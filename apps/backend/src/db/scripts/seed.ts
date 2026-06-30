import { BunRuntime } from "@effect/platform-bun";
import { Console, Effect, Layer } from "effect";
import { Env } from "../../env.ts";
import { PgClientLive } from "../PgClient.ts";
import { PgDrizzle, PgDrizzleLive } from "../PgDrizzle.ts";
import { rankingItemsTable } from "../schema/ranking-items.table.ts";
import { rankingsTable } from "../schema/rankings.table.ts";
import { rankingItems, rankings } from "./seed-values.ts";

/**
 * The same Effect/sql-pg stack the app uses: PgDrizzle on top of PgClient,
 * configured from the redacted Env. The PgClient layer owns the connection
 * lifecycle, so there is no manual pool to open or release here.
 */
const DbLive = PgDrizzleLive.pipe(
	Layer.provide(PgClientLive),
	Layer.provide(Env.Live),
);

const program = Effect.gen(function* () {
	const db = yield* PgDrizzle;

	/**
	 * Insert seed rankings and their items
	 */
	yield* db.insert(rankingsTable).values(rankings);
	yield* db.insert(rankingItemsTable).values(rankingItems);

	yield* Console.info("Seed successful");
});

BunRuntime.runMain(program.pipe(Effect.provide(DbLive)));
