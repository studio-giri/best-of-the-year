import { useQuery } from "@tanstack/react-query";
import { Effect } from "effect";
import { client } from "#/lib/api/client";

export function useRanking(id: string) {
	return useQuery({
		queryKey: [
			"ranking",
			id,
		],
		enabled: Boolean(id),
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
