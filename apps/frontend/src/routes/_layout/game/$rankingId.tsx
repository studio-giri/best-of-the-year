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
		} catch {
			throw notFound();
		}
	},
	component: RouteComponent,
	notFoundComponent: RankingNotFound,
});

function RouteComponent() {
	const { rankingId } = Route.useParams();
	return <RankingPage rankingId={rankingId} />;
}
