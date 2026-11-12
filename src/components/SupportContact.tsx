"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckIcon, PawIcon, ShieldIcon, SignalIcon, ScaleIcon } from "./Icons";

const INQUIRY_TOPICS = [
  "Load Cell Scale & HX711 Calibration",
  "Water Pump Switching & MOSFET Circuit",
  "Feeder Servo & Kibble Gate Mechanicals",
  "MQTT WebSocket & HiveMQ TLS Connection",
  "Firmware Flashing & ESP32 Bootloader",
  "Power Isolation & Dual-Rail Safety",
  "General Hardware Inquiries",
];

const CAT_BREEDS = [
  "Domestic Shorthair",
  "Domestic Longhair",
  "Maine Coon",
  "British Shorthair",
  "Siamese",
  "Ragdoll",
  "Persian",
  "Bengal",
  "Scottish Fold",
  "Sphynx",
  "Other / Mixed",
];

export default function SupportContact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    breed: "Domestic Shorthair",
    topic: INQUIRY_TOPICS[0],
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="support-contact"
      className="py-20 md:py-28 bg-canvas-light dark:bg-canvas-dark border-t border-black/[0.04] dark:border-white/[0.06] transition-colors duration-200"
    >
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-18 max-w-2xl mx-auto">
          <span className="inline-block text-[11px] font-semibold tracking-[0.05em] uppercase text-accent-amber mb-3">
            Hardware Support &amp; Assistance
          </span>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-tight text-[#18181B] dark:text-[#F4F4F5] leading-tight">
            Need Help With Your Station?
          </h2>
          <p className="text-[15px] md:text-[16px] text-[#71717A] dark:text-[#A1A1AA] mt-3 leading-relaxed">
            Direct technical support for circuit assembly, sensor calibration,
            firmware flashing, and feeding routine configuration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto items-stretch">
          {/* Left Column: Support Info Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-accent-amber">
                <ShieldIcon className="w-5 h-5" />
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em]">
                  Direct Engineering Assistance
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-[#18181B] dark:text-[#F4F4F5] mb-3">
                Built to be Maintained
              </h3>
              <p className="text-[14px] leading-relaxed text-[#71717A] dark:text-[#A1A1AA] mb-6">
                PawStation hardware is modular, serviceable, and open. If you
                encounter unexpected HX711 tare drift, pump inductive kickback,
                or Wi-Fi reconnection timeouts, our team is ready to help.
              </p>
            </div>

            {/* Support Channels List */}
            <div className="space-y-3.5">
              {/* Phone card */}
              <div className="p-4 rounded-apple bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#71717A] dark:text-[#A1A1AA]">
                    Telephone Assistance
                  </span>
                  <span className="text-[11px] font-medium text-accent-forest">
                    Mon - Fri, 8AM - 6PM PST
                  </span>
                </div>
                <div className="text-[15px] font-semibold text-[#18181B] dark:text-[#F4F4F5] font-mono">
                  +1 (800) 555-PAWS
                </div>
              </div>

              {/* Email card */}
              <div className="p-4 rounded-apple bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#71717A] dark:text-[#A1A1AA]">
                    Hardware Support Desk
                  </span>
                  <span className="text-[11px] font-medium text-accent-azure">
                    Sub-4h Response
                  </span>
                </div>
                <div className="text-[15px] font-semibold text-[#18181B] dark:text-[#F4F4F5] font-mono">
                  support@pawstation.io
                </div>
              </div>

              {/* Open Hardware documentation card */}
              <div className="p-4 rounded-apple bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#71717A] dark:text-[#A1A1AA]">
                    Firmware &amp; Specs Vault
                  </span>
                  <span className="text-[11px] font-mono text-[#71717A] dark:text-[#A1A1AA]">
                    v1.2 Release
                  </span>
                </div>
                <div className="text-[13px] text-[#71717A] dark:text-[#A1A1AA]">
                  Full schematics, pinout assignments, and safety isolation guides
                  available in project documentation.
                </div>
              </div>
            </div>

            {/* Assurance footnote */}
            <div className="p-3.5 rounded-apple bg-accent-amber/5 dark:bg-accent-amber/10 border border-accent-amber/15 text-[12px] text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-2.5">
              <PawIcon className="w-4 h-4 text-accent-amber shrink-0" />
              <span>
                100% feline-safe engineering standards verified for every component.
              </span>
            </div>
          </div>

          {/* Right Column: Hardware Assistance & Question Form */}
          <div className="lg:col-span-7 flex flex-col">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="apple-card p-8 md:p-12 text-center h-full flex flex-col items-center justify-center transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-accent-forest/10 dark:bg-accent-forest/20 flex items-center justify-center mx-auto mb-5 text-accent-forest">
                  <CheckIcon className="w-7 h-7 stroke-[2.5]" />
                </div>
                <h3 className="text-2xl font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2">
                  Inquiry Dispatched
                </h3>
                <p className="text-[14px] text-[#71717A] dark:text-[#A1A1AA] max-w-md leading-relaxed mb-6">
                  Thank you, <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">{form.name}</span>.
                  Our hardware engineering team has logged your ticket regarding{" "}
                  <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                    &quot;{form.topic}&quot;
                  </span>{" "}
                  and will reply to{" "}
                  <span className="font-mono text-[#18181B] dark:text-[#F4F4F5]">
                    {form.email}
                  </span>{" "}
                  within 4 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="apple-button bg-[#18181B] text-white hover:bg-[#27272A] dark:bg-white dark:text-[#18181B] dark:hover:bg-gray-100 px-6 py-2.5 text-[13px]"
                >
                  Send Another Inquiry
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="apple-card p-6 md:p-8 flex-1 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#71717A] dark:text-[#A1A1AA]">
                      Hardware Assistance &amp; Question Form
                    </div>
                    <span className="text-[11px] text-accent-amber font-medium">
                      All Fields Protected
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-medium text-[#71717A] dark:text-[#A1A1AA] mb-1.5">
                          Full Name <span className="text-accent-crimson">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Jane Doe"
                          className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-canvas-light dark:bg-[#121214] px-3.5 py-2.5 text-[14px] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] dark:placeholder:text-[#52525B] focus:outline-none focus:ring-2 focus:ring-accent-amber/40 focus:border-accent-amber/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-medium text-[#71717A] dark:text-[#A1A1AA] mb-1.5">
                          Email Address <span className="text-accent-crimson">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="jane@example.com"
                          className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-canvas-light dark:bg-[#121214] px-3.5 py-2.5 text-[14px] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] dark:placeholder:text-[#52525B] focus:outline-none focus:ring-2 focus:ring-accent-amber/40 focus:border-accent-amber/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Breed & Topic Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-medium text-[#71717A] dark:text-[#A1A1AA] mb-1.5">
                          Cat&apos;s Breed
                        </label>
                        <select
                          name="breed"
                          value={form.breed}
                          onChange={handleChange}
                          className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-canvas-light dark:bg-[#121214] px-3.5 py-2.5 text-[13px] text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-accent-amber/40 transition-all"
                        >
                          {CAT_BREEDS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[12px] font-medium text-[#71717A] dark:text-[#A1A1AA] mb-1.5">
                          Inquiry Topic
                        </label>
                        <select
                          name="topic"
                          value={form.topic}
                          onChange={handleChange}
                          className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-canvas-light dark:bg-[#121214] px-3.5 py-2.5 text-[13px] text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-accent-amber/40 transition-all"
                        >
                          {INQUIRY_TOPICS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message Area */}
                    <div>
                      <label className="block text-[12px] font-medium text-[#71717A] dark:text-[#A1A1AA] mb-1.5">
                        Detailed Message / Question{" "}
                        <span className="text-accent-crimson">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Describe your hardware inquiry, firmware issue, or wiring question..."
                        className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-canvas-light dark:bg-[#121214] px-3.5 py-2.5 text-[14px] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] dark:placeholder:text-[#52525B] focus:outline-none focus:ring-2 focus:ring-accent-amber/40 focus:border-accent-amber/50 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    className="apple-button w-full bg-[#18181B] text-white hover:bg-[#27272A] dark:bg-white dark:text-[#18181B] dark:hover:bg-gray-100 py-3 text-[14px] font-semibold tracking-tight shadow-sm active:scale-[0.98]"
                  >
                    Send Hardware Inquiry
                  </button>
                  <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] text-center mt-2.5">
                    Our engineering desk replies promptly with hardware-verified
                    diagnostics.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
