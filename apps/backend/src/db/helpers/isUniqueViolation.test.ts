import { describe, expect, test } from "bun:test";
import { Cause } from "effect";
import { isUniqueViolation } from "./isUniqueViolation.ts";

/**
 * Build a fake `EffectDrizzleQueryError`-shaped value: a `cause` that is an
 * Effect `Cause` wrapping an `@effect/sql` `SqlError` carrying the given
 * structured `reason`. Mirrors the shape the helper unwraps in production.
 */
function queryError(reason: unknown) {
	return {
		cause: Cause.fail({
			reason,
		}),
	};
}

describe("isUniqueViolation", () => {
	test("true for a unique violation when no constraint is required", () => {
		const error = queryError({
			_tag: "UniqueViolation",
			constraint: "rankings_username_lower_trim_unique",
		});
		expect(isUniqueViolation(error)).toBe(true);
	});

	test("true when the violated constraint matches the requested one", () => {
		const error = queryError({
			_tag: "UniqueViolation",
			constraint: "rankings_username_lower_trim_unique",
		});
		expect(
			isUniqueViolation(error, "rankings_username_lower_trim_unique"),
		).toBe(true);
	});

	test("false when a different constraint was violated", () => {
		const error = queryError({
			_tag: "UniqueViolation",
			constraint: "rankings_email_unique",
		});
		expect(
			isUniqueViolation(error, "rankings_username_lower_trim_unique"),
		).toBe(false);
	});

	test("false for a non-unique constraint failure", () => {
		const error = queryError({
			_tag: "ConstraintError",
		});
		expect(isUniqueViolation(error)).toBe(false);
		expect(
			isUniqueViolation(error, "rankings_username_lower_trim_unique"),
		).toBe(false);
	});

	test("false when the cause is not an Effect Cause", () => {
		expect(
			isUniqueViolation({
				cause: new Error("boom"),
			}),
		).toBe(false);
	});
});
