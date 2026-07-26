import type { ClaimRankingBody } from "@boty/shared/api/rankings/claim/ClaimRankingBody.schema";
import type { ClaimRankingResponse } from "@boty/shared/api/rankings/claim/ClaimRankingResponse.schema";
import { Effect } from "effect";
import { client } from "./client.ts";

/**
 * Claim a Ranking and answer with its id and Owner token.
 *
 * A `ClaimRejected` 422 rejects the promise, so a refusal reaches the caller as
 * a failed mutation carrying the reason code.
 */
export function claimRanking(
	input: ClaimRankingBody,
): Promise<ClaimRankingResponse> {
	return Effect.runPromise(
		client.rankings.claim({
			payload: input,
		}),
	);
}
