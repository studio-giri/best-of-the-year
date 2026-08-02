import type { List } from "@boty/shared/api/lists/List.schema";
import { type ListItems, toListItems } from "./listItems.ts";

/**
 * What the editor's fields hold once a commit is answered: the stored list, which
 * is the truth everyone else reads, except for the years named in `keepYears` —
 * those keep what is in the field, so no answer lands on top of typing it never
 * carried.
 */
export function mergeSavedList({
	fields,
	saved,
	keepYears,
}: {
	fields: ListItems;
	saved: List["items"];
	keepYears: ReadonlySet<number>;
}): ListItems {
	const merged = toListItems(saved);

	// A kept year that the answer does not hold still keeps its field, empty or not.
	for (const year of keepYears) {
		merged[year] = fields[year] ?? "";
	}
	return merged;
}
