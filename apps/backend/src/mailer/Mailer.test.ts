import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { Mailer } from "./Mailer.ts";

describe("Mailer.Live (logging layer)", () => {
	// The default layer just logs; the contract we depend on is that a send is a
	// well-typed Effect<void> that succeeds, so a handler can `yield*` it and move on.
	test("sendOwnerLink resolves to void", async () => {
		const result = await Effect.gen(function* () {
			const mailer = yield* Mailer;
			return yield* mailer.sendOwnerLink({
				to: "someone@example.com",
				url: "http://localhost:3001/recover/raw-token",
			});
		}).pipe(Effect.provide(Mailer.Live), Effect.runPromise);

		expect(result).toBeUndefined();
	});
});
