---
name: refine-story
description: Just-in-time refinement of one Story before it's built — drains its open questions to empty, routing each answer to the acceptance criteria or the ADR, until the Story is ready for TDD.
disable-model-invocation: true
---

Just-in-time **refinement** of one Story right before it's built: **drain** the Story's `Open questions` to empty so its acceptance criteria become test-ready and the Story is ready for TDD. It sits between [`prd-to-stories`](../prd-to-stories/SKILL.md) (which writes AC only at the altitude the PRD + ADR support, and parks every undecided detail in `Open questions`) and implementation.

Drain the *known* worklist — do **not** chase a zero-ambiguity spec. Ambiguity that only surfaces once code meets reality is resolved at build time, not here.

Grill conversationally: one question at a time, always recommend an answer, never advance until the user agrees, never use the AskUserQuestion tool. If a question can be answered by exploring the codebase, explore instead of asking.

## Input

Exactly one Story file (`docs/stories/<prd-slug>/NN-slug.story.md`). If which Story is meant is ambiguous, ask.

## Process

1. **Ground.** Read the Story, its PRD, every ADR it links, the [glossary](../../../CONTEXT.md) (`CONTEXT.md`), and the code it touches. *Done when:* you can state the Story's behavior in the project's terms, the `REQ`s it satisfies, and the mechanism its ADR provides.

2. **Edge sweep.** Before draining, put on the tester's hat and pass the Story's acceptance criteria under each [edge lens](#edge-lenses) once, adding any important, answerable-now question the PRD never enumerated to `Open questions`. A bounded sweep for cheap-now/expensive-later cases — not an attempt to enumerate everything. *Done when:* every lens has been weighed against this Story and each gap it surfaced is in `Open questions`.

3. **Drain.** Resolve `Open questions` one at a time, conversationally — recommend an answer, don't advance until the user explicitly agrees to advance — and **route** each answer by [the routing rule](#routing). Edit in place: a product answer sharpens the existing acceptance criteria, a mechanism answer updates the ADR, and each resolved item is removed from `Open questions` as it lands. *Done when:* `Open questions` is empty (or the section is gone) and the Story's `Status` is set to `Ready` — implementation-ready.

## Routing

Each resolved answer goes to exactly one home, decided by the **bright line** ([PRD-ADR-BOUNDARY.md](../PRD-ADR-BOUNDARY.md)) applied one level down, to a slice:

- **Product-altitude** (user-observable: error wording, field limits, a behavioral choice) → fold **up into the acceptance criteria** as a test-ready Given/When/Then. State observable behavior, never the mechanism that realizes it — behavioral AC stay valid while the mechanism is decided in the ADR. ("This browser can now edit; a different browser cannot," never "a bearer token is stored in localStorage.")
- **Mechanism-altitude** (invisible: token transport, endpoint shape, table layout) → record in the **ADR** (create or update under `docs/adr/`, per [`FORMAT.md`](../../../docs/adr/FORMAT.md)); replace the open question with a reference to the ADR rather than copying mechanism into the Story.
- **PRD-requirement gap** (not a slice detail — an undecided product *requirement*, a contradiction between REQs, or a missing flow branch) → **do not patch it into the Story.** Set the Story's `Status` to `Blocked`, fix it upstream via [`to-prd`](../to-prd/SKILL.md), and don't build it until resolved.

## Edge lenses

The tester's-hat checklist for step 2. For each, ask "what does this Story leave undefined?" and park anything important in `Open questions`:

- **Boundaries** — min/max, length limits, off-by-one, first/last.
- **Empty & null** — blank input, no results, missing optional data.
- **Duplicates & collisions** — the same value submitted twice, a race to the same unique name.
- **Concurrency & ordering** — two edits at once, out-of-order arrival, retries.
- **Permission** — who *can't* do this, and what they see when they try.
- **Error copy** — the exact wording and recovery path for each refusal.
