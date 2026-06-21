# Product → delivery process

How a feature goes from idea to merged code. Five steps, each a skill except the last.

```
grill  →  to-prd  →  prd-to-stories  →  refine-story  →  implement (TDD)
```

Each Story carries a **Status** tracking its place in this pipeline — `Needs refinement → Ready → In progress → Done`, or `Blocked`. Values are defined in [`STORY-FORMAT.md`](../.claude/skills/prd-to-stories/STORY-FORMAT.md); the steps below note who sets each.

## 1. Grill (`grill-with-docs`)

Explore and frame the feature, challenging every decision one at a time. Product and technical concerns are discussed **together** — an infeasible product choice gets caught here, not after. Record by altitude as decisions land: terms → `CONTEXT.md` (glossary), pure mechanism → an ADR. *Mixed conversation, separated artifacts.*

## 2. PRD (`to-prd`)

Synthesize the discussion into a PRD (`docs/prd/`): problem, solution, constraints, and an exhaustive list of numbered, observable requirements (`REQ-N`). Behavior only — no mechanism.

## 3. Stories (`prd-to-stories`)

Slice the PRD into **vertical Stories** (`docs/stories/`) — the smallest end-to-end change that delivers one user-noticeable behavior and merges working. Each carries behavioral acceptance criteria, `Depends on`, `Satisfies` (REQ coverage), and parks undecided details in `Open questions`. AC are written only at the altitude the PRD + ADR support. Each new Story is born `Needs refinement`.

## 4. Refine (`refine-story`)

Just-in-time, one Story at a time: **drain** its `Open questions` to empty. An edge sweep first surfaces the cheap-now/expensive-later cases; then each answer is routed — product → acceptance criteria, mechanism → ADR, PRD gap → back to `to-prd`. Drains the *known* questions; it does not chase a zero-ambiguity spec. On drain-to-empty the Story flips to `Ready`; a PRD gap flips it to `Blocked`.

## 5. Implement (TDD) — *WIP*

> Not yet finalized: whether this step is a skill, and its specific rules (including the build-time ambiguity protocol below), are not written yet.

Acceptance criteria are the failing-test list. When a behavioral ambiguity surfaces mid-build, classify it by the bright line: mechanism → decide and note in the ADR; **product → stop and ask, never silently guess** — then fold the answer back into the AC/PRD. The Story moves to `In progress` while building and to `Done` once it meets the global [Definition of Done](./DEFINITION-OF-DONE.md).

## Principles

- **The bright line everywhere.** *If a user could notice it, product owns it (PRD/AC); otherwise it's mechanism (ADR).* Applied at grill, refine, and build. Full rule: [`PRD-ADR-BOUNDARY.md`](../.claude/skills/PRD-ADR-BOUNDARY.md).
- **Feedback flows upstream.** No spec is complete; ambiguity is discovered at every stage. Decisions made downstream return to the PRD/ADR/Story so the docs don't rot.
- **Refine then build, one Story at a time.** Don't batch-refine all Stories upfront — building each one teaches you how to refine the next. Reach for batch only to flush a blocking PRD gap early.

## Artifacts

| File | Owns |
|------|------|
| `CONTEXT.md` | Glossary / ubiquitous language |
| `docs/prd/*.prd.md` | Observable behavior + requirements (`REQ-N`) |
| `docs/adr/*.md` | Invisible mechanism + alternatives weighed |
| `docs/stories/**/*.story.md` | One vertical slice + test-ready AC |
| `docs/DEFINITION-OF-DONE.md` | The global done checklist |
