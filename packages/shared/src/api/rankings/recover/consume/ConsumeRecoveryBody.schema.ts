import { Schema } from "effect";

/**
 * Consume-recovery payload — the raw recovery token, carried in the POST body
 * rather than the URL so the secret never lands in the backend's access logs.
 * Deliberately a permissive plain string, same rationale as the other bodies:
 * the handler owns validity (hashing and lookup), so a malformed value resolves
 * to a rejection there rather than a decode error here.
 */
export const ConsumeRecoveryBody = Schema.Struct({
	token: Schema.String,
});

export type ConsumeRecoveryBody = Schema.Schema.Type<
	typeof ConsumeRecoveryBody
>;
