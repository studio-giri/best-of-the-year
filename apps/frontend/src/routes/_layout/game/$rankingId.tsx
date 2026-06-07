import { RankingNotFound as RankingNotFoundError } from "@boty/shared/api/rankings/RankingNotFound";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { RankingNotFound } from "#/pages/game/ranking/RankingNotFound";
import { RankingPage } from "#/pages/game/ranking/RankingPage";
import { rankingQueryOptions } from "#/pages/game/ranking/useRanking.query";

export const Route = createFileRoute("/_layout/game/$rankingId")({
	loader: async ({ context, params }) => {
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
