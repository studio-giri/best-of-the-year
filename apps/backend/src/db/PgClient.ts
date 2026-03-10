import { PgClient } from "@effect/sql-pg";
import { Effect, Layer, Redacted } from "effect";
import { types } from "pg";
import { Env } from "../env.js";

export const PgClientLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		/**
		 * Retrieve database URL
		 */
		const { databaseUrl } = yield* Env;
		const databaseUrlString = Redacted.make(databaseUrl.toString());

		/**
		 * PostGresql runtime Client
		 */
		return PgClient.layer({
			url: databaseUrlString,
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
	}),
);
