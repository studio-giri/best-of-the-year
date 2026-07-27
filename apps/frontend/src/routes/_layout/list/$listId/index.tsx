import { ListNotFound as ListNotFoundError } from "@boty/shared/api/lists/ListNotFound.error";
import { Uuid } from "@boty/shared/api/primitives/Uuid.schema";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Schema } from "effect";
import { listQueryOptions } from "#/lib/api/listQueryOptions.ts";
import { ListNotFound } from "#/pages/list/detail/ListNotFound.tsx";
import { ListPage } from "#/pages/list/detail/ListPage.tsx";

export const Route = createFileRoute("/_layout/list/$listId/")({
	loader: async ({ context, params }) => {
		// Validate the id against the shared contract schema *before* hitting the
		// query: a malformed id makes the typed client reject synchronously with a
		// SchemaError, which would poison the query cache with a value the SSR
		// dehydration step cannot serialize (seroval). Short-circuit to notFound.
		if (!Schema.is(Uuid)(params.listId)) {
			throw notFound({
				data: {
					reason: "malformed",
				},
			});
		}
		try {
			await context.queryClient.ensureQueryData(
				listQueryOptions(params.listId),
			);
		} catch (error) {
			if (error instanceof ListNotFoundError) {
				throw notFound();
			}
			throw error;
		}
	},
	component: RouteComponent,
	notFoundComponent: ListNotFound,
});

function RouteComponent() {
	const { listId } = Route.useParams();
	return <ListPage listId={listId} />;
}
