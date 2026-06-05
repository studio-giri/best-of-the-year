import type { PgClient } from "@effect/sql-pg/PgClient";
import {
	type EffectPgDatabase,
	makeWithDefaults,
} from "drizzle-orm/effect-postgres";
import { Context, Layer } from "effect";
import * as schema from "./schema.ts";

type SchemaDb = EffectPgDatabase<typeof schema.relations> & {
	$client: PgClient;
};

export class PgDrizzle extends Context.Service<PgDrizzle, SchemaDb>()(
	"PgDrizzle",
) {}

/**
 * drizzle v1's first-party Effect integration. `makeWithDefaults` reads the
 * PgClient from context (provided upstream by PgClientLive / TestDbLive) and
 * comes with the default no-op logger and cache services pre-provided.
 */
export const PgDrizzleLive = Layer.effect(
	PgDrizzle,
	makeWithDefaults({
		relations: schema.relations,
	}),
);
