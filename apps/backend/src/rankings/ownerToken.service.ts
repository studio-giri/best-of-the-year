import { randomBytes } from "node:crypto";
import { EditAccessDenied } from "@boty/shared/api/rankings/EditAccessDenied.error";
import { RankingNotFound } from "@boty/shared/api/rankings/RankingNotFound.error";
import { and, eq } from "drizzle-orm";
import { Effect } from "effect";
import { hashToken } from "../crypto/hashToken.ts";
import { PgDrizzle } from "../db/PgDrizzle.ts";
import { ownerTokensTable } from "../db/schema/owner-tokens.table.ts";
import { rankingsTable } from "../db/schema/rankings.table.ts";

/**
 * Mint an Owner token for a ranking: generate the secret, persist only its
 * SHA-256 hash (a DB read can never recover a usable token), and return the raw
 * token to be handed to the claiming browser exactly once. Any DB failure here
 * is a genuine defect, so it dies rather than surfacing as a domain error.
 */
export function mintOwnerToken(rankingId: string) {
	return Effect.gen(function* () {
		const db = yield* PgDrizzle;

		// Generate a new Owner token: 32 cryptographically-random bytes, base64url-encoded
		// (~43 chars, opaque to the client).
		const ownerToken = randomBytes(32).toString("base64url");

		// Insert in database hashed version
		const ownerTokenHash = hashToken(ownerToken);
		yield* db
			.insert(ownerTokensTable)
			.values({
				rankingId,
				tokenHash: ownerTokenHash,
			})
			.pipe(Effect.orDie);

		// Non-hashed token is sent back to the user to be saved in browser
		return ownerToken;
	});
}

/**
 * The scheme an Owner token travels under, lowercased for comparison — the
 * scheme name is case-insensitive on the wire.
 */
const BEARER_SCHEME = "bearer ";

/**
 * The token an `Authorization` header presents, or undefined when the header
 * presents no bearer token at all. An empty token is no token: it would hash to
 * a real value and go looking for a row, which is a question not worth asking.
 */
function readBearerToken(
	authorization: string | undefined,
): string | undefined {
	if (!authorization?.toLowerCase().startsWith(BEARER_SCHEME)) {
		return undefined;
	}

	const token = authorization.slice(BEARER_SCHEME.length).trim();
	return token.length > 0 ? token : undefined;
}

/**
 * Resolve the Ranking a presented credential grants edit access to (ADR-003).
 * Edit access is resource-scoped — the question is whether this token grants
 * access to *this* Ranking — so it is answered here rather than by middleware,
 * which has no path param to scope itself by.
 *
 * Existence and access come from one query: the Ranking is joined to the Owner
 * token whose hash matches the presented one, so a Ranking that is gone
 * (`RankingNotFound`) and a Ranking this browser cannot edit (`EditAccessDenied`)
 * are told apart without a second read. Callers get the resolved row, so the
 * Ranking's stored state needs no fetching of its own.
 */
export function resolveOwnedRanking(
	rankingId: string,
	authorization: string | undefined,
) {
	return Effect.gen(function* () {
		// Anything that is not a bearer token is refused before the database is
		// touched: it can grant nothing, whatever the Ranking's state.
		const presentedToken = readBearerToken(authorization);
		if (presentedToken === undefined) {
			return yield* Effect.fail(
				new EditAccessDenied({
					id: rankingId,
				}),
			);
		}

		// Left-join so the Ranking row comes back whether or not the token matches:
		// a missing row and an unmatched token are different answers, and the join
		// condition binds the token to this Ranking, so a token minted for another
		// one cannot match here.
		const db = yield* PgDrizzle;
		const rows = yield* db
			.select({
				id: rankingsTable.id,
				updatedAt: rankingsTable.updatedAt,
				grantingTokenId: ownerTokensTable.id,
			})
			.from(rankingsTable)
			.leftJoin(
				ownerTokensTable,
				and(
					eq(ownerTokensTable.rankingId, rankingsTable.id),
					eq(ownerTokensTable.tokenHash, hashToken(presentedToken)),
				),
			)
			.where(eq(rankingsTable.id, rankingId))
			.pipe(Effect.orDie);

		const row = rows[0];
		if (!row) {
			return yield* Effect.fail(
				new RankingNotFound({
					id: rankingId,
				}),
			);
		}
		if (row.grantingTokenId === null) {
			return yield* Effect.fail(
				new EditAccessDenied({
					id: rankingId,
				}),
			);
		}

		return {
			id: row.id,
			updatedAt: row.updatedAt,
		};
	});
}
