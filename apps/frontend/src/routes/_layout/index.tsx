import { createFileRoute } from "@tanstack/react-router";
import { List } from "#/components/List/List.component";

export const Route = createFileRoute("/_layout/")({
	component: HomePage,
});

function HomePage() {
	return (
		<main>
			<h1>Homepage</h1>
			<List id={1} />
		</main>
	)
}
