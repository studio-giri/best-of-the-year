import { useQuery } from "@tanstack/react-query";
import { rankingQueryOptions } from "#/lib/api/rankingQueryOptions.ts";

/**
 * The editor's read of the Ranking being edited. Edit access is settled before
 * this runs, so the request starts from the component and the caller renders the
 * pending and failed states itself. The cache key is the public view's, which
 * makes an owner arriving from their own list a cache hit.
 */
export function useRankingForEdit(id: string) {
	return useQuery(rankingQueryOptions(id));
}
