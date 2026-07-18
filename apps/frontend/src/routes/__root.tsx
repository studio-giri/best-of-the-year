import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getServerLanguage } from "#/lib/language/getServerLanguage.ts";
import { LanguageProvider } from "#/lib/language/LanguageProvider.tsx";
import { resolveClientLanguage } from "#/lib/language/resolveClientLanguage.ts";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	// Resolve the reader's Language before the tree renders so the first paint —
	// `<html lang>` and every string — is already correct. On the server that
	// reads the request (cookie › Accept-Language › English); on the client it
	// keeps the current choice without re-guessing.
	beforeLoad: async () => {
		const language = import.meta.env.SSR
			? await getServerLanguage()
			: resolveClientLanguage();
		return {
			language,
		};
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Best Of The Year",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	// The server-resolved Language: drives `<html lang>` on the first paint and
	// seeds the provider that owns it thereafter.
	const { language } = Route.useRouteContext();
	return (
		<html lang={language}>
			<head>
				<HeadContent />
			</head>
			<body className="font-sans antialiased wrap-anywhere">
				<LanguageProvider initialLanguage={language}>
					{children}
				</LanguageProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
