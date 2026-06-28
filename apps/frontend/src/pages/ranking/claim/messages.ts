import type { ClaimRejectionCode } from "@boty/shared/api/rankings/claim/ClaimRejectionCode.schema";

/**
 * The single client-side source of the user-facing claim-rejection wording.
 * The server speaks only machine codes; this map renders them. The exact
 * strings here are the acceptance-criteria source of truth (i18n-ready: swap
 * this map, not the call sites).
 */
export const claimRejectionMessages: Record<ClaimRejectionCode, string> = {
	email_empty: "Email cannot be empty.",
	email_invalid: "Email is invalid.",
	username_empty: "Username cannot be empty.",
	username_too_short: "Username must be at least 2 characters.",
	username_too_long: "Username must be 30 characters or fewer.",
	username_taken: "Username taken: pick another.",
};
