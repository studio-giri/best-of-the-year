import type { ClaimRankingBody } from "@boty/shared/api/rankings/claim/ClaimRankingBody.schema";
import { ClaimRejected } from "@boty/shared/api/rankings/claim/ClaimRejected.error";
import {
	validateEmail,
	validateUsername,
} from "@boty/shared/api/rankings/claim/claimRules";
import { sql } from "drizzle-orm";
import { Effect } from "effect";
import { isUniqueViolation } from "../../db/helpers/isUniqueViolation.ts";
import { PgDrizzle } from "../../db/PgDrizzle.ts";
import {
	RANKINGS_EMAIL_UNIQUE_INDEX,
	RANKINGS_USERNAME_UNIQUE_INDEX,
	rankingsTable,
} from "../../db/schema/rankings.table.ts";
import { mintOwnerToken } from "../ownerToken.service.ts";

/**
 * Claim a ranking: validate the input, persist the ranking and a fresh Owner token,
 * and return the owner credentials.
 */
export function claimRanking(body: ClaimRankingBody) {
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

		// Insert the ranking. The functional unique indexes on lower(trim(username))
		// and lower(trim(email)) are the authoritative duplicate guards: a violation
		// of one of THOSE indexes is the race-free signal that the name/email is taken
		// (never a server error). Any other DB failure is a genuine defect and dies
		// rather than misreporting a duplicate.
		//
		// Email takes precedence over username: the identity key wins, so a
		// duplicate email routes toward recovery even when the username also clashes.
		// Postgres reports only one violated constraint per failed insert, so a
		// username violation is not proof the email is free — before concluding
		// username_taken we look the email up (against the same lower(trim(email))
		// expression the unique index and recovery lookup use) and prefer email_taken
		// if a ranking already backs it. The extra read runs only on the
		// username-collision branch, never on the happy or pure-email-duplicate path.
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
				Effect.catchTag("EffectDrizzleQueryError", (error) => {
					if (isUniqueViolation(error, RANKINGS_EMAIL_UNIQUE_INDEX)) {
						return Effect.fail(
							new ClaimRejected({
								code: "email_taken",
							}),
						);
					}
					if (isUniqueViolation(error, RANKINGS_USERNAME_UNIQUE_INDEX)) {
						return Effect.gen(function* () {
							const emailMatches = yield* db
								.select({
									id: rankingsTable.id,
								})
								.from(rankingsTable)
								.where(
									sql`lower(trim(${rankingsTable.email})) = ${trimmedEmail.toLowerCase()}`,
								)
								.pipe(Effect.orDie);
							return yield* Effect.fail(
								new ClaimRejected({
									code: emailMatches[0] ? "email_taken" : "username_taken",
								}),
							);
						});
					}
					return Effect.die(error);
				}),
			);
		const ranking = insertedRows[0];
		if (!ranking) {
			return yield* Effect.die("Insert returned no ranking row");
		}

		// Mint an Owner token (stored as a hash only), granting this browser owner
		// access. The raw token is returned exactly once below.
		//
		// Intentionally not transactional with the insert above: a failure here leaves
		// a tokenless ranking, which the email-keyed recovery flow resolves like any
		// lost token.
		const ownerToken = yield* mintOwnerToken(ranking.id);

		return {
			id: ranking.id,
			username: ranking.username,
			ownerToken,
		};
	});
}
