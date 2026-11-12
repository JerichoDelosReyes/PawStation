"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LiveStation from "@/components/LiveStation";
import Scheduler from "@/components/Scheduler";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { CatIcon, CloseIcon } from "@/components/Icons";
import { useAuth } from "@/lib/auth-context";

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
  const { user, catProfile, setCatProfile, openAuthModal } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const displayCatName = catProfile?.catName || user?.user_metadata?.cat_name || "Whiskers";
  const displayCatBreed = catProfile?.catBreed || user?.user_metadata?.cat_breed || "Domestic Shorthair";
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

  return (
    <>
      <Navbar />

      <main className="pt-20 pb-16 bg-canvas-light dark:bg-canvas-dark min-h-screen transition-colors duration-200">
        <div className="section-container">
          {/* Dashboard Header & Cat Profile Sync Banner */}
          <div className="mb-8 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 apple-card p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent-amber/10 dark:bg-accent-amber/20 flex items-center justify-center text-accent-amber shrink-0">
                  <CatIcon className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-accent-amber">
                      Active Hardware Profile
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-forest/15 text-accent-forest text-[11px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-forest" />
                      Station Synced
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#18181B] dark:text-[#F4F4F5]">
                    {displayCatName}&apos;s Station Console
                  </h1>
                  <p className="text-[13px] text-[#71717A] dark:text-[#A1A1AA] mt-1">
                    Breed: <span className="text-[#18181B] dark:text-[#F4F4F5] font-medium">{displayCatBreed}</span>
                    {"  |  "}
                    Device: <span className="text-[#18181B] dark:text-[#F4F4F5] font-medium">{displayStationName}</span>
                    {user?.email && (
                      <>
                        {"  |  "}
                        Owner: <span className="text-[#18181B] dark:text-[#F4F4F5] font-mono">{user.email}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Status pills / actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenEdit}
                  className="apple-button bg-white dark:bg-[#2C2C2E] text-[#18181B] dark:text-[#F4F4F5] border border-black/[0.1] dark:border-white/[0.12] hover:bg-gray-50 dark:hover:bg-[#3A3A3C] text-[12px]"
                >
                  Edit Profile
                </button>
                <Link
                  href="/"
                  className="apple-button bg-white dark:bg-[#2C2C2E] text-[#18181B] dark:text-[#F4F4F5] border border-black/[0.1] dark:border-white/[0.12] hover:bg-gray-50 dark:hover:bg-[#3A3A3C] text-[12px]"
                >
                  Return to Home
                </Link>
                {!user && (
                  <button
                    onClick={() => openAuthModal("signup")}
                    className="apple-button bg-[#18181B] text-white hover:bg-[#27272A] dark:bg-white dark:text-[#18181B] text-[12px]"
                  >
                    Sync Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Hardware Console */}
          <div className="mb-12">
            <LiveStation />
          </div>

          {/* Routine Scheduler */}
          <div className="mb-12">
            <Scheduler />
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isSaving && setIsEditModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-[#1C1C1E] rounded-apple-lg border border-black/[0.08] dark:border-white/[0.1] max-w-md w-full p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08] mb-4">
              <h3 className="text-[16px] font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                Update Cat &amp; Station Profile
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C2C2E]"
                aria-label="Close"
              >
                <CloseIcon className="w-4 h-4 text-[#71717A]" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#71717A] dark:text-[#A1A1AA] mb-1.5">
                  Cat Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                  required
                  className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-canvas-light dark:bg-[#121214] px-3.5 py-2.5 text-[14px] text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-accent-amber/40"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#71717A] dark:text-[#A1A1AA] mb-1.5">
                  Cat Breed
                </label>
                <select
                  value={editBreed}
                  onChange={(e) => setEditBreed(e.target.value)}
                  className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-canvas-light dark:bg-[#121214] px-3 py-2.5 text-[13px] text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-accent-amber/40"
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
                  Station Device Name
                </label>
                <input
                  type="text"
                  value={editStation}
                  onChange={(e) => setEditStation(e.target.value)}
                  maxLength={60}
                  required
                  className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-canvas-light dark:bg-[#121214] px-3.5 py-2.5 text-[14px] text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-accent-amber/40"
                />
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-apple bg-accent-forest/15 text-accent-forest text-[12px] font-medium text-center">
                  Profile updated successfully.
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="apple-button flex-1 bg-gray-100 dark:bg-[#2C2C2E] text-[#18181B] dark:text-[#F4F4F5] py-2.5 text-[13px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="apple-button flex-1 bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] py-2.5 text-[13px] disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <AuthModal />
    </>
  );
}
