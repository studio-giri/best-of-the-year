import { ListNotFound } from "@boty/shared/api/lists/ListNotFound.error";
import { Effect } from "effect";
import { PgDrizzle } from "../../db/PgDrizzle.ts";

export function findListById(id: string) {
	return Effect.gen(function* () {
		/**
		 * Fetch the list and its items in a single round trip via the
		 * defined relations. params.id is a validated UUID (enforced by the
		 * contract); columns are projected to the contract shape, and items
		 * are ordered newest-first — the API owns the ordering guarantee.
		 */
		const db = yield* PgDrizzle;
		const list = yield* db.query.listsTable
			.findFirst({
				columns: {
					id: true,
					username: true,
					updatedAt: true,
				},
				where: {
					id,
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

		if (!list) {
			return yield* Effect.fail(
				new ListNotFound({
					id,
				}),
			);
		}

		return list;
	});
}
