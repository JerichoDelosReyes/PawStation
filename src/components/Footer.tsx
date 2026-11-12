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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Content */}
      <div className="relative bg-[#131A14] rounded-apple-2xl border border-white/[0.1] max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl transition-colors">
        <div className="sticky top-0 bg-[#131A14]/95 backdrop-blur-md border-b border-white/[0.08] px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-[17px] font-semibold text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-4 h-4 text-[#8FA391]" />
          </button>
        </div>
        <div className="px-6 py-6 text-[13px] leading-relaxed text-[#8FA391] space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

const footerLinks = [
  { label: "Features", href: "/#hero-features" },
  { label: "Hardware Architecture", href: "/#why-cat-care" },
  { label: "Technical FAQ", href: "/#faq" },
  { label: "GitHub Repository", href: "https://github.com/JerichoDelosReyes/PawStation.git", external: true },
];

export default function Footer() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <>
      <footer className="relative bg-[#080B08] text-white overflow-hidden border-t border-white/[0.06] transition-colors duration-200">
        <div className="section-container py-16 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#131A14] border border-white/[0.08] flex items-center justify-center text-[#D4F66C]">
                  <PawIcon className="w-4 h-4 text-[#D4F66C]" />
                </div>
                <span className="text-[17px] font-bold tracking-tight text-white">
                  PawStation
                </span>
                <span className="text-[12px] text-[#8FA391] font-mono pl-1">
                  / Tactile feline feeding &amp; hydration system
                </span>
              </div>
              <p className="text-[13px] text-[#8FA391] leading-relaxed max-w-md">
                An open ESP32 hardware platform combining precision load-cell telemetry,
                silent servo kibble metering, and soft-stop hydration. Designed for
                cat health and sensory wellbeing.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#D4F66C] mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-[13px] text-[#8FA391] hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#D4F66C] mb-4">
                Compliance &amp; Terms
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => setPrivacyOpen(true)}
                    className="text-[13px] text-[#8FA391] hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setTermsOpen(true)}
                    className="text-[13px] text-[#8FA391] hover:text-white transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#8FA391]">
            <span>
              PawStation. Open hardware for cats, built by cat people.
            </span>
            <div className="flex items-center gap-5 text-[11px] font-mono">
              <span className="text-[#D4F66C]">ESP32 Firmware v1.2</span>
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
        <p className="font-semibold text-white">
          PawStation Privacy Policy
        </p>
        <p>Last updated: November 12, 2026</p>

        <p className="font-medium text-white mt-4">
          1. Information We Collect
        </p>
        <p>
          PawStation is designed with data minimization in mind. We collect only
          data strictly necessary to monitor and operate the pet feeding station.
        </p>
        <p>
          <strong className="text-white">Hardware and Telemetry Data:</strong> Weight values measured by
          the HX711, water reservoir levels, actuator execution records, and
          device health and network status (Wi-Fi RSSI, uptime, broker ping latencies).
        </p>
        <p>
          <strong className="text-white">Account and User Authentication Data:</strong> Email address
          and unique user identifier (UUID) via Supabase Auth. Session tokens
          (JWT) and encrypted session cookies.
        </p>
        <p>
          <strong className="text-white">Data We Do NOT Collect:</strong> PawStation contains no
          cameras, no microphones, and no ambient audio listening devices. We do
          not collect GPS location data, advertising IDs, or biometric data.
        </p>

        <p className="font-medium text-white mt-4">
          2. How We Use Your Data
        </p>
        <p>
          We use collected information solely for live station operation, health
          and intake tracking, safety and anomaly alerts, and hardware
          protection.
        </p>

        <p className="font-medium text-white mt-4">
          3. Data Storage, Retention and Security
        </p>
        <p>
          All communications are encrypted in transit using TLS 1.2/1.3 and
          Secure WebSockets. Database access is protected by PostgreSQL Row
          Level Security (RLS). Telemetry snapshots are stored for 30 days and
          automatically pruned. You may request complete erasure at any time.
        </p>

        <p className="font-medium text-white mt-4">
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
        <p className="font-semibold text-white">
          PawStation Terms of Service
        </p>
        <p>Last updated: November 12, 2026</p>

        <p className="font-medium text-white mt-4">
          1. Description of Service
        </p>
        <p>
          PawStation is an open hardware and software project designed for
          personal, non-commercial monitoring and dispensing of pet food and
          water using an ESP32 microcontroller, cloud MQTT broker, and web
          dashboard.
        </p>

        <p className="font-medium text-white mt-4">
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

        <p className="font-medium text-white mt-4">
          3. Acceptable Use
        </p>
        <p>
          You agree to safeguard your MQTT broker credentials, database
          passwords, and private API keys. You agree not to flood the cloud MQTT
          broker or database with malicious traffic.
        </p>

        <p className="font-medium text-white mt-4">
          4. Limitation of Liability
        </p>
        <p className="uppercase text-[11px] text-[#8FA391]">
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
