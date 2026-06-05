import { Schema } from "effect";

export class RankingNotFound extends Schema.TaggedErrorClass<RankingNotFound>()(
	"RankingNotFound",
	{
		id: Schema.String,
	},
) {}
