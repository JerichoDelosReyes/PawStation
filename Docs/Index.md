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

Welcome to the **PawStation Obsidian Knowledge Base**. This vault is organized using linked notes (`[[WikiLinks]]`) designed to render an intuitive, interconnected knowledge graph in Obsidian.

```
                                        [[Index]]
                                           |
         +---------------------------------+---------------------------------+
         |                                 |                                 |
         v                                 v                                 v
  [[Pawstation Documentation      [[Security Architecture         [[Design System
        and Parts]]                    and Hardening]]           and Apple UI]]
         |                                 |                                 |
         +----------------+----------------+----------------+----------------+
                          |                                 |
                          v                                 v
               [[Supabase and Backend            [[Implementation Plan
                   Architecture]]                     and Roadmap]]
                          |                                 |
                          +----------------+----------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
                    v                                             v
            [[Privacy Policy]]                           [[Terms of Service]]
```

---

## 1. Vault Map of Content (MOC)

### Core Architecture & Specifications
- **Hardware & Firmware:** [[Pawstation Documentation and Parts]]
  - Complete ESP32 pinouts, load cell calibration (HX711), pump switching (XY-MOS), servo wiring, capacitor & flyback diode protection.
  - HiveMQ Cloud broker setup, MQTT topic definitions (`pawstation/telemetry`, `pawstation/status`, `pawstation/cmd`).
- **Security Engineering:** [[Security Architecture and Hardening]]
  - STRIDE threat modeling for IoT & Cloud.
  - Supabase Row Level Security (RLS) policies and least-privilege role separation.
  - Hardware lockout defenses (pump runaway cutoff, servo heat relief).
  - Web client CSP and environment variable sanitation.
- **UI/UX & Visual Design:** [[Design System and Apple UI]]
  - Apple macOS Sequoia & iOS 18 design language (SF Pro typography, translucent frosted glass, squircle radii, fluid spring animations).
  - Translation of reference image aesthetics (organic arched cards, floating badges, dark foundation footer with radiating pastel paws).
  - Micro-interactions, haptic feedback cues, and responsive layouts.
- **Data & Cloud Backend:** [[Supabase and Backend Architecture]]
  - PostgreSQL schema for `stations`, `telemetry_logs`, `feeding_events`, `cat_visits`, `station_alerts`.
  - Dual communication pipeline: sub-100ms MQTT WebSockets for live controls + Supabase PostgreSQL for persistent history.
  - Realtime subscription patterns and time-series data retention strategies.
- **Execution Plan:** [[Implementation Plan and Roadmap]]
  - 5-phase structured rollout from planning to hardware commissioning.
  - Verification gates and decision checkpoints before code execution.
- **Legal, Compliance & Policy:**
  - [[Privacy Policy]]: Full IoT telemetry collection rules, retention policies, GDPR compliance, and Supabase RLS privacy assurances.
  - [[Terms of Service]]: Hardware safety disclosures, fail-safe animal welfare requirements, electrical isolation warnings, and liability terms.


---

## 2. Configuration & Secrets

- **`.env.example`:** Blueprint for environment keys.
- **`.env`:** Active local environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_HIVEMQ_HOST`, etc.).
- **`.gitignore`:** Strict exclusion rules protecting secrets from git leaks.

---

## 3. Obsidian Graph View Optimization Tips

To view this graph in Obsidian:
1. Open the **Graph View** (`Cmd + G` on Mac).
2. Group nodes by tags:
   - `#security` -> Purple
   - `#ui-ux` -> Cyan
   - `#backend` -> Green
   - `#hardware` / `#iot` -> Amber
3. Enjoy the clean, circular cluster topology centered on [[Index]]!

