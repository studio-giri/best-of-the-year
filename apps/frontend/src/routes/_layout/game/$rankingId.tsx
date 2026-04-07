import { createFileRoute } from "@tanstack/react-router";
import { HorizontalRule } from "#/components/HorizontalRule";
import { Ranking } from "#/components/Ranking/Ranking";

export const Route = createFileRoute("/_layout/game/$rankingId")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<HorizontalRule size="small" />
			<h2 className="text-white text-center font-semibold  p-8 pt-2">
				By O.G.R.E.
			</h2>
			<HorizontalRule />
			<Ranking />
		</div>
	);
}
