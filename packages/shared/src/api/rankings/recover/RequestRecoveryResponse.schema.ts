import { Schema } from "effect";

/**
 * The successful answer to a recovery request (HTTP 200): a ranking backs the
 * email, so a recovery link was created and emailed. The body carries neither
 * the submitted email nor the raw token — the token travels only in the email.
 * Every other case (bad or unknown email) is a `RecoveryRejected` 422.
 */
export const RequestRecoveryResponse = Schema.Struct({
	outcome: Schema.Literal("sent"),
});

export type RequestRecoveryResponse = Schema.Schema.Type<
	typeof RequestRecoveryResponse
>;
