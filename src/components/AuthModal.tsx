"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CloseIcon, CheckIcon, PawIcon, ShieldIcon } from "./Icons";
import { supabase } from "@/lib/supabase";
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

// Input sanitization helper to prevent script injection
function sanitizeInput(str: string, maxLen = 60): string {
  return str
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/[^\w\s\-'.]/gi, "") // Keep safe alphanumeric & common punctuation
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

  const [mode, setMode] = useState<"login" | "signup">(authModalMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [catName, setCatName] = useState("");
  const [catBreed, setCatBreed] = useState("Domestic Shorthair");
  const [stationName, setStationName] = useState("PawStation Unit 1");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);

  // Sync mode with context
  if (authModalMode !== mode && !isSubmitting && !showVerificationScreen) {
    setMode(authModalMode);
  }

  // Strong password requirements validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9\s]/.test(password);
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;

  // Real-time strength score: 0 to 4
  const strengthScore = [
    hasMinLength,
    hasUppercase && hasLowercase,
    hasDigit,
    hasSpecial,
  ].filter(Boolean).length;

  const strengthLabels = ["Too Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthLabel = password.length === 0 ? "Empty" : strengthLabels[strengthScore];
  const strengthColor =
    strengthScore === 4
      ? "bg-periwinkle text-periwinkle"
      : strengthScore === 3
      ? "bg-sky-500 text-sky-500"
      : strengthScore === 2
      ? "bg-amber-500 text-amber-500"
      : "bg-accent-crimson text-accent-crimson";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("Please fulfill all password requirements.");
      return;
    }

    const cleanCatName = sanitizeInput(catName, 50);
    if (!cleanCatName) {
      setErrorMessage("Please enter your cat's name.");
      return;
    }

    const cleanStationName = sanitizeInput(stationName, 60) || "PawStation Unit 1";

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            cat_name: cleanCatName,
            cat_breed: catBreed,
            station_name: cleanStationName,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      // Synchronize cat profile to session cache and database
      await setCatProfile({
        catName: cleanCatName,
        catBreed,
        stationName: cleanStationName,
      });

      // Show verification view with verify-later option
      setShowVerificationScreen(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to register account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyLater = () => {
    setShowVerificationScreen(false);
    closeAuthModal();
    router.push("/dashboard");
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          if (!isSubmitting) closeAuthModal();
        }}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white dark:bg-[#1C1C1E] rounded-apple-lg border border-black/[0.08] dark:border-white/[0.1] max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10 transition-colors"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.08] px-6 py-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <PawIcon className="w-5 h-5 text-accent-amber" />
            <h3 className="text-[17px] font-semibold text-[#18181B] dark:text-[#F4F4F5]">
              {showVerificationScreen
                ? "Verify Your Email"
                : mode === "login"
                ? "Sign In to PawStation"
                : "Create PawStation Account"}
            </h3>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-4 h-4 text-[#71717A] dark:text-[#A1A1AA]" />
          </button>
        </div>

        <div className="p-6">
          {/* Verification Screen with Verify Later */}
          {showVerificationScreen ? (
            <div className="text-center space-y-5 py-2">
              <div className="w-14 h-14 rounded-full bg-accent-amber/10 dark:bg-accent-amber/20 flex items-center justify-center mx-auto text-accent-amber">
                <ShieldIcon className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-[18px] font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2">
                  Verification Link Sent
                </h4>
                <p className="text-[13px] text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                  We sent a confirmation link to{" "}
                  <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                    {email}
                  </span>
                  . You can verify your email now or proceed directly to your
                  hardware dashboard.
                </p>
              </div>

              {/* Station summary chip */}
              <div className="p-3.5 rounded-apple bg-canvas-light dark:bg-[#121214] border border-black/[0.04] dark:border-white/[0.06] text-left text-[12px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#71717A] dark:text-[#A1A1AA]">Registered Cat:</span>
                  <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                    {catName} ({catBreed})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717A] dark:text-[#A1A1AA]">Station Name:</span>
                  <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                    {stationName}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleVerifyLater}
                  className="apple-button w-full bg-[#18181B] text-white hover:bg-[#27272A] dark:bg-white dark:text-[#18181B] dark:hover:bg-gray-100 py-3 text-[14px]"
                >
                  Verify Later &amp; Continue to Dashboard
                </button>
                <button
                  onClick={() => setShowVerificationScreen(false)}
                  className="w-full text-center text-[12px] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] py-1 transition-colors"
                >
                  Change Account Details
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mode Tabs */}
              <div className="flex rounded-apple p-1 bg-canvas-light dark:bg-[#121214] border border-black/[0.04] dark:border-white/[0.06] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    openAuthModal("login");
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-[13px] font-semibold rounded-lg transition-all ${
                    mode === "login"
                      ? "bg-white dark:bg-[#2C2C2E] text-[#18181B] dark:text-[#F4F4F5] shadow-sm"
                      : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    openAuthModal("signup");
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-[13px] font-semibold rounded-lg transition-all ${
                    mode === "signup"
                      ? "bg-white dark:bg-[#2C2C2E] text-[#18181B] dark:text-[#F4F4F5] shadow-sm"
                      : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-apple bg-accent-crimson/10 border border-accent-crimson/20 text-accent-crimson text-[12px] leading-relaxed">
                  {errorMessage}
                </div>
              )}

              {/* Form Content */}
              {mode === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <FormInput
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="catparent@example.com"
                  />
                  <FormInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="apple-button w-full bg-[#18181B] text-white hover:bg-[#27272A] dark:bg-white dark:text-[#18181B] dark:hover:bg-gray-100 py-3 text-[14px] disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? "Signing In..." : "Sign In to Dashboard"}
                  </button>

                  <div className="text-center pt-3 text-[12px] text-[#71717A] dark:text-[#A1A1AA]">
                    Need an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setErrorMessage(null);
                      }}
                      className="font-semibold text-accent-amber hover:underline"
                    >
                      Sign Up
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Account credentials */}
                  <FormInput
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="catparent@example.com"
                  />

                  {/* Password with strength meter */}
                  <div>
                    <FormInput
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Minimum 8 characters"
                    />

                    {/* Real-time strength meter bar */}
                    {password.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#71717A] dark:text-[#A1A1AA]">
                            Password Strength
                          </span>
                          <span className={`font-semibold ${strengthColor.split(" ")[1]}`}>
                            {strengthLabel}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          {[0, 1, 2, 3].map((step) => (
                            <div
                              key={step}
                              className={`h-full rounded-full transition-all duration-200 ${
                                step < strengthScore
                                  ? strengthColor.split(" ")[0]
                                  : "bg-gray-200 dark:bg-[#2C2C2E]"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feline & Station details */}
                  <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] space-y-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-accent-amber">
                      <PawIcon className="w-3.5 h-3.5" />
                      Cat Profile &amp; Station Setup
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormInput
                        label="Cat Name"
                        type="text"
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        required
                        placeholder="e.g. Whiskers"
                      />

                      <div>
                        <label className="block text-[12px] font-medium text-[#71717A] dark:text-[#A1A1AA] mb-1.5">
                          Cat Breed
                        </label>
                        <select
                          value={catBreed}
                          onChange={(e) => setCatBreed(e.target.value)}
                          className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-canvas-light dark:bg-[#121214] px-3 py-2.5 text-[13px] text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-accent-amber/40 transition-all"
                        >
                          {CAT_BREEDS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <FormInput
                      label="Station Device Name"
                      type="text"
                      value={stationName}
                      onChange={(e) => setStationName(e.target.value)}
                      placeholder="PawStation Unit 1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !isPasswordValid}
                    className="apple-button w-full bg-[#18181B] text-white hover:bg-[#27272A] dark:bg-white dark:text-[#18181B] dark:hover:bg-gray-100 py-3 text-[14px] disabled:opacity-50 mt-4"
                  >
                    {isSubmitting
                      ? "Registering Account..."
                      : "Register & Connect Station"}
                  </button>

                  <div className="text-center pt-3 text-[12px] text-[#71717A] dark:text-[#A1A1AA]">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setErrorMessage(null);
                      }}
                      className="font-semibold text-accent-amber hover:underline"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function RequirementItem({
  satisfied,
  text,
}: {
  satisfied: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
          satisfied
            ? "bg-periwinkle text-white"
            : "bg-gray-200 dark:bg-[#2C2C2E] text-transparent"
        }`}
      >
        <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />
      </div>
      <span
        className={
          satisfied
            ? "text-[#18181B] dark:text-[#F4F4F5]"
            : "text-[#71717A] dark:text-[#A1A1AA]"
        }
      >
        {text}
      </span>
    </div>
  );
}

function FormInput({
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
    <div>
      <label
        htmlFor={id}
        className="block text-[12px] font-medium text-[#71717A] dark:text-[#A1A1AA] mb-1.5"
      >
        {label}
        {required && <span className="text-accent-crimson ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-canvas-light dark:bg-[#121214] px-3.5 py-2.5 text-[14px] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] dark:placeholder:text-[#52525B] focus:outline-none focus:ring-2 focus:ring-accent-amber/40 focus:border-accent-amber/50 transition-all"
      />
    </div>
  );
}
