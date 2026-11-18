/*
 * ==============================================================================
 * PawStation ESP32 Direct Wi-Fi Firmware
 * ==============================================================================
 * File: firmware/PawStationDirect/PawStationDirect.ino
 * ==============================================================================
 */

#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <ESPmDNS.h>
#include <HX711.h>
#include <ESP32Servo.h>
#include <time.h>

// ==============================================================================
// 1. PIN CONFIGURATION
// ==============================================================================
#define MOISTURE_PIN 34  // Moisture / Water level sensor AO (ADC1, Wi-Fi safe)
#define HX_DT_PIN    19  // HX711 Load Cell Data
#define HX_SCK_PIN   18  // HX711 Load Cell Clock
#define PUMP_PIN     23  // XY-MOS MOSFET TRIG / PWM
#define SERVO_PIN    21  // SG90 Feeder Servo signal
#define STATUS_LED   2   // Built-in status LED

// ==============================================================================
// 2. WI-FI & TIME CONFIGURATION
// ==============================================================================
// >>> REPLACE WITH YOUR HOME 2.4 GHz WI-FI CREDENTIALS <<<
const char* WIFI_SSID     = "MeowWhyfi";
const char* WIFI_PASSWORD = "23434523";

// Fallback SoftAP if Home Wi-Fi is unreachable
const char* AP_SSID       = "PawStation-AP";
const char* AP_PASSWORD   = "pawstation123";

// NTP Time Configuration (Default: UTC+8)
const long  GMT_OFFSET_SEC      = 8 * 3600;  // Adjust to your timezone offset in seconds
const int   DAYLIGHT_OFFSET_SEC = 0;
const char* NTP_SERVER_1        = "pool.ntp.org";
const char* NTP_SERVER_2        = "time.google.com";

// ==============================================================================
// 3. HARDWARE & CALIBRATION CONSTANTS
// ==============================================================================
// Use negative calibration factor (-420.0) so downward platform pressure produces positive weight
float CALIBRATION_FACTOR = -420.0;   // Tune with a known weight (e.g. 500g)
const int CAT_WEIGHT_G   = 500;      // Grams threshold to detect cat visit
const int LOW_WATER_RAW  = 1500;     // Raw ADC threshold: below this = low water

const int SERVO_FILL_POS = 0;       // Resting fill angle
const int SERVO_DROP_POS = 55;      // Dispense drop angle
const unsigned long DISPENSE_MS = 1200;

// Pump PWM setup
const int PUMP_PWM_FREQ    = 1000;
const int PUMP_PWM_RES     = 8;      // Duty 0-255
const int PUMP_PWM_CHANNEL = 4;
const unsigned long PUMP_RUN_MS      = 3000;
const unsigned long PUMP_RAMPDOWN_MS = 600;

// ==============================================================================
// 4. GLOBAL INSTANCES & SYSTEM STATE
// ==============================================================================
HX711 scale;
Servo feeder;
WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

float weightG    = 0.0;
long  rawValue   = 0;
bool  scaleOk    = false;
int   waterRaw   = 0;
bool  waterLow   = false;
bool  catPresent = false;
int   catVisits  = 0;

enum PumpState { PUMP_OFF, PUMP_RUN, PUMP_RAMP };
PumpState pumpState = PUMP_OFF;
unsigned long pumpT0 = 0;

bool dispensing = false;
unsigned long dispenseT0 = 0;

// Schedule & Clock State
String feedingSchedule = "08:00,18:00";
String lastAutoFeed    = "--";
String lastCheckedMin  = "";

// ==============================================================================
// 5. HELPER FUNCTIONS: TIME & SCHEDULING
// ==============================================================================
String getCurrentTimeStr(bool &isOk) {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo, 50)) {
    isOk = false;
    unsigned long sec = millis() / 1000;
    char buf[16];
    snprintf(buf, sizeof(buf), "%02lu:%02lu:%02lu", (sec / 3600) % 24, (sec / 60) % 60, sec % 60);
    return String(buf);
  }
  isOk = true;
  char buf[16];
  snprintf(buf, sizeof(buf), "%02d:%02d:%02d", timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
  return String(buf);
}

// ==============================================================================
// 6. HELPER FUNCTIONS: ACTUATORS
// ==============================================================================
void pumpWrite(int duty) {
#if ESP_ARDUINO_VERSION_MAJOR >= 3
  ledcWriteChannel(PUMP_PWM_CHANNEL, duty);
#else
  ledcWrite(PUMP_PWM_CHANNEL, duty);
#endif
}

void triggerDispense() {
  if (!dispensing) {
    feeder.attach(SERVO_PIN, 500, 2400);
    feeder.write(SERVO_DROP_POS);
    dispenseT0 = millis();
    dispensing = true;
    Serial.println("[Feeder] Dispensing portion...");
  }
}

void triggerPump() {
  if (pumpState == PUMP_OFF) {
    pumpWrite(255);
    pumpState = PUMP_RUN;
    pumpT0 = millis();
    Serial.println("[Pump] ON (3s run cycle)");
  }
}

void triggerTare() {
  if (scale.wait_ready_timeout(500)) {
    scale.tare(5);
    Serial.println("[Scale] Zeroed / Tared");
  }
}

void updatePump(unsigned long now) {
  if (pumpState == PUMP_RUN) {
    if (now - pumpT0 >= PUMP_RUN_MS) {
      pumpState = PUMP_RAMP;
      pumpT0 = now;
    }
  } else if (pumpState == PUMP_RAMP) {
    unsigned long elapsed = now - pumpT0;
    if (elapsed >= PUMP_RAMPDOWN_MS) {
      pumpWrite(0);
      pumpState = PUMP_OFF;
      Serial.println("[Pump] OFF");
    } else {
      pumpWrite(255 - (int)(255UL * elapsed / PUMP_RAMPDOWN_MS));
    }
  }
}

const char* pumpName() {
  return pumpState == PUMP_OFF ? "OFF" : (pumpState == PUMP_RUN ? "RUNNING" : "STOPPING");
}

void checkSchedule(const String &clockStr, bool timeOk) {
  if (!timeOk) return;
  String currentHHMM = clockStr.substring(0, 5); // "HH:MM"
  if (currentHHMM == lastCheckedMin) return;
  lastCheckedMin = currentHHMM;

  int startIndex = 0;
  while (startIndex < (int)feedingSchedule.length()) {
    int commaIndex = feedingSchedule.indexOf(',', startIndex);
    if (commaIndex == -1) commaIndex = feedingSchedule.length();
    String scheduledSlot = feedingSchedule.substring(startIndex, commaIndex);
    scheduledSlot.trim();
    if (scheduledSlot == currentHHMM) {
      Serial.printf("[Scheduler] Auto-feed triggered for %s\n", scheduledSlot.c_str());
      triggerDispense();
      lastAutoFeed = currentHHMM;
      break;
    }
    startIndex = commaIndex + 1;
  }
}

// ==============================================================================
// 7. TELEMETRY JSON GENERATOR
// ==============================================================================
String buildTelemetryJson() {
  bool timeOk = false;
  String clockStr = getCurrentTimeStr(timeOk);
  int rssiVal = (WiFi.status() == WL_CONNECTED) ? WiFi.RSSI() : -40;

  String json = "{";
  json += "\"weight\":" + String(weightG, 1) + ",";
  json += "\"raw\":" + String(rawValue) + ",";
  json += "\"scaleOk\":" + String(scaleOk ? "true" : "false") + ",";
  json += "\"cat\":" + String(catPresent ? "true" : "false") + ",";
  json += "\"visits\":" + String(catVisits) + ",";
  json += "\"water\":" + String(waterRaw) + ",";
  json += "\"waterLow\":" + String(waterLow ? "true" : "false") + ",";
  json += "\"pump\":\"" + String(pumpName()) + "\",";
  json += "\"dispensing\":" + String(dispensing ? "true" : "false") + ",";
  json += "\"rssi\":" + String(rssiVal) + ",";
  json += "\"clock\":\"" + clockStr + "\",";
  json += "\"timeOk\":" + String(timeOk ? "true" : "false") + ",";
  json += "\"sched\":\"" + feedingSchedule + "\",";
  json += "\"lastAuto\":\"" + lastAutoFeed + "\"";
  json += "}";
  return json;
}

// ==============================================================================
// 8. WEBSOCKET EVENT HANDLER
// ==============================================================================
void parseAndExecuteCommand(const String &cmdText) {
  if (cmdText.indexOf("dispense") >= 0) {
    triggerDispense();
  } else if (cmdText.indexOf("pump") >= 0) {
    triggerPump();
  } else if (cmdText.indexOf("tare") >= 0) {
    triggerTare();
  } else if (cmdText.indexOf("\"schedule\"") >= 0 || cmdText.indexOf("\"sched\"") >= 0) {
    int keyPos = cmdText.indexOf("schedule");
    if (keyPos < 0) keyPos = cmdText.indexOf("sched");
    int colonPos = cmdText.indexOf(':', keyPos);
    if (colonPos > 0) {
      int quote1 = cmdText.indexOf('"', colonPos);
      int quote2 = cmdText.indexOf('"', quote1 + 1);
      if (quote1 > 0 && quote2 > quote1) {
        feedingSchedule = cmdText.substring(quote1 + 1, quote2);
        Serial.printf("[Scheduler] Updated via WS to: %s\n", feedingSchedule.c_str());
      }
    }
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[WS #%u] Disconnected\n", num);
      break;
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[WS #%u] Connected from %s\n", num, ip.toString().c_str());
      String telemetry = buildTelemetryJson();   // <-- store first
      webSocket.sendTXT(num, telemetry);
      break;
    }
    case WStype_TEXT: {
      String msg = String((char*)payload);
      Serial.printf("[WS #%u] Message: %s\n", num, msg.c_str());
      parseAndExecuteCommand(msg);
      String telemetry = buildTelemetryJson();   // <-- store first
      webSocket.sendTXT(num, telemetry);
      break;
    }
    default:
      break;
  }
}
// ==============================================================================
// 9. HTTP REST HANDLERS & CORS SUPPORT
// ==============================================================================
void setCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.sendHeader("Access-Control-Allow-Private-Network", "true");
}

void handleOptions() {
  setCorsHeaders();
  server.send(204);
}

void handleTelemetry() {
  setCorsHeaders();
  server.send(200, "application/json", buildTelemetryJson());
}

void handleCommandPost() {
  setCorsHeaders();
  String body = "";
  if (server.hasArg("plain")) {
    body = server.arg("plain");
  } else if (server.hasArg("command")) {
    body = server.arg("command");
  } else if (server.hasArg("cmd")) {
    body = server.arg("cmd");
  } else if (server.hasArg("action")) {
    body = server.arg("action");
  }
  if (body.length() > 0) {
    parseAndExecuteCommand(body);
  }
  server.send(200, "application/json", "{\"status\":\"ok\"}");
}

void handleSchedulePost() {
  setCorsHeaders();
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    parseAndExecuteCommand(body);
  }
  server.send(200, "application/json", "{\"status\":\"ok\",\"schedule\":\"" + feedingSchedule + "\"}");
}

void handleStatus() {
  setCorsHeaders();
  String ip = (WiFi.status() == WL_CONNECTED) ? WiFi.localIP().toString() : WiFi.softAPIP().toString();
  String json = "{";
  json += "\"status\":\"online\",";
  json += "\"ip\":\"" + ip + "\",";
  json += "\"hostname\":\"pawstation.local\",";
  json += "\"uptime_s\":" + String(millis() / 1000);
  json += "}";
  server.send(200, "application/json", json);
}

// Emergency Fallback UI
const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PawStation Emergency Console</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #0f1117; color: #fff; text-align: center; padding: 24px; margin: 0; }
    .card { max-width: 420px; margin: auto; background: #181d28; padding: 24px; border-radius: 20px; border: 1px solid #282f40; }
    h1 { font-size: 20px; color: #f59e0b; margin-bottom: 20px; }
    .metric { background: #10131c; border-radius: 12px; padding: 12px; margin-bottom: 12px; text-align: left; }
    .label { font-size: 11px; color: #8892b0; text-transform: uppercase; font-weight: 600; }
    .val { font-size: 28px; font-weight: bold; color: #fff; font-family: monospace; }
    .btn-grid { display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 16px; }
    button { padding: 12px; font-size: 13px; font-weight: 600; border-radius: 10px; border: none; cursor: pointer; background: #f59e0b; color: #000; text-transform: uppercase; }
    .btn-secondary { background: #282f40; color: #fff; }
  </style>
</head>
<body>
  <div class="card">
    <h1>PAWSTATION DIRECT</h1>
    <div class="metric"><div class="label">Scale Weight</div><div class="val" id="w">-- g</div></div>
    <div class="metric"><div class="label">Water Reservoir</div><div class="val" id="water">--</div></div>
    <div class="metric"><div class="label">Cat Visits Today</div><div class="val" id="v">--</div></div>
    <div class="btn-grid">
      <button onclick="fetch('/api/command',{method:'POST',body:JSON.stringify({command:'dispense'})})">Dispense Food</button>
      <button onclick="fetch('/api/command',{method:'POST',body:JSON.stringify({command:'pump'})})" class="btn-secondary">Run Pump (3s)</button>
      <button onclick="fetch('/api/command',{method:'POST',body:JSON.stringify({command:'tare'})})" class="btn-secondary">Zero Scale</button>
    </div>
  </div>
  <script>
    setInterval(() => {
      fetch('/api/telemetry').then(r => r.json()).then(d => {
        document.getElementById('w').textContent = d.weight.toFixed(1) + ' g';
        document.getElementById('water').textContent = d.waterLow ? 'LOW REFILL' : 'NORMAL (' + d.water + ')';
        document.getElementById('v').textContent = d.visits + (d.cat ? ' (CAT HERE)' : '');
      }).catch(() => {});
    }, 1000);
  </script>
</body>
</html>
)rawliteral";

// ==============================================================================
// 10. SETUP INITIALIZATION
// ==============================================================================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n\n========================================");
  Serial.println("  PAWSTATION SMART PET HARDWARE INITIALIZING  ");
  Serial.println("========================================");

  pinMode(STATUS_LED, OUTPUT);
  pinMode(MOISTURE_PIN, INPUT);

  // Initialize Servo
  ESP32PWM::allocateTimer(0);
  feeder.setPeriodHertz(50);
  feeder.attach(SERVO_PIN, 500, 2400);
  feeder.write(SERVO_FILL_POS);
  delay(300);
  feeder.detach(); // Detach initially to prevent motor hum/heating

  // Initialize Pump PWM
#if ESP_ARDUINO_VERSION_MAJOR >= 3
  ledcAttachChannel(PUMP_PIN, PUMP_PWM_FREQ, PUMP_PWM_RES, PUMP_PWM_CHANNEL);
#else
  ledcSetup(PUMP_PWM_CHANNEL, PUMP_PWM_FREQ, PUMP_PWM_RES);
  ledcAttachPin(PUMP_PIN, PUMP_PWM_CHANNEL);
#endif
  pumpWrite(0);

  // Initialize HX711 Scale
  scale.begin(HX_DT_PIN, HX_SCK_PIN);
  if (scale.wait_ready_timeout(1000)) {
    scale.set_scale(CALIBRATION_FACTOR);
    scale.tare(5);
    scaleOk = true;
    Serial.println("[Scale] HX711 connected and tared successfully.");
  } else {
    Serial.println("[Scale] WARNING: HX711 not detected. Continuing in offline scale mode.");
  }

  // Connect to Home Wi-Fi
  Serial.printf("[Wi-Fi] Connecting to %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 15000) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(STATUS_LED, HIGH);
    Serial.println("\n[Wi-Fi] Connected successfully!");
    Serial.print("[Wi-Fi] IP Address: ");
    Serial.println(WiFi.localIP());

    // Start mDNS Responder
    if (MDNS.begin("pawstation")) {
      Serial.println("[mDNS] Responder started: http://pawstation.local");
      MDNS.addService("http", "tcp", 80);
      MDNS.addService("ws", "tcp", 81);
    }

    configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER_1, NTP_SERVER_2);
  } else {
    Serial.println("\n[Wi-Fi] Connection timeout. Launching Fallback SoftAP...");
    WiFi.mode(WIFI_AP);
    WiFi.softAP(AP_SSID, AP_PASSWORD);
    Serial.print("[Wi-Fi AP] SoftAP SSID: ");
    Serial.println(AP_SSID);
    Serial.print("[Wi-Fi AP] IP Address: ");
    Serial.println(WiFi.softAPIP());
  }

  // Start Embedded WebSocket Server on Port 81
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("[WebSocket] Server started on port 81");

  // Register WebServer HTTP Routes
  server.on("/", []() {
    setCorsHeaders();
    server.send(200, "text/html", index_html);
  });
  server.on("/api/telemetry", HTTP_GET, handleTelemetry);
  server.on("/api/telemetry", HTTP_OPTIONS, handleOptions);
  server.on("/api/command", HTTP_GET, []() {
    setCorsHeaders();
    String cmd = server.hasArg("command") ? server.arg("command") : (server.hasArg("cmd") ? server.arg("cmd") : "");
    if (cmd.length() > 0) {
      parseAndExecuteCommand(cmd);
    }
    server.send(200, "application/json", "{\"status\":\"ok\"}");
  });
  server.on("/api/command", HTTP_POST, handleCommandPost);
  server.on("/api/command", HTTP_OPTIONS, handleOptions);
  server.on("/api/schedule", HTTP_POST, handleSchedulePost);
  server.on("/api/schedule", HTTP_OPTIONS, handleOptions);
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/api/status", HTTP_OPTIONS, handleOptions);

  // Backward compatibility routes
  server.on("/data", HTTP_GET, handleTelemetry);
  server.on("/dispense", HTTP_GET, []() { triggerDispense(); handleTelemetry(); });
  server.on("/pump", HTTP_GET, []() { triggerPump(); handleTelemetry(); });
  server.on("/tare", HTTP_GET, []() { triggerTare(); handleTelemetry(); });

  server.begin();
  Serial.println("[HTTP] REST API Server started on port 80");
  Serial.println("========================================\n");
}

// ==============================================================================
// 11. MAIN EXECUTION LOOP
// ==============================================================================
void loop() {
  server.handleClient();
  webSocket.loop();

  unsigned long now = millis();

  updatePump(now);

  if (dispensing && now - dispenseT0 >= DISPENSE_MS) {
    feeder.write(SERVO_FILL_POS);
    dispensing = false;
    delay(200);
    feeder.detach();
  }

  static unsigned long lastTelemetryTime = 0;
  if (now - lastTelemetryTime >= 1000) {
    lastTelemetryTime = now;

    // Wait up to 150ms for 10Hz HX711 conversion cycle (~100ms)
    if (scale.wait_ready_timeout(150)) {
      if (!scaleOk) {
        scale.set_scale(CALIBRATION_FACTOR);
        scale.tare(3);
        scaleOk = true;
      }
      rawValue = scale.read();
      float delta = (float)(rawValue - scale.get_offset());
      float rawWeight = delta / CALIBRATION_FACTOR;
      // Filter micro noise around 0, but preserve true negative readings so wiring polarity can be debugged
      if (fabs(rawWeight) < 2.0) {
        weightG = 0.0;
      } else {
        weightG = rawWeight;
      }
    } else {
      scaleOk = false;
    }

    waterRaw = analogRead(MOISTURE_PIN);
    waterLow = (waterRaw < LOW_WATER_RAW);

    if (scaleOk && weightG >= CAT_WEIGHT_G) {
      if (!catPresent) {
        catPresent = true;
        catVisits++;
      }
    } else {
      catPresent = false;
    }

    bool timeOk = false;
    String clockStr = getCurrentTimeStr(timeOk);
    checkSchedule(clockStr, timeOk);

    // Broadcast Telemetry via WebSocket to all web clients
    String payload = buildTelemetryJson();
    webSocket.broadcastTXT(payload);

    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
  }
}