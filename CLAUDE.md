# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Lowe-s** is a secondhand marketplace app **for Covenant College** (campus-specific classifieds).
Built with Expo / React Native, it targets iOS, Android, and web from one codebase. The UI theme is a
physical **cork board**: listings are cards "pinned" with randomized thumbtacks.

For direction and current status, read `PROJECT_SCOPE.md` (purpose + state) and `PROJECT_PLAN.md`
(roadmap, decisions, and the proposed Supabase data model). These are the source of truth for what's
decided vs. still open.

## Commands

```bash
npm install          # install deps
npx expo start       # start Metro dev server (press i / a / w to open iOS / Android / web)
npm run ios          # start + open iOS simulator
npm run android      # start + open Android emulator
npm run web          # start + open web
npm run lint         # eslint (eslint-config-expo)
```

- **No test suite exists yet** — there is no test runner configured. Don't assume `npm test` works.
- The `reset-project` npm script points at `./scripts/reset-project.js`, which is **not present**
  (the reset has already been run — starter code lives in `app-example/`). Treat that script as
  unavailable.

## Architecture

**Routing — Expo Router (file-based).** Entry is `expo-router/entry` (see `package.json` `main`).
Routes live in `app/`; `app/_layout.tsx` is the root layout. On `main` the app is a single screen
(`app/index.tsx`, the cork-board home). Typed routes are enabled (`app.json` → `experiments.typedRoutes`),
so route strings are type-checked.

**Import alias.** `@/*` maps to the repo root (`tsconfig.json`). Import as `@/components/...`,
`@/constants/theme`, `@/hooks/...` — not relative paths.

**Cross-platform code.** This runs on native **and** web. Platform-specific implementations use the
`*.web.ts` filename convention (e.g. `hooks/use-color-scheme.ts` vs `hooks/use-color-scheme.web.ts`);
Metro picks the right one per platform. Web-only styling like `boxShadow`/`filter`/`textShadow` is
used in some components — keep native and web behavior in mind when editing styles.

**The cork-board / thumbtack visual system.** The signature look is randomized thumbtacks pinning
cards. The randomization logic (`REGULAR_THUMBTACKS`, `SPECIAL_THUMBTACKS`, `getRandomThumbtack` with
a 1-in-300 rare rainbow/doge easter egg) is **currently duplicated** in `components/listing.tsx` and
`components/logo.tsx`. If you touch it, consider consolidating into a shared module rather than
editing one copy. Randomized rotation/thumbtack per card is memoized with `useMemo(..., [])` so it's
stable across re-renders.

**Responsive grid.** `components/listing.tsx` computes its own column count and item width from
`useWindowDimensions()` (`getColumns` targets ~170px items, 2–6 columns). `app/index.tsx` currently
renders **500 hardcoded placeholder listings inside a `ScrollView`** — this is stand-in data; real
data should move to a `FlatList`/pagination (see `PROJECT_PLAN.md` M2).

**Theme.** `constants/theme.ts` exports `Colors` and `Fonts`. Note `Colors` only has a `dark` key and
its values are actually light-colored — the naming is misleading; a proper theming pass is planned.

## Conventions & gotchas

- **`.gitignore` does NOT ignore `node_modules/`.** It only ignores `expo-env.d.ts`, `/.expo`, and
  `.DS_Store`. This already caused `node_modules` to be committed accidentally on the `auth` branch —
  be careful with `git add`, and prefer staging specific paths over `git add -A`.
- **Backend is Supabase** (planned; auth is currently mocked on the in-flight `auth` branch). Never
  hardcode the Supabase URL/keys — surface them via env/`expo-constants`.
- Component files use `snake_case` names (`search_bar.tsx`, `login_field_border.tsx`); exported
  components are PascalCase. TypeScript `strict` mode is on.
- `app-example/` is untouched Expo starter scaffolding, not part of the app — ignore it when working
  on features.
