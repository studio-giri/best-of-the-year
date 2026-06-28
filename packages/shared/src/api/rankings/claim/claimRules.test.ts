import { describe, expect, test } from "bun:test";
import { validateEmail, validateUsername } from "./claimRules.ts";

describe("validateEmail", () => {
	// AC7
	test.each([
		"",
		"   ",
	])("flags %p as email_empty", (value) => {
		expect(validateEmail(value)).toBe("email_empty");
	});

	// AC6
	test.each([
		"foo@",
		"no-at-sign",
		`${"a".repeat(250)}@b.com`,
	])("flags %p as email_invalid", (value) => {
		expect(validateEmail(value)).toBe("email_invalid");
	});

	test("accepts a well-formed email", () => {
		expect(validateEmail("me@example.com")).toBeUndefined();
	});
});

describe("validateUsername", () => {
	// AC9
	test.each([
		"",
		"   ",
	])("flags %p as username_empty", (value) => {
		expect(validateUsername(value)).toBe("username_empty");
	});

	// AC10
	test("flags a trimmed length < 2 as username_too_short", () => {
		expect(validateUsername(" a ")).toBe("username_too_short");
	});

	test("flags a trimmed length > 30 as username_too_long", () => {
		expect(validateUsername(`  ${"x".repeat(31)}  `)).toBe("username_too_long");
	});

	test("accepts a 2..30 char username after trimming", () => {
		expect(validateUsername("  Paulin ")).toBeUndefined();
	});
});
