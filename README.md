# Best Of The Year

Bun monorepo (Turborepo): `apps/backend` (Effect + Drizzle), `apps/frontend` (React + TanStack Start), `packages/shared` (shared schemas & API specs), `packages/emails` (react-email templates).

## Setup

```bash
bun install
cp .env.example .env       # root: read by docker compose (POSTGRES_*)
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

The DB container does not auto-start (`restart: "no"`): after a reboot or a `bun db:down`, run `bun db:up` before `bun dev`.

## Email

`bun db:up` also starts [Mailpit](https://mailpit.axllent.org/), the local SMTP sink the backend sends through in development. No mail leaves the machine — open the captured messages at http://localhost:8025.

Email templates ([react-email](https://react.email/)) live in `packages/emails`. Preview them with live reload:

```bash
bun run --cwd packages/emails dev   # preview server at http://localhost:3006
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
bun db:up                  # start PostgreSQL (detached, waits until healthy)
bun db:down                # stop
bun db:logs                # tail logs
bun db:migration:generate  # generate Drizzle migration
bun db:migration:run       # apply migrations
bun db:seed                # seed
bun db:truncate            # truncate all tables (asks confirmation)
```
