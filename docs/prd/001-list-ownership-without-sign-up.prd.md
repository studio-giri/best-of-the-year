# List ownership without sign-up

> Architecture for how ownership and edit access are realized:
> [ADR 001 — Account-less edit access via client-side bearer Owner tokens](../adr/001-accountless-owner-tokens.md)
> Claude conversation: ab4cb6d3-b39d-4f28-9647-771d1969651b

## Problem Statement

People want to publish their "best game of each year" List and keep refining
it over time. But signing up — creating an account, choosing a password,
confirming an email — is friction that stops people before they start. At the
same time, a List is personal: only the person who made it should be able to
change it. So we need people to own and edit their own List without ever
asking them to register.

## Solution

Anyone can build a List immediately and, on saving, claim it with just their
email and a username — no account, no password, no confirmation step. Their
browser stays able to edit that List from then on, with nothing to remember.
If they switch browsers or lose access, they ask for an emailed link that
restores editing on the new browser. Each person has exactly one List, kept
scarce on purpose so it feels worth crafting.

This PRD covers only how a person comes to **own** a List and **hold edit
access** to it without signing up: claiming, durable per-browser editing, and
recovery on another browser. It does **not** cover the contents of a List —
adding, editing, reordering, or removing the games in it — which is a separate
concern (see Out of Scope).

## Constraints & Clarifications

- **One List per email.** An email address backs at most one List. Re-using an email never creates a second; it routes the person back to the one they have.
- **No registration, no password.** Claiming a List must never require account creation or a password. Lowest possible friction is the priority.
- **Email required, and asked upfront.** Email is mandatory to save, and is presented at the start of creation (not sprung at the end), so the person knows it's needed and learns about the one-per-email rule before investing effort.
- **No email verification.** People use their List immediately, with no confirm-your-email step. The accepted consequence: an email can be claimed by someone who doesn't own it (the recovery link only ever reaches the real inbox, which self-corrects control).
- **Unique, public username.** The username is shown publicly on the List and is unique across all Lists — no two share one. It is a display name, not a login: holding it carries no edit rights on its own.
- **Private email.** The email is private and is never rendered on any page or returned in any public response.
- **Identity is matched loosely.** Email and username comparisons ignore letter case and surrounding whitespace, so cosmetically different spellings of the same value resolve to the same thing — the one-per-email and unique-username rules can't be sidestepped by re-casing or padding.
- **Editing is durable per browser.** Once claimed, a browser can edit the List indefinitely without re-checking email.
- **Recovery is additive across devices.** Recovering on a new browser authorizes that browser without de-authorizing any other. A person may edit from several browsers at once.
- **Edit access is held, not proven.** Whoever holds a browser's edit access can edit; there is no second identity check. The accepted risk is a recovery link shared *before* it is clicked.
- **Recovery messaging is honest.** The recovery form tells the person plainly whether a List exists for an email; existence is not treated as a secret (lists are public, and creation already reveals "email taken").
- **Recovery ships in V1.** Because of one-per-email, a lost browser would otherwise lock a person out of their own email permanently; recovery is therefore in the first release, not deferred.
- **Recovery links expire and are single-use.** A link works once and ages out after 48 hours. Several valid links may be outstanding at once — requesting a new one does not cancel earlier unexpired ones.
- **Low-stakes data.** A List is a fun list; loss or theft is annoying, not damaging. This framing is what makes the relaxed-security behaviors above acceptable.

## Requirements

### Claiming a List

- REQ-1: No identity or contact detail is required to begin building a List; identity is asked for only when the person claims it.
- REQ-2: The email field is shown as required from the start of creation, not introduced only at save, so the person knows email is needed before investing effort.
- REQ-3: Claiming a List requires an email and a username, and nothing more.
- REQ-4: A syntactically invalid email is refused at claim time. This is format checking only — there is no verification or confirmation step.
- REQ-5: After claiming, the person can keep editing on the same browser straight away, with no email round-trip before they can continue.

### One List per email

- REQ-6: An email address backs at most one List; entering an email that already has one is refused before a second can be claimed, with an explanation of why a second isn't possible.
- REQ-7: A person refused for a duplicate email is given a clear path back into their existing List (a recovery request), not left at a dead end.

### Unique username

- REQ-8: A username is unique across all Lists; claiming with a username already in use is refused, and the person is asked to choose a different one.
- REQ-9: A duplicate username is handled differently from a duplicate email — it is simply a name to change, and is *not* routed into recovery. The email, not the username, is the person's identity key.

### Editing on the same browser

- REQ-10: A browser that has claimed or recovered a List can keep editing it indefinitely and across visits, with no re-authentication, until its local edit access is lost.

### Recovering access on another browser

- REQ-11: A person can request recovery by entering their email.
- REQ-12: When a List exists for that email, an emailed link is sent and the person is told to check their inbox.
- REQ-13: When no List exists for that email, the person is told plainly and kept on the form to correct the address, which is treated as a correctable input error.
- REQ-14: The recovery form signals existence honestly either way — it never masks whether a List exists behind a vague "if it exists, a link was sent" message.
- REQ-15: Recovery restores edit access only to the requester's own List, never anyone else's.
- REQ-16: Clicking a valid recovery link lands the person directly in edit mode on that browser, with no extra confirmation step.
- REQ-17: Recovering on a new browser adds edit access there without revoking it from any previously authorized browser, so a person can edit from several browsers at once.

### Recovery link lifetime

- REQ-18: A recovery link grants access only once.
- REQ-19: A recovery link stops working 48 hours after it is issued.
- REQ-20: Several recovery links may be valid at the same time; requesting a new link does not invalidate earlier unexpired ones.
- REQ-21: A person who follows a used or expired link is told it no longer works and is directed to request a fresh one.

### Viewing a List

- REQ-22: Anyone can read any List without signing in or holding edit access.
- REQ-23: A List publicly displays the person's chosen username.
- REQ-24: An email address is never shown on any public page or returned in any public response.

### No registration, relaxed security

- REQ-25: At no point does the flow ask the person to create an account, set a password, or confirm their email.
- REQ-26: Whoever holds a browser's edit access can edit, with no second identity check.

## Out of Scope

- **Email verification** of any kind.
- **Editing the username or email after a List is claimed.** Both are fixed at claim time in this release; changing them is a later concern.
- **The contents of a List** — adding, editing, reordering, or removing the games (Items) in it. This PRD establishes ownership and edit access only; what that edit access ultimately unlocks is specified separately.
- **Abuse protection for recovery requests.** Because there is no verification, anyone can trigger a recovery email to any registered address. Rate-limiting / throttling against that is acknowledged as needed, but deferred.
- **Per-device revocation / "reset all tokens for this email"** — the escape hatch for a leaked or shared link. Acknowledged as a likely follow-up, not in this release.
- **More than one List per person.** Deliberately excluded; scarcity is a feature.
- **Transferring or merging Lists between emails.**

## Further Notes

The scarcity of one List per person is intentional product design: it creates
a sense of rarity that motivates people to craft their list carefully, and it
keeps the recovery story unambiguous (one email, one List, one link).
