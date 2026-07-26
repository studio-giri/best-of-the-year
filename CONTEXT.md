# Best of the Year — Domain Context

The shared language for the games-ranking site. This is a glossary, not a spec:
it defines what terms *mean*, with no implementation details.

An _Avoid_ list bans a word as **domain vocabulary** — the name the code, the
schemas and these docs give the thing itself. It reaches neither names for purely
visual or structural parts that happen to reuse the word, nor user-facing copy,
which answers to its own register (see Ranking).

## Language

**Ranking**:
One person's selection of their best game for each year. Belongs to exactly one
person, and a person has at most one — its scarcity is deliberate.
The interface calls it a **list** — "your list", "ta liste". To a reader
"ranking" suggests a leaderboard of everybody, which this is not, and its French
counterpart is stiffer still. Both registers are deliberate: the code keeps the
rarer word because it is unambiguous and greppable, where "list" collides with
every generic collection.
_Avoid_: List, board, chart — as the domain term; the interface is exempt

**Ranking Item**:
A single entry in a Ranking: the chosen game for one specific year. At most one
Item per year within a Ranking.
_Avoid_: Entry, pick, row

**Covered Years**:
The span of years a Ranking can hold an Item for: 1985 — the arrival of the NES,
where the era this site is about begins — up to the current year. It gains a year
as each one begins and never gives one back. A year outside the span can hold no
Item; a year inside it may simply have none.
_Avoid_: Range, window, period, era

**Claim**:
The act of taking ownership of a Ranking by submitting an Email and a Username.
In one step it creates the Ranking and grants the claiming browser an Owner
token — no account, no password, no email verification. It is how a Ranking
comes into being; ownership and creation are the same moment. Distinct from
recovery (regaining edit access, via an Owner link, to a Ranking that already
exists).
_Avoid_: Register, sign up, create account, save

**Owner token**:
A bearer credential held in a person's browser that grants the right to edit one
Ranking. Long-lived; a single Ranking may have several, one per browser/device.
Whoever presents it can edit — there is no account or login behind it.
_Avoid_: Session, password, API key

**Owner link**:
A single-use, short-lived URL emailed to a person so that a new browser can mint
its own Owner token. Its only purpose is recovery and moving between devices.
_Avoid_: Magic link

**Username**:
The public-facing name attached to a Ranking (e.g. "Paulin"). A label shown on
the list, carrying no edit rights on its own. Unique: no two Rankings share one.
_Avoid_: Author, user, owner, handle

**Email**:
A person's private email address, captured when their Ranking is created. Used
only to identify them (one Ranking per Email) and to deliver Owner links. Never
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
