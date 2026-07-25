import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Config comes from env. `EXPO_PUBLIC_`-prefixed vars are inlined into the
// client bundle at build time by the Expo CLI (which auto-loads `.env`).
// The anon/public key is safe to ship in a client app — Row-Level Security is
// what protects the data. Copy `.env.example` to `.env` and fill these in
// (see docs/AUTH_SETUP.md).
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase configuration. Copy .env.example to .env and set " +
      "EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

// Persist the auth session in SecureStore on native (encrypted on-device) and
// localStorage on web.
// `localStorage` is undefined during static web prerendering (Node) and in any
// non-browser context, so guard every web access — there's no session to
// restore server-side anyway.
const hasLocalStorage = () => typeof localStorage !== "undefined";

const SecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === "web") {
      return hasLocalStorage() ? localStorage.getItem(key) : null;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web") {
      if (hasLocalStorage()) localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === "web") {
      if (hasLocalStorage()) localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
