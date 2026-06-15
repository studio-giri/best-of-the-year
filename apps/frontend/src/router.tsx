import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen.ts";

export function getRouter() {
	const queryClient = new QueryClient();

	const router = createTanStackRouter({
		routeTree,
		context: {
			queryClient,
		},

		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
	});

	// Dehydrates the query cache into the SSR'd HTML and rehydrates it on the
	// client, so data fetched in loaders is rendered server-side and available
	// on the client without a refetch. Also wraps the app in a
	// QueryClientProvider.
	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
