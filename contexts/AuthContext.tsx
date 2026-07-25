import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

export interface User {
  id: string;
  email: string;
  isNewUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  pendingEmail: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  requestCode: (email: string) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_KEY);
      if (token && userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  // Step 1: user submits email — sanitize, send code, navigate to verify screen
  const requestCode = async (email: string) => {
    try {
      setIsLoading(true);

      // TODO: sanitize to covenant email domain
      // if (!email.endsWith("@covenant.edu")) throw new Error("Invalid email domain");

      // TODO: call your backend to send the 2FA code to this email

      setPendingEmail(email);
      router.push("/(auth)/verify");
    } catch (error) {
      console.error("Request code error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: user submits the code from their email
  const verifyCode = async (code: string) => {
    try {
      setIsLoading(true);

      // TODO: call your backend to verify the code against pendingEmail
      // For now accept any 6-digit input
      await new Promise((resolve) => setTimeout(resolve, 800));

      // TODO: determine from backend whether this is a new user
      const isNewUser = false;

      const mockUser: User = {
        id: "123",
        email: pendingEmail!,
        isNewUser,
      };

      const mockToken = "mock_token_" + Date.now();

      await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(mockUser));

      setUser(mockUser);
      setPendingEmail(null);

      if (isNewUser) {
        // TODO: router.replace("/(auth)/onboarding");
        router.replace("/(tabs)");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Verify code error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      setUser(null);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    pendingEmail,
    isLoading,
    isAuthenticated: !!user,
    requestCode,
    verifyCode,
    signOut,
    initializeAuth,
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
