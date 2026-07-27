import { queryOptions } from "@tanstack/react-query";
import { Effect } from "effect";
import { client } from "./client.ts";

/**
 * The single declaration of "fetch this List": one cache key, one call, one
 * retry policy, shared by every view of a List so they read the same cached
 * copy instead of racing each other for it.
 *
 * A missing List is a modelled outcome the caller maps to its own not-found
 * rendering, so a failure is surfaced rather than retried.
 */
export function listQueryOptions(id: string) {
	return queryOptions({
		queryKey: [
			"list",
			id,
		],
		retry: false,
		queryFn: () =>
			Effect.runPromise(
				client.lists.findById({
					params: {
						id,
					},
				}),
			),
	});
}
