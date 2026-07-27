import { Schema } from "effect";
import { Email } from "../../primitives/Email.schema.ts";
import type { ClaimRejectionCode } from "./ClaimRejectionCode.schema.ts";

/**
 * The trivial claim rules, shared by both sides (defense in depth + instant
 * client feedback). Each validator returns the same machine `ClaimRejectionCode`
 * the server would, so one message map renders both. `Schema.is(Email)` is pure
 * synchronous schema use — allowed on the frontend.
 *
 * Validation order is part of the contract (first failure wins), and the
 * `username_taken` rule is deliberately absent: it is only knowable at claim
 * time, so it arrives from the server response, never from these validators.
 */
export const MAX_EMAIL_LENGTH = 254;
export const MIN_USERNAME_LENGTH = 2;
export const MAX_USERNAME_LENGTH = 30;

const isEmail = Schema.is(Email);

// Return type is exactly the two email codes (a subset of ClaimRejectionCode):
// this validator only inspects the email, so an email code is all it can yield,
// while the narrow type stays assignable where the full claim code set is
// expected.
export function validateEmail(
	value: string,
): "email_empty" | "email_invalid" | undefined {
	const trimmed = value.trim();
	if (trimmed.length === 0) {
		return "email_empty";
	}
	if (trimmed.length > MAX_EMAIL_LENGTH || !isEmail(trimmed)) {
		return "email_invalid";
	}
	return undefined;
}

export function validateUsername(
	value: string,
): ClaimRejectionCode | undefined {
	const trimmed = value.trim();
	if (trimmed.length === 0) {
		return "username_empty";
	}
	if (trimmed.length < MIN_USERNAME_LENGTH) {
		return "username_too_short";
	}
	if (trimmed.length > MAX_USERNAME_LENGTH) {
		return "username_too_long";
	}
	return undefined;
}
