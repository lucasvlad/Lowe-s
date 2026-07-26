# Authentication Setup Guide

How auth is wired in Lowe-s, and how to configure the Supabase backend.

## Flow

Lowe-s uses **passwordless email OTP** (one-time 6-digit codes), restricted to
Covenant College emails.

1. **Login** (`app/(auth)/login.tsx`) — the user enters their `@covenant.edu`
   email and we request a one-time code.
2. **Verify** (`app/(auth)/verify.tsx`) — the user enters the 6-digit code from
   their inbox; on success a session is created and they land in `(tabs)`.

`contexts/AuthContext.tsx` is wired to real Supabase OTP (`signInWithOtp` /
`verifyOtp`) and restores sessions via `onAuthStateChange`.

## Structure

- `contexts/AuthContext.tsx` — global auth state (`requestCode`, `verifyCode`, `signOut`).
- `app/(auth)/` — public routes (`login`, `verify`); redirects to `(tabs)` if already signed in.
- `app/(tabs)/` — protected routes (the cork-board home); redirects to `(auth)/login` if not.
- `app/_layout.tsx` — wraps the app in `AuthProvider` + a navigation guard.
- `utils/supabase.ts` — Supabase client (persists the session via SecureStore on
  native / localStorage on web).

## Configuring Supabase

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. Enable email OTP: **Authentication → Providers → Email** (enable "Email OTP").
3. **Make the emails send a code, not a link.** Supabase picks the template by
   account state: a **first-time** email hits **"Confirm signup"**, a
   **returning** email hits **"Magic Link"**. Edit **both** (Authentication →
   Email Templates) so each uses the code token instead of the confirmation URL:
   ```
   Your Lowe-s code is: {{ .Token }}
   ```
   If a template only contains `{{ .ConfirmationURL }}`, that user gets a link
   instead of the 6-digit code the verify screen expects. (Our code verifies the
   token with `type: "email"`, which covers both new and returning users.)
4. Grab your API credentials: **Project Settings → API** → Project URL and the
   client-safe key (the **publishable** `sb_publishable_...` key, aka the `anon`
   key). Never use the `secret` / `service_role` key in the app.
5. In the repo root, copy the example env file and fill it in:
   ```bash
   cp .env.example .env
   ```
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your-publishable-key
   ```
6. Restart the dev server so the new env vars are picked up:
   ```bash
   npx expo start -c
   ```

`.env` is gitignored. The publishable/`anon` key is safe in the client (Row-Level
Security protects data); never put the `secret` / `service_role` key in the
client or in `.env`.

## Restricting sign-in to Covenant emails

Enforced in two places:

- **Client** (done, `login.tsx` + `contexts/AuthContext.tsx`): rejects any
  address that isn't `@covenant.edu` before requesting a code.
- **Server** (⚠️ **you must apply this** — the client check alone can be
  bypassed by calling the Supabase API directly): add a trigger that blocks
  non-Covenant signups. Run this once in the Supabase **SQL Editor**:

  ```sql
  create or replace function public.enforce_covenant_email()
  returns trigger
  language plpgsql
  security definer
  as $$
  begin
    if new.email !~* '@covenant\.edu$' then
      raise exception 'Only @covenant.edu email addresses are allowed';
    end if;
    return new;
  end;
  $$;

  create trigger enforce_covenant_email
    before insert on auth.users
    for each row execute function public.enforce_covenant_email();
  ```

  With OTP, the user row is created when the code is requested, so a non-Covenant
  address will fail at that point.

## Session storage caveat (native)

The Supabase session is persisted via `expo-secure-store` on native and
`localStorage` on web. SecureStore has a ~2048-byte per-value limit, and Supabase
sessions can exceed it, which logs a warning and may fail to persist on device.
Web is unaffected. If this bites on iOS/Android, switch the native branch of the
storage adapter in `utils/supabase.ts` to `@react-native-async-storage/async-storage`
(already a dependency).
