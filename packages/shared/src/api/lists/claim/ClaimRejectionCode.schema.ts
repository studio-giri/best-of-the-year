import { Schema } from "effect";

/**
 * The closed set of machine-readable reasons a claim can be refused.
 *
 * Shared so both sides agree on the contract: the server returns one of these
 * codes (never a human string), and the client maps it to a rendered message.
 * This keeps user-facing wording client-side (i18n-ready) while the wire stays
 * language-neutral.
 */
export const ClaimRejectionCode = Schema.Literals([
	"email_empty",
	"email_invalid",
	"username_empty",
	"username_too_short",
	"username_too_long",
	"username_taken",
	"email_taken",
]);

export type ClaimRejectionCode = Schema.Schema.Type<typeof ClaimRejectionCode>;
