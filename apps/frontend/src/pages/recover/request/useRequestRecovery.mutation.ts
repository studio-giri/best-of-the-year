import type { RequestRecoveryBody } from "@boty/shared/api/rankings/recover/RequestRecoveryBody.schema";
import type { RequestRecoveryResponse } from "@boty/shared/api/rankings/recover/RequestRecoveryResponse.schema";
import { useMutation } from "@tanstack/react-query";
import { Effect } from "effect";
import { client } from "#/lib/api/client.ts";

/**
 * Submit a recovery request. The Effect runtime stays confined here: the typed
 * client call is run to a Promise, and a `RecoveryRejected` 422 rejects the
 * promise so the form can map its code to a message. A successful resolve means
 * a link was emailed — the form renders the check-inbox confirmation.
 */
async function submitRecovery(
	input: RequestRecoveryBody,
): Promise<RequestRecoveryResponse> {
	return Effect.runPromise(
		client.rankings.requestRecovery({
			payload: input,
		}),
	);
}

export function useRequestRecovery() {
	return useMutation({
		mutationFn: submitRecovery,
	});
}
