import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "#/pages/home/HomePage.tsx";

export const Route = createFileRoute("/_layout/")({
	component: HomePage,
});
