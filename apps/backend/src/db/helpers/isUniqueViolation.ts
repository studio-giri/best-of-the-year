import { Cause, Option } from "effect";

/**
 * True when a drizzle query failure was caused by a PostgreSQL unique-constraint
 * violation. When `constraint` is given, narrows to a violation of THAT specific
 * constraint/index — so callers can map only the constraint they expect (e.g. the
 * username index) to a user-facing error, and let any other unique violation die
 * as the genuine defect it is.
 *
 * drizzle's Effect integration fails with an `EffectDrizzleQueryError` whose
 * `cause` is an Effect `Cause` wrapping the underlying `@effect/sql` `SqlError`.
 * That SqlError classifies the failure into a structured `reason`; a unique
 * violation surfaces as the tagged `UniqueViolation` reason carrying the violated
 * `constraint` name. We extract the SqlError from the Cause and match that tag
 * rather than chasing the raw pg error code, which is buried beneath several
 * non-enumerable wrappers.
 */
export function isUniqueViolation(
	error: {
		readonly cause: unknown;
	},
	constraint?: string,
): boolean {
	if (!Cause.isCause(error.cause)) {
		return false;
	}

	const sqlError = Cause.findErrorOption(error.cause);
	if (Option.isNone(sqlError)) {
		return false;
	}

	const reason = (
		sqlError.value as {
			reason?: {
				_tag?: string;
				constraint?: string;
			};
		}
	).reason;
	if (reason?._tag !== "UniqueViolation") {
		return false;
	}
	return constraint === undefined || reason.constraint === constraint;
}
