import { randomBytes } from "node:crypto";
import { Effect } from "effect";
import { hashToken } from "../crypto/hashToken.ts";
import { PgDrizzle } from "../db/PgDrizzle.ts";
import { ownerTokensTable } from "../db/schema/owner-tokens.table.ts";

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
