import { Schema } from "effect";

/**
 * Recovery-request payload — deliberately a permissive plain string, same
 * rationale as `ClaimRankingBody`: the handler owns validation order and
 * messaging so it can return a precise reason code (`email_empty` /
 * `email_invalid`) rather than a generic decode error. The client mirrors the
 * same trivial rule for instant feedback.
 */
export const RequestRecoveryBody = Schema.Struct({
	email: Schema.String,
});

export type RequestRecoveryBody = Schema.Schema.Type<
	typeof RequestRecoveryBody
>;
