import { Schema } from "effect";

/**
 * Recovery-request payload — deliberately permissive plain strings, same
 * rationale as `ClaimRankingBody`: the handler owns validation order and
 * messaging so it can return a precise reason code (`email_empty` /
 * `email_invalid`) rather than a generic decode error. The client mirrors the
 * same trivial rule for instant feedback.
 *
 * `language` is the reader's current Language, carried so the recovery email
 * matches what they're reading. It is a lenient optional string, not the strict
 * `Language` literal, for the same reason `email` is permissive: the handler
 * coerces it (falling back to English), so a malformed or absent value can
 * never turn recovery — the lockout safety net — into a 422 decode error.
 */
export const RequestRecoveryBody = Schema.Struct({
	email: Schema.String,
	language: Schema.optional(Schema.String),
});

export type RequestRecoveryBody = Schema.Schema.Type<
	typeof RequestRecoveryBody
>;
