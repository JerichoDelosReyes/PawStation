"use client";

import { useState, useCallback } from "react";
import ConsoleNavbar from "@/components/ConsoleNavbar";
import LiveStation from "@/components/LiveStation";
import Scheduler from "@/components/Scheduler";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { CatIcon, CloseIcon } from "@/components/Icons";
import { useAuth } from "@/lib/auth-context";
import type { StationStatus } from "@/lib/mqtt";

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
  "Russian Blue",
  "Abyssinian",
  "Birman",
  "Other / Mixed",
];

export default function DashboardPage() {
  const { user, catProfile, setCatProfile } = useAuth();
  const [stationStatus, setStationStatus] = useState<StationStatus>("connecting");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const displayCatName = catProfile?.catName || user?.user_metadata?.cat_name || "Whiskers";
  const displayCatBreed = catProfile?.catBreed || user?.user_metadata?.cat_breed || "Domestic Longhair";
  const displayStationName = catProfile?.stationName || user?.user_metadata?.station_name || "PawStation Unit 1";

  // Edit form state
  const [editName, setEditName] = useState(displayCatName);
  const [editBreed, setEditBreed] = useState(displayCatBreed);
  const [editStation, setEditStation] = useState(displayStationName);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleOpenEdit = () => {
    setEditName(displayCatName);
    setEditBreed(displayCatBreed);
    setEditStation(displayStationName);
    setSaveSuccess(false);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setCatProfile({
        catName: editName.trim() || "Whiskers",
        catBreed: editBreed,
        stationName: editStation.trim() || "PawStation Unit 1",
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccess(false);
      }, 800);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = useCallback((status: StationStatus) => {
    setStationStatus(status);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[var(--frame-bg)] text-white select-none p-0 flex flex-col justify-between overflow-x-hidden selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200">
      <main className="relative w-full flex-1 min-h-0 bg-[var(--panel-bg)] text-[var(--panel-text)] rounded-none flex flex-col transition-colors duration-200 overflow-visible">
        {/* ─────────────────────────────────────────────────────────────
            BESPOKE CONSOLE NAVIGATION BAR WITH DOCKED CORNER NOTCHES
        ───────────────────────────────────────────────────────────── */}
        <ConsoleNavbar
          stationStatus={stationStatus}
          catName={displayCatName}
          catBreed={displayCatBreed}
          stationName={displayStationName}
          onOpenEditProfile={handleOpenEdit}
        />

        {/* ─────────────────────────────────────────────────────────────
            CONSOLE MAIN WORKSTATION CONTAINER (EXPANSIVE WIDE LAYOUT)
        ───────────────────────────────────────────────────────────── */}
        <div className="w-full flex-1 pt-6 lg:pt-20 pb-16 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 max-w-[1760px] mx-auto flex flex-col gap-8">
          {/* Precision Hardware Console */}
          <LiveStation catName={displayCatName} onStatusChange={handleStatusChange} />

          {/* Routine Automation & Hardware Blueprint */}
          <Scheduler catName={displayCatName} />
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          EDIT PROFILE MODAL
      ───────────────────────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isSaving && setIsEditModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-[#161B26] rounded-apple-2xl border border-black/[0.08] dark:border-white/[0.1] max-w-md w-full p-6 sm:p-7 shadow-2xl z-10 transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08] mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent-amber/15 text-accent-amber flex items-center justify-center">
                  <CatIcon className="w-4 h-4 fill-current" />
                </div>
                <h3 className="text-[16px] font-bold text-neutral-900 dark:text-white">
                  Update Companion Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Companion Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                  required
                  placeholder="e.g. Burnok"
                  className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-[#FAF8F5] dark:bg-[#181D2A] px-3.5 py-2.5 text-[14px] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-amber/40 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Breed / Heritage
                </label>
                <select
                  value={editBreed}
                  onChange={(e) => setEditBreed(e.target.value)}
                  className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-[#FAF8F5] dark:bg-[#181D2A] px-3.5 py-2.5 text-[13.5px] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-amber/40 transition-all font-medium"
                >
                  {CAT_BREEDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Station Hardware Identifier
                </label>
                <input
                  type="text"
                  value={editStation}
                  onChange={(e) => setEditStation(e.target.value)}
                  maxLength={60}
                  required
                  placeholder="e.g. PawStation Unit 1"
                  className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-[#FAF8F5] dark:bg-[#181D2A] px-3.5 py-2.5 text-[14px] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-amber/40 transition-all font-medium"
                />
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-apple bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[12px] font-medium text-center">
                  Profile updated and synchronized.
                </div>
              )}

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="apple-button flex-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200 py-2.5 text-[13px] rounded-apple font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="apple-button flex-1 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 py-2.5 text-[13px] rounded-apple font-semibold shadow-sm disabled:opacity-50 transition-all"
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Minimalist Footer & Auth Modal */}
      <Footer />
      <AuthModal />
    </div>
  );
}
