# Definition of Done

The global, repo-wide checklist that applies to **every Story**. It is stable and
rarely changes — per-Story specifics live in that Story's Acceptance Criteria, not
here. Stories **reference** this file; they never copy it.

A Story is *done* only when **all** of the following hold:

- **Acceptance criteria met.** Every Acceptance Criterion on the Story has a
  corresponding automated test, and all of them pass.
- **Tests green.** `bun test:unit` passes. `bun test:e2e` passes (with `bun db:up`)
  whenever the Story touches an API or DB path.
- **Lint & format clean.** `bun check` reports no problems.
- **Types clean.** `bun typecheck` passes across all packages.
- **Migrations apply cleanly.** If the schema changed, a Drizzle migration is
  generated and applies on a fresh database (`bun db:reset`).
- **Contract integrity.** If the API changed, the `HttpApi` spec in
  `packages/shared/src/api/` is updated, and both the backend implementation and
  the frontend derived client compile against it.
- **Conventions respected.** The change obeys `RULES.md` / `CLAUDE.md` for the area
  touched (typed domain errors, Effect runtime confined to the API client and
  query functions on the frontend, no raw `pg`, etc.).
- **Docs in sync.** If behavior or mechanism changed, the PRD requirements and the
  relevant ADR cross-references are still accurate.

Deliberately **not** here: git/PR mechanics (commits are managed by hand), and
anything feature-specific (that belongs in a Story's Acceptance Criteria).
