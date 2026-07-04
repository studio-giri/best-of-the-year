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
	username_taken: "Sry, username taken. Pick another.",
};

/**
 * Shown when a claim succeeded but its Owner token could not be saved to this
 * browser (storage full or disabled): the ranking exists and is claimed, yet
 * this browser cannot prove ownership to edit it. Resubmitting would only hit a
 * username collision, so the wording must not read as retryable.
 */
export const ownerTokenNotStoredMessage =
	"Your ranking was created, but this browser couldn't save your access to it. Open another browser and use the Recover Ranking form to gain access.";
