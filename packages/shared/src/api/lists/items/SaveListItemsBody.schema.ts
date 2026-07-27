import { Schema } from "effect";
import { MAX_ITEM_NAME_LENGTH } from "./listItemRules.ts";

/**
 * The desired end state of all of a List's Items (ADR-003): every year
 * that is to hold a game, with the name it is to hold. A year absent from `items`
 * holds no game once the write lands.
 *
 * Only the static bounds live here — a name's ceiling, and at most one entry per
 * year, the same invariant the `unique(listId, year)` index carries. Which
 * years are acceptable follows the clock, so it cannot be expressed in a schema
 * built once at import.
 */
export const SaveListItemsBody = Schema.Struct({
	items: Schema.Array(
		Schema.Struct({
			year: Schema.Int,
			name: Schema.String.pipe(
				Schema.check(Schema.isMaxLength(MAX_ITEM_NAME_LENGTH)),
			),
		}),
	).check(
		Schema.makeFilter((items) =>
			new Set(items.map((item) => item.year)).size === items.length
				? undefined
				: "a year may appear at most once",
		),
	),
});

export type SaveListItemsBody = Schema.Schema.Type<typeof SaveListItemsBody>;
