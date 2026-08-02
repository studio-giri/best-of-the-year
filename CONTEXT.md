# Best of the Year — Domain Context

The shared language for the games-list site. This is a glossary, not a spec:
it defines what terms *mean*, with no implementation details.

An _Avoid_ list bans a word as **domain vocabulary** — the name the code, the
schemas and these docs give the thing itself. It reaches neither names for purely
visual or structural parts that happen to reuse the word.

## Language

**List**:
One person's selection of their best game for each year. Belongs to exactly one
person, and a person has at most one — its scarcity is deliberate.
_Avoid_: Ranking, board, chart

**List Item**:
The chosen game for one specific year. At most one Item per year within a List.
Person-facing copy calls it an *entry* ("3 entries unsaved"), which stays true of
a year whose game was removed — the year is not the thing that was edited, what
it holds is. The code, the schemas and these docs say Item, so the two surfaces
never blur into one another.
_Avoid_: Pick, row — and *entry* as the name in code, schemas or docs

**Covered Years**:
The span of years a List can hold an Item for: 1985 — the arrival of the NES,
where the era this site is about begins — up to the current year. It gains a year
as each one begins and never gives one back. A year outside the span can hold no
Item; a year inside it may simply have none.
_Avoid_: Range, window, period, era

**Claim**:
The act of taking ownership of a List by submitting an Email and a Username.
In one step it creates the List and grants the claiming browser an Owner
token — no account, no password, no email verification. It is how a List
comes into being; ownership and creation are the same moment. Distinct from
recovery (regaining edit access, via an Owner link, to a List that already
exists).
_Avoid_: Register, sign up, create account, save

**Owner token**:
A bearer credential held in a person's browser that grants the right to edit one
List. Long-lived; a single List may have several, one per browser/device.
Whoever presents it can edit — there is no account or login behind it.
_Avoid_: Session, password, API key

**Owner link**:
A single-use, short-lived URL emailed to a person so that a new browser can mint
its own Owner token. Its only purpose is recovery and moving between devices.
_Avoid_: Magic link

**Username**:
The public-facing name attached to a List (e.g. "Paulin"). A label shown on
the List, carrying no edit rights on its own. Unique: no two Lists share one.
_Avoid_: Author, user, owner, handle

**Email**:
A person's private email address, captured when their List is created. Used
only to identify them (one List per Email) and to deliver Owner links. Never
shown publicly. There is no account behind it.
_Avoid_: Account, login, user

**Language**:
The person's chosen language for reading the site and receiving emails —
currently English or French. A presentation choice about which words are shown,
not about number/date formatting (there is nothing format-sensitive to
localize). It is client-owned and never a stored account attribute: the site
follows whatever Language the person is currently using, and an email inherits
the Language of the browser that triggered it.
_Avoid_: Locale, i18n, translation, region
