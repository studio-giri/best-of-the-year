import { describe, expect, test } from "bun:test";
import { Schema } from "effect";
import { ConsumeRecoveryResponse } from "./ConsumeRecoveryResponse.schema.ts";

describe("ConsumeRecoveryResponse", () => {
	// The response the consuming browser needs — and nothing more.
	test("carries only id and ownerToken", () => {
		expect(Object.keys(ConsumeRecoveryResponse.fields).sort()).toEqual([
			"id",
			"ownerToken",
		]);
	});

	// Recovery restores access without ever exposing the email it keyed on: the
	// schema has no email field, so an email can never ride out in the response.
	test("has no email field", () => {
		expect(ConsumeRecoveryResponse.fields).not.toHaveProperty("email");
		const decoded = Schema.decodeUnknownSync(ConsumeRecoveryResponse)({
			id: "ranking-1",
			ownerToken: "tok",
		});
		expect(decoded).not.toHaveProperty("email");
	});
});
