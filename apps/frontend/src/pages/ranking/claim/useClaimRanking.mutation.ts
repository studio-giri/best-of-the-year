import type { ClaimRankingBody } from "@boty/shared/api/rankings/claim/ClaimRankingBody.schema";
import type { ClaimRankingResponse } from "@boty/shared/api/rankings/claim/ClaimRankingResponse.schema";
import { useMutation } from "@tanstack/react-query";
import { claimRanking } from "#/lib/api/claimRanking.ts";
import { setOwnerToken } from "#/lib/ownerTokens.ts";

/**
 * Persist the Owner token before the value resolves, so navigation into the
 * owner view finds the grant already in place. A storage failure surfaces as a
 * typed `OwnerTokenNotStored` the form handles on its own path.
 */
async function submitClaim(
	input: ClaimRankingBody,
): Promise<ClaimRankingResponse> {
	const response = await claimRanking(input);

	setOwnerToken(response.id, response.ownerToken);
	return response;
}

export function useClaimRanking() {
	return useMutation({
		mutationFn: submitClaim,
	});
}
