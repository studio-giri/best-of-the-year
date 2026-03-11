import { Schema } from "effect";

export class RankingNotFound extends Schema.TaggedError<RankingNotFound>()(
	"RankingNotFound",
	{
		id: Schema.String,
	},
) {}
