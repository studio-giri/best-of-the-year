import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { HttpApiBuilder, HttpServer } from "@effect/platform";
import {
	type PgDrizzle,
	layer as PgDrizzleLayer,
} from "@effect/sql-drizzle/Pg";
import { Effect, Layer, Redacted } from "effect";
import { Pool } from "pg";
import { makePgClientLayer } from "../../src/db/PgClient.ts";
import { HttpApiHandlersLive } from "../../src/http.ts";

const MIGRATIONS_DIR = join(import.meta.dir, "../../drizzle");

/**
 * Spin up a fully isolated test environment for one test suite.
 *
 * Each call creates a brand-new PostgreSQL schema, runs all Drizzle migrations
 * into it, wires up the Effect HTTP app against that schema, and returns a
 * fetch-compatible handler plus helpers for seeding/asserting DB state.
 *
 * Isolation guarantee: because every suite gets its own schema, test suites can
 * run in parallel without interfering with each other or the development database.
 */
export async function makeTestCtx() {
	// biome-ignore lint/complexity/useLiteralKeys: noPropertyAccessFromIndexSignature requires bracket notation
	const databaseUrl = process.env["DATABASE_URL"];
	if (!databaseUrl) throw new Error("DATABASE_URL is not set");

	/**
	 * Generate a unique schema name for this suite so parallel runs never share
	 * tables. UUIDs contain hyphens which are not valid in unquoted identifiers,
	 * so we strip them before embedding in the name.
	 */
	const schemaName = `test_${randomUUID().replace(/-/g, "")}`;

	/**
	 * Create the isolated schema and run all migrations into it via a temporary
	 * raw pg connection. We use a raw Pool here (not the Effect layer) because
	 * this setup runs before the Effect runtime exists. Migration files are applied
	 * in alphabetical order, which matches Drizzle's own ordering convention.
	 */
	const setupPool = new Pool({
		connectionString: databaseUrl,
	});
	const client = await setupPool.connect();
	try {
		await client.query(`CREATE SCHEMA "${schemaName}"`);
		await client.query(`SET search_path = "${schemaName}", public`);
		const sqlFiles = readdirSync(MIGRATIONS_DIR)
			.filter((f) => f.endsWith(".sql"))
			.sort();
		for (const file of sqlFiles) {
			await client.query(readFileSync(join(MIGRATIONS_DIR, file), "utf-8"));
		}
	} finally {
		// Always release the client and close the pool, even if migrations fail,
		// so we don't leave dangling connections.
		client.release();
		await setupPool.end();
	}

	/**
	 * Build a DB Layer that always routes queries to the isolated schema. We
	 * encode the schema as a `search_path` connection option in the URL so that
	 * every connection opened by the Effect pool inherits it automatically —
	 * no need to SET search_path manually on each query.
	 */
	const testUrl = new URL(databaseUrl);
	if (testUrl.searchParams.get("options")) {
		throw new Error("Database URL already have options");
	}
	testUrl.searchParams.set("options", `-c search_path=${schemaName},public`);
	const TestDbLive = makePgClientLayer(Redacted.make(testUrl.toString()));

	/**
	 * Assemble the full application Layer: provide the test DB layer to all
	 * handlers, then add HttpServer.layerContext so the Layer has everything it
	 * needs to handle requests (request/response context, etc.).
	 */
	const TestAppLayer = Layer.mergeAll(
		HttpApiHandlersLive.pipe(
			Layer.provide(PgDrizzleLayer),
			Layer.provide(TestDbLive),
		),
		HttpServer.layerContext,
	);

	/**
	 * Convert the Effect Layer into a plain fetch-compatible handler. `app.handler`
	 * accepts a standard Request and returns a Response, so tests can call it
	 * directly without spinning up a real HTTP server.
	 */
	const app = HttpApiBuilder.toWebHandler(TestAppLayer);

	/**
	 * Helper that lets tests run arbitrary Drizzle effects against the isolated
	 * schema — useful for seeding rows before a request or asserting DB state
	 * after one. Wires the same DB layer used by the app so both share the same
	 * schema context.
	 */
	const runDb = <A, E>(effect: Effect.Effect<A, E, PgDrizzle>) =>
		effect.pipe(
			Effect.provide(PgDrizzleLayer),
			Effect.provide(TestDbLive),
			Effect.runPromise,
		);

	/**
	 * Tear down everything created by this function: dispose the HTTP handler
	 * (closes its internal connection pool), then drop the isolated schema and
	 * all its tables in one CASCADE so nothing lingers in the database.
	 *
	 * We use a raw Pool here (not the Effect layer) for the same reason as
	 * setup: the Effect runtime has already been torn down at this point.
	 */
	const cleanup = async () => {
		await app.dispose();
		const teardownPool = new Pool({
			connectionString: databaseUrl,
		});
		await teardownPool.query(`DROP SCHEMA "${schemaName}" CASCADE`);
		await teardownPool.end();
	};

	return {
		handler: app.handler,
		runDb,
		cleanup,
	};
}
