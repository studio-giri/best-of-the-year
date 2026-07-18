import { renderOwnerLink } from "@boty/emails/index";
import { Config, Context, Effect, Layer, Option, Redacted } from "effect";
import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";

export interface SendOwnerLinkArgs {
	readonly to: string;
	readonly url: string;
}

interface MailerShape {
	readonly sendOwnerLink: (args: SendOwnerLinkArgs) => Effect.Effect<void>;
}

/** Subject line of the Owner recovery email (S-001-02). */
const OWNER_LINK_SUBJECT = "Get back into your ranking";

/**
 * Build the Mailer service around a ready nodemailer transport and a From
 * address. Factored out of `Live` so a test can drive the exact same render +
 * send path through an in-memory transport (`jsonTransport`) — no socket, no
 * config — see Mailer.test.ts.
 */
export function makeMailer(
	transporter: Transporter,
	from: string,
): MailerShape {
	return {
		sendOwnerLink: ({ to, url }) =>
			Effect.gen(function* () {
				// One react-email template, rendered to both an HTML body and a
				// plain-text fallback so clients that strip HTML still get the link.
				const { html, text } = yield* Effect.promise(() =>
					renderOwnerLink({
						url,
					}),
				);
				// A send failure is an infrastructure fault, not a domain outcome:
				// die (→ 500), the same way the recovery handler treats DB errors.
				yield* Effect.tryPromise(() =>
					transporter.sendMail({
						from,
						to,
						subject: OWNER_LINK_SUBJECT,
						html,
						text,
					}),
				).pipe(Effect.orDie);
			}),
	};
}

/**
 * Email delivery seam (ADR-001). Handlers depend on this interface, never a
 * concrete provider, so the send is mockable: tests provide a capturing layer
 * and assert the recipient and link URL.
 */
export class Mailer extends Context.Service<Mailer, MailerShape>()("Mailer") {
	/**
	 * Default layer: dispatch over SMTP via nodemailer. Config is read here
	 * (rather than from the shared `Env` service) so the layer stays
	 * dependency-free and `server.ts` wiring is unchanged. Locally this points at
	 * Mailpit (host `localhost`, port `1025`, no auth); in production at a real
	 * SMTP provider.
	 */
	static readonly Live = Layer.effect(
		Mailer,
		Effect.gen(function* () {
			const host = yield* Config.string("SMTP_HOST");
			const port = yield* Config.number("SMTP_PORT");
			const from = yield* Config.string("MAIL_FROM");

			// Auth is optional: Mailpit accepts unauthenticated SMTP, so only attach
			// credentials when both are configured. Redacted so they never log.
			const user = yield* Config.option(Config.redacted("SMTP_USER"));
			const pass = yield* Config.option(Config.redacted("SMTP_PASS"));
			const auth =
				Option.isSome(user) && Option.isSome(pass)
					? {
							user: Redacted.value(user.value),
							pass: Redacted.value(pass.value),
						}
					: undefined;

			const transporter = nodemailer.createTransport({
				host,
				port,
				// Implicit TLS is port 465; 587/1025 negotiate STARTTLS instead.
				secure: port === 465,
				auth,
			});

			return makeMailer(transporter, from);
		}),
	);
}
