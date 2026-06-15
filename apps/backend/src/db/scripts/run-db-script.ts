import { sql } from "drizzle-orm";
import { Config, Effect, Layer, String as Str } from "effect";
import { Env } from "../../env.ts";
import { PgClientLive } from "../PgClient.ts";
import { PgDrizzle, PgDrizzleLive } from "../PgDrizzle.ts";

interface DbScriptConfig {
	/** Script name used in error messages, e.g. "db:truncate" */
	name: string;
	/** Word the user must type to confirm, e.g. "truncate" */
	confirmWord: string;
}

/**
 * The same Effect/sql-pg stack the app uses (PgDrizzle on PgClient, configured
 * from the redacted Env). The PgClient layer owns the connection lifecycle, so
 * the scripts no longer open or release a raw pool of their own.
 */
const DbLive = PgDrizzleLive.pipe(
	Layer.provide(PgClientLive),
	Layer.provide(Env.Live),
);

/**
 * Shared lifecycle for destructive DB scripts (db:truncate, db:drop).
 * The safety guards live here so the scripts can't drift apart — each script
 * only provides its SQL via `body`, which reads the PgDrizzle service from
 * context (provided here, only after the guards pass).
 */
export const runDbScript = <E>(
	{ name, confirmWord }: DbScriptConfig,
	body: Effect.Effect<void, E, PgDrizzle>,
) =>
	Effect.gen(function* () {
		/**
		 * Refuse to run in production
		 */
		const nodeEnv = yield* Config.withDefault(
			Config.string("NODE_ENV"),
			"development",
		);
		if (nodeEnv === "production" || nodeEnv === "prod") {
			yield* Effect.fail(new Error(`${name} cannot be run in production`));
		}

		/**
		 * User confirmation
		 */
		const confirmation = yield* Effect.sync(() =>
			prompt(`Type "${confirmWord}" to confirm (ENV=${nodeEnv}):`),
		);
		if (confirmation !== confirmWord) {
			yield* Effect.fail(new Error(`${Str.capitalize(confirmWord)} cancelled`));
		}

		/**
		 * Connect (only now, after the guards), terminate other connections so
		 * locks don't block the script, then run the body. DbLive is provided
		 * here so the connection pool is acquired and released around just this
		 * block.
		 */
		yield* Effect.gen(function* () {
			const db = yield* PgDrizzle;
			yield* db.execute(
				sql`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()`,
			);
			yield* body;
		}).pipe(Effect.provide(DbLive));
	});
