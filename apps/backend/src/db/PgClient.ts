import { PgClient } from "@effect/sql-pg";
import { Effect, Layer, Redacted } from "effect";
import { types } from "pg";
import { Env } from "../env.js";

/**
 * Build a PgClient Layer for a given database URL. Accepting the URL as an
 * argument lets callers (server and test setup) inject different connection
 * strings without duplicating the type-parser configuration.
 */
export const makePgClientLayer = (url: Redacted.Redacted<string>) =>
	PgClient.layer({
		url,
		types: {
			getTypeParser: (typeId, format) => {
				// Return raw values for date/time types to let Drizzle handle parsing
				if (
					[
						1184, // date
						1114, // timestamp
						1082, // timestamptz
						1186, // interval
						1231, // numeric[]
						1115, // timestamp[]
						1185, // timestamptz[]
						1187, // interval[]
						1182, // date[]
					].includes(typeId)
				) {
					// biome-ignore lint/suspicious/noExplicitAny: raw wire protocol value has no type info; returned as-is for Drizzle to parse downstream
					return (val: any) => val;
				}
				return types.getTypeParser(typeId, format);
			},
		},
	});

export const PgClientLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		/**
		 * Resolve the database URL from the environment and build the PgClient layer
		 */
		const { databaseUrl } = yield* Env;
		return makePgClientLayer(Redacted.make(databaseUrl.toString()));
	}),
);
