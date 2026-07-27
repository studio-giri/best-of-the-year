import { useSuspenseQuery } from "@tanstack/react-query";
import { listQueryOptions } from "#/lib/api/listQueryOptions.ts";

/**
 * The public view's read of a List. It suspends rather than rendering a
 * pending state, which the route's prefetch has already made unreachable.
 */
export function useList(id: string) {
	return useSuspenseQuery(listQueryOptions(id));
}
