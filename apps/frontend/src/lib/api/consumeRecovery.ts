import type { ConsumeRecoveryBody } from "@boty/shared/api/rankings/recover/consume/ConsumeRecoveryBody.schema";
import type { ConsumeRecoveryResponse } from "@boty/shared/api/rankings/recover/consume/ConsumeRecoveryResponse.schema";
import { Effect } from "effect";
import { client } from "./client.ts";

/**
 * Exchange a recovery link for owner credentials.
 *
 * A `RecoveryLinkRejected` 422 or a transport failure rejects the promise, so a
 * refused link reaches the caller as a failed mutation.
 */
export function consumeRecovery(
	input: ConsumeRecoveryBody,
): Promise<ConsumeRecoveryResponse> {
	return Effect.runPromise(
		client.rankings.consumeRecovery({
			payload: input,
		}),
	);
}
