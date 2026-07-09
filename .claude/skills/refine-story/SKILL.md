---
name: refine-story
description: Refine one Story before it's built — explore the code it touches, drain its open questions into sharpened acceptance criteria and the ADR, and leave a build brief the builder runs from.
disable-model-invocation: true
---

Just-in-time **refinement** of one Story right before it's built: read the code it touches, **drain** its `Open questions` to empty so the acceptance criteria become test-ready, and leave a **build brief** the builder runs from. It sits between [`prd-to-stories`](../prd-to-stories/SKILL.md) (which writes AC only at the altitude the PRD + ADR support, parking every undecided detail in `Open questions`) and [`implement-story`](../implement-story/SKILL.md).

Drain the *known* worklist — do **not** chase a zero-ambiguity spec. Ambiguity that only surfaces once code meets reality is resolved at build time, not here.

Grill conversationally: one question at a time, always recommend an answer, never advance until the user agrees, never use the AskUserQuestion tool. If a question can be answered by exploring the codebase, explore instead of asking.

## Input

Exactly one Story file (`docs/stories/<prd-slug>/NN-slug.story.md`). If which Story is meant is ambiguous, ask.

## Process

1. **Ground.** Read the Story, its PRD, every ADR it links, the [glossary](../../../CONTEXT.md) (`CONTEXT.md`), the [Definition of Done](../../../docs/DEFINITION-OF-DONE.md), and the code the Story touches. *Done when:* you can state the Story's behavior in the project's terms, the `REQ`s it satisfies, the mechanism its ADR provides, and the existing seams in the code it will plug into.

2. **Sweep.** Put on the tester's hat and pass the acceptance criteria under each [sweep lens](#sweep-lenses) once — the product edges and the code seams both — adding any important, answerable-now question the PRD never enumerated to `Open questions`. A bounded sweep for cheap-now/expensive-later gaps, not an attempt to enumerate everything. *Done when:* every lens has been weighed against this Story and each gap it surfaced is in `Open questions`.

3. **Drain.** Resolve `Open questions` one at a time, conversationally — recommend an answer, don't advance until the user explicitly agrees — and **route** each answer by [the routing rule](#routing). Edit in place, removing each item as it lands. *Done when:* `Open questions` is empty (or the section is gone).

4. **Brief.** Write the [build brief](#build-brief): the structural map, plus every by-hand pick Drain routed here. Setting `Status: Ready` is the last thing you do — it means both the AC are test-ready *and* the brief exists. *Done when:* the brief exists, no decision from Drain lives only in this conversation, and the Story is `Ready`.

## Routing

Each resolved answer goes to exactly one home, decided by the **bright line** ([PRD-ADR-BOUNDARY.md](../PRD-ADR-BOUNDARY.md)) applied one level down, to a slice:

- **Product-altitude** (user-observable: error wording, field limits, a behavioral choice) → fold **up into the acceptance criteria** as a test-ready Given/When/Then. State observable behavior, never the mechanism that realizes it — behavioral AC stay valid while the mechanism is decided in the ADR. ("This browser can now edit; a different browser cannot," never "a bearer token is stored in localStorage.")
- **Mechanism-altitude** (invisible: token transport, endpoint shape, table layout) → record in the **ADR** (create or update under `docs/adr/`, per [`FORMAT.md`](../../../docs/adr/FORMAT.md)); replace the open question with a reference to the ADR rather than copying mechanism into the Story.
- **Too small for an ADR** (a by-hand pick with no architectural weight: a URL slug, a field's order, where a component lives) → the **build brief** (step 4). It has no home in AC or ADR, so unwritten it is lost.
- **PRD-requirement gap** (not a slice detail — an undecided product *requirement*, a contradiction between REQs, or a missing flow branch) → **do not patch it into the Story.** Set the Story's `Status` to `Blocked`, fix it upstream via [`to-prd`](../to-prd/SKILL.md), and don't build it until resolved.

## Sweep lenses

The tester's-hat checklist for step 2. For each, ask "what does this Story leave undefined?" and park anything important in `Open questions`.

**Product edges** — what the user could notice:

- **Boundaries** — min/max, length limits, off-by-one, first/last.
- **Empty & null** — blank input, no results, missing optional data.
- **Duplicates & collisions** — the same value submitted twice, a race to the same unique name.
- **Concurrency & ordering** — two edits at once, out-of-order arrival, retries.
- **Permission** — who *can't* do this, and what they see when they try.
- **Error copy** — the exact wording and recovery path for each refusal.

**Code seams** — what only reading the codebase reveals; for each ask "does the code this needs even exist yet?":

- **Entry & navigation** — how each screen is reached: its route/URL, the link or control that leads there, the cancel/back path.
- **Existing seams** — what this plugs into that already exists: a page with no slot for the new control, an endpoint with no client.
- **Contract** — the endpoint shape and request/response schema (including each refusal's status code and the order validation runs in), and where they live in `packages/shared/src/api/`.
- **Schema & migration** — new columns or tables, the constraints they carry (uniqueness, case-folding), and the Drizzle migration that adds them.
- **Test surface** — which AC are unit and which e2e, the fixtures they need, whether the DB must be up.

## Build brief

The handoff to [`implement-story`](../implement-story/SKILL.md): the structural map — files to create or modify, each AC mapped to the test that covers it, pointers to the seams it plugs into — plus every by-hand pick from Drain too small for an ADR. A real file co-located with its Story:

`docs/stories/<prd-slug>/<story-slug>.build-brief.md`

- **Behavior lives in the AC, mechanism in the ADR; the brief is only the map.** It never restates an AC or an ADR decision, so if the brief is lost, AC + ADR remain the source of truth.
- **Gitignored** (`*.build-brief.md`) so it never commits, and **deleted when the Story reaches `Done`** (by `implement-story`) so it never dangles.
