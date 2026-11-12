---
title: PawStation Design System & Anti-Vibe-Code Principles
tags:
  - pawstation
  - design-system
  - ui-ux
  - apple-hig
  - anti-vibe-code
  - standards
aliases:
  - Design System
  - Anti-Vibe-Code Guidelines
date_created: 2026-11-12
status: Approved
---

# PawStation Design System & Anti-Vibe-Code Principles

Part of [[Index]] | Related: [[Security Architecture and Hardening]] | [[Supabase and Backend Architecture]] | [[Implementation Plan and Roadmap]] | [[Privacy Policy]] | [[Terms of Service]]

## 1. The Anti-Vibe-Code Manifesto

Most modern AI-generated web interfaces follow a lazy, recognizable template ("vibe coding"). PawStation strictly rejects this template in favor of authentic, functional industrial software design modeled after genuine Apple professional utility apps (macOS System Settings, Activity Monitor, Audio MIDI Setup, and iOS Health/Measure).

### Strict Prohibition Checklist (The 30 Anti-Patterns)

| # | Banned "Vibe Coded" Cliché | PawStation Replacement Standard |
| :--- | :--- | :--- |
| **1** | **Harsh gradients** | Solid, opaque, calibrated Apple neutral surfaces with subtle tactile 1px borders. |
| **2** | **Lucide icons default spam** | Bespoke vector SVG glyphs tailored specifically for hardware mechanisms (scale platform, kibble gate, peristaltic pump, signal RSSI). |
| **3** | **Pure white background (`#FFFFFF`)** | Grounded system background tones: `#F5F5F7` (macOS Light Canvas) / `#1C1C1E` (Apple System Dark Canvas). |
| **4** | **Rainbow coloring** | Disciplined functional palette: 1 primary neutral, 1 hardware accent (machined amber), and functional status indicators (green/red). |
| **5** | **Drop shadows (heavy diffuse 30px blurs)** | Flat layered elevation with crisp 1px borders (`rgba(0,0,0,0.08)` or `rgba(255,255,255,0.1)`). |
| **6** | **3 feature cards in a row** | Functional hardware dashboard layout: primary gauge console, live state machine readouts, and direct actuation controls. |
| **7** | **Emojis (cat, paw, lightning, fire icons)** | Zero emojis in UI copy or controls. Technical labels and clean glyphs only. |
| **8** | **Liquid glass / exaggerated blur blobs** | Authentic, subdued Apple materials (`backdrop-blur-md` with strict opacity thresholds), no distorted chromatic glass effects. |
| **9** | **Em dashes in headings (`Word — phrase`)** | Clean, direct sentence case with clear typographic hierarchy. No decorative punctuation. |
| **10** | **Inter / Geist / Space Grotesk defaults** | Native Apple San Francisco (`SF Pro Display`, `SF Pro Text`, `SF Pro Rounded`) utilizing native font metrics. |
| **11** | **Colored left accent stripes on cards** | Full-width contextual state indicators or subtle status chips. |
| **12** | **Fake testimonials & social proof** | Real device logs, actual timestamped telemetry records, and true cat visit events. |
| **13** | **Forced bento grids** | Structured, logical control panels based on physical hardware components. |
| **14** | **Decorative terminal window mockups** | Legitimate telemetry data tables and live MQTT connection inspector. |
| **15** | **"It's not X, it's Y" AI marketing copy** | Direct, factual descriptions: "Dispenses 1 portion of dry kibble (35g)." |
| **16** | **Checkmark bullet lists (plain text symbols)** | Real operational checklists, sensor health tables, and state summaries. |
| **17** | **3 pricing tiers** | None. PawStation is a self-hosted, private IoT station. |
| **18** | **No real product demos** | Interactive hardware interface with live load cell weighing, pump triggers, and tare controls. |
| **19** | **Soft pillowy bloated corner radii** | Crisp, disciplined macOS radii (`8px`, `12px`, and max `16px` on main modules). |
| **20** | **Purple and black synthwave palettes** | Authentic Apple dark slate (`#1C1C1E`) and machined graphite (`#2C2C2E`). |
| **21** | **Missing skeleton loaders** | Comprehensive shimmering skeleton states for all telemetry tiles and historical tables during initial data fetch. |
| **22** | **Radial gradient orbs** | Zero ambient color blobs floating in canvas corners. |
| **23** | **Background dot grids** | Clean, uninterrupted matte utility surfaces. |
| **24** | **Sparkle icons (decorative AI stars)** | Strictly prohibited. |
| **25** | **Bouncing / animated arrows (`→`)** | Standard Apple system navigation indicators or flat button text. |
| **26** | **Missing Terms of Service** | Complete, comprehensive [[Terms of Service]] documented and integrated. |
| **27** | **Missing Privacy Policy** | Complete, comprehensive [[Privacy Policy]] documented and integrated. |
| **28** | **Gimmicky hover tilt/zoom animations** | Tactile, immediate active state feedback (`active:scale-[0.98]`) matching native iOS/macOS controls. |
| **29** | **Neon colors** | Calibrated Apple System tones (Apple Green `#34C759`, Apple Orange `#FF9500`, Apple Red `#FF3B30`). |
| **30** | **Basic candy pastel washes** | Rich, desaturated natural tones with high legibility and contrast ratios exceeding WCAG AAA. |

---

## 2. Palette & Material System

### 2.1 Surfaces & Canvas (Grounded Apple Utility)
- **Light Theme Background:** `#F5F5F7` (macOS System Gray 6)
- **Light Theme Card Base:** `#FFFFFF` with 1px border `rgba(0, 0, 0, 0.08)`
- **Dark Theme Background:** `#121214` (Deep System Canvas)
- **Dark Theme Card Base:** `#1C1C1E` with 1px border `rgba(255, 255, 255, 0.09)`
- **Divider Lines:** `rgba(0, 0, 0, 0.06)` / `rgba(255, 255, 255, 0.08)`

### 2.2 Functional Accents
- **Hardware Primary (Kibble / Feeding):** `#E67E22` (Machined Amber/Ochre)
- **Hydration / Water Sensor:** `#0284C7` (Clean Technical Azure)
- **Station Healthy / Online:** `#16A34A` (Precision Forest Green)
- **Hardware Warning / Low Reservoir:** `#DC2626` (Safety Crimson)
- **Text Primary:** `#18181B` (Light) / `#F4F4F5` (Dark)
- **Text Secondary:** `#71717A` (Light) / `#A1A1AA` (Dark)

---

## 3. Typography & Hierarchy

Utilizing native Apple SF Pro font definitions without generic web font bloat:

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif;
```

- **Section Titles:** `17px`, font-weight `600`, letter-spacing `-0.015em` (macOS Toolbar style).
- **Telemetry Readouts:** `32px`, font-weight `700`, `font-variant-numeric: tabular-nums` (prevents jitter during live scale weight updates).
- **Micro Metadata & Unit Labels:** `11px`, font-weight `500`, letter-spacing `+0.02em`, uppercase.
- **Body & Hardware Status:** `13px`, font-weight `400`, line-height `18px`.

---

## 4. Hardware Dashboard Architecture

```
+-----------------------------------------------------------------------------------+
|  PawStation Console               [ESP32: Online | 8883 TLS]   [Tare Scale] [Auth]|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ PRIMARY CONSOLE: LOAD CELL ]               [ WATER RESERVOIR & PUMP ]          |
|  Current Weight: 428.5 g (Stable)              Level: 78% (Adequate)              |
|  Cat Present: No                               State: Idle                        |
|  [ Real-time weight graph / 60s stream ]       [ Action: Run Pump (3.0s) ]        |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | HARDWARE CONTROLS                                                           |  |
|  | [ Dispense Food (Portion: 1) ]    [ Run Pump (3s) ]    [ Calibrate Zero ]   |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  [ CAT VISIT LOG (SUPABASE) ]                  [ EVENT AUDIT TRAIL ]              |
|  14:22 - 3.82 kg (4m 12s duration)             14:20 - Manual Dispense (User 1)   |
|  11:05 - 3.79 kg (2m 45s duration)             12:00 - Pump Run (Auto-topup)      |
|  08:14 - 3.84 kg (5m 01s duration)             08:00 - Scheduled Dispense         |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  [[Privacy Policy]]  |  [[Terms of Service]]  |  ESP32 Firmware v1.2  | HiveMQ TLS|
+-----------------------------------------------------------------------------------+
```

---

## 5. Skeleton Loading System

To prevent layout shifts and eliminate empty screen flickers:
1. Every numerical readout displays a dedicated tabular skeleton pill during initial connection.
2. Historical tables render 5 rows of pulsing gray bars matching the exact row heights.
3. Hardware status chips default to a neutral gray `"Connecting..."` badge before live MQTT handshake confirms state.

---
[[Index]] | [[Security Architecture and Hardening]] | [[Supabase and Backend Architecture]] | [[Privacy Policy]] | [[Terms of Service]]
