import { Uuid } from "@boty/shared/api/primitives/Uuid.schema";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Schema } from "effect";
import { RankingNotFound } from "#/pages/ranking/detail/RankingNotFound.tsx";
import { RankingEditGuard } from "#/pages/ranking/edit/RankingEditGuard.tsx";

export const Route = createFileRoute("/_layout/ranking/$rankingId/edit")({
	loader: ({ params }) => {
		// A malformed id can never name a real ranking — short-circuit to notFound,
		// matching the public route's contract guard.
		if (!Schema.is(Uuid)(params.rankingId)) {
			throw notFound();
		}
	},
	component: RouteComponent,
	notFoundComponent: RankingNotFound,
});

function RouteComponent() {
	const { rankingId } = Route.useParams();
	return <RankingEditGuard rankingId={rankingId} />;
}
