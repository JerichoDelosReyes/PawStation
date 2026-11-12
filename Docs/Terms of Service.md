---
title: PawStation Terms of Service
tags:
  - pawstation
  - legal
  - terms-of-service
  - iot
  - hardware
aliases:
  - Terms of Service
  - TOS
date_created: 2026-11-12
status: Active
---

# PawStation Terms of Service

Last updated: November 12, 2026  
Part of [[Index]] | Related: [[Privacy Policy]] | [[Security Architecture and Hardening]] | [[Pawstation Documentation and Parts]]

Please review these Terms of Service ("Terms") before assembling, flashing, or operating the PawStation smart pet feeding and watering station ("Hardware") and its companion software applications ("Software").

---

## 1. Description of Service & DIY Hardware Scope

PawStation is an open hardware and software project designed for personal, non-commercial monitoring and dispensing of pet food and water. 

PawStation provides:
1. Firmware and circuit schematics for the ESP32 microcontroller and attached sensors/actuators.
2. Web application code (Next.js) and database schemas ([[Supabase and Backend Architecture|Supabase]]).
3. MQTT messaging protocol definitions ([[Pawstation Documentation and Parts]]).

---

## 2. Animal Welfare & Hardware Safety Disclaimers

> [!WARNING]
> **Do not rely solely on automated or DIY hardware for pet sustenance.** Electronic components, network connections, Wi-Fi routers, cloud brokers, and physical mechanical dispensers can fail.

By operating PawStation, you acknowledge and agree that:
1. **Human Supervision Required:** PawStation is an assistive device and does not replace regular human supervision, daily fresh water checks, and routine animal care.
2. **Fail-Safe Measures:** You are responsible for ensuring your pet has secondary access to water and sustenance in the event of power outages, Wi-Fi disconnects, mechanical hopper jams, or pump failures.
3. **Food-Safe Materials:** You are strictly responsible for using food-grade plastics, non-toxic silicone tubing, and sanitary food storage containers as detailed in [[Pawstation Documentation and Parts]].
4. **Electrical Isolation:** You must adhere to the dual-power rail design (separate 5V power supply for heavy motor/pump loads, shared ground, and protective flyback diodes). Never power high-current motors directly from microcontroller GPIO pins.

---

## 3. Acceptable Use & Account Responsibilities

When operating the PawStation dashboard and cloud APIs:
- You agree to safeguard your MQTT broker credentials, database passwords, and private API keys.
- You agree not to reverse engineer or flood the cloud MQTT broker or database with malicious traffic that disrupts service.
- You agree to operate the software in accordance with applicable local animal welfare and electronic device regulations.

---

## 4. Software License & Modifications

PawStation software and documentation are provided for personal educational and hobbyist use. You are permitted to modify firmware parameters (such as `CALIBRATION_FACTOR`, `DISPENSE_MS`, and `PUMP_RUN_MS`) to suit your specific cat, dispenser hopper, and reservoir configuration.

---

## 5. Limitation of Liability & Warranty Disclaimer

THE SOFTWARE, FIRMWARE, AND CIRCUIT DESIGNS ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR FREEDOM FROM ELECTRICAL/MECHANICAL MALFUNCTION.

IN NO EVENT SHALL THE AUTHORS, CONTRIBUTORS, OR HARDWARE DESIGNERS BE LIABLE FOR ANY CLAIM, DAMAGES, INJURY TO ANIMALS, PROPERTY DAMAGE, WATER LEAKS, FOOD SPOILAGE, OR OTHER LIABILITY ARISING FROM THE OPERATION, MECHANICAL ASSEMBLY, OR NETWORK COMMUNICATION OF PAWSTATION.

---

## 6. Amendments

These Terms may be revised as new firmware releases, safety mechanisms, or cloud backend capabilities are introduced. Continued use of the Software or Hardware constitutes acceptance of the modified terms.

---
[[Index]] | [[Privacy Policy]] | [[Security Architecture and Hardening]] | [[Pawstation Documentation and Parts]]

