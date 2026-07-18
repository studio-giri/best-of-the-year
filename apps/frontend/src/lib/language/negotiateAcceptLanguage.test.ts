import { describe, expect, test } from "vitest";
import {
	negotiateAcceptLanguage,
	parseAcceptLanguage,
} from "./negotiateAcceptLanguage.ts";

describe("parseAcceptLanguage", () => {
	// Tags come back ordered by descending q-weight, with q=0 dropped.
	test("orders tags by descending quality and drops q=0", () => {
		expect(parseAcceptLanguage("en;q=0.5, fr, de;q=0")).toEqual([
			"fr",
			"en",
		]);
	});

	// A missing or empty header yields no preferences.
	test.each([
		null,
		undefined,
		"",
	])("returns [] for %p", (header) => {
		expect(parseAcceptLanguage(header)).toEqual([]);
	});
});

describe("negotiateAcceptLanguage", () => {
	const cases: ReadonlyArray<
		[
			string | null | undefined,
			"en" | "fr",
			string,
		]
	> = [
		[
			"fr",
			"fr",
			"exact French",
		],
		[
			"fr-CA,fr;q=0.9,en;q=0.5",
			"fr",
			"regional French, French preferred",
		],
		[
			"en-US,en;q=0.9",
			"en",
			"English",
		],
		[
			"fr;q=0.8, en;q=0.9",
			"en",
			"English outweighs French",
		],
		[
			"de, es;q=0.9",
			"en",
			"no supported language → English",
		],
		[
			null,
			"en",
			"no header → English",
		],
		[
			"",
			"en",
			"empty header → English",
		],
	];
	test.each(cases)("resolves %p to %s (%s)", (header, expected) => {
		expect(negotiateAcceptLanguage(header)).toBe(expected);
	});
});
