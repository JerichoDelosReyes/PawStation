---
title: PawStation Privacy Policy
tags:
  - pawstation
  - legal
  - privacy-policy
  - compliance
  - gdpr
aliases:
  - Privacy Policy
date_created: 2026-11-12
status: Active
---

# PawStation Privacy Policy

Last updated: November 12, 2026  
Part of [[Index]] | Related: [[Terms of Service]] | [[Security Architecture and Hardening]] | [[Supabase and Backend Architecture]]

This Privacy Policy explains how PawStation ("we", "us", or "our") collects, uses, stores, and protects information when you operate the PawStation IoT device, cloud services, and companion web dashboard.

---

## 1. Information We Collect

PawStation is designed with data minimization in mind. We collect only data strictly necessary to monitor and operate the pet feeding station.

### 1.1 Hardware & Telemetry Data
- **Load Cell & Weight Telemetry:** Weight values measured by the HX711 analog-to-digital converter, baseline zero tare offsets, and visit threshold triggers.
- **Water Reservoir Levels:** Sensor resistivity/analog values from the reservoir probe and low-water threshold alerts.
- **Actuator Execution Records:** Timestamps and duration of servo kibble dispensing and pump cycle activations.
- **Device Health & Network Status:** Wi-Fi Received Signal Strength Indicator (RSSI), ESP32 uptime, broker ping latencies, and last-will connectivity status (`online` / `offline`).

### 1.2 Account & User Authentication Data
- **Owner Identity:** Email address and unique user identifier (UUID) generated via [[Supabase and Backend Architecture|Supabase Auth]].
- **Session Tokens:** JSON Web Tokens (JWT) and encrypted session cookies managed via `@supabase/ssr` to maintain authenticated dashboard sessions.

### 1.3 Data We Do NOT Collect
- PawStation contains **no cameras**, **no microphones**, and **no ambient audio listening devices**.
- We do not collect GPS location data, advertising IDs, or biometric human data.

---

## 2. How We Use Your Data

We use collected information solely for:
1. **Live Station Operation:** Streaming real-time weight, reservoir levels, and cat presence to your private dashboard via encrypted MQTT WebSockets.
2. **Health & Intake Tracking:** Recording feeding frequency, portion counts, and cat visit durations in your Supabase PostgreSQL database.
3. **Safety & Anomaly Alerts:** Notifying you when the water reservoir is depleted or the station loses network connectivity.
4. **Hardware Protection:** Logging commands to enforce rate limits and prevent physical actuator burnout or accidental overfeeding.

---

## 3. Data Storage, Retention & Security

### 3.1 Data Transit Security
All communications between the ESP32 microcontroller, HiveMQ Cloud broker, Supabase backend, and your web browser are encrypted in transit using **TLS 1.2 / TLS 1.3** and Secure WebSockets (`wss://`).

### 3.2 Database Access & Row Level Security (RLS)
Telemetry logs and feeding events stored in Supabase are protected by PostgreSQL [[Security Architecture and Hardening|Row Level Security (RLS)]]. Only authenticated users whose `auth.uid()` matches the registered station owner can view or query station records.

### 3.3 Data Retention & Deletion
- **Raw Telemetry Ticks (1 Hz):** Processed in-memory in the web dashboard; raw ticks are not permanently written to disk.
- **Telemetry Snapshots:** Periodic 5-minute health snapshots are stored for 30 days and automatically pruned.
- **Historical Event Logs:** Feeding events and visit records are retained for historical health analysis until deleted by the user.
- **Right to Erase:** You may request complete erasure of your station and account records at any time directly through the database console or by deleting your registered station profile.

---

## 4. Third-Party Service Providers

PawStation utilizes the following infrastructure providers:
- **Supabase Inc.:** Database hosting, authentication, and Row Level Security enforcement. (Data hosted in secure cloud regions compliant with SOC 2 Type II and ISO 27001).
- **HiveMQ GmbH / HiveMQ Cloud:** MQTT message brokering over TLS for low-latency device control.

We do not sell, rent, monetize, or share your telemetry or personal information with third-party advertisers or data brokers.

---

## 5. Contact & Inquiries

For questions regarding data privacy, security disclosures, or data deletion requests, consult the [[Security Architecture and Hardening]] documentation or submit an inquiry through your project repository.

---
[[Index]] | [[Terms of Service]] | [[Design System and Apple UI]] | [[Security Architecture and Hardening]]

