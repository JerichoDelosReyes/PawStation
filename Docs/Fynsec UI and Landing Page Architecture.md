---
title: PawStation Fynsec UI & Landing Page Architecture
tags:
  - pawstation
  - ui-ux
  - fynsec
  - design-system
  - animation
aliases:
  - Fynsec Landing Page Architecture
  - Frontend Design System
  - UI Architecture
date_created: 2026-11-13
status: Approved
---

# PawStation Fynsec UI & Landing Page Architecture

Part of [[Index]] | Related: [[Design System and Apple UI]] | [[Pawstation Documentation and Parts]] | [[Security Architecture and Hardening]] | [[Supabase and Backend Architecture]] | [[Implementation Plan and Roadmap]]

---

## 1. Executive Summary & Design Vision

The PawStation landing interface is modeled directly after the high-contrast, editorial industrial aesthetic of modern cybersecurity design systems (specifically the **Fynsec** benchmark). It replaces typical startup marketing templates with an authentic, full-screen digital experience that pairs tactile physical hardware with responsive telemetry.

```
+---------------------------------------------------------------------------------------+
|  [■] PAWSTATION             [ Features  Ecosystem  Architecture  FAQ ]   Get Started ›|  <- Dark Frame Top Bar
|  +---------------------------------------------------------------------------------+  |
|  | There is a                                                                      |  |
|  | [🐾] Better Way                       [ 3D BALTIC BIRCH SCULPTURE ]             |  |
|  | to Nourish.                           • Telemetry Live    • Kibble: 85%         |  |
|  |                                       • Fresh Water: 720ml • ±0.1g Tare         |  |
|  | › Get Started                                                                   |  |
|  | --------------------                                                            |  |
|  | PawStation is an open-hardware                                                  |  |
|  | feline workstation...                                      +--------------------+  |
|  |                                                            | Dark mode: [On|Off]|  |  <- Docked Notch
|  +------------------------------------------------------------+--------------------+  |
+---------------------------------------------------------------------------------------+
|  Our Partners                                                                         |  <- Hairline Divider
|  -----------------------------------------------------------------------------------  |
|                   [Espressif]   [Supabase]   [HiveMQ]   [HX711]   [FreeRTOS]          |  <- Infinite Marquee
+---------------------------------------------------------------------------------------+
|  How Can PawStation Help?                                                             |
|  [/ 01: Micro-Portions]      [/ 02: Whisper Flow]      [/ 03: Biometric Tracking]     |  <- Hover Expand
+---------------------------------------------------------------------------------------+
|  Engineered for Feline Senses (Subsystem Blueprint)                                  |
|  [01 Birch Sled]   [02 Metering Chute]   [03 Hydration Alcove]   [04 Dual-Rail Hub]   |  <- Live Emulation
+---------------------------------------------------------------------------------------+
```

---

## 2. Core UI Components & Architectural Topology

### 2.1 Full-Screen Edge-to-Edge Layout (`src/app/page.tsx`)
- **Zero Outer Margins:** Completely strips out letterbox constraints (`max-w-[1536px]`, `px-6`, `py-6`), rendering pure 100vw full bleed.
- **Root Background:** Matte obsidian `#161618` carrying uniform styling across sections without seam artifacts.
- **Semantic Hierarchy:** `Hero` -> `EcosystemBand` -> `HowPawStationHelps` -> `HardwareBlueprintSection` -> `FAQ` -> `CtaSection` -> `Footer`.

### 2.2 Interlocking Cream Panel & Inverse Fillet Geometry (`src/components/Hero.tsx`)
The centerpiece of the hero section is the interlocking jigsaw boundary between the dark chassis (`#161618`) and the warm cream panel (`#F8F5EE`):
1. **Raised Nav Tongue (Top-Center):** The cream panel reaches up into the dark top bar, housing the navigation pill (`Features / Ecosystem / Architecture / FAQ`).
2. **Bottom-Right Toggle Notch:** The dark chassis scoops into the bottom-right corner of the cream panel, housing the single global Dark Mode switch.
3. **Mathematical SVG Fillets (`src/components/InverseCorner.tsx`):**
   - Pure vector concave arcs based on `x^2 + y^2 = R^2` with radius `R = 20px / 24px`.
   - Utilizes `fill="currentColor"` bound to CSS variables (`var(--panel-bg)` and `var(--frame-bg)`), guaranteeing zero pixel gaps, zero stray wedges, and seamless dark mode synchronization.

```svg
<!-- Inverse Corner Fillet Path (Top-Left Tab) -->
<svg width="24" height="24" viewBox="0 0 24 24">
  <path d="M 0,24 A 24,24 0 0 0 24,0 L 24,24 Z" fill="currentColor" />
</svg>
```

### 2.3 3D Architectural Hardware Sculpture
- **Physical Sculpture Asset:** `public/pawstation-hero-3d.jpg` represents an authentic industrial design render of the PawStation Baltic birch workstation.
- **Layers:** Undulating Baltic birch plywood layers, brushed satin aluminum load-cell plates, optical sensor lens, and ceramic feeding dish contours.
- **Optical Blending:** Layered with `mix-blend-multiply` in light mode so the ivory studio background dissolves seamlessly into the cream canvas.
- **Floating Glass Chips:** Four frosted glass labels (`backdrop-blur-md`, 1px hairline border) orbit the sculpture with independent spring offsets:
  - `Telemetry Live · PWST-MKII` (Top-Left)
  - `Kibble: 85% Full` (Bottom-Left)
  - `Fresh Water: 720 ml` (Bottom-Right)
  - `±0.1g HX711 Tare` (Top-Right)

### 2.4 Single Global Dark Mode Capsule Switch (`src/components/ThemeTogglePill.tsx`)
- **Docked Placement:** Located exclusively in the hero's bottom-right notch.
- **Scroll Continuity:** Scrolls away naturally with the hero section, exactly replicating the reference interaction.
- **State Mechanics:** Controls global theme via React Context (`ThemeProvider.tsx`), toggling `.dark` on document element and persisting to `localStorage`.

### 2.5 Infinite Horizontal Marquee (`src/components/EcosystemBand.tsx`)
- **Layout:** Large left-aligned "Our Partners" title with a full-width 1px hairline divider beneath it.
- **Right-Offset Copy:** Editorial paragraph and `› Get Started` button start 1/3 across the viewport (`lg:col-span-8`).
- **Marquee Mechanics:** Seamless CSS ticker (`animate-ticker`) translating duplicated card arrays (`translateX(0)` to `translateX(-50%)`).
- **Cards:** Outlined `rounded-[24px]` cards in dark fill (`#18181B`) with inline vector logos for **Espressif**, **Supabase**, **HiveMQ**, **HX711**, and **FreeRTOS**. Pauses on hover; respects `prefers-reduced-motion`.

### 2.6 Interactive Feature Numbered Cards (`src/components/HowPawStationHelps.tsx`)
- Three structured columns with prominent index markers (`/ 01`, `/ 02`, `/ 03`).
- Centered 3D tactile icons for kibble chute, whisper hydration, and 24-bit strain gauge.
- Hover-expand interaction reveals comprehensive feline medical and hardware context without layout shifts.

### 2.7 Hardware Blueprint & Telemetry Simulator (`src/components/HardwareBlueprintSection.tsx`)
- Minimalist 4-column architecture blueprint breaking down PawStation's decoupled subsystems:
  1. **Suspended Birch Sled:** 24-bit HX711 ADC, ±0.1g precision, 10 SPS rate.
  2. **Anti-Regurgitation Chute:** SG90 micro-servo, 35g portions, 0.0mA quiescent auto-detach.
  3. **Whisper Hydration Flow:** 600ms cosine decay voltage ramp, < 16 dB acoustic rating.
  4. **Dual-Rail Telemetry Hub:** Isolated 3.3V / 5.0V power rails, MQTTS TLS 1.3 on Port 8883.

---

## 3. iOS Fluid Scroll Physics & Motion System

PawStation incorporates native Apple iOS spring dynamics driven by Framer Motion:

```typescript
// Apple Spring Timing Curve
const IOS_EASE = [0.16, 1, 0.3, 1] as const;

// Spring-Damped Scroll Interpolation
const { scrollYProgress } = useScroll({
  target: heroRef,
  offset: ["start start", "end start"],
});

const smoothProgress = useSpring(scrollYProgress, {
  stiffness: 100,
  damping: 26,
  restDelta: 0.001,
});

const heroScale = useTransform(smoothProgress, [0, 1], [1, 0.975]);
const heroY = useTransform(smoothProgress, [0, 1], [0, 36]);
const heroOpacity = useTransform(smoothProgress, [0, 0.9], [1, 0.88]);
const sculptureParallax = useTransform(smoothProgress, [0, 1], [0, 48]);
```

- **Interactive Tilt:** Mouse movement drives spring-interpolated `rotateX` and `rotateY` (-5deg to +5deg) with smooth reset on leave.
- **Scroll Momentum:** HTML root configured with `-webkit-overflow-scrolling: touch` and `scroll-behavior: smooth`.

---

## 4. Cross-Reference Knowledge Map

- [[Index]]: Central knowledge vault hub.
- [[Design System and Apple UI]]: Design tokens, SF Pro typography, and anti-vibe-code principles.
- [[Pawstation Documentation and Parts]]: Electrical schematics, bill of materials, and ESP32 pinouts.
- [[Security Architecture and Hardening]]: STRIDE threat model, TLS 1.3 encryption, and Supabase RLS.
- [[Supabase and Backend Architecture]]: PostgreSQL schemas, telemetry logs, and realtime pipelines.
- [[Implementation Plan and Roadmap]]: Phased engineering milestones and verification criteria.
