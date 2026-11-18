---
name: prd-to-stories
description: Slice a finished PRD into vertically-sliced, independently-buildable Stories — each with test-ready acceptance criteria, dependencies, and traceability back to the PRD requirements.
disable-model-invocation: true
---

Turn a finished PRD into the **Stories** that implement it, sliced one at a time. Run deliberately on one PRD; write no files until the user approves the slice plan.

## What a Story is

The unit of build-test-review-merge: the smallest **vertical slice** — through every layer it needs (UI → API → DB) — that delivers one user-noticeable behavior, is verifiable alone, and merges leaving the app working. The loop is solo-dev-plus-Claude today and may scale to a team, so each Story declares its dependencies, not just its order.

A slice passes **both** tests:

- **Top bound — one behavior, end-to-end.** One capability a user could notice, cut through every layer it needs. One demoable sentence per Story; a title joining two behaviors with "and" is two Stories.
- **Bottom bound — still coherent.** No thinner than "app works and the behavior is real." A piece needing a *later* Story to be usable (an endpoint with no UI) is a horizontal task — fold it into the Story it serves.

**Edges:** the happy path is one Story; an error/edge variation splits off only when independently demoable, else it folds into the parent's acceptance criteria. ("Refuse a claim when the email is taken, with a path back" → own Story. "Validation error on empty username" → folds in.)

## Process

1. **Read** the PRD, every ADR it links, the [glossary](../../../CONTEXT.md) (`CONTEXT.md`), and the codebase it touches — existing endpoints/tables make slices thinner; the ADR's mechanism shows the slice seams. *Done when:* you can state every `REQ-N` and the mechanism realizing it, in the project's terms.

2. **Slice.** Derive the user-facing behaviors and flows from the *whole* PRD + ADR, then cut them by the two bounds above. Requirements are a **coverage checklist distributed across Stories, never transcribed one-to-one** — one Story usually satisfies several REQs, and a cross-cutting REQ ("email never shown publicly") is satisfied by several Stories. Give each Story an ID (`S-<prd>-<NN>`), `Depends on` (Story IDs or `None`), and `Satisfies` (its REQs). Find the **root(s)** always; add a thin walking-skeleton root only when the feature introduces genuinely new end-to-end plumbing. Log gaps as slicing exposes them (see below). *Done when:* every Story has ID + `Depends on` + `Satisfies`, and every REQ is claimed by ≥1 Story.

3. **Audit** the draft against the [self-challenge](#self-challenge) — a fresh-eyes pass, distinct from slicing — revising wherever a check fails. *Done when:* every check is answered and every triggered revision applied.

4. **Checkpoint — stop for approval, write nothing.** Present conversationally — never via the AskUserQuestion tool: the ordered Story list (ID, title, `Depends on`, `Satisfies`); a line confirming every REQ is claimed; the **judgment calls** you made; and the gaps (below). A *blocking* gap must be resolved with the user before slicing past it.

5. **Write** one file per approved Story via [FORMAT.md](../../../docs/stories/FORMAT.md), into `docs/stories/<prd-slug>/NN-slug.story.md` (slug = PRD filename without `.prd.md`), each born at `Status: Needs refinement`. *Done when:* every approved Story is on disk and coverage still holds.

## Self-challenge

The independent audit of step 3 — re-examine the draft against each check, not the bounds you sliced by, and revise where one fails:

- **Coverage** — every `REQ` is claimed by ≥1 Story; no orphan.
- **Not transcribed** — one Story per one REQ is fine individually, but a *uniformly* one-Story-per-REQ plan with nothing cross-cutting or bundled means the REQ list was copied, not sliced. Re-examine (guideline, not a hard rule).
- **Bounds** — no "and"-joined title; no horizontal task undemoable alone; broken-out edges all independently demoable; each slice cuts every layer it needs.
- **INVEST**, teeth on **Valuable** (observable value, not plumbing) and **Testable** (you can write its acceptance criteria).
- **Test-ready AC** — each Given/When/Then concrete enough to become a failing test as written (implementation is TDD; vague = unbuildable), and stated as **observable behavior, not mechanism** (no token/storage/endpoint phrasing — that's the ADR's, and it leaves the AC valid while mechanism is undecided).
- **Dependencies** — no cycles; each Story buildable from only its declared `Depends on`; every root truly has no prerequisite; `NN` a valid topological order.

## Gaps & ambiguities

A PRD stops at feature altitude, so slicing hits details it never decided. Surface them in the checkpoint *(presented there, never a file)* — never silently invent; state any assumption explicitly ("sliced assuming usernames are immutable — confirm"). Each gap routes to a durable home once adjudicated:

- **Trivial detail** (field length, error copy) → the relevant Story's `Open questions`, resolved just-in-time before that Story is built. Unresolved blocking questions there mean the Story isn't implementation-ready.
- **Non-trivial gap** (undefined behavior with plausible answers, contradicting REQs, a missing flow branch — anything changing *how things slice*) → tag with what's undefined, the options, its **altitude** (PRD requirement / ADR mechanism / product decision), and **blocking vs non-blocking**. Blocking → halt and ask, don't write affected Stories. Non-blocking → carry into a Story's `Open questions`. A **PRD requirement gap** is fixed upstream via `to-prd`, not patched in a Story.
