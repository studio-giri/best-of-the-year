import { Schema } from "effect";

/**
 * Claim payload — deliberately permissive plain strings.
 *
 * Email/username rules are NOT enforced at the schema layer: the claim handler
 * owns validation order and messaging so it can return a precise reason code
 * (e.g. `email_invalid`) instead of a generic decode error. The client mirrors
 * the same trivial rules for instant feedback.
 */
export const ClaimRankingBody = Schema.Struct({
	email: Schema.String,
	username: Schema.String,
});

export type ClaimRankingBody = Schema.Schema.Type<typeof ClaimRankingBody>;
