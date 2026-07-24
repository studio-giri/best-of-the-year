import type { ConsumeRecoveryBody } from "@boty/shared/api/rankings/recover/consume/ConsumeRecoveryBody.schema";
import type { ConsumeRecoveryResponse } from "@boty/shared/api/rankings/recover/consume/ConsumeRecoveryResponse.schema";
import { RecoveryLinkRejected } from "@boty/shared/api/rankings/recover/consume/RecoveryLinkRejected.error";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { hashToken } from "../crypto/hashToken.ts";
import { PgDrizzle } from "../db/PgDrizzle.ts";
import { recoveryTokensTable } from "../db/schema/recovery-tokens.table.ts";
import { mintOwnerToken } from "../ownerTokens/ownerToken.service.ts";

/**
 * Consume a recovery link: look the link up by the hash of its raw token, then
 * mint a fresh Owner token for the ranking that link is bound to and hand it to
 * the requesting browser. Binding the mint to the stored `rankingId` — never a
 * caller-supplied id — is what restores access to only the requester's own
 * ranking. The response carries just the id and token; it never exposes the email.
 */
export function consumeRecovery(
	body: ConsumeRecoveryBody,
): Effect.Effect<ConsumeRecoveryResponse, RecoveryLinkRejected, PgDrizzle> {
	return Effect.gen(function* () {
		// Match the link by the hash of the presented token — only the hash is ever
		// stored, so an incoming raw token is hashed to look its row up.
		const db = yield* PgDrizzle;
		const matches = yield* db
			.select({
				rankingId: recoveryTokensTable.rankingId,
			})
			.from(recoveryTokensTable)
			.where(eq(recoveryTokensTable.tokenHash, hashToken(body.token)))
			.pipe(Effect.orDie);

		// No outstanding link matches: refuse it. This structured rejection is the
		// home the used- and expired-link branches extend onto.
		const link = matches[0];
		if (!link) {
			return yield* Effect.fail(
				new RecoveryLinkRejected({
					code: "link_invalid",
				}),
			);
		}

		// Mint a fresh Owner token for the bound ranking, granting this browser
		// owner access. Recovery is additive — it revokes no existing token.
		const ownerToken = yield* mintOwnerToken(link.rankingId);

		return {
			id: link.rankingId,
			ownerToken,
		};
	});
}
