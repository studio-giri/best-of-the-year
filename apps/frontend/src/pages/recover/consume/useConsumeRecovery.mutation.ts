import { useMutation } from "@tanstack/react-query";
import { consumeRecovery } from "#/lib/api/consumeRecovery.ts";

/**
 * Exchange a recovery link for owner credentials. Storing the token and
 * navigating is the caller's job, so the store happens before the redirect the
 * owner guard reads.
 */
export function useConsumeRecovery() {
	return useMutation({
		mutationFn: consumeRecovery,
	});
}
