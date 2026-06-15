import { Api } from "@boty/shared/api/Api";
import { RankingNotFound } from "@boty/shared/api/rankings/RankingNotFound";
import { and, eq, isNull } from "drizzle-orm";
import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { PgDrizzle } from "../db/PgDrizzle.ts";
import { rankingItemsTable, rankingsTable } from "../db/schema.ts";

export const HttpRankingsLive = HttpApiBuilder.group(
	Api,
	"rankings",
	(handlers) =>
		handlers.handle("findById", ({ params }) =>
			Effect.gen(function* () {
				/**
				 * Fetch the ranking — params.id is a validated UUID (enforced by the contract)
				 */
				const db = yield* PgDrizzle;
				const [rankingRow] = yield* db
					.select({
						id: rankingsTable.id,
						author: rankingsTable.author,
						updatedAt: rankingsTable.updatedAt,
					})
					.from(rankingsTable)
					.where(
						and(
							eq(rankingsTable.id, params.id),
							isNull(rankingsTable.deletedAt),
						),
					)
					.pipe(Effect.orDie);

				if (!rankingRow) {
					return yield* Effect.fail(
						new RankingNotFound({
							id: params.id,
						}),
					);
				}

				/**
				 * Fetch items for the ranking
				 */
				const items = yield* db
					.select({
						id: rankingItemsTable.id,
						year: rankingItemsTable.year,
						name: rankingItemsTable.name,
					})
					.from(rankingItemsTable)
					.where(eq(rankingItemsTable.rankingId, rankingRow.id))
					.pipe(Effect.orDie);

				return {
					...rankingRow,
					items,
				};
			}),
		),
);
