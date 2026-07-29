import React, { createContext, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";
import { useDesignVariant } from "@/contexts/DesignVariantContext";

/** Only this email domain may sign in (also enforced server-side). */
export const ALLOWED_EMAIL_DOMAIN = "covenant.edu";

/** True if `email` belongs to the allowed Covenant domain. */
export function isAllowedEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

export interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  pendingEmail: string | null;
  /** True only for the one-time cold-start session restore — gates the full-screen loading view. */
  isInitializing: boolean;
  /** True while a specific auth action (request/verify/sign out) is in flight — for inline button spinners. */
  isLoading: boolean;
  isAuthenticated: boolean;
  requestCode: (email: string) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(session: Session | null): User | null {
  if (!session?.user?.email) return null;
  return { id: session.user.id, email: session.user.email };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { markJustSignedIn } = useDesignVariant();

  useEffect(() => {
    // Restore a persisted session on cold start.
    supabase.auth
      .getSession()
      .then(({ data }) => setUser(toUser(data.session)))
      .finally(() => setIsInitializing(false));

    // Stay in sync with sign-in / sign-out / token refresh.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Step 1: send a one-time code to a Covenant email, then go to the verify screen.
  const requestCode = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isAllowedEmail(normalizedEmail)) {
      throw new Error(`Please use your @${ALLOWED_EMAIL_DOMAIN} email address.`);
    }
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
      });
      if (error) throw error;
      setPendingEmail(normalizedEmail);
      router.push("/(auth)/verify");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: verify the 6-digit code; Supabase creates + persists the session.
  const verifyCode = async (code: string) => {
    if (!pendingEmail) {
      throw new Error("No pending email — please request a new code.");
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: code.trim(),
        type: "email",
      });
      if (error) throw error;
      setUser(toUser(data.session));
      setPendingEmail(null);
      markJustSignedIn();
      router.replace("/(tabs)");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setPendingEmail(null);
      router.replace("/(auth)/login");
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    pendingEmail,
    isInitializing,
    isLoading,
    isAuthenticated: !!user,
    requestCode,
    verifyCode,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
