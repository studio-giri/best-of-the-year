import { Schema } from "effect";

export const List = Schema.Struct({
	id: Schema.Number,
	author: Schema.String,
});

export type List = Schema.Schema.Type<typeof List>;
