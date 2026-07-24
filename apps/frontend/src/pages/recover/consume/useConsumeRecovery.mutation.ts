import type { ConsumeRecoveryBody } from "@boty/shared/api/rankings/recover/consume/ConsumeRecoveryBody.schema";
import type { ConsumeRecoveryResponse } from "@boty/shared/api/rankings/recover/consume/ConsumeRecoveryResponse.schema";
import { useMutation } from "@tanstack/react-query";
import { Effect } from "effect";
import { client } from "#/lib/api/client.ts";

/**
 * Exchange a recovery link for owner credentials. The Effect runtime stays
 * confined here: the typed client call is run to a Promise, and a
 * `RecoveryLinkRejected` 422 or any transport failure rejects it so the page can
 * fall back to a retry. Storing the token and navigating is the caller's job, so
 * the store happens before the redirect the owner guard reads.
 */
async function submitConsume(
	input: ConsumeRecoveryBody,
): Promise<ConsumeRecoveryResponse> {
	return Effect.runPromise(
		client.rankings.consumeRecovery({
			payload: input,
		}),
	);
}

export function useConsumeRecovery() {
	return useMutation({
		mutationFn: submitConsume,
	});
}
