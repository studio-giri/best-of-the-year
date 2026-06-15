import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Effect } from "effect";
import { client } from "#/lib/api/client.ts";

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

export function useRanking(id: string) {
	return useSuspenseQuery(rankingQueryOptions(id));
}
