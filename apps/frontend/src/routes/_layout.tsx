import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Layout } from "#/layout/Layout.tsx";

export const Route = createFileRoute("/_layout")({
	component: () => (
		<Layout>
			<Outlet />
		</Layout>
	),
});
