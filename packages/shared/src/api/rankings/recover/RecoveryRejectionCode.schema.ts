import { Schema } from "effect";

/**
 * The closed set of machine-readable reasons a recovery request can be refused.
 *
 * Recovery keys on email alone. `email_empty` / `email_invalid` reuse the exact
 * `validateEmail` rule and wording the claim flow uses, so those codes render
 * identically on both sides (one message definition, shared client-side).
 * `email_unknown` — no ranking backs the email — is refused the same way: it
 * means the address is mistyped, a correctable input error the person fixes in
 * place.
 */
export const RecoveryRejectionCode = Schema.Literals([
	"email_empty",
	"email_invalid",
	"email_unknown",
]);

export type RecoveryRejectionCode = Schema.Schema.Type<
	typeof RecoveryRejectionCode
>;
