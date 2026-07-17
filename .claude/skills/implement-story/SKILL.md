---
name: implement-story
description: Build one refined Story from its build brief with TDD — check the brief hasn't drifted from the code, then go red-green AC by AC until the Definition of Done holds.
disable-model-invocation: true
---

Build one **Ready** Story with TDD — the last step of the pipeline, after [`refine-story`](../refine-story/SKILL.md), which leaves the [**build brief**](../refine-story/SKILL.md#build-brief) this skill runs from. The brief predates the build, so it may have **drifted** from the code; confirm it still fits before trusting it, then build test-first.

Whenever anything feels off — drift you can't cheaply patch, a brief that no longer fits, a decision you're unsure of, a surprise the story never anticipated — **stop and ask the user** rather than guess or push through. Cheap to ask, expensive to build the wrong thing. Don't use AskUserQuestion tool.

## Input

Exactly one Story at `Status: Ready` with a **build brief**. No brief, or `Status: Needs refinement` → run [`refine-story`](../refine-story/SKILL.md) first; `Blocked` → stop. If which Story is meant is ambiguous, ask.

## Process

1. **Check for drift.** Before trusting the brief, smoke-test its seam map against the current code: do the files, endpoints, and helpers it names still exist with the shapes it assumes? On drift, re-ground the affected slice and correct the brief. A cheap check, not a re-exploration. *Done when:* every seam the brief names is confirmed present or corrected.

2. **Build.** Set `Status: In progress`, then build test-first from the brief, the Story, and its ADR(s): each acceptance criterion becomes a failing test (**red**), then the code that turns it **green**, AC by AC, until the whole [Definition of Done](../../../docs/DEFINITION-OF-DONE.md) holds. Never reference AC identifiers (`AC1`, …) in test names, comments, or source — describe the behavior, not the story's numbering. Route what you resolve mid-build as [`refine-story`](../refine-story/SKILL.md#routing) does — a product answer sharpens the AC, a mechanism call is yours to make and note in the ADR (per [`docs/adr/FORMAT.md`](../../../docs/adr/FORMAT.md)). *Done when:* every AC is green and every DoD gate passes — set `Status: Done` and delete the build brief.
