import { useMutation } from "@tanstack/react-query";
import { requestRecovery } from "#/lib/api/requestRecovery.ts";

/**
 * Submit a recovery request. A successful resolve means a link was emailed — the
 * form renders the check-inbox confirmation.
 */
export function useRequestRecovery() {
	return useMutation({
		mutationFn: requestRecovery,
	});
}
