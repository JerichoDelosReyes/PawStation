"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckIcon, ScaleIcon, KibbleIcon, PumpIcon, SignalIcon, ShieldIcon, WaterDropIcon } from "./Icons";
import { useAuth } from "@/lib/auth-context";

const hardwareSpecs = [
  {
    icon: SignalIcon,
    label: "Controller",
    value: "ESP32 30-pin, 3.3V Logic",
  },
  {
    icon: ScaleIcon,
    label: "Scale ADC",
    value: "HX711 24-bit, 10 kg bar load cell",
  },
  {
    icon: PumpIcon,
    label: "Pump Switch",
    value: "XY-MOS Dual MOSFET, PWM input",
  },
  {
    icon: ShieldIcon,
    label: "Power Rail",
    value: "Isolated 5V external, 2A supply",
  },
  {
    icon: KibbleIcon,
    label: "Servo",
    value: "SG90 with capacitor and auto-detach",
  },
  {
    icon: WaterDropIcon,
    label: "Broker",
    value: "HiveMQ Cloud TLS 8883/8884",
  },
];

export default function Scheduler() {
  const { catProfile } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    catName: catProfile?.catName || "",
    portionSize: "35",
    morningTime: "08:00",
    eveningTime: "18:00",
    waterInterval: "4",
    lowWaterThreshold: "1500",
  });

  useEffect(() => {
    if (catProfile?.catName && !form.catName) {
      setForm((prev) => ({ ...prev, catName: catProfile.catName }));
    }
  }, [catProfile?.catName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="scheduler" className="py-20 md:py-28 bg-canvas-light dark:bg-canvas-dark transition-colors duration-200">
      <div className="section-container">
        <div className="text-center mb-14">
          <span className="inline-block text-[11px] font-semibold tracking-[0.04em] uppercase text-accent-amber mb-3">
            Automation
          </span>
          <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-tight text-[#18181B] dark:text-[#F4F4F5]">
            Automated Feeding and Watering Scheduler
          </h2>
          <p className="text-[15px] text-[#71717A] dark:text-[#A1A1AA] mt-3 max-w-lg mx-auto">
            Configure your station's daily routine. Set portion sizes, feeding
            times, and water top-up intervals.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Hardware specs */}
          <div className="apple-card p-6 md:p-8">
            <h3 className="text-[11px] font-semibold tracking-[0.04em] uppercase text-[#71717A] dark:text-[#A1A1AA] mb-6">
              Hardware Specifications
            </h3>
            <div className="space-y-4">
              {hardwareSpecs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-start gap-3 p-3 rounded-apple bg-canvas-light dark:bg-[#121214] border border-black/[0.04] dark:border-white/[0.06] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-amber/8 dark:bg-accent-amber/15 flex items-center justify-center shrink-0 mt-0.5">
                    <spec.icon className="w-4 h-4 text-accent-amber" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[#18181B] dark:text-[#F4F4F5]">
                      {spec.label}
                    </div>
                    <div className="text-[12px] text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                      {spec.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pin diagram summary */}
            <div className="mt-6 p-4 rounded-apple bg-[#121214] dark:bg-[#0D0D0E] border border-white/[0.06] text-[12px] font-mono">
              <div className="text-[11px] font-semibold tracking-[0.04em] uppercase text-[#71717A] dark:text-[#A1A1AA] mb-3 font-sans">
                Pin Assignment Summary
              </div>
              <div className="space-y-1.5 text-[#A1A1AA]">
                <div className="flex justify-between">
                  <span>GPIO 18</span>
                  <span className="text-[#F4F4F5]">HX711 SCK</span>
                </div>
                <div className="flex justify-between">
                  <span>GPIO 19</span>
                  <span className="text-[#F4F4F5]">HX711 DT</span>
                </div>
                <div className="flex justify-between">
                  <span>GPIO 21</span>
                  <span className="text-[#F4F4F5]">Servo Signal</span>
                </div>
                <div className="flex justify-between">
                  <span>GPIO 23</span>
                  <span className="text-[#F4F4F5]">XY-MOS TRIG/PWM</span>
                </div>
                <div className="flex justify-between">
                  <span>GPIO 34</span>
                  <span className="text-[#F4F4F5]">Moisture Sensor AO</span>
                </div>
                <div className="flex justify-between">
                  <span>GPIO 2</span>
                  <span className="text-[#F4F4F5]">Status LED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Scheduler form */}
          <div>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="apple-card p-10 text-center h-full flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-periwinkle/15 flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="w-6 h-6 text-periwinkle" />
                </div>
                <h3 className="text-[20px] font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
                  Schedule Saved
                </h3>
                <p className="text-[14px] text-[#71717A] dark:text-[#A1A1AA] max-w-xs">
                  {form.catName
                    ? `Routine configured for ${form.catName}.`
                    : "Routine configured."}{" "}
                  Dispensing {form.portionSize}g at {form.morningTime} and{" "}
                  {form.eveningTime}. Water top-up every {form.waterInterval}h.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="apple-button bg-[#18181B] text-white hover:bg-[#27272A] dark:bg-white dark:text-[#18181B] dark:hover:bg-gray-100 mt-6"
                >
                  Edit Schedule
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="apple-card p-6 md:p-8">
                <h3 className="text-[11px] font-semibold tracking-[0.04em] uppercase text-[#71717A] dark:text-[#A1A1AA] mb-6">
                  Routine Scheduler
                </h3>

                <div className="space-y-4">
                  <SchedulerField
                    label="Cat Name"
                    name="catName"
                    type="text"
                    value={form.catName}
                    onChange={handleChange}
                    placeholder="Whiskers"
                  />

                  <SchedulerField
                    label="Meal Portion Size (grams per rotation)"
                    name="portionSize"
                    type="number"
                    value={form.portionSize}
                    onChange={handleChange}
                    min="10"
                    max="100"
                    step="5"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <SchedulerField
                      label="Morning Feed Time"
                      name="morningTime"
                      type="time"
                      value={form.morningTime}
                      onChange={handleChange}
                      required
                    />
                    <SchedulerField
                      label="Evening Feed Time"
                      name="eveningTime"
                      type="time"
                      value={form.eveningTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <SchedulerField
                    label="Water Top-Up Interval (hours)"
                    name="waterInterval"
                    type="number"
                    value={form.waterInterval}
                    onChange={handleChange}
                    min="1"
                    max="24"
                    step="1"
                  />

                  <SchedulerField
                    label="Low Reservoir Alert Level (raw sensor threshold)"
                    name="lowWaterThreshold"
                    type="number"
                    value={form.lowWaterThreshold}
                    onChange={handleChange}
                    min="500"
                    max="3500"
                    step="100"
                  />
                </div>

                <button
                  type="submit"
                  className="apple-button bg-[#18181B] text-white hover:bg-[#27272A] dark:bg-white dark:text-[#18181B] dark:hover:bg-gray-100 w-full py-3 text-[14px] mt-6"
                >
                  Save Schedule
                </button>

                <p className="text-[11px] text-[#A1A1AA] dark:text-[#71717A] mt-3 text-center">
                  Schedule is stored locally. Future firmware versions will
                  support over-the-air schedule synchronization.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SchedulerField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required,
  min,
  max,
  step,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[12px] font-medium text-[#71717A] dark:text-[#A1A1AA] mb-1.5"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-canvas-light dark:bg-[#121214] px-3.5 py-2.5 text-[14px] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] dark:placeholder:text-[#52525B] focus:outline-none focus:ring-2 focus:ring-accent-amber/40 focus:border-accent-amber/50 transition-all"
      />
    </div>
  );
}
