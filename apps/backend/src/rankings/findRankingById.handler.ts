import { RankingNotFound } from "@boty/shared/api/rankings/RankingNotFound.error";
import { Effect } from "effect";
import { PgDrizzle } from "../db/PgDrizzle.ts";

export function findRankingById(id: string) {
	return Effect.gen(function* () {
		/**
		 * Fetch the ranking and its items in a single round trip via the
		 * defined relations. params.id is a validated UUID (enforced by the
		 * contract); columns are projected to the contract shape, and items
		 * are ordered newest-first — the API owns the ordering guarantee.
		 */
		const db = yield* PgDrizzle;
		const ranking = yield* db.query.rankingsTable
			.findFirst({
				columns: {
					id: true,
					username: true,
					updatedAt: true,
				},
				where: {
					id,
					deletedAt: {
						isNull: true,
					},
				},
				with: {
					items: {
						columns: {
							id: true,
							year: true,
							name: true,
						},
						orderBy: {
							year: "desc",
						},
					},
				},
			})
			.pipe(Effect.orDie);

		if (!ranking) {
			return yield* Effect.fail(
				new RankingNotFound({
					id,
				}),
			);
		}

		return ranking;
	});
}
