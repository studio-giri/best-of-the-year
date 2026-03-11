# Code style & rules

See `RULES.md` for the repository coding standards and style rules.

# Project structure

Bun monorepo managed with Turborepo.

```text
best-of-the-year/
├── apps/
│   ├── backend/      # Bun + Effect HTTP server (@effect/platform-bun) + Drizzle ORM (PostgreSQL)
│   └── frontend/     # React 19 + TanStack Start (SSR) + TanStack Query + Vite + Tailwind v4
└── packages/
    └── shared/       # @boty/shared — shared Effect schemas and types
```

Both apps depend on `@boty/shared` via `workspace:*`.

Frontend path alias: `#/*` → `./src/*` (use for all internal imports in the frontend).

# Effect

The backend uses [Effect](https://effect.website/) (v3.19.19). Write idiomatic Effect code:
- Model domain errors as typed failures (`Effect.fail`, tagged errors)
- Use `Effect.gen` for sequencing
- Prefer Effect's built-in utilities over manual async/promise patterns
- Use `Layer` for dependency injection and service composition

The frontend uses **Effect Schema only** (via shared types from `@boty/shared`) for decoding API responses. Do not introduce Effect runtime primitives (`Effect.gen`, `Layer`, etc.) in the frontend.

# Database

The backend uses two complementary libraries:
- **Drizzle ORM** — schema definition (`src/db/schema.ts`) and migrations (`drizzle-kit`)
- **`@effect/sql-pg`** — Effect-integrated PostgreSQL client; connection and query execution are managed as Effect `Layer`s

Do not use raw `pg` or promise-based queries directly. All DB access must go through the `@effect/sql-pg` client wrapped in Effect.

# Commands

Run from the repo root unless noted.

```bash
# Lint / format (Biome)
bun check          # check all packages
bun fix            # check + auto-fix

# Type-check (all packages via Turbo)
bun typecheck

# Dev servers
bun dev            # starts all apps in parallel

# Database (Docker)
bun db:up                    # start PostgreSQL
bun db:down                  # stop PostgreSQL
bun db:logs                  # tail DB logs

# Database (schema & data)
bun db:migration:generate    # generate a new Drizzle migration
bun db:migration:run         # apply pending migrations
bun db:seed                  # seed the database
bun db:reset                 # reset the database (asks for confirmation)

# Testing (frontend only, vitest)
bun test                     # run from apps/frontend or use --filter frontend
```
