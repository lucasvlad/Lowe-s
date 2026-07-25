# Lowe-s — Project Scope

> Living document capturing the project's purpose, current state, and open questions.
> Last updated: 2026-07-25

## 1. Purpose

**Lowe-s** is a **secondhand marketplace app for Covenant College** — a small, campus-specific
classifieds/marketplace where students can buy and sell used items among each other. The name is a
playful stylization (rendered as `Lowe\`s` in the UI), unrelated to the hardware retailer.

**Design identity:** a physical **cork-board** metaphor. Listings appear as cards "pinned" to a cork
board with randomly-colored, randomly-rotated thumbtacks (with a rare 1-in-300 rainbow/doge tack
easter egg). The auth screens use a hand-drawn **pencil-on-paper** aesthetic (custom pencil font,
torn-paper backgrounds, "erase"/"reveal" transition animations, scribbled underlines).

## 2. Tech Stack

- **Framework:** Expo (~54) + React Native (0.81) with `expo-router` (file-based routing, typed routes)
- **Language:** TypeScript, React 19
- **Target platforms:** iOS, Android, and Web (`react-native-web`, static web output)
- **Planned backend:** Supabase (`@supabase/supabase-js`) — client scaffolded, not yet configured
- **Auth storage:** `expo-secure-store` (encrypted on device), `localStorage` fallback on web
- **Other:** react-native-reanimated / worklets, react-native-svg, expo-font, expo-haptics

## 3. Current State

### `main` branch — static UI prototype (home screen only)
The visual shell of the marketplace home screen is built, but there is **no data layer or
interactivity** yet.

- `app/index.tsx` — cork-board home: logo, search bar, responsive grid of listings
- `components/listing.tsx` — polished responsive listing card (2–6 columns by screen width),
  thumbtack + image + price + title. **All placeholder data**: every card is the same favicon
  image, `$1,000,000`, and `CHOW SUPP READING`, repeated **500 times**.
- `components/search_bar.tsx` — styled input, **no search logic wired up**
- `components/logo.tsx` — logo with decorative corner thumbtacks
- `constants/theme.ts` — only a `dark` palette key defined (values are actually light-colored;
  naming is a bit misleading)

### `auth` branch — email OTP auth flow (NOT yet merged, WIP / "broken")
> Friend's in-progress work. Latest commit message: *"Broken Auth but there's some auth stuff in there."*
> Restructures the app into route groups.

- **Route restructure:** `app/(auth)/` (public) and `app/(tabs)/` (protected); root `_layout.tsx`
  wraps everything in `AuthProvider` + a `NavigationGuard` that redirects based on auth state.
- **Auth flow (2 steps):**
  1. `app/(auth)/login.tsx` — enter Covenant email → `requestCode(email)`
  2. `app/(auth)/verify.tsx` — enter 6-digit code (with paste + backspace handling) → `verifyCode(code)` → `(tabs)`
- `contexts/AuthContext.tsx` — global auth state; `requestCode` / `verifyCode` / `signOut`.
  **Currently mocked** (fake token, accepts any 6-digit code); has `isNewUser` branch stubbed for a
  future onboarding screen.
- `utils/supabase.ts` — Supabase client with a SecureStore/localStorage storage adapter; URL and
  anon key are still `YOUR_SUPABASE_URL` / `YOUR_SUPABASE_ANON_KEY` placeholders.
- **Pencil-aesthetic components:** `components/erase_transition.tsx`, `components/scribble_line.tsx`,
  `components/login_field_border.tsx` (SVG border); custom `assets/fonts/pencil_type_beat.ttf`.
- Adds deps: `@supabase/supabase-js`, `expo-secure-store`, `react-native-svg`, `@react-native-async-storage/async-storage`.
- Includes `AUTH_SETUP.md` documenting the intended flow.

### Other branches
- `origin/listing-component`, `origin/logo` — already merged into `main`.

## 4. Known Issues / Cleanup Needed

- ⚠️ **`node_modules` was committed on the `auth` branch** (thousands of files, ~575KB+ diff).
  This must be cleaned up (remove from history / ensure `.gitignore` covers it) **before** the
  branch is merged to `main`, or it will badly pollute the repo.
- The `auth` branch's home screen lives at `app/(tabs)/index.tsx`; merging will need to reconcile
  this with `main`'s `app/index.tsx` (and the deleted `components/logo.tsx`).
- `main`'s listings render 500 identical hardcoded cards — placeholder pending a real data model.
- `constants/theme.ts` only defines a `dark` key with light values; theming needs a proper pass.

## 5. Decisions Made (2026-07-25)

Resolved — see `PROJECT_PLAN.md` for the roadmap built on these:

- **Backend:** ✅ **Supabase** — for both auth (email OTP) and listings data/storage.
- **Email domain:** ✅ **`@covenant.edu` only** (enforced client- and server-side).
- **First milestone:** ✅ **Finish & merge the `auth` branch.**
- **MVP feature set:** ✅ Browse listings · Post a listing · Search & categories.
- **Deferred to post-MVP:** in-app messaging / contact-seller.

### Still open (tracked in `PROJECT_PLAN.md`)
- Data model details (categories list, single vs multiple images, "sold" state in MVP).
- Profile / display-name collection (onboarding vs derived from email).

## 6. Repo Facts

- GitHub: `lucasvlad/Lowe-s` (collaborators; "a friend and I")
- Default branch: `main`
