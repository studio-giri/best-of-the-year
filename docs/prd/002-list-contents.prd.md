# List contents

> Architecture for how a pass of edits is carried and committed:
> [ADR 003 — Whole-list writes, with `updatedAt` as the concurrency token](../adr/003-whole-list-writes.md)
> Edit access itself is owned by [PRD 001 — List ownership without sign-up](./001-list-ownership-without-sign-up.prd.md).

## Problem Statement

A person owns a List and can prove nothing about it yet: it is an empty frame.
What they actually came to do is decide, year by year, which game was the best —
and that is not a form you fill in once. It is a pass you make, change your mind
during, come back to, and refine over years. Picking the best game of 2011 means
weighing three candidates and possibly landing somewhere different tomorrow.

Two things make that hard to offer well. First, a List is public: if every
keystroke were published, a person's half-remembered guesses and typos would be
on display to anyone who loaded the page while they were still thinking. A person
needs room to be undecided in private. Second, a person may be editing from more
than one browser at once — PRD-001 deliberately allows it — and a list assembled
on a laptop must not be quietly erased by a phone that had an older copy of it.

## Solution

The List is edited in place: the page a person edits is the page readers see,
one band per year, so a name is judged exactly where it will be met. Every year
the site covers is already there as a field — nothing to add, nothing to create,
no empty state — which turns the list into something to complete rather than
something to build.

A pass stays private. Typing changes nothing anyone else can see; one deliberate
action commits the whole list at once, and until then the published List is
untouched. That single moment of commitment is also what makes the list feel
worth crafting, and it means a person can leave a year blank, fill it, empty it
again, and reconsider without ever publishing a thought they hadn't finished.
The one thing a pass cannot do is publish nothing at all: a list that has held a
game keeps at least one, so what a reader meets is never a bare frame where a
List used to be.

Because a pass is a batch, the editor keeps it safe: it says how many years are
unsaved, warns before a person walks away from them, and can resume a pass that
was interrupted. And because two browsers may be at work, a commit that would
overwrite what another one already published is refused rather than allowed to
delete it — while years nobody else touched quietly stay in step, so that refusal
is something a person almost never meets.

## Constraints & Clarifications

- **A pass is private until committed.** This is the load-bearing constraint, and the reason changes are committed as one list rather than saved a year at a time. A List is publicly readable, so anything written through immediately is immediately on show.
- **Editing happens in place.** The editor is the published page with its year names made editable, not a separate form. A person should never have to imagine how their choice will look.
- **Every covered year is present, filled or not.** Years without a game are bands like any other. Filling one in moves nothing else on screen.
- **A List never becomes empty once it holds a game.** A pass that would remove every game is not committed: the last game standing can be replaced, but not removed. The floor is on what a commit may *produce*, not on what a List may *be* — a List is created empty (PRD-001 REQ-3 asks for an email and a username and nothing more) and holds no games until its first commit, so an unfilled List stays a normal state that this rule does not retroactively forbid. Two consequences are accepted rather than solved: a person holding exactly one game has no route back to zero, and emptying a list wholesale is deletion, which is out of scope.
- **Covered Years starts at 1985.** A floor had to be chosen; the arrival of the NES is where the era this site is about begins. It is a product choice, not a technical limit, and years before it are excluded rather than deferred.
- **Covered Years only ever grows.** It gains each new year as that year begins and never gives one back, so a year that could hold a game last week can still hold one today.
- **A brief wait for a new year is acceptable.** A person should not have to wait more than roughly a week into January before the year that just ended can be filled in. Sub-day precision is explicitly not required.
- **Nothing is verified about a game's name.** Any text a person types is accepted as a title. There is no catalogue, no spell-check, and no notion of whether the game exists or came out that year.
- **The 255-character ceiling is a storage limit surfaced as a rule.** No real game title approaches it, so it exists only to refuse pasted nonsense — and it must refuse visibly, never by silently shortening a title or by blocking a person mid-word.
- **Conflicts favour the person currently typing.** When two browsers changed the same year, the one committing keeps its own version. A true both-edited-the-same-year conflict is resolved without asking; telling the person it happened is deferred (see Out of Scope).
- **Low stakes.** As in PRD-001, a List is a fun list. That framing is what makes "the typing session wins" and "no undo" acceptable answers.
- **English and French**, resolved as ADR-002 already establishes for every other surface.

## Requirements

### Composing a List

- REQ-1: Every year in Covered Years is offered as its own field, so any year can be filled directly with nothing to add or create first.
- REQ-2: Years holding no game appear alongside years that do, so the shape of the whole list is visible at once.
- REQ-3: Years are presented newest-first, the same order the published List uses.
- REQ-4: A year's field sits in the same visual band the published List uses for that year, so a name is judged where readers will meet it.
- REQ-5: Filling in a previously empty year moves nothing else on screen.
- REQ-6: Each year's field identifies the year it belongs to for someone who cannot see the screen.
- REQ-7: A person can see how many of the Covered Years hold a game, out of how many years in total.
- REQ-8: A year holds at most one game, and the editor offers no way to give a year two.
- REQ-9: A commit never leaves a List holding no games at all: any year can be emptied, but not the last year still holding a game. The editor does not offer a commit that would empty the list and says why, and such a commit is refused if it is attempted regardless of what the editor offered.

### Committing a pass

- REQ-10: Nothing a person types is published until they explicitly commit; until that moment the List readers see is unchanged.
- REQ-11: One action commits every change in the pass at once. There is no per-year save and no automatic save.
- REQ-12: Before committing, a person can see how many years they have changed.
- REQ-13: When nothing has changed, committing is not offered.
- REQ-14: While a commit is in progress, a person can see that it is.
- REQ-15: After a successful commit a person is told their changes are saved, and when.
- REQ-16: Text typed while a commit is in flight is never lost or overwritten by that commit completing.
- REQ-17: A commit applies in full or not at all — a person never finds a half-saved List.
- REQ-18: A successful commit is immediately reflected everywhere the List is read, including its public page.
- REQ-19: Leaving the editor with uncommitted changes asks for confirmation first.
- REQ-20: A pass interrupted without committing — a reload, the back button, a mis-click — can be resumed rather than retyped.
- REQ-21: Only someone holding edit access to a List can commit changes to it.

### What a game's name may be

- REQ-22: Whitespace around a name is forgiven: the name is stored and published as its visible text, and the field shows that tidied form once committed.
- REQ-23: A name that is only whitespace is not a game — the year ends up holding none, exactly as if it had been left blank.
- REQ-24: Clearing a year that held a game removes that game from the List — unless it is the only game the List holds, which REQ-9 keeps.
- REQ-25: Invisible control characters pasted into a name are discarded rather than stored or published.
- REQ-26: A name over 255 characters cannot be committed; the person is told which year is at fault, and nothing is silently shortened.
- REQ-27: Typing is never blocked or truncated as a person writes — an over-long name is reported after the fact, never prevented as it happens.
- REQ-28: A name is accepted in any language or script, including accents and punctuation.

### Which years a List can cover

- REQ-29: Covered Years runs from 1985 to the current year.
- REQ-30: A year outside Covered Years cannot be given a game.
- REQ-31: Covered Years gains each new year as it begins, with no action by anyone.
- REQ-32: A newly begun year becomes fillable promptly — within about a week of the year starting at the very latest.
- REQ-33: When a List already holds a game for a year outside Covered Years, the editor still shows that year so it can be seen, changed, or removed. A commit never drops a year the person was not shown.

### Editing from more than one browser

- REQ-34: A person may have the editor open in more than one browser at the same time, as PRD-001 REQ-17 allows.
- REQ-35: A commit never silently discards games committed elsewhere since the editor loaded its copy. If it would, it is refused and nothing is written.
- REQ-36: A refused commit tells the person their List changed elsewhere, and keeps their uncommitted typing rather than discarding it.
- REQ-37: While the editor is open, years the person has not edited take on changes committed elsewhere, so their copy stays current.
- REQ-38: A year emptied elsewhere empties in the person's form too, provided they have not edited it.
- REQ-39: Years the person has edited keep their own version, and committing publishes theirs.
- REQ-40: A commit refused only because the List moved elsewhere recovers without the person retrying, whenever their changes and the other browser's do not touch the same year.

### When a List cannot be edited

- REQ-41: A person whose List no longer exists is told plainly that it is gone.
- REQ-42: A person whose browser no longer holds valid edit access is told so, and pointed at recovery.
- REQ-43: Neither refusal navigates a person away from their work, nor discards the edit access their browser holds.

## Out of Scope

- **Composing a List before claiming it.** PRD-001 REQ-1 promises that building can begin before any identity is given, and that flow does not exist yet. This PRD covers editing a List a person already owns. Deferred, on `docs/ROADMAP.md`.
- **A conflict-resolution interface** — showing both versions of a year and letting a person choose. The typing session simply wins. Deferred, on `docs/ROADMAP.md`.
- **Undo, version history, or restoring a previous state.** A committed pass replaces the one before it and the earlier state is gone.
- **Live collaborative editing.** Two browsers stay in step at commit boundaries and on refocus, not keystroke by keystroke.
- **Ordering within the list.** A year holds one game and years sort by year; nothing is ranked against anything else.
- **More than one game per year**, and **years before 1985**. Both deliberately excluded, not deferred.
- **Anything about a game beyond its name** — no rating, note, platform, release date, cover art, or link.
- **A game catalogue, autocomplete, or verifying a title names a real game.**
- **Offline editing**, or queuing a commit made without a connection.
- **Archiving or deleting a List**, and **editing the username or email** (the latter already out of scope in PRD-001). Both on `docs/ROADMAP.md`. With REQ-9's floor in place, deletion becomes the only route by which a List that has held a game ends up holding none — so a person asking to empty their list entirely is asking for a feature this release does not have.
- **Rate limiting or abuse protection on commits.** As in PRD-001, acknowledged and deferred.

## Further Notes

The privacy of an uncommitted pass is the requirement everything else in this
document bends around. It is worth being explicit that this was a choice with a
cheaper alternative: saving each year as it is typed would need no unsaved-change
count, no leave-confirmation, no resumable draft, and no conflict handling at all,
because there would never be a batch to conflict with. All of that machinery is
the price of letting a person be undecided in private on a page anyone can read.

The floor on emptiness (REQ-9) sits a little awkwardly beside a List being
created empty, and that asymmetry is deliberate rather than overlooked. The rule
exists to stop a person publishing a bare list over one they had already filled —
a destructive act, and the only one this PRD can produce — not to police the
ordinary state of a List nobody has got to yet. Closing the gap properly would
mean asking for a first game at claim time, which would cost PRD-001 its promise
that claiming asks for an email and a username and nothing more; that is a higher
price than the gap charges.

The second-order effect is that the list reads as something to complete. Because
every covered year is present whether or not it holds a game, a person sees the
gaps — and a List with gaps invites another pass. That is the same instinct as
the one-per-person scarcity in PRD-001: the list should feel worth returning to.
