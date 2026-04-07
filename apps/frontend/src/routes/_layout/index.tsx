import { createFileRoute } from "@tanstack/react-router";
import { HorizontalRule } from "#/components/HorizontalRule";
import { List } from "#/components/List/List.component";

export const Route = createFileRoute("/_layout/")({
	component: HomePage,
});

function HomePage() {
	return (
		<section>
			<HorizontalRule />
			<h1>Homepage</h1>
			<List id={1} />
		</section>
	);
}
