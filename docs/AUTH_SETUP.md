# Authentication Setup Guide

How auth is wired in Lowe-s, and how to configure the Supabase backend.

## Flow

Lowe-s uses **passwordless email OTP** (one-time 6-digit codes), restricted to
Covenant College emails.

1. **Login** (`app/(auth)/login.tsx`) — the user enters their `@covenant.edu`
   email and we request a one-time code.
2. **Verify** (`app/(auth)/verify.tsx`) — the user enters the 6-digit code from
   their inbox; on success a session is created and they land in `(tabs)`.

> **Status:** the flow is currently **mocked** in `contexts/AuthContext.tsx`
> (any 6-digit code is accepted). Wiring it to real Supabase OTP + enforcing the
> `@covenant.edu` domain is the next step — see `docs/PROJECT_PLAN.md` (M1 / PR B).

## Structure

- `contexts/AuthContext.tsx` — global auth state (`requestCode`, `verifyCode`, `signOut`).
- `app/(auth)/` — public routes (`login`, `verify`); redirects to `(tabs)` if already signed in.
- `app/(tabs)/` — protected routes (the cork-board home); redirects to `(auth)/login` if not.
- `app/_layout.tsx` — wraps the app in `AuthProvider` + a navigation guard.
- `utils/supabase.ts` — Supabase client (persists the session via SecureStore on
  native / localStorage on web).

## Configuring Supabase

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. Enable email OTP: **Authentication → Providers → Email**, and turn on
   "Email OTP" (a numeric code) rather than magic links.
3. Grab your API credentials: **Project Settings → API** → Project URL and the
   `anon` `public` key.
4. In the repo root, copy the example env file and fill it in:
   ```bash
   cp .env.example .env
   ```
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Restart the dev server so the new env vars are picked up:
   ```bash
   npx expo start -c
   ```

`.env` is gitignored. The `anon` key is safe in the client (Row-Level Security
protects data); never put the `service_role` key in the client or in `.env`.

## Restricting sign-in to Covenant emails

Enforced in two places (PR B):

- **Client:** `login.tsx` rejects any address that isn't `@covenant.edu` before
  requesting a code.
- **Server:** a Supabase Auth hook / allowed-domain check, so the restriction
  can't be bypassed by calling the API directly.
