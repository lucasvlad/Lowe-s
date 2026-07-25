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

### M1 — Finish & merge Auth  ← *current focus*
Goal: a real, working `@covenant.edu`-restricted email OTP login merged to `main`.

- [ ] **Clean up the `auth` branch git history** — remove committed `node_modules`, confirm
      `.gitignore` covers it. (See scope doc §4.)
- [ ] **Reconcile the home screen** — auth branch moved it to `app/(tabs)/index.tsx`; port
      `main`'s cork-board home (logo, search bar, listing grid) into the `(tabs)` structure.
- [ ] **Set up the Supabase project** — create project, get URL + anon key, store as env vars
      (via `app.config` / `expo-constants`), replace the placeholders in `utils/supabase.ts`.
- [ ] **Wire real OTP auth** — replace the mocked `requestCode`/`verifyCode` in `AuthContext`
      with `supabase.auth.signInWithOtp` + `verifyOtp`.
- [ ] **Enforce `@covenant.edu`** — client-side validation in `login.tsx` **and** server-side
      (Supabase auth hook / allowed-domain check) so it can't be bypassed.
- [ ] **Verify the navigation guard** — unauthenticated → `(auth)/login`; authenticated → `(tabs)`;
      session restored from SecureStore on cold start; sign-out works.
- [ ] Merge `auth` → `main`.

### M2 — Listings data layer (Browse)
Goal: replace the 500 hardcoded placeholder cards with real data.

- [ ] Create the `listings` table + `profiles` table in Supabase (schema below).
- [ ] Set up Supabase **Storage** bucket for listing images + RLS policies.
- [ ] Data access module (`utils/listings.ts` or a hook, e.g. `useListings`) — fetch listings,
      paginated (the current grid renders 500 at once; use `FlatList`/pagination for real data).
- [ ] Refactor `components/listing.tsx` to accept real props (`id`, `imageUrl`, `price`, `title`,
      `onPress`) — the TODO block in that file already sketches this.
- [ ] **Listing detail page** — `app/(tabs)/listing/[id].tsx`, loads a listing by id.
- [ ] Loading / empty / error states.

### M3 — Post a listing (Sell)
Goal: users can create, edit, and delete their own listings.

- [ ] "Post" screen/tab — form: image picker (`expo-image-picker`), title, price, description,
      category.
- [ ] Upload image to Supabase Storage; insert row into `listings`.
- [ ] "My listings" view; edit + delete (RLS: only the owner can mutate).
- [ ] Basic validation (required fields, price format, image size).

### M4 — Search & Categories
Goal: make the cork board navigable.

- [ ] Wire `components/search_bar.tsx` to filter listings by keyword (title/description).
- [ ] Category taxonomy (e.g. Furniture, Textbooks, Electronics, Clothing, Appliances, Other) +
      category filter UI.
- [ ] Server-side query (Supabase `ilike` / full-text search) rather than client-side filtering
      of a full download.

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
