import type { EditAccessDenied } from "@boty/shared/api/rankings/EditAccessDenied.error";
import { FIRST_COVERED_YEAR } from "@boty/shared/api/rankings/items/coveredYears";
import { RankingWouldBeEmpty } from "@boty/shared/api/rankings/items/RankingWouldBeEmpty.error";
import type { SaveRankingItemsBody } from "@boty/shared/api/rankings/items/SaveRankingItemsBody.schema";
import { YearNotCovered } from "@boty/shared/api/rankings/items/YearNotCovered.error";
import type { Ranking } from "@boty/shared/api/rankings/Ranking.schema";
import type { RankingNotFound } from "@boty/shared/api/rankings/RankingNotFound.error";
import { and, eq, notInArray, sql } from "drizzle-orm";
import { Clock, Effect } from "effect";
import { PgDrizzle } from "../../db/PgDrizzle.ts";
import { rankingItemsTable } from "../../db/schema/ranking-items.table.ts";
import { rankingsTable } from "../../db/schema/rankings.table.ts";
import { findRankingById } from "../find/findRankingById.handler.ts";
import { resolveOwnedRanking } from "../ownerToken.service.ts";

/**
 * How far past the current year a commit may reach. A browser that has
 * already turned the year over is accepted rather than corrected (ADR-003).
 */
const CLOCK_TOLERANCE_YEARS = 1;

/**
 * Replace a Ranking's whole list of Items: years named are upserted, years absent
 * are removed, and the Ranking's own row is stamped, all three in one transaction.
 *
 * All checks are run first, ahead of the transaction, to avoid no partial write.
 */
export function saveRankingItems(args: {
	rankingId: string;
	authorization: string | undefined;
	body: SaveRankingItemsBody;
}): Effect.Effect<
	Ranking,
	RankingNotFound | EditAccessDenied | YearNotCovered | RankingWouldBeEmpty,
	PgDrizzle
> {
	return Effect.gen(function* () {
		// Check ownership
		yield* resolveOwnedRanking(args.rankingId, args.authorization);

		// Refuse a pass that would publish no games at all.
		if (args.body.items.length === 0) {
			return yield* Effect.fail(new RankingWouldBeEmpty());
		}

		// If a year is outside the allowed coverage, reject
		const now = yield* Clock.currentTimeMillis;
		const lastAcceptedYear =
			new Date(now).getUTCFullYear() + CLOCK_TOLERANCE_YEARS;
		const yearOutsideSpan = args.body.items.find(
			(item) => item.year < FIRST_COVERED_YEAR || item.year > lastAcceptedYear,
		);
		if (yearOutsideSpan) {
			return yield* Effect.fail(
				new YearNotCovered({
					year: yearOutsideSpan.year,
				}),
			);
		}

		// Land the pass as a unit.
		// `$onUpdate` is set here explicitly so all records hold same date, for consistency.
		const db = yield* PgDrizzle;
		const updatedAt = new Date(now);
		const namedYears = args.body.items.map((item) => item.year);
		yield* db
			.transaction((tx) =>
				Effect.gen(function* () {
					// Upsert items
					yield* tx
						.insert(rankingItemsTable)
						.values(
							args.body.items.map((item) => ({
								rankingId: args.rankingId,
								year: item.year,
								name: item.name,
								createdAt: updatedAt,
								updatedAt,
							})),
						)
						.onConflictDoUpdate({
							target: [
								rankingItemsTable.rankingId,
								rankingItemsTable.year,
							],
							set: {
								name: sql`excluded.name`,
								updatedAt,
							},
						});

					// Delete removed items
					yield* tx
						.delete(rankingItemsTable)
						.where(
							and(
								eq(rankingItemsTable.rankingId, args.rankingId),
								notInArray(rankingItemsTable.year, namedYears),
							),
						);

					// Set main table updatedAt
					yield* tx
						.update(rankingsTable)
						.set({
							updatedAt,
						})
						.where(eq(rankingsTable.id, args.rankingId));
				}),
			)
			.pipe(Effect.orDie);

		// Return updated Ranking
		return yield* findRankingById(args.rankingId);
	});
}
