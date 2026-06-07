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
    └── shared/       # @boty/shared — shared Effect schemas, types, and HttpApi specs (src/api/)
```

Both apps depend on `@boty/shared` via `workspace:*`.

Frontend path alias: `#/*` → `./src/*` (use for all internal imports in the frontend).

# Effect

The backend uses [Effect](https://effect.website/) (v4 beta). Write idiomatic Effect code:
- Model domain errors as typed failures (`Effect.fail`, tagged errors)
- Use `Effect.gen` for sequencing
- Prefer Effect's built-in utilities over manual async/promise patterns
- Use `Layer` for dependency injection and service composition

API specs (`HttpApi` groups) live in `packages/shared/src/api/` so both sides share one contract: the backend implements them (`HttpApiBuilder.group` in `apps/backend/src/<group>/handlers.ts`), the frontend derives a typed client from them (`HttpApiClient` in `apps/frontend/src/lib/api/client.ts`).

The frontend calls the API exclusively through that derived client. Effect runtime usage (`Effect.runPromise`, `Effect.provide`) is confined to `lib/api/client.ts` and inside TanStack Query `queryFn`s — components and hooks expose plain Promises/data via TanStack Query. Do not introduce broader Effect runtime patterns (`Effect.gen`, `Layer` composition, services) in the frontend.

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
bun db:truncate              # truncate all tables (asks for confirmation)
bun db:drop                  # drop everything — tables, enums, migration journal (asks for confirmation)
bun db:reset                 # db:drop + db:migration:run

# Testing (via Turbo)
bun test:unit                # unit tests, all packages (backend: bun test, frontend: vitest)
bun test:e2e                 # backend e2e tests (requires the DB: bun db:up)
```

# Testing

- **Backend** uses Bun's built-in test runner: unit tests are colocated in `src/` (`bun test src`), e2e tests live in `tests/` (`bun test tests`) and hit a real PostgreSQL — start it first with `bun db:up`.
- **Frontend** uses vitest (`vitest.config.ts`, jsdom): unit tests are colocated in `src/` as `*.test.tsx?`.
- Inside a package, run tests with `bun run test:unit` — NOT plain `bun test`, which invokes Bun's own test runner regardless of package scripts (wrong runner for the frontend).
