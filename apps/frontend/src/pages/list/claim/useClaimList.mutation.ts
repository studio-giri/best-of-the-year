import type { ClaimListBody } from "@boty/shared/api/lists/claim/ClaimListBody.schema";
import type { ClaimListResponse } from "@boty/shared/api/lists/claim/ClaimListResponse.schema";
import { useMutation } from "@tanstack/react-query";
import { claimList } from "#/lib/api/claimList.ts";
import { setOwnerToken } from "#/lib/ownerTokens.ts";

/**
 * Persist the Owner token before the value resolves, so navigation into the
 * owner view finds the grant already in place. A storage failure surfaces as a
 * typed `OwnerTokenNotStored` the form handles on its own path.
 */
async function submitClaim(input: ClaimListBody): Promise<ClaimListResponse> {
	const response = await claimList(input);

	setOwnerToken(response.id, response.ownerToken);
	return response;
}

export function useClaimList() {
	return useMutation({
		mutationFn: submitClaim,
	});
}
