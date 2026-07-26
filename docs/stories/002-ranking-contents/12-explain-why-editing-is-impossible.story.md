# Explain why editing is impossible without losing the pass

**ID:** S-002-12
**Status:** Needs refinement

## Story

As someone whose editor cannot reach their list any more, I want to be told plainly why — it is gone, or this browser can no longer edit it — so that I understand what happened instead of watching a commit fail for no stated reason.

## Acceptance Criteria

- **Given** the editor open on a ranking that no longer exists, **when** I commit or the editor reads the list, **then** I am told plainly that the list is gone.
- **Given** a browser whose edit access is no longer valid for this ranking, **when** I commit or the editor reads the list, **then** I am told this browser can no longer edit the list, and I am pointed at recovery.
- **Given** either refusal, **when** it appears, **then** I am not navigated away — the editor and every year I typed are still on screen.
- **Given** either refusal, **when** it appears, **then** the edit access this browser holds is not discarded, so a list that *is* still editable stays editable.
- **Given** the two refusals, **when** the list is simply gone, **then** I am not told my access is invalid, and when my access is invalid I am not told the list is gone — each says what actually happened.
- **Given** I am told my access is no longer valid, **when** I follow the recovery path offered, **then** I reach the recovery-request flow.

## Out of scope for this Story

Refusing a browser that never had edit access at all — the route guard from S-001-01 already covers that before the editor renders. This slice is about access or existence failing *while* a pass is underway.

## Depends on

S-002-01 — these are the refusals of that Story's read and commit.

## Satisfies

REQ-41, REQ-42, REQ-43

## Open questions

- Neither state can currently arise on its own: deleting a ranking and revoking edit access are both out of scope or on the roadmap, so these refusals are reachable only from a cleared or tampered browser, or a direct database deletion. Confirm this is worth building now as hardening rather than deferring until archiving exists.
- When the list is gone, is there anything to offer the person beyond the message — claiming a new list, say — or is the message the whole of it?

## References

- PRD: [../../prd/002-ranking-contents.prd.md](../../prd/002-ranking-contents.prd.md) — the what & why
- ADR: [../../adr/003-whole-list-item-writes.md](../../adr/003-whole-list-item-writes.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
