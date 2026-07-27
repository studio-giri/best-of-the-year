import { Schema } from "effect";

export const ListItem = Schema.Struct({
	id: Schema.String,
	year: Schema.Number,
	name: Schema.String,
});

export type ListItem = Schema.Schema.Type<typeof ListItem>;

export const List = Schema.Struct({
	id: Schema.String,
	username: Schema.String,
	updatedAt: Schema.DateFromString,
	items: Schema.Array(ListItem),
});

export type List = Schema.Schema.Type<typeof List>;
