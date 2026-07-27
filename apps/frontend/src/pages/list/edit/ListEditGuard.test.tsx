import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LanguageProvider } from "#/lib/language/LanguageProvider.tsx";
import { setOwnerToken } from "#/lib/ownerTokens.ts";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, ...props }: { children: ReactNode }) => (
		<a {...props}>{children}</a>
	),
}));

// The shell the guard grants access to fetches the List; stub that read so
// these tests stay about the grant and never reach the network.
vi.mock("./useListForEdit.query.ts", () => ({
	useListForEdit: () => ({
		data: undefined,
		isError: false,
	}),
}));

import { ListEditGuard } from "./ListEditGuard.tsx";

// The guard's copy reads through the LanguageProvider, and the shell behind it
// reads through a query client; render inside both.
function renderWithLanguage(ui: ReactElement) {
	return render(
		<QueryClientProvider client={new QueryClient()}>
			<LanguageProvider initialLanguage="en">{ui}</LanguageProvider>
		</QueryClientProvider>,
	);
}

afterEach(() => {
	cleanup();
	window.localStorage.clear();
});

describe("ListEditGuard", () => {
	// Durability: a browser that holds a token (e.g. from an earlier visit)
	// opens the owner view with no re-authentication.
	test("renders the owner view when a token is present", async () => {
		setOwnerToken("list-1", "stored-token");

		renderWithLanguage(<ListEditGuard listId="list-1" />);

		expect(await screen.findByTestId("owner-view")).toBeTruthy();
		expect(screen.queryByTestId("edit-denied")).toBeNull();
	});

	// A browser without a token is refused the owner view and shown an
	// access-denied message with a link to the public read-only view.
	test("shows the access-denied message when no token is held", async () => {
		renderWithLanguage(<ListEditGuard listId="list-1" />);

		expect(await screen.findByTestId("edit-denied")).toBeTruthy();
		expect(screen.queryByTestId("owner-view")).toBeNull();
	});
});
