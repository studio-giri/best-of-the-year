import type { ClaimRankingBody } from "@boty/shared/api/rankings/claim/ClaimRankingBody.schema";
import { ClaimRejected } from "@boty/shared/api/rankings/claim/ClaimRejected.error";
import {
	validateEmail,
	validateUsername,
} from "@boty/shared/api/rankings/claim/claimRules";
import { Effect } from "effect";
import { isUniqueViolation } from "../db/helpers/isUniqueViolation.ts";
import { PgDrizzle } from "../db/PgDrizzle.ts";
import {
	RANKINGS_USERNAME_UNIQUE_INDEX,
	rankingsTable,
} from "../db/schema/rankings.table.ts";
import { mintOwnerToken } from "../ownerTokens/ownerToken.service.ts";

/**
 * Claim a ranking: validate the input, persist the ranking and a fresh Owner token,
 * and return the owner credentials.
 */
export function claimRanking(body: typeof ClaimRankingBody.Type) {
	return Effect.gen(function* () {
		// Validate email
		const trimmedEmail = body.email.trim();
		const emailError = validateEmail(trimmedEmail);
		if (emailError) {
			return yield* Effect.fail(
				new ClaimRejected({
					code: emailError,
				}),
			);
		}

		// Validate username
		const trimmedUsername = body.username.trim();
		const usernameError = validateUsername(trimmedUsername);
		if (usernameError) {
			return yield* Effect.fail(
				new ClaimRejected({
					code: usernameError,
				}),
			);
		}

		// Insert the ranking. The functional unique index on lower(trim(username))
		// is the authoritative duplicate guard: a violation of THAT index is the
		// race-free signal that the name is taken (never a server error). A unique
		// violation on any other constraint is not a username clash, and any other DB
		// failure is a genuine defect — both die rather than misreporting "name taken".
		const db = yield* PgDrizzle;
		const insertedRows = yield* db
			.insert(rankingsTable)
			.values({
				username: trimmedUsername,
				email: trimmedEmail,
			})
			.returning({
				id: rankingsTable.id,
				username: rankingsTable.username,
			})
			.pipe(
				Effect.catchTag("EffectDrizzleQueryError", (error) =>
					isUniqueViolation(error, RANKINGS_USERNAME_UNIQUE_INDEX)
						? Effect.fail(
								new ClaimRejected({
									code: "username_taken",
								}),
							)
						: Effect.die(error),
				),
			);
		const ranking = insertedRows[0];
		if (!ranking) {
			return yield* Effect.die("Insert returned no ranking row");
		}

		// Mint an Owner token (stored as a hash only), granting this browser owner
		// access. The raw token is returned exactly once below.
		const ownerToken = yield* mintOwnerToken(ranking.id);

		return {
			id: ranking.id,
			username: ranking.username,
			ownerToken,
		};
	});
}
