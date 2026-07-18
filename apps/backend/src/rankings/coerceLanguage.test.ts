import { describe, expect, test } from "bun:test";
import { coerceLanguage } from "./coerceLanguage.ts";

describe("coerceLanguage", () => {
	// A supported code passes straight through.
	test("keeps a supported Language", () => {
		expect(coerceLanguage("en")).toBe("en");
		expect(coerceLanguage("fr")).toBe("fr");
	});

	// Anything absent or unrecognized falls back to English, so a bad value can
	// never fail a recovery request.
	const fallbackCases: ReadonlyArray<
		[
			string | undefined,
			string,
		]
	> = [
		[
			undefined,
			"absent",
		],
		[
			"",
			"empty",
		],
		[
			"de",
			"unsupported language",
		],
		[
			"EN",
			"wrong case",
		],
		[
			"en-US",
			"regional tag",
		],
		[
			"nonsense",
			"garbage",
		],
	];
	test.each(fallbackCases)("falls back to en for %p (%s)", (raw) => {
		expect(coerceLanguage(raw)).toBe("en");
	});
});
