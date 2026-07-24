import type { ConsumeRecoveryBody } from "@boty/shared/api/rankings/recover/consume/ConsumeRecoveryBody.schema";
import type { ConsumeRecoveryResponse } from "@boty/shared/api/rankings/recover/consume/ConsumeRecoveryResponse.schema";
import { RecoveryLinkRejected } from "@boty/shared/api/rankings/recover/consume/RecoveryLinkRejected.error";
import { eq } from "drizzle-orm";
import { Clock, Effect } from "effect";
import { hashToken } from "../../crypto/hashToken.ts";
import { PgDrizzle } from "../../db/PgDrizzle.ts";
import { recoveryTokensTable } from "../../db/schema/recovery-tokens.table.ts";
import { mintOwnerToken } from "../ownerToken.service.ts";

/**
 * Consume a recovery link: look the link up by the hash of its raw token, then
 * classify the link, and only if it is still live mint a fresh Owner token for
 * the ranking that link is bound to. Binding the mint to the stored `rankingId`
 * — never a caller-supplied id — is what restores access to only the
 * requester's own ranking. The response carries just the id and token; it never
 * exposes the email.
 */
export function consumeRecovery(
	body: ConsumeRecoveryBody,
): Effect.Effect<ConsumeRecoveryResponse, RecoveryLinkRejected, PgDrizzle> {
	return Effect.gen(function* () {
		// Match the link by the hash of the presented token — only the hash is ever
		// stored, so an incoming raw token is hashed to look its row up. Pull the
		// lifecycle columns alongside the binding so a single read decides its fate.
		const db = yield* PgDrizzle;
		const matches = yield* db
			.select({
				rankingId: recoveryTokensTable.rankingId,
				consumedAt: recoveryTokensTable.consumedAt,
				expiresAt: recoveryTokensTable.expiresAt,
			})
			.from(recoveryTokensTable)
			.where(eq(recoveryTokensTable.tokenHash, hashToken(body.token)))
			.pipe(Effect.orDie);

		// Classify in precedence order: an unknown token is invalid; an
		// already-spent link is used (this ordering is what makes a link that is
		// both used and expired report as used); a live-but-aged-out link is
		// expired. Expiry is the half-open window [issued, issued+48h), so a link is
		// valid iff now is strictly before its expiry — same clock as issuance,
		// compared in-app for testability rather than in SQL.
		const link = matches[0];
		if (!link) {
			return yield* Effect.fail(
				new RecoveryLinkRejected({
					code: "link_invalid",
				}),
			);
		}
		if (link.consumedAt !== null) {
			return yield* Effect.fail(
				new RecoveryLinkRejected({
					code: "link_used",
				}),
			);
		}
		const now = yield* Clock.currentTimeMillis;
		if (now >= link.expiresAt.getTime()) {
			return yield* Effect.fail(
				new RecoveryLinkRejected({
					code: "link_expired",
				}),
			);
		}

		// The link is live: mark this row consumed so it cannot be spent again,
		// scoped by its own hash so sibling links for the ranking are untouched.
		// (Single-use is best-effort — two simultaneous consumes could both mint;
		// harmless under the additive-recovery model, see ADR-001.)
		yield* db
			.update(recoveryTokensTable)
			.set({
				consumedAt: new Date(now),
			})
			.where(eq(recoveryTokensTable.tokenHash, hashToken(body.token)))
			.pipe(Effect.orDie);

		// Mint a fresh Owner token for the bound ranking, granting this browser
		// owner access. Recovery is additive — it revokes no existing token.
		const ownerToken = yield* mintOwnerToken(link.rankingId);

		return {
			id: link.rankingId,
			ownerToken,
		};
	});
}
