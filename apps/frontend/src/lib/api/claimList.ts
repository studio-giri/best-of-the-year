import type { ClaimListBody } from "@boty/shared/api/lists/claim/ClaimListBody.schema";
import type { ClaimListResponse } from "@boty/shared/api/lists/claim/ClaimListResponse.schema";
import { Effect } from "effect";
import { client } from "./client.ts";

/**
 * Claim a List and answer with its id and Owner token.
 *
 * A `ClaimRejected` 422 rejects the promise, so a refusal reaches the caller as
 * a failed mutation carrying the reason code.
 */
export function claimList(input: ClaimListBody): Promise<ClaimListResponse> {
	return Effect.runPromise(
		client.lists.claim({
			payload: input,
		}),
	);
}
