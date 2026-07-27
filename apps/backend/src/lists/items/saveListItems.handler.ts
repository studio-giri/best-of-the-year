import type { EditAccessDenied } from "@boty/shared/api/lists/EditAccessDenied.error";
import { FIRST_COVERED_YEAR } from "@boty/shared/api/lists/items/coveredYears";
import { ListWouldBeEmpty } from "@boty/shared/api/lists/items/ListWouldBeEmpty.error";
import type { SaveListItemsBody } from "@boty/shared/api/lists/items/SaveListItemsBody.schema";
import { YearNotCovered } from "@boty/shared/api/lists/items/YearNotCovered.error";
import type { List } from "@boty/shared/api/lists/List.schema";
import type { ListNotFound } from "@boty/shared/api/lists/ListNotFound.error";
import { and, eq, notInArray, sql } from "drizzle-orm";
import { Clock, Effect } from "effect";
import { PgDrizzle } from "../../db/PgDrizzle.ts";
import { listItemsTable } from "../../db/schema/list-items.table.ts";
import { listsTable } from "../../db/schema/lists.table.ts";
import { findListById } from "../find/findListById.handler.ts";
import { resolveOwnedList } from "../ownerToken.service.ts";

/**
 * How far past the current year a commit may reach. A browser that has
 * already turned the year over is accepted rather than corrected (ADR-003).
 */
const CLOCK_TOLERANCE_YEARS = 1;

/**
 * Replace all of a List's Items: years named are upserted, years absent
 * are removed, and the List's own row is stamped, all three in one transaction.
 *
 * All checks are run first, ahead of the transaction, to avoid no partial write.
 */
export function saveListItems(args: {
	listId: string;
	authorization: string | undefined;
	body: SaveListItemsBody;
}): Effect.Effect<
	List,
	ListNotFound | EditAccessDenied | YearNotCovered | ListWouldBeEmpty,
	PgDrizzle
> {
	return Effect.gen(function* () {
		// Check ownership
		yield* resolveOwnedList(args.listId, args.authorization);

		// Refuse a pass that would publish no games at all.
		if (args.body.items.length === 0) {
			return yield* Effect.fail(new ListWouldBeEmpty());
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
						.insert(listItemsTable)
						.values(
							args.body.items.map((item) => ({
								listId: args.listId,
								year: item.year,
								name: item.name,
								createdAt: updatedAt,
								updatedAt,
							})),
						)
						.onConflictDoUpdate({
							target: [
								listItemsTable.listId,
								listItemsTable.year,
							],
							set: {
								name: sql`excluded.name`,
								updatedAt,
							},
						});

					// Delete removed items
					yield* tx
						.delete(listItemsTable)
						.where(
							and(
								eq(listItemsTable.listId, args.listId),
								notInArray(listItemsTable.year, namedYears),
							),
						);

					// Set main table updatedAt
					yield* tx
						.update(listsTable)
						.set({
							updatedAt,
						})
						.where(eq(listsTable.id, args.listId));
				}),
			)
			.pipe(Effect.orDie);

		// Return updated List
		return yield* findListById(args.listId);
	});
}
