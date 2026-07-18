import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import type { SentMessageInfo, Transporter } from "nodemailer";
import { makeMailer } from "./Mailer.ts";

type SendMailOptions = Parameters<Transporter["sendMail"]>[0];

describe("makeMailer", () => {
	// Drive the real render + send path through a capturing fake transport: no
	// socket, no config, so the test stays hermetic (unit tests must not hit the
	// network) while asserting exactly what makeMailer hands to `sendMail`.
	const makeCapturingMailer = () => {
		const sent: SendMailOptions[] = [];
		const transporter = {
			sendMail: (options: SendMailOptions) => {
				sent.push(options);
				return Promise.resolve({} as SentMessageInfo);
			},
		} as unknown as Transporter;
		return {
			mailer: makeMailer(transporter, "Best of the Year <noreply@boty.test>"),
			sent,
		};
	};

	test("sendOwnerLink resolves to void", async () => {
		const { mailer } = makeCapturingMailer();

		const result = await mailer
			.sendOwnerLink({
				to: "someone@example.com",
				url: "http://localhost:3001/recover/raw-token",
			})
			.pipe(Effect.runPromise);

		expect(result).toBeUndefined();
	});

	test("dispatches to the recipient with the link and From address", async () => {
		const { mailer, sent } = makeCapturingMailer();

		await mailer
			.sendOwnerLink({
				to: "someone@example.com",
				url: "http://localhost:3001/recover/raw-token",
			})
			.pipe(Effect.runPromise);

		expect(sent).toHaveLength(1);
		const message = sent[0];
		expect(message?.to).toBe("someone@example.com");
		expect(message?.from).toBe("Best of the Year <noreply@boty.test>");
		expect(message?.subject).toBe("Get back into your ranking");
		// Both parts carry the recovery link.
		expect(message?.html).toContain("http://localhost:3001/recover/raw-token");
		expect(message?.text).toContain("http://localhost:3001/recover/raw-token");
	});
});
