import type { RequestRecoveryBody } from "@boty/shared/api/lists/recover/RequestRecoveryBody.schema";
import type { RequestRecoveryResponse } from "@boty/shared/api/lists/recover/RequestRecoveryResponse.schema";
import { Effect } from "effect";
import { client } from "./client.ts";

/**
 * Ask for a recovery link to be emailed.
 *
 * A `RecoveryRejected` 422 rejects the promise, so a refusal reaches the caller
 * as a failed mutation carrying the reason code.
 */
export function requestRecovery(
	input: RequestRecoveryBody,
): Promise<RequestRecoveryResponse> {
	return Effect.runPromise(
		client.lists.requestRecovery({
			payload: input,
		}),
	);
}
