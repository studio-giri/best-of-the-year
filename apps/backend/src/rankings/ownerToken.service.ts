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
 * Mint an Owner token for a ranking. Only its SHA-256 hash is stored, so the raw
 * token is returned once here and never recoverable from the database.
 */
export function mintOwnerToken(rankingId: string) {
	return Effect.gen(function* () {
		const db = yield* PgDrizzle;

		// 32 random bytes, base64url-encoded: ~43 opaque chars.
		const ownerToken = randomBytes(32).toString("base64url");

		// Store the hash only.
		const ownerTokenHash = hashToken(ownerToken);
		yield* db
			.insert(ownerTokensTable)
			.values({
				rankingId,
				tokenHash: ownerTokenHash,
			})
			.pipe(Effect.orDie);

		// Raw token goes back to the browser, which saves it.
		return ownerToken;
	});
}

// Lowercased: the scheme name is case-insensitive on the wire.
const BEARER_SCHEME = "bearer ";

/**
 * The token an `Authorization` header presents, or undefined for anything else.
 * An empty token is no token — not worth a database lookup.
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
 * Resolve the Ranking a presented token grants edit access to (ADR-003). Access is
 * resource-scoped, so it lives here rather than in middleware, which has no path param.
 *
 * One query answers both questions: a Ranking that is gone (`RankingNotFound`) and one
 * this browser cannot edit (`EditAccessDenied`) are told apart without a second read.
 * The resolved row is returned, so callers need no fetch of their own.
 */
export function resolveOwnedRanking(
	rankingId: string,
	authorization: string | undefined,
) {
	return Effect.gen(function* () {
		// No bearer token grants nothing, whatever the Ranking's state. Refuse
		// before touching the database.
		const presentedToken = readBearerToken(authorization);
		if (presentedToken === undefined) {
			return yield* Effect.fail(
				new EditAccessDenied({
					id: rankingId,
				}),
			);
		}

		// Left-join so the Ranking comes back whether or not the token matches: a
		// missing row and an unmatched token are different answers. The join binds
		// the token to this Ranking, so one minted for another cannot match.
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
