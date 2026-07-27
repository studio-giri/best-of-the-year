import { describe, expect, test } from "bun:test";
import { coveredYears, FIRST_COVERED_YEAR } from "./coveredYears.ts";

// Instants are given in UTC, the calendar the span is read in — so these
// expectations hold whatever timezone the machine running them sits in.
describe("coveredYears", () => {
	test("runs from the current year down to the first covered year", () => {
		const years = coveredYears(new Date("2026-07-26T00:00:00.000Z"));

		expect(years[0]).toBe(2026);
		expect(years.at(-1)).toBe(FIRST_COVERED_YEAR);
		expect(years).toHaveLength(2026 - FIRST_COVERED_YEAR + 1);
	});

	test("reads newest-first, with no year missing or repeated", () => {
		const years = coveredYears(new Date("2026-07-26T00:00:00.000Z"));

		const descending = [
			...years,
		].sort((a, b) => b - a);
		expect(years).toEqual(descending);
		expect(new Set(years).size).toBe(years.length);
	});

	test("gains the new year as soon as that year has begun", () => {
		const lastMomentOfTheYear = coveredYears(
			new Date("2026-12-31T23:59:59.999Z"),
		);
		const firstMomentOfTheNext = coveredYears(
			new Date("2027-01-01T00:00:00.000Z"),
		);

		expect(lastMomentOfTheYear).not.toContain(2027);
		expect(firstMomentOfTheNext[0]).toBe(2027);
		expect(firstMomentOfTheNext).toHaveLength(lastMomentOfTheYear.length + 1);
	});

	test("never gives a year back", () => {
		const earlier = coveredYears(new Date("2026-07-26T00:00:00.000Z"));
		const later = coveredYears(new Date("2031-03-01T00:00:00.000Z"));

		for (const year of earlier) {
			expect(later).toContain(year);
		}
	});
});
