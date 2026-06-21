# Story format

The template for one Story file, written by [`prd-to-stories`](./SKILL.md) into `docs/stories/<prd-slug>/NN-slug.story.md`. One Story = one **vertical slice**.

```markdown
# <Title — the one demoable sentence that defines the slice>

**ID:** S-<prd>-<NN>
**Status:** Needs refinement

## Story

As a <actor>, I want <capability>, so that <benefit>.

## Acceptance Criteria

Given/When/Then, each concrete enough to become a failing test as written — a specific trigger and a specific observable outcome. State **observable behavior, never the mechanism** that realizes it — the PRD/ADR bright line applied to the slice. The mechanism lives in the ADR; behavioral phrasing also keeps the AC valid while that mechanism is still undecided or later changes.

- **Given** <context>, **when** <action>, **then** <observable outcome>.
- **Given** <context>, **when** <action>, **then** <observable outcome>.

## Out of scope for this Story

<One line naming what this slice deliberately does not cover, to stop it swallowing a neighbor.>

## Depends on

<Story IDs this slice requires, or `None` for a root. This graph — not the file numbering — is the build-order truth: a team picks any Story whose dependencies are all done.>

## Satisfies

<The PRD requirements this Story advances, e.g. `REQ-2`, `REQ-7`. Powers the coverage check: every REQ must appear in at least one Story.>

## Open questions

<Non-trivial, slice-level details the PRD left undecided, resolved just-in-time before this Story is built. While a blocking question is unresolved, the Story is NOT implementation-ready — no concrete outcome to test against. Omit the section if none.>

## References

- PRD: <../../prd/NNNN-slug.prd.md> — the what & why
- ADR: <../../adr/NNNN-slug.md> — the mechanism (if any)

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
```

## Status

The Story's position in the pipeline, updated in place as it moves:

- **Needs refinement** — sliced, `Open questions` still open; awaiting `refine-story`. (Set at birth by `prd-to-stories`.)
- **Ready** — `Open questions` drained to empty; implementation-ready. (Set by `refine-story`.)
- **In progress** — being built.
- **Done** — meets the Definition of Done.
- **Blocked** — a PRD-requirement gap was surfaced and escalated to `to-prd`; frozen until resolved. (Set by `refine-story`.)

## Stable IDs

`NN` is assigned once at birth and **never renumbered** — later insertions get new numbers rather than shifting existing ones, so `NN` may drift out of strict sequence. `Depends on` is the order truth; the numbering is only a convenience for the linear case. `Depends on` and `Satisfies` reference IDs and `REQ` numbers, never titles.
