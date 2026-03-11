import { Schema } from "effect";

export const Ranking = Schema.Struct({
	id: Schema.String,
	author: Schema.String,
	updatedAt: Schema.Date,
});

export type Ranking = Schema.Schema.Type<typeof Ranking>;
