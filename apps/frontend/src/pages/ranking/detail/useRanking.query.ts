import { useSuspenseQuery } from "@tanstack/react-query";
import { rankingQueryOptions } from "#/lib/api/rankingQueryOptions.ts";

/**
 * The public view's read of a Ranking. It suspends rather than rendering a
 * pending state, which the route's prefetch has already made unreachable.
 */
export function useRanking(id: string) {
	return useSuspenseQuery(rankingQueryOptions(id));
}
