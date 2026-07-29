# Lowe-s — Project Plan

> Roadmap and technical plan for the Lowe-s campus marketplace.
> See `PROJECT_SCOPE.md` for purpose, current state, and background.
> Last updated: 2026-07-25

## Decisions (locked)

| Decision | Choice |
|---|---|
| **Backend** | **Supabase** (Postgres + Auth + Storage + Row-Level Security) |
| **First milestone** | **Finish & merge the `auth` branch** |
| **Allowed email domain** | **`@covenant.edu` only** |
| **MVP feature set** | Browse listings · Post a listing · Search & categories |
| **Deferred** | In-app messaging / contact-seller (post-MVP) |

## MVP Definition

A Covenant student can: sign in with their `@covenant.edu` email via a one-time code,
**browse** listings on the cork board, **search/filter** them by keyword and category, and
**post** their own item (photo, price, title, description) for others to see.

---

## Milestones

### M1 — Finish & merge Auth  ✅
Goal: a real, working `@covenant.edu`-restricted email OTP login merged to `main`.

**Status: ✅ complete (merged).**

- [x] **Clean up committed `node_modules`** — turned out to be tracked since the initial commit
      (~41k files), not just on the auth branch; untracked and `.gitignore` covers it.
- [x] **Reconcile the home screen** — cork-board home now lives at `app/(tabs)/index.tsx`.
- [x] **Set up the Supabase project** — URL + publishable key via gitignored `.env`
      (`EXPO_PUBLIC_*`), read in `utils/supabase.ts`.
- [x] **Wire real OTP auth** — `signInWithOtp` + `verifyOtp`, session via `onAuthStateChange`.
- [x] **Enforce `@covenant.edu`** — client-side in `login.tsx`/`AuthContext`; server-side trigger
      SQL documented in `docs/AUTH_SETUP.md` (applied in Supabase).
- [x] **Verify the navigation guard** — confirmed by the user (login/signup/logout work).
- [x] Merged to `main` (PRs #9/#10 area).

### M2 — Listings data layer (Browse)  ← *delivered, pending SQL apply*
Goal: replace the 500 hardcoded placeholder cards with real data.

- [x] Create the `listings` + `profiles` tables — `supabase/migrations/0001_listings_and_profiles.sql`.
- [x] Supabase **Storage** bucket for listing images + RLS policies (in the same migration).
- [x] Data access module + hook — `utils/listings.ts` (paginated fetch, `formatPrice`) and
      `hooks/use-listings.ts` (infinite scroll state).
- [x] Refactor `components/listing.tsx` to real props (`item`, `width`, `onPress`).
- [x] **Listing detail page** — `app/listing/[id].tsx` (root-level so it pushes over the tabs).
- [x] Loading / empty / error states (+ pull-to-refresh).

> **To go live:** run `supabase/migrations/0001_...sql` then `supabase/seed.sql` in the Supabase
> SQL editor. Until then the browse grid loads empty.

### M3 — Post a listing (Sell)  ✅
Goal: users can create, edit, and delete their own listings.

**Status: ✅ delivered.**

- [x] "Post" screen/tab — form: image picker (`expo-image-picker`), title, price, description,
      category. `app/(tabs)/post.tsx` + shared `components/listing_form.tsx`.
- [x] Upload image to Supabase Storage; insert row into `listings` —
      `uploadListingImage`/`createListing` in `utils/listings.ts`.
- [x] "My listings" view; edit + delete (RLS: only the owner can mutate) —
      `app/(tabs)/my-listings.tsx` + `app/listing/[id]/edit.tsx`.
- [x] Basic validation (required fields, price format, image size) — in `ListingForm` and
      `uploadListingImage`'s 8MB cap.
- [x] Fixed `Alert.alert` being a silent no-op on web (`react-native-web`), which was blocking the
      delete-confirmation dialog and every error alert in the app on web — added
      `utils/alert.ts` (`alertMessage`/`confirmAction`) with a `window.confirm`/`alert` fallback,
      and swapped every `Alert.alert` call site to use it.
- [x] Fixed Home/My Listings not showing newly created or edited listings without a manual
      refresh — both screens now refetch on tab focus (`useFocusEffect`) instead of only once on
      mount, since Expo Router keeps tab screens mounted.

### M4 — Search & Categories  ✅
Goal: make the cork board navigable.

**Status: ✅ delivered.**

- [x] Wire `components/search_bar.tsx` to filter listings by keyword (title/description) — now
      controlled + debounced (300ms), reports up via `onSearch`.
- [x] Category taxonomy (`constants/categories.ts`, shared with the M3 post/edit form) +
      category filter UI (`components/category_filter.tsx`, "All" + chips on the home screen).
- [x] Server-side query (Supabase `ilike` / full-text search) rather than client-side filtering
      of a full download — `fetchListingsPage` takes an optional `{ search, category }` filter and
      builds the query with `.eq`/`.or(...ilike...)`; `hooks/use-listings.ts` reloads from page 0
      whenever either changes.

### M5 — UI cleanup pass
Goal: come back and fix the visual/UX debt intentionally left rough while M3/M4 were built fast.
Nothing here blocks functionality — it's a punch list so it doesn't get forgotten.

- [ ] `constants/theme.ts` — only has a `dark` key with light values; misleading naming, no real
      light/dark theming.
- [ ] Consolidate the duplicated thumbtack randomization logic (`REGULAR_THUMBTACKS`,
      `SPECIAL_THUMBTACKS`, `getRandomThumbtack`) out of `components/listing.tsx` and
      `components/logo.tsx` into a shared module.
- [ ] Post / My Listings / Edit screens (M3) were built with plain `TextInput`s and
      `TouchableOpacity` chips, no cork-board/thumbtack styling, no custom fonts — bring them in
      line with the login screen's visual identity (`SvgBorder`, `PencilFont`, erase transitions).
- [ ] Category picker is a bare row of text chips — needs real design treatment. The chip styling
      is now duplicated across `components/listing_form.tsx` and `components/category_filter.tsx`
      (M4); consolidate into one shared chip component during the design pass.
- [ ] `app/(tabs)/index.tsx` home header (`firstNameFromEmail` greeting, logout button) is
      placeholder-styled — revisit copy + layout.
- [ ] Bottom tab bar has no icons, just text titles, once there are 3+ tabs (Home/Post/My Listings)
      it needs a real icon set.
- [ ] Listing detail page (`app/listing/[id].tsx`) layout/typography pass.
- [ ] General empty/error/loading state styling across screens (currently plain centered text).
- [ ] Search bar (`components/search_bar.tsx`) placeholder copy ("jawns") — confirm tone before
      launch.

### Post-MVP (deferred)
- In-app messaging / contact seller.
- Mark item as sold / listing status lifecycle.
- Push notifications, favorites/saved items, onboarding screen for new users
  (`isNewUser` branch already stubbed in `AuthContext`), reporting/moderation.

---

## Proposed Data Model (Supabase / Postgres)

> Draft — refine during M2.

```
profiles
  id            uuid  PK  (references auth.users.id)
  email         text      -- @covenant.edu
  display_name  text
  created_at    timestamptz default now()

listings
  id            uuid  PK  default gen_random_uuid()
  seller_id     uuid  FK -> profiles.id
  title         text  not null
  description   text
  price_cents   int   not null        -- store cents to avoid float issues
  category      text                  -- enum-like: furniture | textbooks | ...
  image_url     text                  -- Supabase Storage public URL
  status        text  default 'active' -- active | sold | removed
  created_at    timestamptz default now()
  updated_at    timestamptz default now()
```

**Row-Level Security (RLS):**
- `listings`: anyone authenticated can `SELECT`; only `seller_id = auth.uid()` can
  `INSERT`/`UPDATE`/`DELETE`.
- `profiles`: user can read all, write only their own row.
- Storage bucket: authenticated read; write scoped to owner's folder.

**Auth domain enforcement:** restrict sign-in to `@covenant.edu` via a Supabase auth hook /
database trigger (in addition to client-side checks).

---

## Technical Notes / Watch-outs

- **Config/secrets:** don't hardcode Supabase URL/key — use env vars surfaced through
  `app.config.ts` + `expo-constants`. The anon key is public-safe, but keep service-role keys off
  the client entirely.
- **Perf:** `main` currently renders 500 `<Listing>` in a `ScrollView`. Switch to `FlatList`
  (or `FlashList`) with pagination for real data.
- **Cross-platform:** app targets web too; keep SecureStore/localStorage adapter split (already
  handled in `utils/supabase.ts`) and test auth on web + native.
- **Theme:** `constants/theme.ts` only has a `dark` key with light values — clean up during M2/M4.
- Keep listing/thumbtack visual identity (random tacks, rare easter egg) when refactoring to real data.

## Open Questions (remaining)

- Display name / profile: collect at first sign-in (onboarding) or derive from email?
- Categories: final list?
- Image handling: single image per listing for MVP, or multiple?
- Do we need a "sold" state in MVP browse, or is delete enough?
