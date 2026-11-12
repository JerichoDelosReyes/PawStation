"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, ShieldIcon } from "./Icons";

interface DossierItem {
  id: string;
  category: "all" | "actuation" | "hydration" | "power" | "sensors" | "telemetry" | "safety";
  categoryLabel: string;
  statusBadge: string;
  question: string;
  summary: string;
  analysis: string;
  parameters: {
    label: string;
    value: string;
  }[];
}

const CATEGORIES = [
  { id: "all", label: "All Subsystems", code: "ALL" },
  { id: "actuation", label: "Actuation & Dispense", code: "ACT" },
  { id: "hydration", label: "Hydration & Pump", code: "HYD" },
  { id: "power", label: "Electrical & Power", code: "PWR" },
  { id: "sensors", label: "Scale & Load Cell", code: "SEN" },
  { id: "telemetry", label: "Cloud & Telemetry", code: "NET" },
  { id: "safety", label: "Materials & Safety", code: "MAT" },
] as const;

const DOSSIER_ITEMS: DossierItem[] = [
  {
    id: "DOSS-ACT-01",
    category: "actuation",
    categoryLabel: "Actuation & Dispense",
    statusBadge: "Kinematic Safeguard",
    question: "How does the SG90 servo dispense dry kibble without thermal stall?",
    summary: "Bi-directional 20-to-160 degree disc sweep releasing nominal 35g kibble with firmware motor detachment.",
    analysis:
      "An SG90 micro-servo rotates an internal rotary feeder disc between two calibrated mechanical stops at 20 degrees and 160 degrees. Each cycle meters approximately 35 grams of dry feline kibble through the gravity chute. To prevent continuous stall currents, motor heating, and gear stripped failures at the mechanical limits, the ESP32 firmware executes a detach command immediately following completion of the cycle. A 470uF to 1000uF electrolytic capacitor across the 5V rail dampens transient inrush current during acceleration.",
    parameters: [
      { label: "Signal Pin", value: "GPIO 21 (PWM 50Hz)" },
      { label: "Portion Size", value: "Nominal 35g kibble" },
      { label: "Sweep Arc", value: "20 deg to 160 deg" },
      { label: "Idle State", value: "Detached (0mA draw)" },
    ],
  },
  {
    id: "DOSS-HYD-01",
    category: "hydration",
    categoryLabel: "Hydration & Pump",
    statusBadge: "Runaway Interlock",
    question: "What safeguards prevent water pump runaway, dry running, and inductive spikes?",
    summary: "Firmware 3-second hard timeout, 600ms PWM soft-stop ramp, and a 1N4007 flyback diode protection.",
    analysis:
      "The submersible 3-5V DC fluid pump is driven through an XY-MOS dual-MOSFET module connected to GPIO 23. Firmware enforces a strict non-blocking 3000ms execution cap per actuation request, preventing fluid overflow and dry-burn damage. At the end of the 3-second pulse, duty cycle ramps smoothly to zero over 600ms (soft-stop), eliminating water hammer and hydraulic shock. A 1N4007 fast flyback diode across the motor terminals clamps inductive back-EMF spikes that could otherwise corrupt logic signals.",
    parameters: [
      { label: "Drive Pin", value: "GPIO 23 (PWM Low-Side)" },
      { label: "Runtime Cap", value: "3000ms automatic cutoff" },
      { label: "Ramp Curve", value: "600ms soft-stop decay" },
      { label: "Diode Clamp", value: "1N4007 across motor" },
    ],
  },
  {
    id: "DOSS-PWR-01",
    category: "power",
    categoryLabel: "Electrical & Power",
    statusBadge: "Dual-Rail Isolation",
    question: "Why does the PawStation architecture enforce strict dual-rail power isolation?",
    summary: "Physical separation between high-current inductive actuators and sensitive 3.3V ESP32 logic.",
    analysis:
      "DC motor pumps and servo actuators generate severe transient voltage dips and inductive noise exceeding 1.2A during stall or spin-up. If routed directly through the ESP32 development board, these transients trigger brownout resets and Wi-Fi radio dropouts. PawStation implements an isolated dual-rail topology: an external 5V 2A auxiliary power supply powers the pump and servo, while the ESP32 runs independently from USB or an isolated buck converter. Both rails share a common ground reference exclusively.",
    parameters: [
      { label: "Actuator Rail", value: "5V DC (2.0A dedicated)" },
      { label: "Logic Rail", value: "3.3V DC (ESP32 bus)" },
      { label: "Ground Tie", value: "Single common point" },
      { label: "Brownout Risk", value: "Zero (isolated bus)" },
    ],
  },
  {
    id: "DOSS-SEN-01",
    category: "sensors",
    categoryLabel: "Scale & Load Cell",
    statusBadge: "Gram-Level Resolution",
    question: "How is the 10kg load cell calibrated and zeroed across temperature drift?",
    summary: "24-bit HX711 differential ADC reading strain gauge bridge with remote MQTT zero-tare offset.",
    analysis:
      "A 10kg aluminum bar load cell uses a four-gauge Wheatstone bridge connected to an HX711 24-bit differential analog-to-digital converter. Calibration uses a two-point linear factor derived from a known calibration mass (e.g. 500g). A digital tare offset can be triggered remotely via MQTT or at station boot, zeroing out bowl mass. Cat presence detection trips when weight differential exceeds +150g above tare baseline, tracking visit frequency and duration automatically.",
    parameters: [
      { label: "Data Pin", value: "GPIO 19 (HX711 DT)" },
      { label: "Clock Pin", value: "GPIO 18 (HX711 SCK)" },
      { label: "Resolution", value: "24-bit (~0.5g error)" },
      { label: "Trip Threshold", value: "+150g delta visit" },
    ],
  },
  {
    id: "DOSS-NET-01",
    category: "telemetry",
    categoryLabel: "Cloud & Telemetry",
    statusBadge: "Fail-Safe Protocol",
    question: "What happens during a Wi-Fi dropout or cloud broker connectivity loss?",
    summary: "MQTT Last Will and Testament (LWT) notification, 6-second heartbeat trip, and non-blocking reconnect.",
    analysis:
      "The station publishes 1Hz state telemetry over port 8884 WebSocket TLS to HiveMQ Cloud. The broker maintains a persistent Last Will and Testament (LWT) record on pawstation/status. If the ESP32 loses carrier signal, the broker instantly marks the station offline. Browser dashboards detect missed telemetry packets within 6000ms. Crucially, ESP32 reconnect loops use non-blocking asynchronous timers so the internal hardware watchdog timer (WDT) is never blocked.",
    parameters: [
      { label: "Broker Endpoint", value: "HiveMQ Cloud TLS" },
      { label: "WebSocket Port", value: "8884 (TLS WSS)" },
      { label: "LWT Timeout", value: "6000ms missed packet" },
      { label: "Watchdog Loop", value: "Non-blocking async" },
    ],
  },
  {
    id: "DOSS-MAT-01",
    category: "safety",
    categoryLabel: "Materials & Safety",
    statusBadge: "Biological Grade",
    question: "Are contact surfaces and fluid conduits safe for feline consumption?",
    summary: "Food-grade BPA-free plastics, platinum-cured silicone tubing, and physical fluid-electrical barriers.",
    analysis:
      "All physical components in contact with kibble or water are specified for food-grade contact: BPA-free PETG or polypropylene for the kibble hopper and dispenser disc, platinum-cured non-toxic silicone tubing for the water conduit, and non-porous ceramic bowls. The chassis utilizes a double-deck layout where electronics, breadboard wiring, and power connections are physically isolated behind a sealed vertical bulkhead with dedicated drip loops.",
    parameters: [
      { label: "Fluid Conduit", value: "Platinum silicone tube" },
      { label: "Dispense Hopper", value: "BPA-Free PETG" },
      { label: "Isolation Barrier", value: "Sealed bulkhead" },
      { label: "Bowl Surfaces", value: "Food-safe ceramic" },
    ],
  },
  {
    id: "DOSS-HYD-02",
    category: "hydration",
    categoryLabel: "Hydration & Pump",
    statusBadge: "Sensor Life Extension",
    question: "How does the water reservoir level probe prevent electrode corrosion?",
    summary: "LM393 comparator with pulsed measurement intervals to mitigate DC electrolysis degradation.",
    analysis:
      "Standard DC probes immersed in standing water suffer galvanic oxidation and ionic depletion over continuous operation. The PawStation architecture utilizes an LM393 comparator probe calibrated with discrete wet/dry voltage bands. Firmware samples the analog level on GPIO 34 at scheduled intervals rather than applying continuous current. If the reading drops below the calibrated safe threshold, the web console warns the owner and software interlocks lock out the pump command.",
    parameters: [
      { label: "Analog Input", value: "GPIO 34 (ADC1)" },
      { label: "Sensor Module", value: "LM393 Comparator" },
      { label: "Probe Sampling", value: "Interval pulsed read" },
      { label: "Dry Cutoff", value: "Auto-inhibit pump" },
    ],
  },
  {
    id: "DOSS-PWR-02",
    category: "power",
    categoryLabel: "Electrical & Power",
    statusBadge: "Bench Validation",
    question: "What is the recommended 10-point commissioning sequence for new builds?",
    summary: "Systematic staged bring-up protocol ensuring zero brownouts before live feline deployment.",
    analysis:
      "Before deploying PawStation with animals, follow the 10-step bench checklist: (1) USB-only flash to verify bootloader, (2) Serial monitor Wi-Fi credential validation, (3) Tare scale unloaded, (4) Verify with 500g standard mass, (5) Test SG90 servo rotation without dry food, (6) 3-second pump cycle into test container, (7) Measure 5V aux rail under actuator load, (8) Verify MQTT command reception, (9) Confirm WebSocket telemetry in web UI, (10) Disconnect power to confirm 6-second offline UI trip.",
    parameters: [
      { label: "Checklist", value: "10-point staged bring-up" },
      { label: "Diagnostics", value: "UART Serial @ 115200" },
      { label: "Test Mass", value: "500g calibration block" },
      { label: "Pass Criteria", value: "Zero brownout reboots" },
    ],
  },
];

export default function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "DOSS-ACT-01": true,
  });

  const filteredItems =
    selectedCategory === "all"
      ? DOSSIER_ITEMS
      : DOSSIER_ITEMS.filter((item) => item.category === selectedCategory);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getCategoryCount = (catId: string) => {
    if (catId === "all") return DOSSIER_ITEMS.length;
    return DOSSIER_ITEMS.filter((item) => item.category === catId).length;
  };

  return (
    <section
      id="faq"
      className="py-24 md:py-32 bg-canvas-light dark:bg-canvas-dark border-t border-[#D8E4F2] dark:border-white/[0.04] transition-colors duration-200"
    >
      <div className="section-container">
        {/* Editorial Section Header */}
        <div className="mb-14 md:mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase bg-periwinkle/10 text-periwinkle dark:bg-periwinkle/20 dark:text-periwinkle-light border border-periwinkle/20">
              <span className="w-1.5 h-1.5 rounded-full bg-periwinkle animate-pulse" />
              SYS_DOC: PS-ENG-2026 // REV 1.4
            </span>
            <span className="text-[12px] font-mono text-navy-muted dark:text-navy-lightMuted">
              CONFIDENTIAL HARDWARE REFERENCE
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-tight text-navy dark:text-white leading-[1.1]">
                Technical Engineering Dossier
              </h2>
              <p className="text-[15px] md:text-[17px] text-navy-muted dark:text-navy-lightMuted mt-3 leading-relaxed">
                Field specifications, circuit topologies, safety interlocks, and firmware protocols governing the ESP32 PawStation hardware prototype.
              </p>
            </div>

            <div className="flex items-center gap-6 py-2 px-4 rounded-xl bg-white dark:bg-navy-card border border-[#D8E4F2] dark:border-white/[0.08] text-[13px] font-mono shrink-0 shadow-sm">
              <div>
                <span className="block text-[11px] text-navy-muted dark:text-navy-lightMuted uppercase">
                  Subsystems
                </span>
                <span className="font-bold text-navy dark:text-white">
                  8 Modules
                </span>
              </div>
              <div className="w-px h-8 bg-[#D8E4F2] dark:bg-white/[0.08]" />
              <div>
                <span className="block text-[11px] text-navy-muted dark:text-navy-lightMuted uppercase">
                  Telemetry
                </span>
                <span className="font-bold text-[#38BDF8]">
                  MQTT WSS TLS
                </span>
              </div>
              <div className="w-px h-8 bg-[#D8E4F2] dark:bg-white/[0.08]" />
              <div>
                <span className="block text-[11px] text-navy-muted dark:text-navy-lightMuted uppercase">
                  Validation
                </span>
                <span className="font-bold text-periwinkle dark:text-periwinkle-light">
                  Hardware v1.2
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Split-Layout: Left Specs & Category Filter, Right Dossier Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Category Filter & Engineering Specs Sheet */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Category Navigation Panel */}
            <div className="bg-white dark:bg-navy-card rounded-2xl p-5 border border-[#D8E4F2] dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D8E4F2] dark:border-white/[0.08]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-navy-muted dark:text-navy-lightMuted font-semibold">
                  INDEX // SUBSYSTEM FILTER
                </span>
                <span className="text-[11px] font-mono text-periwinkle dark:text-periwinkle-light font-bold">
                  {filteredItems.length} Records
                </span>
              </div>

              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const count = getCategoryCount(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left ${
                        isActive
                          ? "bg-periwinkle text-white shadow-sm font-semibold"
                          : "text-navy dark:text-navy-lightMuted hover:bg-[#EBF3FA]/70 dark:hover:bg-white/[0.04] hover:text-navy dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-[#EBF3FA] dark:bg-white/[0.06] text-navy-muted dark:text-navy-lightMuted"
                          }`}
                        >
                          {cat.code}
                        </span>
                        <span>{cat.label}</span>
                      </div>
                      <span
                        className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "text-navy-muted dark:text-navy-lightMuted"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hardware Architecture Specs Sheet */}
            <div className="bg-white dark:bg-navy-card rounded-2xl p-5 border border-[#D8E4F2] dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D8E4F2] dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <ShieldIcon className="w-4 h-4 text-periwinkle dark:text-periwinkle-light" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-navy-muted dark:text-navy-lightMuted font-semibold">
                    HARDWARE SPECIFICATION
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#38BDF8]/10 text-[#0284C7] dark:text-[#38BDF8] border border-[#38BDF8]/20 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping" />
                  ONLINE
                </span>
              </div>

              <div className="space-y-3 font-mono text-[12px]">
                <div className="flex items-center justify-between py-1 border-b border-[#D8E4F2]/50 dark:border-white/[0.04]">
                  <span className="text-navy-muted dark:text-navy-lightMuted">Controller</span>
                  <span className="text-navy dark:text-white font-medium">ESP32 240MHz</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#D8E4F2]/50 dark:border-white/[0.04]">
                  <span className="text-navy-muted dark:text-navy-lightMuted">Scale ADC</span>
                  <span className="text-navy dark:text-white font-medium">HX711 24-Bit</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#D8E4F2]/50 dark:border-white/[0.04]">
                  <span className="text-navy-muted dark:text-navy-lightMuted">Dispenser</span>
                  <span className="text-navy dark:text-white font-medium">SG90 Servo</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#D8E4F2]/50 dark:border-white/[0.04]">
                  <span className="text-navy-muted dark:text-navy-lightMuted">Pump Switch</span>
                  <span className="text-navy dark:text-white font-medium">Dual XY-MOS</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#D8E4F2]/50 dark:border-white/[0.04]">
                  <span className="text-navy-muted dark:text-navy-lightMuted">Power Rail</span>
                  <span className="text-navy dark:text-white font-medium">Isolated 5V 2A</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#D8E4F2]/50 dark:border-white/[0.04]">
                  <span className="text-navy-muted dark:text-navy-lightMuted">Cloud WSS</span>
                  <span className="text-navy dark:text-white font-medium">Port 8884 TLS</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-navy-muted dark:text-navy-lightMuted">Soft-Stop</span>
                  <span className="text-navy dark:text-white font-medium">600ms Ramp</span>
                </div>
              </div>

              {/* Pin Map Blueprint Box */}
              <div className="mt-5 pt-4 border-t border-[#D8E4F2] dark:border-white/[0.08]">
                <span className="text-[10px] font-mono uppercase tracking-widest text-navy-muted dark:text-navy-lightMuted block mb-2 font-semibold">
                  PRIMARY PIN ROUTING
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  <div className="p-2 rounded bg-canvas-light/60 dark:bg-canvas-dark/60 border border-[#D8E4F2]/50 dark:border-white/[0.04]">
                    <span className="text-periwinkle dark:text-periwinkle-light font-bold">GPIO 19</span>
                    <span className="block text-[10px] text-navy-muted dark:text-navy-lightMuted">Scale DT</span>
                  </div>
                  <div className="p-2 rounded bg-canvas-light/60 dark:bg-canvas-dark/60 border border-[#D8E4F2]/50 dark:border-white/[0.04]">
                    <span className="text-periwinkle dark:text-periwinkle-light font-bold">GPIO 18</span>
                    <span className="block text-[10px] text-navy-muted dark:text-navy-lightMuted">Scale SCK</span>
                  </div>
                  <div className="p-2 rounded bg-canvas-light/60 dark:bg-canvas-dark/60 border border-[#D8E4F2]/50 dark:border-white/[0.04]">
                    <span className="text-periwinkle dark:text-periwinkle-light font-bold">GPIO 21</span>
                    <span className="block text-[10px] text-navy-muted dark:text-navy-lightMuted">Servo PWM</span>
                  </div>
                  <div className="p-2 rounded bg-canvas-light/60 dark:bg-canvas-dark/60 border border-[#D8E4F2]/50 dark:border-white/[0.04]">
                    <span className="text-periwinkle dark:text-periwinkle-light font-bold">GPIO 23</span>
                    <span className="block text-[10px] text-navy-muted dark:text-navy-lightMuted">Pump Gate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Technical Reference Dossier Cards */}
          <div className="lg:col-span-8 space-y-5">
            {/* Active Subsystem Indicator Bar */}
            <div className="flex items-center justify-between pb-2 text-[12px] font-mono text-navy-muted dark:text-navy-lightMuted">
              <span className="uppercase">
                Showing {filteredItems.length} Dossier Entry{filteredItems.length !== 1 ? "ies" : ""}
              </span>
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="text-periwinkle dark:text-periwinkle-light hover:underline font-semibold"
                >
                  Reset To All Subsystems
                </button>
              )}
            </div>

            {/* Dossier Item Cards */}
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const isOpen = openItems[item.id] ?? false;
                return (
                  <article
                    key={item.id}
                    className={`rounded-2xl transition-all border ${
                      isOpen
                        ? "bg-white dark:bg-navy-card border-periwinkle/30 dark:border-periwinkle/30 shadow-md shadow-periwinkle/5"
                        : "bg-white/80 dark:bg-navy-card/80 border-[#D8E4F2] dark:border-white/[0.08] hover:border-periwinkle/30"
                    }`}
                  >
                    {/* Header Strip */}
                    <div className="p-5 md:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-periwinkle dark:text-periwinkle-light tracking-wider">
                            {item.id}
                          </span>
                          <span className="text-[11px] font-mono text-navy-muted dark:text-navy-lightMuted">
                            //
                          </span>
                          <span className="text-[11px] font-mono uppercase tracking-wider text-navy-muted dark:text-navy-lightMuted">
                            {item.categoryLabel}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EBF3FA] dark:bg-white/[0.06] text-navy dark:text-white border border-[#D8E4F2] dark:border-white/[0.08] font-semibold">
                          {item.statusBadge}
                        </span>
                      </div>

                      {/* Question Headline / Interactive Trigger */}
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full flex items-start justify-between gap-4 text-left group"
                        aria-expanded={isOpen}
                      >
                        <h3 className="text-[17px] md:text-[19px] font-bold text-navy dark:text-white group-hover:text-periwinkle dark:group-hover:text-periwinkle-light transition-colors leading-snug">
                          {item.question}
                        </h3>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="shrink-0 mt-1 text-navy-muted dark:text-navy-lightMuted group-hover:text-periwinkle dark:group-hover:text-periwinkle-light transition-colors"
                        >
                          <ChevronDownIcon className="w-5 h-5" />
                        </motion.div>
                      </button>

                      {/* Brief Summary (Visible when collapsed) */}
                      {!isOpen && (
                        <p className="text-[14px] text-navy-muted dark:text-navy-lightMuted mt-2.5 leading-relaxed line-clamp-1">
                          {item.summary}
                        </p>
                      )}

                      {/* Expandable Engineering Analysis & Parameters */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-4 border-t border-[#D8E4F2] dark:border-white/[0.08] space-y-5">
                              {/* Deep Technical Analysis */}
                              <div>
                                <span className="text-[11px] font-mono uppercase tracking-widest text-navy-muted dark:text-navy-lightMuted block mb-2 font-semibold">
                                  ENGINEERING ANALYSIS
                                </span>
                                <p className="text-[14px] md:text-[15px] leading-relaxed text-navy dark:text-navy-lightMuted">
                                  {item.analysis}
                                </p>
                              </div>

                              {/* Technical Parameter Matrix Table */}
                              <div>
                                <span className="text-[11px] font-mono uppercase tracking-widest text-navy-muted dark:text-navy-lightMuted block mb-2 font-semibold">
                                  SPECIFICATION MATRIX
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {item.parameters.map((param, pIdx) => (
                                    <div
                                      key={pIdx}
                                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#EBF3FA]/70 dark:bg-canvas-dark/70 border border-[#D8E4F2]/70 dark:border-white/[0.06] text-[12px] font-mono"
                                    >
                                      <span className="text-navy-muted dark:text-navy-lightMuted">
                                        {param.label}
                                      </span>
                                      <span className="font-semibold text-navy dark:text-white">
                                        {param.value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
