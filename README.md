# Best Of The Year

Bun monorepo (Turborepo): `apps/backend` (Effect + Drizzle), `apps/frontend` (React + TanStack Start), `packages/shared` (shared schemas & API specs).

## Setup

```bash
bun install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
bun db:up                  # start PostgreSQL (Docker)
bun db:migration:run       # apply migrations
bun db:seed                # seed data
```

## Dev

```bash
bun dev                    # all apps in parallel
```

## Checks

```bash
bun check                  # lint/format (Biome)
bun fix                    # lint/format + auto-fix
bun typecheck              # type-check all packages
bun test:unit              # unit tests
bun test:e2e               # e2e tests
```

## Database

```bash
bun db:up                  # start PostgreSQL
bun db:down                # stop
bun db:logs                # tail logs
bun db:migration:generate  # generate Drizzle migration
bun db:migration:run       # apply migrations
bun db:seed                # seed
bun db:truncate            # truncate all tables (asks confirmation)
```
