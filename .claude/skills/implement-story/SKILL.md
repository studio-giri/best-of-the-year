---
name: implement-story
description: Build one refined Story with TDD — resolve every code-grounded question before writing a line, then run the build in a fresh context behind a firewall so it stays efficient.
disable-model-invocation: true
---

Build one **Ready** Story with TDD — the last step of the pipeline, after [`refine-story`](../refine-story/SKILL.md). Two phases either side of a **firewall**: **Resolve** every question the codebase raises, then **Build** test-first in a fresh context.

The firewall exists because the two phases pull opposite ways on context. Resolving questions reads the spec, the code, and a conversation with the user — it *bloats* the window, and that's fine because it is disposable. Building wants a *lean* window (an agent works best well under 100k tokens). So only distilled artifacts cross the firewall — the refined Story, its ADR, and a **file map** — never this session's transcript. Each phase pushes its heavy reading into a subagent, so the orchestrating session itself stays lean.

## Input

Exactly one Story file at `Status: Ready`. `Needs refinement` → run [`refine-story`](../refine-story/SKILL.md) first; `Blocked` → stop. If which Story is meant is ambiguous, ask.

## Process

1. **Scout.** Send a read-only subagent to ground against reality: it reads the Story, its PRD, every linked ADR, the [glossary](../../../CONTEXT.md) (`CONTEXT.md`), the [Definition of Done](../../../docs/DEFINITION-OF-DONE.md), and the code the Story touches, passes the Story under each [sweep lens](#sweep-lenses), and returns two things — a **question list** (each item tagged product or mechanism by the [bright line](../PRD-ADR-BOUNDARY.md)) and a **file map** (files to create or modify, each AC mapped to the test that will cover it, and pointers to the existing seams it plugs into). The orchestrator keeps only this distilled return — the front face of the firewall. *Done when:* you hold the question list and the file map, and have not read the codebase into this session yourself.

2. **Resolve.** Present the whole question list, then work it to empty conversationally — one at a time, recommend an answer, don't advance until the user agrees, never the AskUserQuestion tool. Route each answer by the same rule as `refine-story` ([its routing](../refine-story/SKILL.md#routing)): product → sharpen the **acceptance criteria**, mechanism → the **ADR** (per [`docs/adr/FORMAT.md`](../../../docs/adr/FORMAT.md)), a PRD-requirement gap → `Status: Blocked` and fix upstream via [`to-prd`](../to-prd/SKILL.md). Every *known* question dies here, before any code. *Done when:* the question list and `Open questions` are both empty and the AC are test-ready.

3. **Build.** Cross the firewall: set `Status: In progress` and dispatch a fresh build subagent seeded with only the refined Story, its ADR(s), and the file map inlined in its prompt — never this session's transcript. It builds test-first: each acceptance criterion becomes a failing test (**red**), then the code that turns it **green**, AC by AC, until the whole [Definition of Done](../../../docs/DEFINITION-OF-DONE.md) holds. *Done when:* the subagent reports every AC green and every DoD gate passing — set `Status: Done` — or it returns blocked (step 4).

4. **Unblock.** A subagent can't ask you. So if a *product* ambiguity surfaces mid-build, the build agent stops and **returns** it — never guesses — with its work so far already written to disk. Surface it to the user, fold the answer up into the AC, then re-dispatch a fresh build subagent that resumes from the working tree. A *mechanism* ambiguity never blocks: the build agent decides it and notes it in the ADR (per [`docs/adr/FORMAT.md`](../../../docs/adr/FORMAT.md), which sits beside the ADRs it edits). *Done when:* no product blocker remains and step 3's criterion is met.

## Sweep lenses

The scout's checklist for step 1 — the code-grounded counterpart to `refine-story`'s product edges. These catch what only reading the codebase reveals: gaps between what the Story assumes and what the code actually provides. For each, ask "what does this Story leave undefined, and does the code it needs even exist yet?":

- **Entry & navigation** — how each screen is reached: its route/URL, the link or control that leads there, the cancel/back path. *(A claim flow with no link from the homepage and no route is unreachable — surface it here.)*
- **Existing seams** — what this plugs into that already exists, and whether it exists yet: a page with no slot for the new control, an endpoint with no client.
- **Contract** — the endpoint shape and the request/response schema, and where they live in `packages/shared/src/api/`.
- **Schema & migration** — new columns or tables, the constraints they carry (uniqueness, case-folding), and the Drizzle migration that adds them.
- **Error & state surface** — the exact wording and status code behind each refusal AC, and the order validation runs in.
- **Test surface** — which AC are unit and which e2e, the fixtures they need, whether the DB must be up.
