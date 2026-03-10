import { Config, Context, Effect, Layer } from "effect";

interface EnvShape {
	readonly databaseUrl: URL;
}

export class Env extends Context.Tag("Env")<Env, EnvShape>() {
	static readonly Live = Layer.effect(
		Env,
		Effect.gen(function* () {
			const databaseUrl = yield* Config.url("DATABASE_URL");
			return {
				databaseUrl,
			};
		}),
	);
}
