import { createFileRoute, notFound } from "@tanstack/react-router";
import { HorizontalRule } from "#/components/HorizontalRule";
import { Ranking } from "#/components/Ranking/Ranking";
import {
	rankingQueryOptions,
	useRanking,
} from "#/components/Ranking/useRanking.query";

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
	notFoundComponent: NotFoundComponent,
});

function NotFoundComponent() {
	return <p className="text-white text-center">Ranking not found</p>;
}

function RouteComponent() {
	const { rankingId } = Route.useParams();
	const { data } = useRanking(rankingId);

	return (
		<div>
			<HorizontalRule size="small" />
			<h2 className="text-white text-center font-semibold  p-8 pt-2">
				By {data.author}
			</h2>
			<HorizontalRule />
			<Ranking items={data.items} />
		</div>
	);
}
