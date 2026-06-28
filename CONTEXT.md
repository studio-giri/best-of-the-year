# Best of the Year — Domain Context

The shared language for the games-ranking site. This is a glossary, not a spec:
it defines what terms *mean*, with no implementation details.

## Language

**Ranking**:
One person's selection of their best game for each year. Belongs to exactly one
person, and a person has at most one — its scarcity is deliberate.
_Avoid_: List, board, chart

**Ranking Item**:
A single entry in a Ranking: the chosen game for one specific year. At most one
Item per year within a Ranking.
_Avoid_: Entry, pick, row

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
