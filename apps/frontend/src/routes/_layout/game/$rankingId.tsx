import { createFileRoute } from "@tanstack/react-router";
import { HorizontalRule } from "#/components/HorizontalRule";
import { Ranking } from "#/components/Ranking/Ranking";
import { useRanking } from "#/components/Ranking/useRanking.query";

export const Route = createFileRoute("/_layout/game/$rankingId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { rankingId } = Route.useParams();
	const { data, error } = useRanking(rankingId);

	if (error) {
		return <p className="text-white text-center">Ranking not found</p>;
	}

	if (!data) {
		return <p className="text-white text-center">Loading...</p>;
	}

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
