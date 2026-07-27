import { type ListItems, toSaveItems } from "./listItems.ts";

/**
 * The years where a pass differs from the last-saved list. Both sides are read as
 * a commit would carry them (ADR-003), so the editor can never name unsaved work
 * a commit would leave behind — a claim nothing available to a person could clear.
 */
export function unsavedYears(pass: ListItems, baseline: ListItems): number[] {
	const passNames = namesByYear(pass);
	const baselineNames = namesByYear(baseline);

	// A year counts when the two sides disagree, which includes a year only one of
	// them holds: clearing a year that held a game is unsaved work like any other.
	const years = new Set([
		...passNames.keys(),
		...baselineNames.keys(),
	]);
	return Array.from(years).filter(
		(year) => passNames.get(year) !== baselineNames.get(year),
	);
}

// The names a commit would carry, by year — empties and spaces already dropped.
function namesByYear(listItems: ListItems) {
	return new Map(
		toSaveItems(listItems).map((item) => [
			item.year,
			item.name,
		]),
	);
}
