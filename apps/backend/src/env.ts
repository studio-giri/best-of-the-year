import { Config, Context, Effect, Layer, Redacted } from "effect";

interface EnvShape {
	readonly databaseUrl: Redacted.Redacted<string>;
	readonly appBaseUrl: string;
}

export class Env extends Context.Service<Env, EnvShape>()("Env") {
	static readonly Live = Layer.effect(
		Env,
		Effect.gen(function* () {
			/**
			 * Read the connection string redacted-from-birth: the secret can never
			 * be logged or inspected; reaching it requires an explicit (greppable)
			 * Redacted.value call.
			 */
			const databaseUrl = yield* Config.redacted("DATABASE_URL");

			/**
			 * Fail fast on malformed URLs at startup, without storing — or echoing
			 * in the error — the raw value (it carries the password)
			 */
			yield* Effect.try({
				try: () => new URL(Redacted.value(databaseUrl)),
				catch: () => new Error("DATABASE_URL is not a valid URL"),
			});

			/**
			 * Frontend origin the backend prepends to emailed recovery links. Plain
			 * (not redacted): it is a public URL, never a secret, and it is embedded
			 * verbatim into user-facing links.
			 */
			const appBaseUrl = yield* Config.string("APP_BASE_URL");

			return {
				databaseUrl,
				appBaseUrl,
			};
		}),
	);
}
