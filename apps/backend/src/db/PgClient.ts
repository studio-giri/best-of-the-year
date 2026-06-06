import { PgClient } from "@effect/sql-pg";
import { Effect, Layer, type Redacted } from "effect";
import { Env } from "../env.js";

/**
 * Build a PgClient Layer for a given database URL. Accepting the URL as an
 * argument lets callers (server and test setup) inject different connection
 * strings without duplicating configuration.
 *
 * Note: no custom pg type parsers here — drizzle's effect-postgres
 * integration applies its own codecs (effectPgCodecs) to normalize
 * date/timestamp values.
 */
export const makePgClientLayer = (url: Redacted.Redacted<string>) =>
	PgClient.layer({
		url,
	});

export const PgClientLive = Layer.unwrap(
	Effect.gen(function* () {
		/**
		 * Resolve the database URL from the environment and build the PgClient layer
		 */
		const { databaseUrl } = yield* Env;
		return makePgClientLayer(databaseUrl);
	}),
);
