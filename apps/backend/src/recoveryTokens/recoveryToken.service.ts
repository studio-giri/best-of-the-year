import { randomBytes } from "node:crypto";
import { Clock, Effect } from "effect";
import { hashToken } from "../crypto/hashToken.ts";
import { PgDrizzle } from "../db/PgDrizzle.ts";
import { recoveryTokensTable } from "../db/schema/recovery-tokens.table.ts";

// A recovery link is valid for 48h from issue (ADR-001).
const RECOVERY_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

/**
 * Issue a recovery link for a ranking: generate the secret, persist only its
 * SHA-256 hash with a 48h expiry and no consumption yet, and return the raw
 * token to be emailed exactly once. Any DB failure here is a genuine defect, so
 * it dies rather than surfacing as a domain error (mirrors `mintOwnerToken`).
 */
export function issueRecoveryToken(rankingId: string) {
	return Effect.gen(function* () {
		const db = yield* PgDrizzle;

		// 32 cryptographically-random bytes, base64url-encoded (~43 chars, URL-safe
		// so it rides in the emailed link path).
		const rawToken = randomBytes(32).toString("base64url");

		const now = yield* Clock.currentTimeMillis;

		yield* db
			.insert(recoveryTokensTable)
			.values({
				rankingId,
				tokenHash: hashToken(rawToken),
				expiresAt: new Date(now + RECOVERY_TOKEN_TTL_MS),
			})
			.pipe(Effect.orDie);

		return rawToken;
	});
}
