import { afterEach, describe, expect, test } from "vitest";
import { getOwnerToken, hasOwnerToken, setOwnerToken } from "./ownerTokens.ts";

afterEach(() => {
	window.localStorage.clear();
});

describe("ownerTokens", () => {
	test("round-trips a token through localStorage", () => {
		setOwnerToken("ranking-1", "secret-token");
		expect(getOwnerToken("ranking-1")).toBe("secret-token");
		expect(hasOwnerToken("ranking-1")).toBe(true);
	});

	test("reports no access for an unknown ranking", () => {
		expect(getOwnerToken("never-claimed")).toBeUndefined();
		expect(hasOwnerToken("never-claimed")).toBe(false);
	});

	test("keeps tokens for several rankings independently", () => {
		setOwnerToken("a", "token-a");
		setOwnerToken("b", "token-b");
		expect(getOwnerToken("a")).toBe("token-a");
		expect(getOwnerToken("b")).toBe("token-b");
	});

	test("tolerates corrupt storage by reporting no access", () => {
		window.localStorage.setItem("boty:owner-tokens", "not json{");
		expect(hasOwnerToken("a")).toBe(false);
	});

	// Valid JSON of the wrong shape (e.g. tampering, or a stale format) must not
	// be trusted as a token map.
	test("rejects a map whose values are not strings", () => {
		window.localStorage.setItem(
			"boty:owner-tokens",
			JSON.stringify({
				a: 123,
			}),
		);
		expect(hasOwnerToken("a")).toBe(false);
		expect(getOwnerToken("a")).toBeUndefined();
	});
});
