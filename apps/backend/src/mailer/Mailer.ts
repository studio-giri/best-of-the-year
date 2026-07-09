import { Context, Effect, Layer } from "effect";

export interface SendOwnerLinkArgs {
	readonly to: string;
	readonly url: string;
}

interface MailerShape {
	readonly sendOwnerLink: (args: SendOwnerLinkArgs) => Effect.Effect<void>;
}

/**
 * Email delivery seam (ADR-001). Handlers depend on this interface, never a
 * concrete provider, so the send is mockable: tests provide a capturing layer
 * and assert the recipient and link URL.
 */
export class Mailer extends Context.Service<Mailer, MailerShape>()("Mailer") {
	/**
	 * Default layer: log the send rather than dispatch a real email. A
	 * real-provider layer (and its `env.ts` config) is deferred — see ROADMAP.
	 */
	static readonly Live = Layer.succeed(Mailer, {
		sendOwnerLink: ({ to, url }) =>
			Effect.log(`Dispatching owner recovery link to ${to}: ${url}`),
	});
}
