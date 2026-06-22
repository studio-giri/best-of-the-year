---
name: to-prd
description: Turn the current conversation into a PRD — no interview, just synthesis of what you've already discussed.
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a PRD. Do NOT interview the user — just synthesize what you already know.

A PRD owns **product intent only** — what must be built and why, from the user's perspective. The bright-line test ([PRD-ADR-BOUNDARY.md](../PRD-ADR-BOUNDARY.md)): if a user could notice it, the PRD owns it — including decisions that feel technical but are behavioral ("no email verification," "stays editable on this browser indefinitely," "recovery links are single-use"). It never justifies architecture or test strategy; those are technical judgment that live in ADRs (`docs/adr/`) and the implementation, referenced from here but never restated or justified.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's [glossary](../../../CONTEXT.md) (`CONTEXT.md`) vocabulary throughout the PRD, and respect any ADRs in the area you're touching.

2. Write the PRD using the template below into the folder `docs/prd/` (example: `docs/prd/001-ranking-ownership-without-sign-up.prd.md`)

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## Constraints & Clarifications

Product-side constraints and clarifications the developer gave that shape the solution but aren't captured by the user stories — e.g. hard rules ("one ranking per email"), environmental requirements ("must work on mobile web, JS may be slow"), or boundaries that define scope.

State the constraint, never its technical realization. "One ranking per person" is a product constraint and belongs here; the schema, API contract, token mechanism, or module structure that *enforces* it is architecture — record that in the ADR and reference it from here. No schema, no API contracts, no file paths, no code.

## Requirements

The exhaustive, observable definition of the feature — the sharp, testable end of the Solution and Constraints. Every product-level condition that must hold for the feature to be "done" lives here as a numbered, stably-referenceable requirement (`REQ-1`, `REQ-2`, …). This section carries the feature's *full* behavioral coverage: if a user could notice it, it appears here. State each requirement as an observable behavior — an outcome a user or stakeholder could observe — never as a technical realization, and never in system-voice ("the system shall…").

This list should be extremely extensive and cover all aspects of the feature. A short Requirements list means the feature is under-specified — keep going until every observable behavior, edge, and boundary is pinned down. Group requirements by capability or flow when the list grows long.

These requirements are the source the `prd-to-stories` skill decomposes into Stories: each Story traces back to the requirements it satisfies, and every requirement must be covered by at least one Story. So number them stably and never reuse a number.

<requirements-example>
- REQ-1: A returning visitor who lost their local session can regain edit access to their own ranking — and only their own.
- REQ-2: Trying to create a second ranking with an already-used email is refused, with a clear path back to the existing one.
</requirements-example>

## Out of Scope

A description of the things that are out of scope for this PRD.

Add any item that's *deferred* (intended for later, not deliberately excluded forever) to `docs/ROADMAP.md` too, so it isn't forgotten.

## Further Notes

Any further notes about the feature.

</prd-template>
