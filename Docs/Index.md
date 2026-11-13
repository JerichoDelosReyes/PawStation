---
title: PawStation Knowledge Vault & Architecture Index
tags:
  - pawstation
  - index
  - moc
  - architecture
aliases:
  - PawStation Hub
  - Knowledge Vault Index
date_created: 2026-11-12
status: Active
---

# PawStation Knowledge Vault & Architecture Index

Welcome to the **PawStation Obsidian Knowledge Base**. This vault is structured with bidirectional `[[WikiLinks]]` configured for Obsidian's Graph View.

```
                                               [[Index]]
                                                  |
           +--------------------------------------+--------------------------------------+
           |                                      |                                      |
           v                                      v                                      v
   [[Pawstation Documentation             [[Security Architecture                [[Fynsec UI and Landing
         and Parts]]                           and Hardening]]                    Page Architecture]]
           |                                      |                                      |
           +-----------------+--------------------+--------------------+-----------------+
                             |                                         |
                             v                                         v
                  [[Supabase and Backend                    [[Design System
                      Architecture]]                         and Apple UI]]
                             |                                         |
                             +--------------------+--------------------+
                                                  |
                                                  v
                                       [[Implementation Plan
                                            and Roadmap]]
                                                  |
                               +------------------+------------------+
                               |                                     |
                               v                                     v
                       [[Privacy Policy]]                   [[Terms of Service]]
```

---

## 1. Vault Map of Content (MOC)

### Core Architecture & Frontend Engineering
- **Landing Page & Fynsec Architecture:** [[Fynsec UI and Landing Page Architecture]]
  - High-contrast full-screen layout (100vw), interlocking cream canvas with exact SVG concave fillet curves (`InverseCorner.tsx`).
  - 3D Baltic birch industrial sculpture (`pawstation-hero-3d.jpg`) with floating glass telemetry chips.
  - Single global docked Dark Mode capsule switch, infinite horizontal partner marquee (`EcosystemBand.tsx`), and iOS spring scroll physics (`[0.16, 1, 0.3, 1]`).
- **UI/UX & Design Philosophy:** [[Design System and Apple UI]]
  - The 30 Anti-Vibe-Code principles, native SF Pro typography, calibrated Apple System neutral palettes, and micro-interactions.
- **Hardware & Firmware Engineering:** [[Pawstation Documentation and Parts]]
  - ESP32 pinouts (GPIO 18, 19, 21, 23), HX711 24-bit strain gauge calibration, SG90 auto-detach micro-servo, XY-MOS 600ms soft-stop pump.
  - HiveMQ Cloud broker setup, TLS 1.3 MQTTS on Port 8883, and non-blocking FreeRTOS tasks.
- **Security Engineering & Threat Mitigation:** [[Security Architecture and Hardening]]
  - STRIDE threat modeling across IoT, broker, and web layers.
  - Supabase Row Level Security (RLS) policies, hardware runaway cutoffs, and client sanitization.
- **Data & Cloud Backend:** [[Supabase and Backend Architecture]]
  - PostgreSQL schema for `stations`, `telemetry_logs`, `feeding_events`, `cat_visits`, and `station_alerts`.
  - Dual communication pipeline: sub-100ms MQTT WebSockets for live telemetry + Supabase PostgreSQL for time-series persistence.
- **Roadmap & Execution:** [[Implementation Plan and Roadmap]]
  - Phased engineering milestones, completed frontend overhaul, and upcoming hardware field validation.
- **Legal & Compliance:**
  - [[Privacy Policy]]: Feline biometric telemetry rules, data retention limits, and GDPR assurances.
  - [[Terms of Service]]: Hardware safety disclosures, electrical isolation requirements, and food-grade material standards.

---

## 2. Configuration & Secrets

- **`.env.example`:** Blueprint for environment keys.
- **`.env`:** Active local environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_HIVEMQ_HOST`, etc.).
- **`.gitignore`:** Strict exclusion rules protecting secrets from git commits.

---

## 3. Obsidian Graph View Configuration

This vault's Graph View is tuned with tag-based color clusters and custom forces:

| Cluster | Tag Query | Color Tone | Meaning |
| :--- | :--- | :--- | :--- |
| **Hub / Index** | `#index` / `#moc` | **Pure White** (`#FFFFFF`) | Central vault nexus |
| **Hardware & IoT** | `#hardware` / `#esp32` | **Amber / Gold** (`#F59E0B`) | Microcontrollers, sensors, kinematics |
| **UI/UX & Fynsec** | `#ui-ux` / `#fynsec` | **Sky Blue** (`#38BDF8`) | Frontend architecture, motion, design |
| **Security & Hardening**| `#security` / `#hardening` | **Purple** (`#A855F7`) | STRIDE, RLS, electrical isolation |
| **Backend & Cloud** | `#backend` / `#supabase` | **Emerald Green** (`#10B981`) | PostgreSQL, HiveMQ MQTT, realtime |
| **Roadmap & Plan** | `#roadmap` / `#plan` | **Indigo** (`#6366F1`) | Milestones and phases |
| **Legal & Policy** | `#policy` / `#legal` | **Rose Coral** (`#F43F5E`) | Privacy, terms, safety disclaimers |

### Node Exclusions
- `node_modules/`, `.next/`, `.git/`, and build artifacts are excluded via `.obsidian/app.json` (`userIgnoreFilters`) and `.obsidian/graph.json` (`path:Docs`), keeping the graph clean, focused, and free of external library noise.
