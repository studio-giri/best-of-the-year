import type { ClaimListBody } from "@boty/shared/api/lists/claim/ClaimListBody.schema";
import { ClaimRejected } from "@boty/shared/api/lists/claim/ClaimRejected.error";
import {
	validateEmail,
	validateUsername,
} from "@boty/shared/api/lists/claim/claimRules";
import { sql } from "drizzle-orm";
import { Effect } from "effect";
import { isUniqueViolation } from "../../db/helpers/isUniqueViolation.ts";
import { PgDrizzle } from "../../db/PgDrizzle.ts";
import {
	LISTS_EMAIL_UNIQUE_INDEX,
	LISTS_USERNAME_UNIQUE_INDEX,
	listsTable,
} from "../../db/schema/lists.table.ts";
import { mintOwnerToken } from "../ownerToken.service.ts";

/**
 * Claim a list: validate the input, persist the list and a fresh Owner token,
 * and return the owner credentials.
 */
export function claimList(body: ClaimListBody) {
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

		// Insert the list. The functional unique indexes on lower(trim(username))
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
		// if a list already backs it. The extra read runs only on the
		// username-collision branch, never on the happy or pure-email-duplicate path.
		const db = yield* PgDrizzle;
		const insertedRows = yield* db
			.insert(listsTable)
			.values({
				username: trimmedUsername,
				email: trimmedEmail,
			})
			.returning({
				id: listsTable.id,
				username: listsTable.username,
			})
			.pipe(
				Effect.catchTag("EffectDrizzleQueryError", (error) => {
					if (isUniqueViolation(error, LISTS_EMAIL_UNIQUE_INDEX)) {
						return Effect.fail(
							new ClaimRejected({
								code: "email_taken",
							}),
						);
					}
					if (isUniqueViolation(error, LISTS_USERNAME_UNIQUE_INDEX)) {
						return Effect.gen(function* () {
							const emailMatches = yield* db
								.select({
									id: listsTable.id,
								})
								.from(listsTable)
								.where(
									sql`lower(trim(${listsTable.email})) = ${trimmedEmail.toLowerCase()}`,
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
		const list = insertedRows[0];
		if (!list) {
			return yield* Effect.die("Insert returned no list row");
		}

		// Mint an Owner token (stored as a hash only), granting this browser owner
		// access. The raw token is returned exactly once below.
		//
		// Intentionally not transactional with the insert above: a failure here leaves
		// a tokenless list, which the email-keyed recovery flow resolves like any
		// lost token.
		const ownerToken = yield* mintOwnerToken(list.id);

		return {
			id: list.id,
			username: list.username,
			ownerToken,
		};
	});
}
