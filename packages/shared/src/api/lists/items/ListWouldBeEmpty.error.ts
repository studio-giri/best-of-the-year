import { Schema } from "effect";

/**
 * A write would have left the List holding no games at all, and was refused
 * whole — nothing it carried was written. It carries nothing to point at: the
 * write as a whole is at fault, not any one year of it.
 *
 * Served as HTTP 422: the request is well-formed, and no retry of it can be
 * accepted until it names a game.
 */
export class ListWouldBeEmpty extends Schema.TaggedErrorClass<ListWouldBeEmpty>()(
	"ListWouldBeEmpty",
	{},
) {}
