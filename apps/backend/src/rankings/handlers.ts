import { HttpApiBuilder } from "@effect/platform";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Api } from "../api.ts";
import { rankingsTable } from "../db/schema.ts";
import { RankingNotFound } from "./errors.ts";

export const HttpRankingsLive = HttpApiBuilder.group(
	Api,
	"rankings",
	(handlers) =>
		handlers.handle("findById", ({ path }) =>
			Effect.gen(function* () {
				/**
				 * Validate UUID format — invalid IDs are treated as not found (404)
				 */
				const id = yield* Schema.decode(Schema.UUID)(path.id).pipe(
					Effect.mapError(
						() =>
							new RankingNotFound({
								id: path.id,
							}),
					),
				);

				/**
				 * Fetch the ranking by id, excluding soft-deleted records
				 */
				const db = yield* PgDrizzle;
				const [ranking] = yield* db
					.select({
						id: rankingsTable.id,
						author: rankingsTable.author,
						updatedAt: rankingsTable.updatedAt,
					})
					.from(rankingsTable)
					.where(and(eq(rankingsTable.id, id), isNull(rankingsTable.deletedAt)))
					.pipe(Effect.orDie);

				if (!ranking) {
					return yield* Effect.fail(
						new RankingNotFound({
							id,
						}),
					);
				}

				return ranking;
			}),
		),
);
