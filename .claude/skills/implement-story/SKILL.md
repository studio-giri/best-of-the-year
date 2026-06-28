---
name: implement-story
description: Build one refined Story with TDD — resolve every code-grounded question before writing a line, then run the build in a fresh context behind a firewall so it stays efficient.
disable-model-invocation: true
---

Build one **Ready** Story with TDD — the last step of the pipeline, after [`refine-story`](../refine-story/SKILL.md). Two phases either side of a **firewall**: **Resolve** every question the codebase raises, then **Build** test-first in a fresh context.

The firewall exists because the two phases pull opposite ways on context. Resolving questions reads the spec, the code, and a conversation with the user — it *bloats* the window, and that's fine because it is disposable. Building wants a *lean* window (an agent works best well under 100k tokens). So only distilled artifacts cross the firewall — the refined Story, its ADR, and a **build brief** ([below](#build-brief)) — never this session's transcript. Each phase pushes its heavy reading into a subagent, so the orchestrating session itself stays lean.

## Input

Exactly one Story file at `Status: Ready`. `Needs refinement` → run [`refine-story`](../refine-story/SKILL.md) first; `Blocked` → stop. If which Story is meant is ambiguous, ask.

## Process

1. **Scout.** Send a read-only subagent to ground against reality: it reads the Story, its PRD, every linked ADR, the [glossary](../../../CONTEXT.md) (`CONTEXT.md`), the [Definition of Done](../../../docs/DEFINITION-OF-DONE.md), and the code the Story touches, passes the Story under each [sweep lens](#sweep-lenses), and returns two things — a **question list** (each item tagged product or mechanism by the [bright line](../PRD-ADR-BOUNDARY.md)) and a first draft of the [**build brief**](#build-brief) (files to create or modify, each AC mapped to the test that will cover it, and pointers to the existing seams it plugs into). The orchestrator keeps only this distilled return — the front face of the firewall. *Done when:* you hold the question list and the draft build brief, and have not read the codebase into this session yourself.

2. **Resolve.** Present the whole question list, then work it to empty conversationally — one at a time, recommend an answer, don't advance until the user agrees, never the AskUserQuestion tool. Route each answer as `refine-story` does ([its routing](../refine-story/SKILL.md#routing)) — product → sharpen the **acceptance criteria**, ADR-worthy mechanism → the **ADR** (per [`docs/adr/FORMAT.md`](../../../docs/adr/FORMAT.md)), a PRD-requirement gap → `Status: Blocked` and fix upstream via [`to-prd`](../to-prd/SKILL.md) — plus one destination that exists only here: **a pick too small for an ADR but that you made by hand (the chosen URL, a field's order, where a component lives) → write into the [build brief](#build-brief).** Only what lands in the brief crosses the firewall; a decision left in this conversation is lost. Every *known* question dies here, before any code. *Done when:* the question list and `Open questions` are both empty, the AC are test-ready, and every by-hand pick is captured in the build brief.

3. **Build.** Cross the firewall: set `Status: In progress` and dispatch a fresh build subagent seeded with only the refined Story, its ADR(s), and the resolved [build brief](#build-brief) inlined in its prompt — never this session's transcript. It builds test-first: each acceptance criterion becomes a failing test (**red**), then the code that turns it **green**, AC by AC, until the whole [Definition of Done](../../../docs/DEFINITION-OF-DONE.md) holds. *Done when:* the subagent reports every AC green and every DoD gate passing — set `Status: Done` and delete the build brief — or it returns blocked (step 4).

4. **Unblock.** A subagent can't ask you. So if a *product* ambiguity surfaces mid-build, the build agent stops and **returns** it — never guesses — with its work so far already written to disk. Surface it to the user, fold the answer up into the AC, then re-dispatch a fresh build subagent that resumes from the working tree. A *mechanism* ambiguity never blocks: the build agent decides it and notes it in the ADR (per [`docs/adr/FORMAT.md`](../../../docs/adr/FORMAT.md), which sits beside the ADRs it edits). *Done when:* no product blocker remains and step 3's criterion is met.

## Sweep lenses

The scout's checklist for step 1 — the code-grounded counterpart to `refine-story`'s product edges. These catch what only reading the codebase reveals: gaps between what the Story assumes and what the code actually provides. For each, ask "what does this Story leave undefined, and does the code it needs even exist yet?":

- **Entry & navigation** — how each screen is reached: its route/URL, the link or control that leads there, the cancel/back path. *(A claim flow with no link from the homepage and no route is unreachable — surface it here.)*
- **Existing seams** — what this plugs into that already exists, and whether it exists yet: a page with no slot for the new control, an endpoint with no client.
- **Contract** — the endpoint shape and the request/response schema, and where they live in `packages/shared/src/api/`.
- **Schema & migration** — new columns or tables, the constraints they carry (uniqueness, case-folding), and the Drizzle migration that adds them.
- **Error & state surface** — the exact wording and status code behind each refusal AC, and the order validation runs in.
- **Test surface** — which AC are unit and which e2e, the fixtures they need, whether the DB must be up.

## Build brief

The handoff that crosses the firewall to the builder: the scout's structural map (files to create or modify, each AC mapped to its test, pointers to existing seams) plus every sub-ADR pick made during Resolve. A real file, co-located with its Story:

`docs/stories/<prd-slug>/<story-slug>.build-brief.md`

- **Living, not frozen.** The scout drafts it (step 1); Resolve writes each by-hand pick into it (step 2); the builder reads a snapshot inlined at dispatch (step 3). Only what is written here crosses — a decision left in the conversation is lost.
- **Durable across reboots, by design.** It lives in the repo working tree (not `/tmp`), so a kill-and-`/resume` — even across an overnight reboot — finds it intact and the run just continues. Re-scout only if you edited code since.
- **Self-cleaning.** Gitignored (`*.build-brief.md`) so it can never be committed; **deleted when the Story reaches `Done`**, so it never dangles. A fresh run on a Story whose brief still exists (a prior run abandoned before `Done`) **regenerates** it rather than trusting it.
