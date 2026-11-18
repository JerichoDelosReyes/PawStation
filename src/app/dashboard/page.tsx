"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConsoleNavbar from "@/components/ConsoleNavbar";
import LiveStation from "@/components/LiveStation";
import HardwareDiagnosticsDrawer from "@/components/HardwareDiagnosticsDrawer";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { CatIcon, CloseIcon, ChevronDownIcon, ChipIcon } from "@/components/Icons";
import { useAuth } from "@/lib/auth-context";
import { StationProvider, useStationStatus } from "@/lib/station";

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

function DashboardContent() {
  const { user, loading, catProfile, setCatProfile } = useAuth();
  const router = useRouter();
  const { stationStatus } = useStationStatus();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Security: Guard console against unauthenticated access
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/?auth=login");
    }
  }, [loading, user, router]);

  const displayCatName = catProfile?.catName || user?.user_metadata?.cat_name || "Whiskers";
  const displayCatBreed = catProfile?.catBreed || user?.user_metadata?.cat_breed || "Domestic Longhair";
  const displayStationName = catProfile?.stationName || user?.user_metadata?.station_name || "PawStation Unit 1";

  // Edit form state
  const [editName, setEditName] = useState(displayCatName);
  const [editBreed, setEditBreed] = useState(displayCatBreed);
  const [editStation, setEditStation] = useState(displayStationName);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleOpenEdit = useCallback(() => {
    setEditName(displayCatName);
    setEditBreed(displayCatBreed);
    setEditStation(displayStationName);
    setSaveSuccess(false);
    setIsEditModalOpen(true);
  }, [displayCatName, displayCatBreed, displayStationName]);

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

  if (loading) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-[var(--frame-bg)] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-[12px] font-semibold text-neutral-400 tracking-wider uppercase">
            Securing Console Session...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] bg-[var(--frame-bg)] text-white select-none p-0 flex flex-col overflow-hidden selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200">
      <main className="relative w-full h-full flex-1 min-h-0 bg-[var(--panel-bg)] text-[var(--panel-text)] rounded-none flex flex-col transition-colors duration-200 overflow-hidden">
        {/* ─────────────────────────────────────────────────────────────
            BESPOKE CONSOLE NAVIGATION BAR WITH DOCKED CORNER NOTCHES
        ───────────────────────────────────────────────────────────── */}
        <ConsoleNavbar
          stationStatus={stationStatus}
          catName={displayCatName}
          catBreed={displayCatBreed}
          stationName={displayStationName}
          onOpenEditProfile={handleOpenEdit}
          onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        />

        {/* ─────────────────────────────────────────────────────────────
            CONSOLE MAIN WORKSTATION CONTAINER (BREATHING MARGINS ZERO SCROLL)
        ───────────────────────────────────────────────────────────── */}
        <div className="w-full flex-1 min-h-0 pt-2.5 sm:pt-4 lg:pt-[94px] pb-2 sm:pb-4 lg:pb-10 px-3 sm:px-6 md:px-12 lg:px-14 xl:px-16 2xl:px-20 max-w-[1560px] mx-auto flex flex-col justify-center overflow-hidden">
          {/* 3-Card Physical-Digital Deck Fitted to Viewport with Generous Padding */}
          <LiveStation
            catName={displayCatName}
            catBreed={displayCatBreed}
            onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
            onOpenEditProfile={handleOpenEdit}
          />
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          HARDWARE & PINOUT DIAGNOSTICS SLIDE-OVER DRAWER
      ───────────────────────────────────────────────────────────── */}
      <HardwareDiagnosticsDrawer
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      {/* ─────────────────────────────────────────────────────────────
          EDIT PROFILE MODAL
      ───────────────────────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isSaving && setIsEditModalOpen(false)}
          />
          <div className="relative bg-[#FAF7F0] dark:bg-[#161B26] rounded-[32px] border border-black/[0.08] dark:border-white/[0.1] max-w-md w-full p-6 sm:p-7 shadow-2xl z-10 transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08] mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center">
                  <CatIcon className="w-4 h-4 fill-current" />
                </div>
                <h3 className="text-[17px] font-bold text-neutral-900 dark:text-white">
                  Companion Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-600 dark:text-neutral-300 flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Companion Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                  required
                  placeholder="e.g. Whiskers"
                  className="w-full rounded-full border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#181D2A] px-4 py-2.5 text-[14px] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Breed / Heritage
                </label>
                <div className="relative">
                  <select
                    value={editBreed}
                    onChange={(e) => setEditBreed(e.target.value)}
                    className="w-full appearance-none rounded-full border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#181D2A] pl-4 pr-10 py-2.5 text-[13.5px] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all font-medium cursor-pointer"
                  >
                    {CAT_BREEDS.map((b) => (
                      <option
                        key={b}
                        value={b}
                        className="bg-white text-neutral-900 dark:bg-[#181D2A] dark:text-white"
                      >
                        {b}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
                    <ChevronDownIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Station Hardware Identifier
                </label>
                <input
                  type="text"
                  value={editStation}
                  onChange={(e) => setEditStation(e.target.value)}
                  maxLength={60}
                  required
                  placeholder="e.g. PawStation Unit 1"
                  className="w-full rounded-full border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#181D2A] px-4 py-2.5 text-[14px] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all font-medium"
                />
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[12px] font-semibold text-center">
                  Profile updated and synchronized.
                </div>
              )}

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-full bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200 py-3 text-[13px] font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-full bg-neutral-900 hover:opacity-90 dark:bg-white dark:text-neutral-900 text-white py-3 text-[13px] font-bold transition-all disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <StationProvider>
      <DashboardContent />
    </StationProvider>
  );
}
