---
title: PawStation Hardware, Firmware & Protocol Documentation
tags:
  - pawstation
  - hardware
  - esp32
  - firmware
  - wifi
  - websockets
  - rest
aliases:
  - Hardware and Parts
  - Firmware Documentation
date_created: 2026-11-12
status: Approved
---

# PawStation: Smart Cat Feeding and Watering Station

Part of [[Index]] | Related: [[Fynsec UI and Landing Page Architecture]] | [[Security Architecture and Hardening]] | [[Supabase and Backend Architecture]] | [[Design System and Apple UI]] | [[Implementation Plan and Roadmap]]

Project documentation for an ESP32-based feeder, water dispenser and weighing scale that is monitored and controlled directly from a web console over local Wi-Fi.

## 1. Project overview

PawStation is a DIY smart feeding station for a cat. An ESP32 microcontroller reads a load cell (the scale) and a water-level sensor, turns a servo that releases a portion of kibble, and switches a small water pump. The ESP32 joins the local Wi-Fi network (or hosts a fallback SoftAP) and runs an embedded HTTP REST and WebSocket server. A web console running in the browser connects directly to the ESP32 over Wi-Fi, allowing the owner to monitor telemetry and dispatch commands in real time with sub-10ms local latency.

The ESP32 uses Direct Wi-Fi architecture. It connects to an existing local Wi-Fi network (home Wi-Fi or phone hotspot) or creates its own SoftAP setup network, serving REST API endpoints and a persistent WebSocket stream directly without relying on external cloud intermediaries or third-party message brokers. The web console is built using Next.js / React with an Apple glassmorphism aesthetic, pairing direct local device control with Supabase for persistent telemetry history and user authentication.

### 1.1 Objectives

- Weigh whatever is on the scale, detect cat visits and count them.
- Dispense a portion of food on command.
- Run a water pump on command and warn when the reservoir is low.
- Show live readings and accept commands from a web console on a phone or laptop directly over Wi-Fi.
- Keep the hardware safe: no motor or pump wired directly to an ESP32 pin, protected switching, and a separate power supply for heavy loads.

### 1.2 Scope

In scope: the ESP32 hardware and firmware, local Wi-Fi connectivity, direct REST and WebSocket endpoints, message formatting between the station and the web console, and the browser client integration. Out of scope for this version: identifying individual cats with cameras, external mechanical housing fabrication, and native app store bundles.

## 2. System architecture

### 2.1 Components

|   |   |
|---|---|
|Part|What it does|
|Station (ESP32 and parts)|Reads sensors, runs the servo and pump, hosts embedded HTTP REST and WebSocket server|
|Direct Wi-Fi Network|Carries direct HTTP REST calls and WebSocket streams between the station and browser|
|Web Console (Next.js / React)|Shows live telemetry, issues immediate commands via WebSocket/REST, and syncs history to Supabase|

### 2.2 Data flow

```
Sensors and actuators <-> ESP32 (HTTP port 80, WebSocket port 81/80) <--Direct Wi-Fi (ws://pawstation.local/ws)--> Web Console in the browser
```

1. The ESP32 reads the scale and the water sensor every 500 ms.
2. Once per second (or immediately on state change), the ESP32 broadcasts a JSON telemetry frame over the active WebSocket connections.
3. The web console receives the WebSocket stream and updates the user interface in memory with sub-10ms latency.
4. When the user taps a button, the web console dispatches an action directly via the WebSocket connection or an HTTP POST to `/api/command`. The ESP32 validates the request and actuates the servo, pump, or scale tare.
5. Persistent logs (feeding history, daily weights) are periodically synced to Supabase PostgreSQL for historical analytics.

### 2.3 Why Direct Wi-Fi Architecture

- **Sub-10ms Latency:** Eliminates cloud broker hops, round trips, and external internet dependency for critical feeding and watering actions.
- **Privacy & Local Resilience:** The device operates seamlessly within the local home network even if external internet service is interrupted.
- **Zero Third-Party Broker Costs:** Eliminates reliance on external cloud messaging tiers, broker quotas, and credential limits.
- **mDNS Zero-Config Discovery:** The web console automatically resolves the station at `pawstation.local` or through configurable local IP discovery.

Requirement: the ESP32 needs a 2.4 GHz Wi-Fi network (or SoftAP). The ESP32 radio does not support 5 GHz. A phone hotspot or home 2.4 GHz router works seamlessly.

## 3. Hardware

### 3.1 Bill of materials

|   |   |   |   |
|---|---|---|---|
|Component|Qty|Specification|Role|
|ESP32 development board|1|30-pin or 38-pin, 3.3 V logic|Controller, Wi-Fi radio, and web server|
|Solderless breadboard|1|830-point or 400-point|Wiring without soldering|
|Bar load cell|1|10 kg aluminum strain gauge|Weighing sensor|
|HX711 module|1|24-bit amplifier board|Amplifies and digitizes the load cell signal|
|XY-MOS module|1|Dual MOSFET switch, PWM input, 5 to 36 V|Switches the water pump|
|Submersible pump|1|3 to 5 V DC micro pump|Moves water from reservoir to bowl|
|Soil moisture sensor|1|Forked probe with LM393 comparator board|Detects the water level in the reservoir|
|Servo|1|SG90 or similar|Turns the feeder disc|
|External 5 V supply|1|Phone charger or power bank, about 2 A|Powers the servo and pump|
|Electrolytic capacitor|1|470 to 1000 uF, 10 V or higher|Smooths the servo supply|
|Flyback diode|1|1N4007 (strongly recommended)|Protects the MOSFET from pump voltage spikes|
|Jumper wires|about 20|Male-male, male-female, female-female|Connections|
|USB cable|1|Must carry data, not charge only|Programming and ESP32 power|
|Structural supplies|1 set|Cardboard or plywood, two plastic bottles, tubing, feeder disc|Frame, food hopper and water reservoir|

A small DC motor can replace the servo, but it needs its own switching module (a second MOSFET module or a motor driver) and cannot be driven from an ESP32 pin.

### 3.2 Wiring

Power rails on the breadboard:

|   |   |
|---|---|
|Rail|Source|
|3.3 V rail|ESP32 3V3 pin (sensors only)|
|GND rail|ESP32 GND, joined to the external supply GND|
|External 5 V rail|Phone charger or power bank, for the servo and pump only|

Do not connect the external 5 V to the ESP32 5V/VIN pin or to the 3.3 V rail. Only the grounds are shared.

Summary by ESP32 pin:

|   |   |
|---|---|
|ESP32 pin|Connected to|
|3V3|HX711 VCC, moisture sensor VCC|
|GND|Every GND, plus the external supply GND|
|GPIO 18|HX711 SCK|
|GPIO 19|HX711 DT|
|GPIO 21|Servo signal|
|GPIO 23|XY-MOS TRIG/PWM|
|GPIO 34|Moisture sensor AO (analog out)|
|GPIO 2|Onboard LED, used as a Wi-Fi and server status indicator|
|USB|Power and programming for the ESP32 only|

Load cell to HX711:

|   |   |
|---|---|
|Load cell wire|HX711 terminal|
|Red|E+|
|Black|E-|
|White|A-|
|Green|A+|

XY-MOS module:

|   |   |
|---|---|
|Pin|Connected to|
|TRIG/PWM|GPIO 23|
|GND (control header)|GND rail|
|VIN+|External 5 V (+)|
|VIN-|GND rail, common with the external supply GND|
|OUT+|Pump red wire (and diode stripe side)|
|OUT-|Pump black wire|

Servo:

|   |   |
|---|---|
|Servo wire|Connected to|
|Signal (orange or yellow)|GPIO 21|
|Power (red)|External 5 V (+)|
|Ground (brown or black)|GND rail|

Place the capacitor across the servo's red and brown wires, close to the servo, with the stripe on the ground side. Place the 1N4007 across OUT+ and OUT-, with the stripe toward OUT+.

### 3.3 Power design

The pump and servo draw much more current than the ESP32 can supply from a pin or from a weak USB port. Early testing showed the ESP32's network disappearing whenever the 5 V parts were connected, which is the pattern of a power dip resetting the board. The design therefore follows these rules:

- The pump and servo run from a separate 5 V supply, not from the ESP32.
- The two supplies share a common ground so the signals have a reference.
- A capacitor smooths the servo supply.
- A flyback diode protects the MOSFET when the pump stops. The firmware also ramps the pump down over 600 ms, which reduces the spike but does not replace the diode.
- The ESP32 is powered from only one source at a time (USB or VIN, not both).

Commissioning order: connect the grounds first, then the sensors, then the servo, then the pump, checking that Wi-Fi stays up after each step.

## 4. Firmware

### 4.1 Environment

- Arduino IDE with the Arduino-ESP32 board package, version 3.x.
- Core Libraries: `WiFi.h`, `WebServer.h` (or `ESPAsyncWebServer.h`), `WebSocketsServer.h`, `ESPmDNS.h`.
- Peripheral Libraries: `HX711` (Bogdan Necula) and `ESP32Servo`.
- Sketch file: `PawStationDirect.ino`.

### 4.2 Configuration

|   |   |   |
|---|---|---|
|Setting|Default|Meaning|
|WIFI_SSID, WIFI_PASS|Placeholder|The 2.4 GHz network the ESP32 joins (or SoftAP credentials)|
|STATION_HOSTNAME|pawstation|mDNS hostname (`pawstation.local`)|
|HTTP_PORT|80|Embedded REST API port|
|WS_PORT|81|Embedded WebSocket server port (or port 80 path `/ws`)|
|CALIBRATION_FACTOR|420.0|Scale calibration, see section 4.4|
|CAT_WEIGHT_G|500|Weight in grams that counts as a visit|
|LOW_WATER_RAW|1500|Sensor reading below this means the reservoir is low|
|SERVO_FILL_POS, SERVO_DROP_POS|20, 160 degrees|Feeder disc positions, narrower than full travel to avoid stalling|
|DISPENSE_MS|1200|Time the disc stays at the drop position|
|PUMP_RUN_MS, PUMP_RAMPDOWN_MS|3000, 600|Pump run time and soft-stop time|

### 4.3 Behavior

- **Non-blocking loop.** Pump timing, the servo, and WebSocket polling all use timers, so the ESP32 never freezes and the watchdog does not reset it.
- **Direct WebSocket Broadcast.** The firmware broadcasts telemetry JSON every 1000 ms to all connected WebSocket clients.
- **Pump soft-stop.** The pump runs at full duty for 3 seconds, then ramps to zero over 600 ms using PWM on the XY-MOS input.
- **Servo detach.** The servo is powered only while it moves, then released, so it does not overheat holding position.
- **Scale safety.** If the HX711 is missing, the firmware reports the scale as offline instead of hanging.
- **Reconnection & mDNS.** Wi-Fi retries automatically in the background. mDNS advertises `pawstation.local` so browsers can connect without hardcoded IP addresses.
- **Visit counting.** A visit is counted when the weight rises above CAT_WEIGHT_G and the scale was previously clear.

### 4.4 Calibrating the scale

1. Set CALIBRATION_FACTOR to 1 and upload.
2. With the scale empty, let it tare. Place an object of known weight, for example 500 g.
3. Read the displayed value in the Serial Monitor.
4. New factor = displayed value divided by the known weight in grams.
5. Enter the new factor and upload again. Check with a second known weight.

Calibrate the water sensor too: read the value with the probe dry and in water, then set LOW_WATER_RAW between the two.

### 4.5 Uploading on a Mac

- Close the Serial Monitor before uploading, because an open monitor locks the port.
- If the port does not appear, use a cable that carries data, plug it straight into the Mac and check System Information under USB.
- If uploading fails with a packet or checksum error, lower the upload speed to 115200, hold the BOOT button when Connecting appears, and disconnect the 5 V parts during the upload.

## 5. Direct Wi-Fi, REST, and WebSocket Interface

### 5.1 Local Network Discovery & Addressing

The ESP32 connects to local Wi-Fi and registers an mDNS service name. The web console connects directly using either:
1. **mDNS Hostname:** `ws://pawstation.local:81` or `http://pawstation.local/api`
2. **Local Static/DHCP IP:** `ws://192.168.1.150:81` or `http://192.168.1.150/api`
3. **SoftAP Fallback:** When no home Wi-Fi is reachable, the ESP32 launches `PawStation-AP` at `192.168.4.1`.

### 5.2 Direct Endpoints

|   |   |   |
|---|---|---|
|Endpoint|Protocol|Description|
|`/ws` (Port 81 or 80)|WebSocket|Full-duplex stream for 1 Hz telemetry and bi-directional commands|
|`GET /api/status`|HTTP REST|Device health status, uptime, Wi-Fi RSSI, and IP info|
|`GET /api/telemetry`|HTTP REST|Instantaneous single-shot JSON telemetry payload|
|`POST /api/command`|HTTP REST|Dispatches an action payload: `{"action": "dispense" \| "pump" \| "tare"}`|

### 5.3 Telemetry fields

Telemetry JSON emitted over WebSocket or returned by `GET /api/telemetry`:

|   |   |   |
|---|---|---|
|Field|Type|Meaning|
|weight|number|Weight on the scale in grams|
|scaleOk|true or false|False if the HX711 is not responding|
|cat|true or false|A cat is currently on the scale|
|visits|number|Visit count since the station started|
|water|number|Raw water sensor reading|
|waterLow|true or false|Reservoir is below the low-water threshold|
|pump|text|OFF, RUNNING or STOPPING|
|dispensing|true or false|The feeder is currently moving|
|rssi|number|Wi-Fi signal strength in dBm|

### 5.4 Commands

Commands can be sent as text payloads over WebSocket (e.g. `dispense`, `pump`, `tare`) or as JSON to `POST /api/command`:

|   |   |
|---|---|
|Command Payload|Action|
|dispense|Turn the feeder disc to drop a portion|
|pump|Run the pump for 3 seconds with a soft stop|
|tare|Zero the scale|

The firmware ignores a dispense or pump command while that action is already running.

## 6. Web Console Architecture

The web console is built with Next.js and React. It interfaces directly with the ESP32 hardware over the local network.

### 6.1 Pages

- A landing page that explains the project and links into the dashboard.
- A dashboard that shows live data and controls using direct WebSocket and REST hooks (`usePawStation`).

### 6.2 Connection details

|   |   |
|---|---|
|Item|Value|
|Target Host|`NEXT_PUBLIC_ESP32_HOST` (e.g. `pawstation.local` or `192.168.1.150`)|
|WebSocket Stream|`ws://<ESP32_HOST>:81` or `ws://<ESP32_HOST>/ws`|
|REST Command Endpoint|`http://<ESP32_HOST>/api/command`|
|Discovery|Local mDNS discovery with manual IP override in console settings|

Store the target host in environment variables or configure it directly in the web console's hardware settings modal.

### 6.3 What the dashboard should do

- Show weight, cat presence, visit count, water reservoir state, pump state, and feeder movement.
- Treat the station as offline if no WebSocket ping or telemetry has arrived for 5 seconds, displaying an intuitive offline state.
- Provide a built-in realistic mock/simulation mode when the hardware is offline or unconfigured so all UI features remain inspectable.
- Disable actuator buttons while an action is already in flight.
- Work responsively on narrow mobile devices, tablets, and desktop viewports.

### 6.4 Hosting

Deploy from a GitHub repository to Vercel, with `NEXT_PUBLIC_ESP32_HOST` set in environment variables (or configured locally via browser storage).

### 6.5 Security note

Local Wi-Fi communication operates inside the trusted home perimeter. The ESP32 supports optional local API tokens and CORS headers to prevent unauthorized cross-origin requests from foreign browser tabs. Do not expose the ESP32 unauthenticated to the public internet via port forwarding; use a home VPN (e.g. WireGuard / Tailscale) for secure remote access.

## 7. Operation

1. Power the ESP32 and the external 5 V supply. The ESP32 joins local Wi-Fi, initializes mDNS (`pawstation.local`), and lights the onboard status LED.
2. Open the web console. The connection badge changes from "Connecting..." to "ESP32 Wi-Fi Direct (Online)".
3. Watch the weight and visit count. When a cat steps on the scale, the cat indicator turns on and the visit count rises.
4. Tap Dispense food to release a portion.
5. Tap Run pump to top up the water bowl for 3 seconds. If the water indicator shows low, refill the reservoir.
6. Tap Zero the scale after placing the empty bowl so the reading starts at zero.

## 8. Testing and commissioning checklist

|   |   |   |
|---|---|---|
|Step|Test|Pass condition|
|1|Upload with only USB connected|No upload errors|
|2|Wi-Fi and Server|Serial Monitor shows Wi-Fi connected and WebServer/WebSocket started|
|3|Scale|Empty reads near zero, known weight reads correctly after calibration|
|4|Water sensor|Dry and wet readings differ clearly, threshold set between them|
|5|Servo|Moves between the two positions without buzzing or getting hot|
|6|Pump|Runs 3 seconds and stops smoothly|
|7|Power|Wi-Fi stays up when the servo and pump are connected and used|
|8|Direct Communication|`GET /api/status` returns HTTP 200 JSON; WebSocket stream transmits 1 Hz telemetry|
|9|Web Console|Status, live data and all three buttons work cleanly directly over Wi-Fi|
|10|Failure behavior|Unplugging the ESP32 transitions the web console to offline within seconds|

## 9. Troubleshooting

|   |   |   |
|---|---|---|
|Symptom|Likely cause|Fix|
|Upload fails with packet transfer or checksum error|Weak cable, high upload speed, loads pulling power|Lower upload speed to 115200, hold BOOT, unplug 5 V parts while uploading|
|termios error or port busy|Serial Monitor open or port stuck|Close the Serial Monitor, unplug and replug the board|
|No serial port appears|Charge-only cable, missing driver, no USB detection|Use a data cable, install the CP210x or CH340 driver, check System Information|
|ESP32 resets or network disappears when 5 V connected|Power dip or wiring fault|Use the separate 5 V supply, add the capacitor, add parts one at a time, check for shorts|
|Servo gets hot|Stalled at end stops, jammed disc, wrong wiring or voltage|Use narrower angles, let the firmware detach it, check the wiring and the 5 V supply|
|Scale shows offline|HX711 wiring or power|Check DT on GPIO 19, SCK on GPIO 18, 3.3 V and ground, and the four load cell wires|
|Weight wrong or negative|Not calibrated or not tared|Recalibrate, then tare with the scale empty|
|Web console says station offline|ESP32 unpowered, wrong Wi-Fi, 5 GHz network, incorrect IP/hostname|Check power, use 2.4 GHz network, verify IP or `pawstation.local` in Serial Monitor|
|WebSocket connection failed|mDNS not supported by browser/client or firewall blocking port 81|Use explicit local IP (e.g. `192.168.1.x`), ensure client device is on same local Wi-Fi|
|Water reading drifts|Probe corrodes in water over time|Recalibrate, and consider powering the probe only while reading|

## 10. Safety and security

- Never connect the pump or a motor directly to an ESP32 pin. Always switch them through the XY-MOS module.
- Keep the electronics and breadboard away from water and from the cat. Route the tubing so a leak cannot reach the wiring.
- Use food-safe containers and tubing for anything that touches the cat's food or water.
- The pump is limited to 3 seconds per command, which protects it from running dry for long.
- Keep the Wi-Fi credentials out of public repositories.
- Use local network security (WPA2/WPA3) and restrict remote access via VPN rather than port forwarding.

## 11. Limitations and future improvements

- Automatic feeding on a schedule stored directly in ESP32 NVRAM / Preferences.
- Notifications when water is low or the cat has not visited for a long time.
- Calibration and threshold settings editable directly from the web console.
- Over-the-air (OTA) firmware updates via direct web interface.
- A second load cell to weigh the food bowl separately from the cat.

## 12. Quick reference

|   |   |
|---|---|
|Item|Value|
|Controller|ESP32 dev board, 3.3 V logic|
|Network mode|Station mode on a 2.4 GHz Wi-Fi network (with SoftAP fallback)|
|Communication|Direct HTTP REST (port 80) and WebSockets (port 81/80)|
|Endpoints|`/ws`, `/api/status`, `/api/telemetry`, `/api/command`|
|Commands|dispense, pump, tare|
|Pins|HX711 DT 19 and SCK 18, pump switch 23, servo 21, moisture sensor 34|
|Power|Separate 5 V for servo and pump, shared ground, capacitor and diode fitted|
|Web Console|Next.js and React, direct Wi-Fi hooks, Supabase persistent storage|

---
[[Index]] | [[Security Architecture and Hardening]] | [[Supabase and Backend Architecture]] | [[Design System and Apple UI]] | [[Implementation Plan and Roadmap]]
