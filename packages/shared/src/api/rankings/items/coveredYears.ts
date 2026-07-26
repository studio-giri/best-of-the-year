/**
 * Covered Years: the span of years a Ranking can hold an Item for. It gains a
 * year as that year begins and never gives one back, so the span is derived from
 * the clock on every call rather than frozen at import — a module read once at
 * boot would keep offering the year the process started in.
 *
 * The span is read on the UTC calendar, so every side of the site agrees on
 * which year it is regardless of where it runs. A person whose local year has
 * turned but whose UTC year has not waits hours, not the week the product
 * tolerates.
 */

export const FIRST_COVERED_YEAR = 1985;

/** The covered years, newest-first — the order a Ranking is read in. */
export function coveredYears(now: Date = new Date()): number[] {
	const currentYear = now.getUTCFullYear();
	return Array.from(
		{
			length: currentYear - FIRST_COVERED_YEAR + 1,
		},
		(_, index) => currentYear - index,
	);
}
