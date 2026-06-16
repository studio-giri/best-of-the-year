# Best Of The Year — Backend

Bun + Effect HTTP server (`@effect/platform-bun`) implementing the HttpApi
contract from `@boty/shared`. PostgreSQL via Drizzle ORM (schema/migrations) and
`@effect/sql-pg` (Effect-integrated query execution).

## Commands

Run from the repo root (see the root `README.md` and `CLAUDE.md` for the full list):

```bash
bun db:up        # start PostgreSQL (Docker)
bun dev          # start all apps
bun typecheck
bun test:unit    # bun test src
bun test:e2e     # bun test tests (needs the DB)
```
