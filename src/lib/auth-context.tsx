"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface CatProfile {
  catName: string;
  catBreed: string;
  stationName: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  catProfile: CatProfile | null;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  setCatProfile: (profile: CatProfile) => Promise<void>;
  signOut: () => Promise<void>;
}

// Sanitize user inputs to prevent injection and limit length
function sanitizeString(input: string, maxLength = 60): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[^\w\s\-'.]/gi, "") // allow standard alphanumeric and safe punctuation
    .trim()
    .slice(0, maxLength);
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  catProfile: null,
  isAuthModalOpen: false,
  authModalMode: "login",
  openAuthModal: () => {},
  closeAuthModal: () => {},
  setCatProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [catProfile, setCatProfileState] = useState<CatProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  // Load saved cat profile from localStorage cache on initial client load
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("pawstation-cat-profile");
      if (savedProfile) {
        setCatProfileState(JSON.parse(savedProfile));
      }
    } catch {
      /* ignore storage errors */
    }
  }, []);

  // Supabase auth listener and database synchronization
  useEffect(() => {
    async function syncProfileFromDatabase(currentUserId: string, fallbackMeta?: Record<string, unknown>) {
      try {
        // Attempt fetch from cat_profiles table
        const { data: dbProfile, error } = await supabase
          .from("cat_profiles")
          .select("cat_name, cat_breed, station_name")
          .eq("user_id", currentUserId)
          .maybeSingle();

        if (dbProfile && !error && dbProfile.cat_name) {
          const profile: CatProfile = {
            catName: sanitizeString(dbProfile.cat_name),
            catBreed: sanitizeString(dbProfile.cat_breed || "Domestic Shorthair"),
            stationName: sanitizeString(dbProfile.station_name || "PawStation Unit 1"),
          };
          setCatProfileState(profile);
          try {
            localStorage.setItem("pawstation-cat-profile", JSON.stringify(profile));
          } catch {
            /* ignore */
          }
          return;
        }
      } catch {
        /* cat_profiles table lookup fallback */
      }

      // Fallback to user metadata
      if (fallbackMeta?.cat_name && typeof fallbackMeta.cat_name === "string") {
        const metaProfile: CatProfile = {
          catName: sanitizeString(fallbackMeta.cat_name),
          catBreed: sanitizeString((fallbackMeta.cat_breed as string) || "Domestic Shorthair"),
          stationName: sanitizeString((fallbackMeta.station_name as string) || "PawStation Unit 1"),
        };
        setCatProfileState(metaProfile);
        try {
          localStorage.setItem("pawstation-cat-profile", JSON.stringify(metaProfile));
        } catch {
          /* ignore */
        }

        // Asynchronously upsert to cat_profiles table for persistence
        try {
          await supabase.from("cat_profiles").upsert(
            {
              user_id: currentUserId,
              cat_name: metaProfile.catName,
              cat_breed: metaProfile.catBreed,
              station_name: metaProfile.stationName,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        } catch {
          /* table upsert non-blocking */
        }
      }
    }

    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          await syncProfileFromDatabase(
            data.session.user.id,
            data.session.user.user_metadata
          );
        }
      } catch {
        /* supabase auth init fail handled gracefully */
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await syncProfileFromDatabase(
            currentSession.user.id,
            currentSession.user.user_metadata
          );
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const setCatProfile = async (profile: CatProfile) => {
    const cleanProfile: CatProfile = {
      catName: sanitizeString(profile.catName),
      catBreed: sanitizeString(profile.catBreed || "Domestic Shorthair"),
      stationName: sanitizeString(profile.stationName || "PawStation Unit 1"),
    };

    setCatProfileState(cleanProfile);

    // Save to local storage cache
    try {
      localStorage.setItem("pawstation-cat-profile", JSON.stringify(cleanProfile));
    } catch {
      /* ignore */
    }

    // If authenticated, sync with user metadata and database table
    if (user) {
      try {
        // 1. Update user metadata
        await supabase.auth.updateUser({
          data: {
            cat_name: cleanProfile.catName,
            cat_breed: cleanProfile.catBreed,
            station_name: cleanProfile.stationName,
          },
        });

        // 2. Upsert to cat_profiles table
        await supabase.from("cat_profiles").upsert(
          {
            user_id: user.id,
            cat_name: cleanProfile.catName,
            cat_breed: cleanProfile.catBreed,
            station_name: cleanProfile.stationName,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      } catch {
        /* database sync is non-blocking for UI responsiveness */
      }
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        catProfile,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setCatProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
