import { queryOptions } from "@tanstack/react-query";
import { Effect } from "effect";
import { client } from "./client.ts";

/**
 * The single declaration of "fetch this Ranking": one cache key, one call, one
 * retry policy, shared by every view of a Ranking so they read the same cached
 * copy instead of racing each other for it.
 *
 * A missing Ranking is a modelled outcome the caller maps to its own not-found
 * rendering, so a failure is surfaced rather than retried.
 */
export function rankingQueryOptions(id: string) {
	return queryOptions({
		queryKey: [
			"ranking",
			id,
		],
		retry: false,
		queryFn: () =>
			Effect.runPromise(
				client.rankings.findById({
					params: {
						id,
					},
				}),
			),
	});
}
