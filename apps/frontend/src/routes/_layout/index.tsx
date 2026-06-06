import { createFileRoute } from "@tanstack/react-router";
import { HorizontalRule } from "#/components/HorizontalRule";

export const Route = createFileRoute("/_layout/")({
	component: HomePage,
});

function HomePage() {
	return (
		<section>
			<HorizontalRule />
			<h1>Homepage</h1>
		</section>
	);
}
