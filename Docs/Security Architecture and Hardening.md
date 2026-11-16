---
title: PawStation Security Architecture & Hardening Guide
tags:
  - pawstation
  - security
  - backend
  - iot
  - supabase
  - wifi
  - websockets
  - rest
aliases:
  - Security Architecture
  - Hardening Guide
date_created: 2026-11-12
status: Approved
---

# PawStation Security Architecture & Hardening Guide

Part of [[Index]] | Related: [[Fynsec UI and Landing Page Architecture]] | [[Supabase and Backend Architecture]] | [[Pawstation Documentation and Parts]] | [[Implementation Plan and Roadmap]]

## 1. Threat Modeling & Scope

PawStation is an Internet-of-Things (IoT) ecosystem connecting an ESP32 hardware device (actuators, load cell, water sensor), a client-facing web application with direct local Wi-Fi control (HTTP REST & WebSockets), and a [[Supabase and Backend Architecture|Supabase Backend]] (PostgreSQL, Auth, RLS, Edge Functions) for persistent history.

```mermaid
flowchart LR
    A["ESP32 Microcontroller"] <-- "Direct Wi-Fi (HTTP 80 / WS 81)" --> C["Web Console (Browser)"]
    C <-- "HTTPS / WSS (Anon Key + JWT)" --> D["Supabase Backend"]
    D <-- "Database Webhooks / Edge Functions" --> E["Persistent Storage"]
```

### STRIDE Threat Matrix

| Threat Category | Target | Vector / Vulnerability | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Spoofing** | Local Station / Supabase | Rogue device or unauthorized user claiming station identity | WPA2/WPA3 Wi-Fi authentication; optional local station API key/token; Supabase JWT authentication |
| **Tampering** | Command & Telemetry stream | Injection of rogue commands (`dispense`, `pump`, `tare`) or falsified scale readings | ESP32 CORS origin validation, strict enum allowlists, rate limiting, local LAN boundary |
| **Repudiation** | Actuator operations | Dispensing food or water without audit trail | Structured append-only audit logs in Supabase `command_audit_log` with user UUID and timestamp |
| **Information Disclosure** | Credentials & Telemetry | Leaking Wi-Fi passwords, Supabase keys, or cat behavioral patterns | WPA2/WPA3 local encryption; strict separation of public anon keys vs service keys; `.env` git exclusion |
| **Denial of Service** | Physical Actuators | Rapid command flooding causing servo burn, motor stall, or water flood | Firmware-level state locks & timeouts; UI button debouncing; hardware lockout guards |
| **Elevation of Privilege** | Database | Malicious client altering feeding schedules or accessing other stations | PostgreSQL Row Level Security (RLS) policies enforcing user isolation |

---

## 2. Supabase Backend Security & Row Level Security (RLS)

Following backend security best practices, the database is locked down by default. No client can access or manipulate tables unless explicitly permitted through Row Level Security (RLS) policies.

### 2.1 Defense-in-Depth Table Security

```sql
-- 1. Ensure RLS is enabled on all tables
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.command_audit_log ENABLE ROW LEVEL SECURITY;

-- 2. Revoke default public schema grants
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon; -- Only if public dashboard viewing is permitted
```

### 2.2 Row Level Security (RLS) Policies

```sql
-- Allow users to only view and manage their own stations
CREATE POLICY "Users can access their own stations"
ON public.stations
FOR ALL
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Telemetry logs: Only station owner can read
CREATE POLICY "Station owners can view telemetry"
ON public.telemetry_logs
FOR SELECT
TO authenticated
USING (
  station_id IN (
    SELECT id FROM public.stations WHERE owner_id = auth.uid()
  )
);

-- Command audit log: Append-only by authenticated owners, read-only
CREATE POLICY "Owners can log commands"
ON public.command_audit_log
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = executed_by AND
  station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
);

CREATE POLICY "Owners can view command history"
ON public.command_audit_log
FOR SELECT
TO authenticated
USING (
  station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
);
```

### 2.3 Input Validation & Parameterized Queries

- **Constraint Enforcement:** SQL column checks enforce valid telemetry values (e.g., `weight >= -50 AND weight <= 15000`, `water_level >= 0 AND water_level <= 4095`).
- **Command Payloads:** Only strictly allowlisted commands (`dispense`, `pump`, `tare`) can be logged or dispatched:
  ```sql
  ALTER TABLE public.command_audit_log 
  ADD CONSTRAINT valid_command_name 
  CHECK (command_name IN ('dispense', 'pump', 'tare'));
  ```

---

## 3. Direct Wi-Fi & Embedded Server Security Architecture

### 3.1 Local Network Perimeter & mDNS Discovery

Direct Wi-Fi architecture operates within the trusted home LAN perimeter:
1. **Network Authentication:** The ESP32 joins home Wi-Fi using WPA2-Personal or WPA3. When launching SoftAP provisioning mode, a WPA2 pre-shared key is mandatory.
2. **mDNS Resolution:** Zero-configuration resolution (`pawstation.local`) allows the web console to discover the station locally without broadcasting or exposing IPs across the public internet.
3. **No Insecure Port Forwarding:** The ESP32 is not exposed directly to the public internet via NAT port forwarding. Remote access outside home Wi-Fi is routed securely via a private VPN (such as Tailscale or WireGuard).

### 3.2 CORS & Request Origin Hardening

Because the web console runs in a browser environment, cross-origin web requests between the console domain and the local ESP32 IP/hostname are protected:
- **CORS Headers:** Embedded HTTP handlers return strict `Access-Control-Allow-Origin` and `Access-Control-Allow-Methods: GET, POST, OPTIONS` headers.
- **WebSocket Handshake Validation:** Embedded WebSocket server validates connection headers on upgrade requests to prevent cross-site WebSocket hijacking (CSWSH) from malicious background browser tabs.
- **Optional Local Bearer Token:** Embedded endpoints accept an optional header token (`X-PawStation-Key`) to verify authorized console clients.

---

## 4. Hardware Fail-Safe & Anti-Abuse Defenses

Firmware-level protections prevent hardware destruction or safety hazards to pets regardless of network commands:

1. **Pump Runaway Prevention:**
   - Maximum continuous pump run is strictly capped in firmware at 3,000 ms (3 seconds), followed by a 600 ms soft-stop.
   - Even if duplicate `pump` commands arrive over HTTP or WebSocket, firmware ignores invocations while a cycle is active.
   - Water level threshold check: if `waterLow == true`, the pump triggers a safety lockout to prevent motor burnout from running dry.
2. **Servo Overheat Mitigation:**
   - Feeder disc actuation uses constrained angles (`20°` fill, `160°` drop) rather than full `0°-180°` stops to prevent mechanical binding.
   - The servo signal is dynamically detached (`servo.detach()`) immediately following dispense completion.
3. **Electrical Isolation:**
   - Actuators run on an isolated 5V power bus; ESP32 GPIOs interface exclusively via optoisolated or MOSFET driver stages (XY-MOS) with a flyback diode.

---

## 5. Web Client Security (Next.js / React)

### 5.1 Environment Variable Hygiene
- All client-accessible secrets in Next.js must start with `NEXT_PUBLIC_` and contain **only** public anon keys and device hostnames.
- Service role keys (`SUPABASE_SERVICE_ROLE_KEY`) must **never** be prefixed with `NEXT_PUBLIC_` or included in frontend client bundles.
- A `.gitignore` file enforces that `.env`, `.env.local`, and related secrets files are never committed to version control.

### 5.2 Content Security Policy (CSP) & HTTP Headers

When deploying to Vercel, configure strict security headers:

```http
Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://*.local:* http://*.local:* ws://192.168.*:* http://192.168.*:*; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; frame-ancestors 'none';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 6. Security Verification Checklist

- [ ] `.gitignore` contains `.env`, `.env.local`, and build artifacts.
- [ ] Supabase tables have RLS enabled with granular owner policies.
- [ ] ESP32 direct Wi-Fi endpoints, CORS headers, and local tokens are verified.
- [ ] Client commands are validated with strict allowlists before dispatch.
- [ ] Firmware contains watchdog timers and hardware lockout guards.
- [ ] CSP and HTTPS headers are defined for the production web app.

---
[[Index]] | [[Supabase and Backend Architecture]] | [[Design System and Apple UI]] | [[Implementation Plan and Roadmap]]
