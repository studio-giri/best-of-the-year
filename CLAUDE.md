# Code style & rules

Are under `RULES.md`

# Project structure

Bun monorepo managed with Turborepo.

```
best-of-the-year/
├── apps/
│   ├── backend/      # Bun + Effect HTTP server (@effect/platform-bun)
│   └── frontend/     # React 19 + TanStack Router/Query + Vite + Tailwind v4
└── packages/
    └── shared/       # @boty/shared — shared Effect schemas and types
```

Both apps depend on `@boty/shared` via `workspace:*`.

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
bun db:up          # start PostgreSQL
bun db:down        # stop PostgreSQL
bun db:logs        # tail DB logs
```
