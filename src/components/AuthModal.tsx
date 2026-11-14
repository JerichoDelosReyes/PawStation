"use client";

import { useState, useEffect, useId } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloseIcon,
  PawIcon,
  ShieldIcon,
  EyeIcon,
  EyeOffIcon,
  ChevronLeftIcon,
} from "./Icons";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "./ThemeProvider";

export const CAT_BREEDS = [
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

// Product highlights on the left column (clean, authentic, Apple-grade)
const SHOWCASE_SLIDES = [
  {
    title: "Precision Micro-Portioning",
    description:
      "Automated portion dispensing calibrated to your feline's metabolic needs and target body condition score.",
  },
  {
    title: "Intelligent Feeding Insights",
    description:
      "Dual load-cell tare sensors detect feeding duration, cadence, and alert you to subtle health shifts.",
  },
];

function sanitizeInput(str: string, maxLen = 60): string {
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s\-'.]/gi, "")
    .trim()
    .slice(0, maxLen);
}

export default function AuthModal() {
  const router = useRouter();
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    setCatProfile,
  } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [mode, setMode] = useState<"login" | "signup">(authModalMode);

  // Database-aligned fields: cat_profiles table
  const [catName, setCatName] = useState("");
  const [catBreed, setCatBreed] = useState("Domestic Shorthair");
  const [stationName, setStationName] = useState("PawStation Unit 1");

  // Database-aligned credentials: auth.users table
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UX states
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [legalView, setLegalView] = useState<"terms" | "privacy" | null>(null);

  // Sync mode with context
  useEffect(() => {
    if (authModalMode !== mode && !isSubmitting && !showVerificationScreen) {
      setMode(authModalMode);
      setErrorMessage(null);
      setSuccessNotice(null);
      setShowForgotPassword(false);
      setLegalView(null);
    }
  }, [authModalMode, isSubmitting, showVerificationScreen]);

  // Auto-advance showcase slides every 5 seconds
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthModalOpen]);

  // Password validation
  const hasMinLength = password.length >= 8;
  const strengthScore = [
    password.length >= 6,
    password.length >= 8,
    /[A-Z]/.test(password) && /[a-z]/.test(password),
    /[0-9]/.test(password) || /[^A-Za-z0-9\s]/.test(password),
  ].filter(Boolean).length;

  const strengthLabels = ["Too Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthLabel = password.length === 0 ? "" : strengthLabels[strengthScore];
  const strengthColor =
    strengthScore === 4
      ? "bg-emerald-500 text-emerald-500 dark:text-emerald-400"
      : strengthScore === 3
      ? "bg-sky-500 text-sky-500 dark:text-sky-400"
      : strengthScore === 2
      ? "bg-amber-500 text-amber-500 dark:text-amber-400"
      : "bg-red-500 text-red-500 dark:text-red-400";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        if (data.user.user_metadata?.cat_name) {
          await setCatProfile({
            catName: data.user.user_metadata.cat_name,
            catBreed: data.user.user_metadata.cat_breed || "Domestic Shorthair",
            stationName:
              data.user.user_metadata.station_name || "PawStation Unit 1",
          });
        }
        closeAuthModal();
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    // Database alignment: public.cat_profiles.cat_name (TEXT NOT NULL, 1-60 chars)
    const cleanCatName = sanitizeInput(catName, 60);
    if (!cleanCatName) {
      setErrorMessage("Please enter your cat's name.");
      return;
    }

    // Database alignment: public.cat_profiles.cat_breed (TEXT NOT NULL DEFAULT 'Domestic Shorthair')
    const cleanBreed = sanitizeInput(catBreed, 60) || "Domestic Shorthair";

    // Database alignment: public.cat_profiles.station_name (TEXT NOT NULL DEFAULT 'PawStation Unit 1', 1-80 chars)
    const cleanStationName = sanitizeInput(stationName, 80) || "PawStation Unit 1";

    // Database alignment: auth.users.email
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Database alignment: auth.users.password
    if (!hasMinLength) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please agree to the Terms & Conditions and Privacy Policy to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            cat_name: cleanCatName,
            cat_breed: cleanBreed,
            station_name: cleanStationName,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      // Synchronize with cat_profiles table in Supabase
      await setCatProfile({
        catName: cleanCatName,
        catBreed: cleanBreed,
        stationName: cleanStationName,
      });

      setShowVerificationScreen(true);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to register account"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage("Please enter your email to receive recovery instructions.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessNotice(
          `Password reset link sent to ${cleanEmail}. Check your inbox.`
        );
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to send password reset"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyLater = () => {
    setShowVerificationScreen(false);
    closeAuthModal();
    router.push("/dashboard");
  };

  const switchMode = (newMode: "login" | "signup") => {
    setMode(newMode);
    openAuthModal(newMode);
    setErrorMessage(null);
    setSuccessNotice(null);
    setShowForgotPassword(false);
    setLegalView(null);
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/45 dark:bg-black/75 backdrop-blur-md transition-colors duration-200"
        onClick={() => {
          if (!isSubmitting) closeAuthModal();
        }}
      />

      {/* 2-Column Split Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/10 rounded-[28px] sm:rounded-[32px] w-full max-w-4xl shadow-2xl z-10 overflow-hidden my-auto max-h-[94vh] flex flex-col transition-colors duration-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-3 gap-2 sm:gap-3 overflow-y-auto max-h-[94vh]">
          {/* ================= LEFT COLUMN: SHOWCASE CARD ================= */}
          <div className="hidden md:flex flex-col justify-between relative rounded-[22px] sm:rounded-[24px] bg-[#F5F5F7] dark:bg-[#141416] border border-black/[0.06] dark:border-white/[0.08] p-6 lg:p-7 overflow-hidden min-h-[520px] transition-colors duration-200">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl" />

            {/* Top Brand Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black/[0.05] dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-amber-500 dark:text-amber-400">
                  <PawIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
                  PawStation
                </span>
              </div>
            </div>

            {/* Middle: 3D Hardware Presentation (Synced with Theme) */}
            <div className="relative z-10 my-auto py-4 flex flex-col items-center justify-center">
              <div
                className="relative w-full max-w-[320px] aspect-[4/3] flex items-center justify-center"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 85%)",
                  maskImage:
                    "radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 85%)",
                }}
              >
                <Image
                  src={isDark ? "/hero-figure-dark.webp" : "/hero-figure-light.webp"}
                  alt="PawStation Smart Feeder"
                  fill
                  sizes="320px"
                  priority
                  className="object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_20px_30px_rgba(0,0,0,0.65)] hover:scale-105 transition-all duration-500"
                />
              </div>
            </div>

            {/* Bottom Content & Carousel Indicators */}
            <div className="relative z-10 space-y-4 pt-2">
              <div className="space-y-1.5 min-h-[64px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h4 className="text-base font-semibold text-neutral-900 dark:text-white tracking-tight">
                      {SHOWCASE_SLIDES[activeSlide].title}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1">
                      {SHOWCASE_SLIDES[activeSlide].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dash Carousel Indicators (---) */}
              <div className="flex items-center gap-1.5 pt-1">
                {SHOWCASE_SLIDES.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeSlide
                        ? "w-8 bg-neutral-900 dark:bg-white"
                        : "w-2.5 bg-neutral-300 hover:bg-neutral-400 dark:bg-white/20 dark:hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: FORM CARD ================= */}
          <div className="flex flex-col justify-between p-4 sm:p-6 lg:p-7 relative min-h-[500px]">
            {/* Header: Brand (Mobile) + Close Button */}
            <div className="flex items-center justify-between mb-3">
              {/* Mobile Brand */}
              <div className="flex md:hidden items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-amber-500 dark:text-amber-400">
                  <PawIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">PawStation</span>
              </div>

              <div className="hidden md:block" />

              {/* Close Button */}
              <button
                type="button"
                onClick={closeAuthModal}
                className="w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/10 dark:bg-white/[0.06] dark:hover:bg-white/15 border border-black/5 dark:border-white/10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* In-Modal Legal Document Viewer (Terms & Conditions / Privacy Policy) */}
            {legalView ? (
              <div className="my-auto space-y-3.5 py-1">
                <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.08] dark:border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLegalView(null)}
                      className="w-7 h-7 rounded-lg bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors"
                      aria-label="Back to sign up"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                      {legalView === "terms" ? "Terms & Conditions" : "Privacy Policy"}
                    </h3>
                  </div>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                    PawStation Legal
                  </span>
                </div>

                {/* Scrollable Document Content */}
                <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-3 max-h-[350px] overflow-y-auto pr-2">
                  {legalView === "terms" ? (
                    <>
                      <p className="font-medium text-neutral-800 dark:text-neutral-200">
                        Last updated: November 2026. Please review these Terms of Service before operating PawStation hardware or software.
                      </p>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">1. Description of Service</h4>
                        <p className="text-neutral-500 dark:text-neutral-400">
                          PawStation is an open hardware and software workstation designed for non-commercial monitoring and controlled dispensing of feline sustenance.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">2. Animal Welfare &amp; Safety</h4>
                        <p className="text-neutral-500 dark:text-neutral-400">
                          PawStation is an assistive device and does not replace regular human care. Maintain daily physical checks of food and water, ensure food-safe container materials, and provide secondary water access.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">3. Account &amp; Device Responsibilities</h4>
                        <p className="text-neutral-500 dark:text-neutral-400">
                          You agree to safeguard your account credentials, Wi-Fi keys, and private database tokens against unauthorized access.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">4. Limitation of Liability</h4>
                        <p className="text-neutral-500 dark:text-neutral-400">
                          Hardware blueprints and software are provided &ldquo;as is&rdquo;. Users assume full responsibility for DIY mechanical assembly, power isolation, and regular maintenance.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-neutral-800 dark:text-neutral-200">
                        PawStation is built with strict privacy and data minimization. We collect only what is strictly required to operate your station.
                      </p>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">1. Telemetry &amp; Metrics</h4>
                        <p className="text-neutral-500 dark:text-neutral-400">
                          We log weight load-cell values, visit duration timestamps, and water reservoir refill alerts to compute feeding cadences on your private dashboard.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">2. Absolute Hardware Privacy</h4>
                        <p className="text-neutral-500 dark:text-neutral-400">
                          PawStation contains <strong className="text-neutral-900 dark:text-white">no optical cameras, no microphones, and no audio recording sensors</strong>. Your home stays strictly private.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">3. Row-Level Security (RLS)</h4>
                        <p className="text-neutral-500 dark:text-neutral-400">
                          All records stored in Supabase PostgreSQL are isolated via Row-Level Security. Only your authenticated user account can access your cat&apos;s feeding data.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">4. Zero Data Selling</h4>
                        <p className="text-neutral-500 dark:text-neutral-400">
                          We never sell, rent, or share personal profiles or feeding statistics with third-party data brokers or advertisers.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  {legalView === "terms" && (
                    <button
                      type="button"
                      onClick={() => {
                        setAgreeTerms(true);
                        setLegalView(null);
                      }}
                      className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-[0.99]"
                    >
                      Accept &amp; Continue
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setLegalView(null)}
                    className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors ${
                      legalView === "terms"
                        ? "flex-initial"
                        : "w-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold"
                    }`}
                  >
                    {legalView === "terms" ? "Close" : "Back to Sign Up"}
                  </button>
                </div>
              </div>
            ) : showVerificationScreen ? (
              /* Verification Flow Screen */
              <div className="my-auto text-center space-y-4 py-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500 dark:text-amber-400">
                  <ShieldIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                    Check your email
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
                    We sent a confirmation link to{" "}
                    <span className="font-semibold text-neutral-900 dark:text-white">{email}</span>.
                    Verify to unlock cloud backups, or dive straight into your dashboard.
                  </p>
                </div>

                {/* Database Profile Confirmation */}
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-[#202024] border border-neutral-200 dark:border-white/10 text-left text-xs space-y-1 max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Registered Cat:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {catName} ({catBreed})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Station Unit:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {stationName}
                    </span>
                  </div>
                </div>

                <div className="pt-2 space-y-2 max-w-sm mx-auto">
                  <button
                    onClick={handleVerifyLater}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md active:scale-[0.99]"
                  >
                    Continue to Dashboard
                  </button>
                  <button
                    onClick={() => setShowVerificationScreen(false)}
                    className="w-full text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white py-1 transition-colors"
                  >
                    Edit Registration Details
                  </button>
                </div>
              </div>
            ) : showForgotPassword ? (
              /* Forgot Password View */
              <div className="my-auto space-y-4 py-2">
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                    Reset your password
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Enter the email associated with your PawStation hardware account.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                    {errorMessage}
                  </div>
                )}

                {successNotice && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                    {successNotice}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-3.5">
                  <InputField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending instructions..." : "Send Reset Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setErrorMessage(null);
                      setSuccessNotice(null);
                    }}
                    className="w-full text-center text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors pt-1"
                  >
                    Back to Log in
                  </button>
                </form>
              </div>
            ) : (
              /* Main Auth View (Sign Up / Log In) */
              <div className="my-auto space-y-3.5">
                {/* Titles */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                    {mode === "signup" ? "Create an account" : "Welcome back"}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {mode === "signup" ? (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("login")}
                          className="text-neutral-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 font-semibold underline underline-offset-2 transition-colors"
                        >
                          Log in
                        </button>
                      </>
                    ) : (
                      <>
                        Don&apos;t have an account?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("signup")}
                          className="text-neutral-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 font-semibold underline underline-offset-2 transition-colors"
                        >
                          Sign up
                        </button>
                      </>
                    )}
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs leading-relaxed">
                    {errorMessage}
                  </div>
                )}

                {/* SIGN UP FORM (Aligned with cat_profiles & auth.users tables) */}
                {mode === "signup" ? (
                  <form onSubmit={handleSignUp} className="space-y-2.5">
                    {/* Database row 1: cat_name & cat_breed */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                      <InputField
                        label="Cat Name"
                        type="text"
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        required
                        placeholder="e.g. Whiskers"
                      />
                      <SelectField
                        label="Cat Breed"
                        value={catBreed}
                        onChange={(e) => setCatBreed(e.target.value)}
                        options={CAT_BREEDS}
                      />
                    </div>

                    {/* Database row 2: station_name & email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                      <InputField
                        label="Station Device Name"
                        type="text"
                        value={stationName}
                        onChange={(e) => setStationName(e.target.value)}
                        placeholder="PawStation Unit 1"
                      />
                      <InputField
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@example.com"
                      />
                    </div>

                    {/* Database row 3: password */}
                    <div>
                      <PasswordField
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        placeholder="Minimum 8 characters"
                        required
                      />

                      {/* Password strength bar */}
                      {password.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500 dark:text-neutral-400">Strength</span>
                            <span className={`font-semibold ${strengthColor.split(" ")[1]}`}>
                              {strengthLabel}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1 h-1">
                            {[0, 1, 2, 3].map((step) => (
                              <div
                                key={step}
                                className={`h-full rounded-full transition-all duration-200 ${
                                  step < strengthScore
                                    ? strengthColor.split(" ")[0]
                                    : "bg-neutral-200 dark:bg-white/10"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Terms & Conditions and Privacy Policy Interactive Checkbox Row */}
                    <div className="flex items-start gap-2.5 pt-0.5 select-none">
                      <input
                        id="agree-terms-checkbox"
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-neutral-300 dark:border-white/20 bg-neutral-100 dark:bg-[#222226] text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500 shrink-0"
                      />
                      <label
                        htmlFor="agree-terms-checkbox"
                        className="text-xs text-neutral-600 dark:text-neutral-400 leading-normal cursor-pointer"
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setLegalView("terms");
                          }}
                          className="text-neutral-900 dark:text-white font-semibold underline underline-offset-2 hover:text-amber-500 transition-colors"
                        >
                          Terms &amp; Conditions
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setLegalView("privacy");
                          }}
                          className="text-neutral-900 dark:text-white font-semibold underline underline-offset-2 hover:text-amber-500 transition-colors"
                        >
                          Privacy Policy
                        </button>
                      </label>
                    </div>

                    {/* CTA Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50 mt-1"
                    >
                      {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                  </form>
                ) : (
                  /* LOGIN FORM */
                  <form onSubmit={handleLogin} className="space-y-3.5">
                    <InputField
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                    />

                    <PasswordField
                      label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      placeholder="Enter your password"
                      required
                    />

                    {/* Remember me & Forgot password row */}
                    <div className="flex items-center justify-between text-xs pt-1 select-none">
                      <label className="flex items-center gap-2 cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-white/20 bg-neutral-100 dark:bg-[#222226] text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
                        />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setErrorMessage(null);
                          setSuccessNotice(null);
                        }}
                        className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* CTA Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50 mt-2"
                    >
                      {isSubmitting ? "Logging in..." : "Log in"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({
  label,
  type,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 truncate"
      >
        {label}
        {required && <span className="text-amber-500 dark:text-amber-400 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100/70 dark:bg-[#202024] px-3.5 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white/40 focus:border-neutral-400 dark:focus:border-white/40 focus:bg-white dark:focus:bg-[#202024] transition-all"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 truncate"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100/70 dark:bg-[#202024] pl-3.5 pr-8 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white/40 focus:border-neutral-400 dark:focus:border-white/40 focus:bg-white dark:focus:bg-[#202024] transition-all cursor-pointer truncate"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-white text-neutral-900 dark:bg-[#18181B] dark:text-white">
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  showPassword,
  setShowPassword,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1"
      >
        {label}
        {required && <span className="text-amber-500 dark:text-amber-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100/70 dark:bg-[#202024] pl-3.5 pr-11 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white/40 focus:border-neutral-400 dark:focus:border-white/40 focus:bg-white dark:focus:bg-[#202024] transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-1 rounded-md transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOffIcon className="w-4 h-4" />
          ) : (
            <EyeIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
