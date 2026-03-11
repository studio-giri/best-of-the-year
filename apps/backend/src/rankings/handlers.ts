import { HttpApiBuilder } from "@effect/platform";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Effect } from "effect";
import { Api } from "../api.ts";
import { rankingsTable } from "../db/schema.ts";
import { RankingNotFound } from "./errors.ts";

export const HttpRankingsLive = HttpApiBuilder.group(
	Api,
	"rankings",
	(handlers) =>
		handlers.handle("findById", ({ path }) =>
			Effect.gen(function* () {
				const db = yield* PgDrizzle;

				/**
				 * Fetch the ranking by id, excluding soft-deleted records
				 */
				const [ranking] = yield* db
					.select({
						id: rankingsTable.id,
						author: rankingsTable.author,
						updatedAt: rankingsTable.updatedAt,
					})
					.from(rankingsTable)
					.where(
						and(eq(rankingsTable.id, path.id), isNull(rankingsTable.deletedAt)),
					)
					.pipe(Effect.orDie);

				if (!ranking) {
					return yield* Effect.fail(
						new RankingNotFound({
							id: path.id,
						}),
					);
				}

				return ranking;
			}),
		),
);
