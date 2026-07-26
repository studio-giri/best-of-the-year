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
 * How far past the current year a commit may reach. The server's job is refusing
 * nonsense, not arbitrating which machine's clock is right, so a browser that has
 * already turned the year over is accepted rather than corrected (ADR-003).
 */
const CLOCK_TOLERANCE_YEARS = 1;

/**
 * Replace a Ranking's whole list of Items with the end state a commit carries
 * (ADR-003): years named are upserted, years absent are removed, and the
 * Ranking's own row is stamped — all three in one transaction, so a person never
 * meets a half-saved list.
 *
 * Everything that can refuse the commit runs first, ahead of the transaction, so
 * no partial write is reachable from a well-formed request.
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
		// Prove this credential grants edit access to this Ranking before reading or
		// writing anything of it.
		yield* resolveOwnedRanking(args.rankingId, args.authorization);

		// Refuse a pass that would publish no games at all. The judgement is on the
		// pass alone, never on what the Ranking currently holds: a pass naming none is
		// refused whether it would empty a full list or re-empty an empty one, which
		// keeps the rule one comparison rather than a state machine (ADR-003).
		if (args.body.items.length === 0) {
			return yield* Effect.fail(new RankingWouldBeEmpty());
		}

		// Refuse the whole pass if it names a year the site does not cover. The span
		// is read from the clock per request, since a bound derived at import would
		// freeze at whatever year the process started in.
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

		// Land the pass as a unit. `$onUpdate` fires only when the row it sits on is
		// itself written, and this write touches the items — so the Ranking's stamp
		// is set here explicitly, from the same instant the items carry.
		const db = yield* PgDrizzle;
		const committedAt = new Date(now);
		const namedYears = args.body.items.map((item) => item.year);
		yield* db
			.transaction((tx) =>
				Effect.gen(function* () {
					yield* tx
						.insert(rankingItemsTable)
						.values(
							args.body.items.map((item) => ({
								rankingId: args.rankingId,
								year: item.year,
								name: item.name,
							})),
						)
						.onConflictDoUpdate({
							target: [
								rankingItemsTable.rankingId,
								rankingItemsTable.year,
							],
							set: {
								name: sql`excluded.name`,
								updatedAt: committedAt,
							},
						});

					// Every year the pass left unnamed holds no game once it lands. A pass
					// always names at least one, so there is always a year to keep.
					yield* tx
						.delete(rankingItemsTable)
						.where(
							and(
								eq(rankingItemsTable.rankingId, args.rankingId),
								notInArray(rankingItemsTable.year, namedYears),
							),
						);

					yield* tx
						.update(rankingsTable)
						.set({
							updatedAt: committedAt,
						})
						.where(eq(rankingsTable.id, args.rankingId));
				}),
			)
			.pipe(Effect.orDie);

		// Answer with the stored Ranking, read the way a reader reads it, so what the
		// committing browser now holds is exactly what everyone else will see.
		return yield* findRankingById(args.rankingId);
	});
}
