import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Config, Effect, String as Str } from "effect";
import { Pool } from "pg";

interface DbScriptConfig {
	/** Script name used in error messages, e.g. "db:truncate" */
	name: string;
	/** Word the user must type to confirm, e.g. "truncate" */
	confirmWord: string;
}

/**
 * Shared lifecycle for destructive DB scripts (db:truncate, db:drop).
 * The safety guards and connection handling live here so the scripts can't
 * drift apart — each script only provides its SQL via `body`.
 */
export const runDbScript = (
	{ name, confirmWord }: DbScriptConfig,
	body: (db: NodePgDatabase) => Effect.Effect<void, Error>,
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
		 * Connect to PostgreSQL, run the script body, then release the pool —
		 * the release runs even if the body fails.
		 */
		const databaseUrl = yield* Config.string("DATABASE_URL");
		yield* Effect.acquireUseRelease(
			Effect.sync(
				() =>
					new Pool({
						connectionString: databaseUrl,
						idleTimeoutMillis: 0,
					}),
			),
			(pool) => {
				const db = drizzle({
					client: pool,
				});
				return Effect.gen(function* () {
					/**
					 * Terminate other connections so locks don't block the script
					 */
					yield* Effect.tryPromise({
						try: () =>
							db.execute(
								sql`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()`,
							),
						catch: (cause) =>
							new Error("Failed to terminate connections", {
								cause,
							}),
					});

					yield* body(db);
				});
			},
			(pool) => Effect.promise(() => pool.end()),
		);
	});
