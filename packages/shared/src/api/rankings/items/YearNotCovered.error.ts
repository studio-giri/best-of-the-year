import { Schema } from "effect";

/**
 * A write named a year outside Covered Years, and was refused whole — nothing it
 * carried was written. Carries the offending year so a client can point at it.
 *
 * Served as HTTP 422: the request is well-formed, and no retry of it can be
 * accepted, since the span is not negotiable.
 */
export class YearNotCovered extends Schema.TaggedErrorClass<YearNotCovered>()(
	"YearNotCovered",
	{
		year: Schema.Number,
	},
) {}
