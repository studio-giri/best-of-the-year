import { Uuid } from "@boty/shared/api/primitives/Uuid.schema";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Schema } from "effect";
import { ListNotFound } from "#/pages/list/detail/ListNotFound.tsx";
import { ListEditGuard } from "#/pages/list/edit/ListEditGuard.tsx";

export const Route = createFileRoute("/_layout/list/$listId/edit")({
	loader: ({ params }) => {
		// A malformed id can never name a real list — short-circuit to notFound,
		// matching the public route's contract guard.
		if (!Schema.is(Uuid)(params.listId)) {
			throw notFound();
		}
	},
	component: RouteComponent,
	notFoundComponent: ListNotFound,
});

function RouteComponent() {
	const { listId } = Route.useParams();
	return <ListEditGuard listId={listId} />;
}
