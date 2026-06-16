# Best Of The Year — Frontend

React 19 + TanStack Start (SSR) + TanStack Query + Vite + Tailwind v4.

Consumes the typed API contract from `@boty/shared` via a derived `HttpApiClient`
(`src/lib/api/client.ts`). Internal imports use the `#/*` alias.

## Commands

Run from the repo root (see the root `README.md` and `CLAUDE.md` for the full list):

```bash
bun dev          # start all apps (frontend on :3001)
bun typecheck
bun test:unit    # vitest (jsdom)
```

Within this package:

```bash
bun run build    # production build
bun run preview  # preview the production build
```
