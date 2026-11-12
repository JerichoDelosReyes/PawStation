"use client";

import { useState } from "react";
import { PawIcon, CloseIcon } from "./Icons";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

function Modal({ title, children, isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Content */}
      <div className="relative bg-white dark:bg-[#1C1C1E] rounded-apple-lg border border-black/[0.08] dark:border-white/[0.1] max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl transition-colors">
        <div className="sticky top-0 bg-white dark:bg-[#1C1C1E] border-b border-black/[0.06] dark:border-white/[0.08] px-6 py-4 flex items-center justify-between z-10 transition-colors">
          <h3 className="text-[17px] font-semibold text-[#18181B] dark:text-[#F4F4F5]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-4 h-4 text-[#71717A] dark:text-[#A1A1AA]" />
          </button>
        </div>
        <div className="px-6 py-5 text-[13px] leading-relaxed text-[#52525B] dark:text-[#A1A1AA] space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

const footerLinks = [
  { label: "Hardware Architecture", href: "/#why-cat-care" },
  { label: "Technical FAQ", href: "/#faq" },
  { label: "Engineering Support", href: "/#support-contact" },
];

export default function Footer() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <>
      <footer className="relative bg-[#121214] dark:bg-[#09090B] text-white overflow-hidden border-t border-white/[0.04] transition-colors duration-200">
        {/* Radiating pastel paws background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.04]">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-140px)`,
                }}
              >
                <PawIcon className="w-12 h-12 text-accent-amber" />
              </div>
            ))}
          </div>
          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent-amber/5 blur-[100px]" />
        </div>

        <div className="relative section-container py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PawIcon className="w-6 h-6 text-accent-amber" />
                <span className="text-[17px] font-semibold text-white">PawStation</span>
              </div>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed max-w-xs">
                An ESP32-powered smart cat feeding and watering station with
                real-time IoT monitoring. Precision hardware, silent operation,
                cat-safe materials.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.04em] uppercase text-[#71717A] mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-[13px] text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.04em] uppercase text-[#71717A] mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => setPrivacyOpen(true)}
                    className="text-[13px] text-[#A1A1AA] hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setTermsOpen(true)}
                    className="text-[13px] text-[#A1A1AA] hover:text-white transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[12px] text-[#71717A]">
              PawStation. Built for cats, by cat people.
            </span>
            <div className="flex items-center gap-4 text-[11px] text-[#52525B]">
              <span>ESP32 Firmware v1.2</span>
              <span>HiveMQ TLS 8884</span>
              <span>Supabase RLS</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <Modal
        title="Privacy Policy"
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      >
        <p className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
          PawStation Privacy Policy
        </p>
        <p>Last updated: November 12, 2026</p>

        <p className="font-medium text-[#18181B] dark:text-[#F4F4F5] mt-4">
          1. Information We Collect
        </p>
        <p>
          PawStation is designed with data minimization in mind. We collect only
          data strictly necessary to monitor and operate the pet feeding station.
        </p>
        <p>
          <strong className="text-[#18181B] dark:text-[#F4F4F5]">Hardware and Telemetry Data:</strong> Weight values measured by
          the HX711, water reservoir levels, actuator execution records, and
          device health and network status (Wi-Fi RSSI, uptime, broker ping
          latencies).
        </p>
        <p>
          <strong className="text-[#18181B] dark:text-[#F4F4F5]">Account and User Authentication Data:</strong> Email address
          and unique user identifier (UUID) via Supabase Auth. Session tokens
          (JWT) and encrypted session cookies.
        </p>
        <p>
          <strong className="text-[#18181B] dark:text-[#F4F4F5]">Data We Do NOT Collect:</strong> PawStation contains no
          cameras, no microphones, and no ambient audio listening devices. We do
          not collect GPS location data, advertising IDs, or biometric data.
        </p>

        <p className="font-medium text-[#18181B] dark:text-[#F4F4F5] mt-4">
          2. How We Use Your Data
        </p>
        <p>
          We use collected information solely for live station operation, health
          and intake tracking, safety and anomaly alerts, and hardware
          protection.
        </p>

        <p className="font-medium text-[#18181B] dark:text-[#F4F4F5] mt-4">
          3. Data Storage, Retention and Security
        </p>
        <p>
          All communications are encrypted in transit using TLS 1.2/1.3 and
          Secure WebSockets. Database access is protected by PostgreSQL Row
          Level Security (RLS). Telemetry snapshots are stored for 30 days and
          automatically pruned. You may request complete erasure at any time.
        </p>

        <p className="font-medium text-[#18181B] dark:text-[#F4F4F5] mt-4">
          4. Third-Party Service Providers
        </p>
        <p>
          Supabase Inc. (database hosting, authentication) and HiveMQ GmbH
          (MQTT message brokering). We do not sell, rent, or share your data with
          advertisers.
        </p>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        title="Terms of Service"
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
      >
        <p className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
          PawStation Terms of Service
        </p>
        <p>Last updated: November 12, 2026</p>

        <p className="font-medium text-[#18181B] dark:text-[#F4F4F5] mt-4">
          1. Description of Service
        </p>
        <p>
          PawStation is an open hardware and software project designed for
          personal, non-commercial monitoring and dispensing of pet food and
          water using an ESP32 microcontroller, cloud MQTT broker, and web
          dashboard.
        </p>

        <p className="font-medium text-[#18181B] dark:text-[#F4F4F5] mt-4">
          2. Animal Welfare and Hardware Safety
        </p>
        <p className="text-accent-crimson font-medium">
          Do not rely solely on automated or DIY hardware for pet sustenance.
        </p>
        <p>
          Human supervision is required. PawStation is an assistive device and
          does not replace regular human supervision, daily fresh water checks,
          and routine animal care. You are responsible for ensuring your pet has
          secondary access to water and sustenance in the event of power outages,
          Wi-Fi disconnects, or mechanical failures.
        </p>
        <p>
          You must use food-grade materials and adhere to the dual-power rail
          design with protective flyback diodes and capacitors.
        </p>

        <p className="font-medium text-[#18181B] dark:text-[#F4F4F5] mt-4">
          3. Acceptable Use
        </p>
        <p>
          You agree to safeguard your MQTT broker credentials, database
          passwords, and private API keys. You agree not to flood the cloud MQTT
          broker or database with malicious traffic.
        </p>

        <p className="font-medium text-[#18181B] dark:text-[#F4F4F5] mt-4">
          4. Limitation of Liability
        </p>
        <p className="uppercase text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
          The software, firmware, and circuit designs are provided &quot;as
          is&quot;, without warranty of any kind, express or implied. In no event
          shall the authors be liable for any claim, damages, injury to animals,
          property damage, or other liability arising from operation of
          PawStation.
        </p>
      </Modal>
    </>
  );
}
