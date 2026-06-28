import { Uuid } from "@boty/shared/api/primitives/Uuid.schema";
import { RankingNotFound as RankingNotFoundError } from "@boty/shared/api/rankings/RankingNotFound.error";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Schema } from "effect";
import { RankingNotFound } from "#/pages/ranking/detail/RankingNotFound.tsx";
import { RankingPage } from "#/pages/ranking/detail/RankingPage.tsx";
import { rankingQueryOptions } from "#/pages/ranking/detail/useRanking.query.ts";

export const Route = createFileRoute("/_layout/ranking/$rankingId/")({
	loader: async ({ context, params }) => {
		// Validate the id against the shared contract schema *before* hitting the
		// query: a malformed id makes the typed client reject synchronously with a
		// SchemaError, which would poison the query cache with a value the SSR
		// dehydration step cannot serialize (seroval). Short-circuit to notFound.
		if (!Schema.is(Uuid)(params.rankingId)) {
			throw notFound({
				data: {
					reason: "malformed",
				},
			});
		}
		try {
			await context.queryClient.ensureQueryData(
				rankingQueryOptions(params.rankingId),
			);
		} catch (error) {
			if (error instanceof RankingNotFoundError) {
				throw notFound();
			}
			throw error;
		}
	},
	component: RouteComponent,
	notFoundComponent: RankingNotFound,
});

function RouteComponent() {
	const { rankingId } = Route.useParams();
	return <RankingPage rankingId={rankingId} />;
}
