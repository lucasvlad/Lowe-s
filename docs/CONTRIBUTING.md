# Contributing — Rules of Engagement

Working agreement for the Lowe-s repo. Keep it lightweight, but follow it so `main` stays clean and
we stop repeating past mistakes (committed `node_modules`, `bruh` commit messages).

## Branching

- **Never commit directly to `main`.** `main` should always be in a working, deployable state.
- Do all work on a **feature branch** off the latest `main`:
  ```bash
  git switch main && git pull
  git switch -c <type>/<short-description>   # e.g. feat/listing-detail, fix/login-domain
  ```
- Branch names: `feat/…`, `fix/…`, `chore/…`, `docs/…` + a short kebab-case description.
- Keep branches focused and short-lived — one feature/fix per branch. Rebase or merge `main` in
  regularly to avoid big divergence.

## Commits — Conventional Commits

Format: `<type>(<optional scope>): <imperative summary>`

```
feat: add listing detail page
fix(auth): restrict sign-in to @covenant.edu
chore: bump expo to 54.0.25
docs: update project plan for M2
refactor: extract shared thumbtack helper
```

- **Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`, `perf`.
- Summary is imperative and lowercase ("add", not "added"/"Adds"), no trailing period.
- Commit logical units — not one giant "save everything" commit. No `bruh`.

## Pull Requests

- All changes reach `main` through a **PR**.
- Before opening a PR: `npm run lint` passes and the app runs (native or web).
- PR description says **what** changed and **why**; link the relevant milestone in `PROJECT_PLAN.md`.
- **Get a review** from the other person before merging when practical. Self-merge only for trivial
  changes (docs, typos) or when the other is unavailable.
- **Merge style: merge commit** (repo default). Do not squash or rebase-merge unless we agree per-PR.
- Delete the branch after merge.

## What must NOT be committed

`.gitignore` now covers these, but double-check `git status` before staging:

- **`node_modules/`** — never commit dependencies. (This happened on the `auth` branch; clean it up
  before merging — see `PROJECT_PLAN.md` M1.)
- **Secrets** — Supabase URL/keys, `.env*` files, signing certs (`*.p8`, `*.p12`, `*.jks`, `*.key`,
  `*.mobileprovision`). Use env vars via `expo-constants`.
- Build output (`.expo/`, `dist/`, `web-build/`), logs, `.DS_Store`.
- Local Claude Code files (`CLAUDE.md`, `.claude/`) — these are gitignored on purpose.

**Prefer staging specific paths** (`git add app/ components/`) over `git add -A` / `git add .`, so
stray files don't sneak in.

## Keeping history clean

- Pull/rebase before pushing to avoid unnecessary merge noise on your own branch.
- If you commit something that shouldn't be tracked, remove it from tracking promptly
  (`git rm -r --cached <path>`) rather than letting it ride.
