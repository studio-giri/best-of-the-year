import { Schema } from "effect";

export const RankingItem = Schema.Struct({
	id: Schema.String,
	year: Schema.Number,
	name: Schema.String,
});

export type RankingItem = Schema.Schema.Type<typeof RankingItem>;

export const Ranking = Schema.Struct({
	id: Schema.String,
	author: Schema.String,
	updatedAt: Schema.DateFromString,
	items: Schema.Array(RankingItem),
});

export type Ranking = Schema.Schema.Type<typeof Ranking>;
