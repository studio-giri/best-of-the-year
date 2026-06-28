import type { ClaimRankingBody } from "@boty/shared/api/rankings/claim/ClaimRankingBody.schema";
import type { ClaimRankingResponse } from "@boty/shared/api/rankings/claim/ClaimRankingResponse.schema";
import { useMutation } from "@tanstack/react-query";
import { Effect } from "effect";
import { client } from "#/lib/api/client.ts";
import { setOwnerToken } from "#/lib/ownerTokens.ts";

/**
 * Submit a claim. The Effect runtime stays confined to this queryFn-equivalent:
 * the typed client call is run to a Promise, and a ClaimRejected failure
 * rejects the promise so the form can map its code to a message. On success the
 * Owner token is persisted before the value resolves, so navigation into the
 * owner view always finds the grant already in place.
 */
async function submitClaim(
	input: typeof ClaimRankingBody.Type,
): Promise<typeof ClaimRankingResponse.Type> {
	const response = await Effect.runPromise(
		client.rankings.claim({
			payload: input,
		}),
	);

	setOwnerToken(response.id, response.ownerToken);
	return response;
}

export function useClaimRanking() {
	return useMutation({
		mutationFn: submitClaim,
	});
}
