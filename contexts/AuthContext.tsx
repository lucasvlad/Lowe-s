import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

// Define types
export interface User {
  id: string;
  email: string;
  // Add more user properties as needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string) => Promise<void>;
  signUp: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app load
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_KEY);

      if (token && userData) {
        setUser(JSON.parse(userData));
        // TODO: Optionally validate token with your backend here
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

  const signIn = async (email: string) => {
    try {
      setIsLoading(true);

      // TODO: Replace this with your actual Supabase authentication
      // Example with Supabase:
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email,
      //   password,
      // });
      // if (error) throw error;

      // For now, this is a placeholder
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data - replace with actual data from your auth service
      const mockUser: User = {
        id: "123",
        email: email,
      };

      const mockToken = "mock_token_" + Date.now();

      // Store securely
      await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(mockUser));

      setUser(mockUser);

      // Navigate to protected area
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string) => {
    try {
      setIsLoading(true);

      // TODO: Replace this with your actual Supabase authentication
      // Example with Supabase:
      // const { data, error } = await supabase.auth.signUp({
      //   email,
      //   password,
      // });
      // if (error) throw error;

      // For now, this is a placeholder
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: "456",
        email: email,
      };

      const mockToken = "mock_token_" + Date.now();

      await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(mockUser));

      setUser(mockUser);

      router.replace("/(tabs)");
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);

      // TODO: Add Supabase signout if needed
      // await supabase.auth.signOut();

      // Clear stored data
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);

      setUser(null);

      // Navigate to auth screen
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
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
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
