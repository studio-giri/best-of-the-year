import { Schema } from "effect";

/**
 * A write would have left the Ranking holding no games at all, and was refused
 * whole — nothing it carried was written. It carries nothing to point at: the
 * list as a whole is what is at fault, not any one year of it.
 *
 * Served as HTTP 422: the request is well-formed, and no retry of it can be
 * accepted until it names a game.
 */
export class RankingWouldBeEmpty extends Schema.TaggedErrorClass<RankingWouldBeEmpty>()(
	"RankingWouldBeEmpty",
	{},
) {}
