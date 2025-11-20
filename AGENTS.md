# Repository Guidelines

## Project Structure & Module Organization
- App code lives under `app/` with Remix routes in `app/routes/`, shared UI in `app/components/`, data/services in `app/services/`, and utilities in `app/utils/`.
- Styling: Tailwind CSS entry at `app/styles/tailwind.css`; config in `tailwind.config.ts`.
- Database schema: `prisma/schema.prisma`; seeds in `prisma/seed.ts`.
- Tests: colocated under `tests/` (Vitest). Public assets and locale files are in `public/`.

## Build, Test, and Development Commands
- `npm run dev` — start Remix dev server (hot reloading).
- `npm run lint` — run ESLint with zero-warning policy.
- `npm run typecheck` — TypeScript type checking only.
- `npm run test` — run Vitest suite; `npm run coverage` for coverage.
- `npx prisma migrate reset --force --skip-seed` — drop/recreate DB during local resets; `npm run db:seed` to load demo data.

## Coding Style & Naming Conventions
- TypeScript/React throughout; prefer functional components and hooks.
- Tailwind for styling; avoid inline styles unless necessary.
- Follow ESLint/Prettier defaults (see `eslint.config.js`), with unused vars prefixed `_` when unavoidable.
- File naming: PascalCase for components, kebab-case for routes, snake_case for Prisma fields as defined.

## Testing Guidelines
- Framework: Vitest with `happy-dom` for React tests.
- Place tests under `tests/` and mirror feature names; use `*.test.ts`/`*.test.tsx`.
- Keep fast, deterministic tests; mock network/DB when possible.
- Aim to cover workflow execution logic and UI behavior for builder/dashboards.

## Commit & Pull Request Guidelines
- Write clear, descriptive commit messages (present tense, e.g., “Add navbar layout”).
- PRs should describe scope, include screenshots for UI changes, and note testing performed (`npm run lint`, `npm run test`).
- Link to relevant issues/tasks when applicable.

## Security & Configuration Tips
- Set `FLOWFORGE_DEMO_MODE=false` and `DATABASE_URL` to use a real Postgres instance; otherwise demo data is in-memory.
- Sensitive env vars belong in `.env` (ignored by git). Do not commit generated `public/build/` artifacts.

## Allowed without prompt:
- read files, list files
- tsc single file, prettier, eslint,
- vitest single test

## Ask first: 
- package installs,
- git push
- deleting files, chmod
- running full build or end to end suites

### When stuck
- ask a clarifying question, propose a short plan, or open a draft PR with notes
- do not push large speculative changes without confirmation

### Test first mode
- when adding new features: write or update unit tests first, then code to green
- prefer component tests for UI state changes
- for regressions: add a failing test that reproduces the bug, then fix to green