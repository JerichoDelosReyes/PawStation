---
title: PawStation Hardware, Firmware & Protocol Documentation
tags:
  - pawstation
  - hardware
  - esp32
  - firmware
  - mqtt
aliases:
  - Hardware and Parts
  - Firmware Documentation
date_created: 2026-11-12
status: Approved
---

# PawStation: Smart Cat Feeding and Watering Station

Part of [[Index]] | Related: [[Fynsec UI and Landing Page Architecture]] | [[Security Architecture and Hardening]] | [[Supabase and Backend Architecture]] | [[Design System and Apple UI]] | [[Implementation Plan and Roadmap]]

Project documentation for an ESP32-based feeder, water dispenser and weighing scale that is monitored and controlled from a website on any phone or laptop.

## 1. Project overview

PawStation is a DIY smart feeding station for a cat. An ESP32 microcontroller reads a load cell (the scale) and a water-level sensor, turns a servo that releases a portion of kibble, and switches a small water pump. The ESP32 joins a Wi-Fi network and exchanges messages with a cloud MQTT broker. A website hosted online connects to the same broker, so the owner can watch the station and send commands from a phone or laptop anywhere there is internet.

The ESP32 uses Option B. It connects to an existing Wi-Fi network (home Wi-Fi or a phone hotspot) and talks to a cloud broker, instead of creating its own access point. The website is built separately by the project owner using React, so this document describes it only as far as it must match the firmware.

### 1.1 Objectives

- Weigh whatever is on the scale, detect cat visits and count them.
- Dispense a portion of food on command.
- Run a water pump on command and warn when the reservoir is low.
- Show live readings and accept commands from a website on a phone or laptop.
- Keep the hardware safe: no motor or pump wired directly to an ESP32 pin, protected switching, and a separate power supply for heavy loads.

### 1.2 Scope

In scope: the ESP32 hardware and firmware, the cloud broker setup, the message format between the station and the website, and the requirements the website must meet. Out of scope for this version: automatic feeding schedules, identifying individual cats, notifications and a mobile app.

## 2. System architecture

### 2.1 Components

|   |   |
|---|---|
|Part|What it does|
|Station (ESP32 and parts)|Reads sensors, runs the servo and pump, publishes readings, receives commands|
|MQTT broker (HiveMQ Cloud, free tier)|Passes messages between the station and the website|
|Website (React, hosted on Vercel or Netlify)|Shows live data and sends commands from any browser|

### 2.2 Data flow

```
Sensors and actuators <-> ESP32 --Wi-Fi, TLS, MQTT port 8883--> HiveMQ Cloud broker <--WebSocket TLS port 8884-- Website in the browser
```

1. The ESP32 reads the scale and the water sensor every 500 ms.
2. Once per second it publishes a JSON reading to the broker over an encrypted connection.
3. The website is subscribed to the broker and updates the page as readings arrive.
4. When the user taps a button, the website publishes a command. The ESP32 receives it and runs the servo, the pump or the tare.

### 2.3 Why Option B

- The website can be reached from any phone or laptop with internet, at home or away.
- A hosted website cannot talk to an ESP32 access point. The access point has no internet to load the site, and browsers block an https page from calling an http address such as 192.168.4.1.
- A phone joined to the ESP32's own network loses its mobile data, which is inconvenient.

Requirement: the ESP32 needs a 2.4 GHz Wi-Fi network with internet access. The ESP32 does not support 5 GHz. A phone hotspot works for demonstrations.

## 3. Hardware

### 3.1 Bill of materials

|   |   |   |   |
|---|---|---|---|
|Component|Qty|Specification|Role|
|ESP32 development board|1|30-pin or 38-pin, 3.3 V logic|Controller and Wi-Fi|
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
|GPIO 2|Onboard LED, used as a status light|
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
- Libraries: PubSubClient (Nick O'Leary), HX711 (Bogdan Necula) and ESP32Servo.
- Sketch file: PawStationMQTT.ino.

### 4.2 Configuration

|   |   |   |
|---|---|---|
|Setting|Default|Meaning|
|WIFI_SSID, WIFI_PASS|Placeholder|The 2.4 GHz network the ESP32 joins|
|MQTT_HOST, MQTT_PORT|Cluster host, 8883|HiveMQ Cloud broker address (TLS)|
|MQTT_USER, MQTT_PASS|esp32 and its password|Broker login for the station|
|CALIBRATION_FACTOR|420.0|Scale calibration, see section 4.4|
|CAT_WEIGHT_G|500|Weight in grams that counts as a visit|
|LOW_WATER_RAW|1500|Sensor reading below this means the reservoir is low|
|SERVO_FILL_POS, SERVO_DROP_POS|20, 160 degrees|Feeder disc positions, narrower than full travel to avoid stalling|
|DISPENSE_MS|1200|Time the disc stays at the drop position|
|PUMP_RUN_MS, PUMP_RAMPDOWN_MS|3000, 600|Pump run time and soft-stop time|

### 4.3 Behavior

- **Non-blocking loop.** Pump timing, the servo and Wi-Fi retries all use timers, so the ESP32 never freezes and the watchdog does not reset it.
- **Pump soft-stop.** The pump runs at full duty for 3 seconds, then ramps to zero over 600 ms using PWM on the XY-MOS input.
- **Servo detach.** The servo is powered only while it moves, then released, so it does not overheat holding position.
- **Scale safety.** If the HX711 is missing, the firmware reports the scale as offline instead of hanging.
- **Reconnection.** Wi-Fi and broker connections retry automatically.
- **Last will.** The station posts online when it connects. If it loses power or Wi-Fi, the broker automatically posts offline.
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

## 5. Cloud broker and MQTT interface

### 5.1 Broker setup

1. Create a free Serverless cluster on HiveMQ Cloud and note its host name.
2. In Access Management, create two credentials: one for the ESP32 and one for the website.
3. Restrict each credential to only the topics it needs (table below).

|   |   |   |
|---|---|---|
|Credential|May publish|May subscribe|
|esp32|pawstation/telemetry, pawstation/status|pawstation/cmd|
|pawstation-web|pawstation/cmd|pawstation/telemetry, pawstation/status|

### 5.2 Topics

|   |   |   |
|---|---|---|
|Topic|Direction|Content|
|pawstation/telemetry|Station to website|JSON readings, once per second, not retained|
|pawstation/status|Station to website|online or offline, retained, offline is the last-will message|
|pawstation/cmd|Website to station|A plain text command|

### 5.3 Telemetry fields

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

|   |   |
|---|---|
|Payload on pawstation/cmd|Action|
|dispense|Turn the feeder disc to drop a portion|
|pump|Run the pump for 3 seconds with a soft stop|
|tare|Zero the scale|

The firmware ignores a dispense or pump command while that action is already running.

## 6. Website (built by the project owner)

The website is a separate React project. It must meet the following so it works with the station.

### 6.1 Pages

- A landing page that explains the project and links into the dashboard.
- A dashboard that shows live data and the controls. The planned stack is React with Vite, routing with a hash router, and the mqtt package for the browser.

### 6.2 Connection details

|   |   |
|---|---|
|Item|Value|
|URL|wss://YOUR-CLUSTER-HOST:8884/mqtt|
|Login|The pawstation-web username and password|
|Subscribe to|pawstation/telemetry and pawstation/status|
|Publish to|pawstation/cmd|

Store the host, username and password in environment variables (Vite uses names starting with VITE_) rather than in the code.

### 6.3 What the dashboard should do

- Show weight, cat present or not, visit count, water state, pump state and feeder state.
- Treat the station as offline if the status is offline or no telemetry has arrived for about 6 seconds, and show a clear message.
- Disable the buttons while the station is offline or while that action is already running.
- Show separate messages for the website being unable to reach the broker and the station being offline.
- Work on narrow phone screens as well as laptops.

### 6.4 Hosting

Deploy from a GitHub repository to Vercel or Netlify, with the three environment variables set in the project settings. Build command: npm run build. Output folder: dist.

### 6.5 Security note

A browser-based site cannot hide its broker password, because the build embeds it in the page. For that reason the website credential must be limited to the topics in section 5.1, and its password should be changed if it leaks. Do not commit the .env file to GitHub. A PIN screen written in the page does not add real security.

## 7. Operation

1. Power the ESP32 and the external 5 V supply. The ESP32 joins Wi-Fi and then the broker, and the onboard LED stays solid when the broker connection is up.
2. Open the website. The status should change from connecting to station online.
3. Watch the weight and visit count. When a cat steps on the scale, the cat indicator turns on and the visit count rises.
4. Tap Dispense food to release a portion.
5. Tap Run pump to top up the water bowl for 3 seconds. If the water indicator shows low, refill the reservoir.
6. Tap Zero the scale after placing the empty bowl so the reading starts at zero.

## 8. Testing and commissioning checklist

|   |   |   |
|---|---|---|
|Step|Test|Pass condition|
|1|Upload with only USB connected|No upload errors|
|2|Wi-Fi and broker|Serial Monitor shows MQTT connected|
|3|Scale|Empty reads near zero, known weight reads correctly after calibration|
|4|Water sensor|Dry and wet readings differ clearly, threshold set between them|
|5|Servo|Moves between the two positions without buzzing or getting hot|
|6|Pump|Runs 3 seconds and stops smoothly|
|7|Power|Wi-Fi stays up when the servo and pump are connected and used|
|8|MQTT messages|Telemetry appears in the HiveMQ web client, commands trigger the actions|
|9|Website|Status, live data and all three buttons work on a phone and a laptop|
|10|Failure behavior|Unplugging the ESP32 turns the website to station offline within seconds|

## 9. Troubleshooting

|   |   |   |
|---|---|---|
|Symptom|Likely cause|Fix|
|Upload fails with packet transfer or checksum error|Weak cable, high upload speed, loads pulling power|Lower upload speed to 115200, hold BOOT, unplug 5 V parts while uploading|
|termios error or port busy|Serial Monitor open or port stuck|Close the Serial Monitor, unplug and replug the board|
|No serial port appears|Charge-only cable, missing driver, no USB detection|Use a data cable, install the CP210x or CH340 driver, check System Information|
|ESP32 resets or the network disappears when 5 V is connected|Power dip or wiring fault|Use the separate 5 V supply, add the capacitor, add parts one at a time, check for shorts|
|Servo gets hot|Stalled at end stops, jammed disc, wrong wiring or voltage|Use narrower angles, let the firmware detach it, check the wiring and the 5 V supply|
|Scale shows offline|HX711 wiring or power|Check DT on GPIO 19, SCK on GPIO 18, 3.3 V and ground, and the four load cell wires|
|Weight wrong or negative|Not calibrated or not tared|Recalibrate, then tare with the scale empty|
|Website says station offline|ESP32 unpowered, wrong Wi-Fi, 5 GHz network, wrong broker login|Check power, use a 2.4 GHz network, read the Serial Monitor for the MQTT error code|
|MQTT error rc=5|Not authorized|Check the esp32 username, password and topic permissions|
|Water reading drifts|Probe corrodes in water over time|Recalibrate, and consider powering the probe only while reading|

## 10. Safety and security

- Never connect the pump or a motor directly to an ESP32 pin. Always switch them through the XY-MOS module.
- Keep the electronics and breadboard away from water and from the cat. Route the tubing so a leak cannot reach the wiring.
- Use food-safe containers and tubing for anything that touches the cat's food or water.
- The pump is limited to 3 seconds per command, which protects it from running dry for long.
- Keep the Wi-Fi and broker passwords out of public repositories.
- The firmware currently skips certificate checking on the broker connection to keep setup simple. For real use, load the broker's root certificate.

## 11. Limitations and future improvements

- Automatic feeding on a schedule and daily portion limits.
- Notifications when water is low or the cat has not visited for a long time.
- Calibration and threshold settings editable from the website.
- Over-the-air firmware updates.
- Proper certificate checking and a login system with a small backend.
- A second load cell to weigh the food bowl separately from the cat.

## 12. Quick reference

|   |   |
|---|---|
|Item|Value|
|Controller|ESP32 dev board, 3.3 V logic|
|Network mode|Station mode on a 2.4 GHz Wi-Fi network|
|Broker|HiveMQ Cloud, MQTT over TLS on 8883 (station), WebSocket TLS on 8884 (website)|
|Topics|pawstation/telemetry, pawstation/status, pawstation/cmd|
|Commands|dispense, pump, tare|
|Pins|HX711 DT 19 and SCK 18, pump switch 23, servo 21, moisture sensor 34|
|Power|Separate 5 V for servo and pump, shared ground, capacitor and diode fitted|
|Website|React and Vite, hosted on Vercel or Netlify, built by the project owner|

---
[[Index]] | [[Security Architecture and Hardening]] | [[Supabase and Backend Architecture]] | [[Design System and Apple UI]] | [[Implementation Plan and Roadmap]]

