import type { Language } from "@boty/shared/language/Language.schema";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { LanguageProvider } from "#/lib/language/LanguageProvider.tsx";
import { getOwnerToken } from "#/lib/ownerTokens.ts";

/**
 * Mock the two side-effecting seams: navigation (needs a router context we do
 * not spin up) and the consume mutation (would hit the network). The navigate
 * mock records whether the owner token was already stored at the moment it runs,
 * so a test can prove the store happens before the redirect.
 */
let tokenStoredAtNavigate: string | undefined;
const navigateMock = vi.fn(() => {
	tokenStoredAtNavigate = getOwnerToken("ranking-123");
	return Promise.resolve();
});
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => navigateMock,
	// The retry CTA renders a router Link; a plain anchor is enough here.
	Link: ({ to, children }: { to: string; children: ReactNode }) => (
		<a href={to}>{children}</a>
	),
}));

const mutateAsyncMock = vi.fn();
vi.mock("./useConsumeRecovery.mutation.ts", () => ({
	useConsumeRecovery: () => ({
		mutateAsync: mutateAsyncMock,
		isPending: false,
	}),
}));

import { ConsumeRecovery } from "./ConsumeRecovery.tsx";

// Every screen reads its copy through the LanguageProvider; render inside one,
// defaulting to English so the assertions read in English.
function renderWithLanguage(ui: ReactElement, language: Language = "en") {
	return render(
		<LanguageProvider initialLanguage={language}>{ui}</LanguageProvider>,
	);
}

beforeEach(() => {
	navigateMock.mockClear();
	mutateAsyncMock.mockReset();
	tokenStoredAtNavigate = undefined;
});

afterEach(() => {
	cleanup();
	window.localStorage.clear();
});

describe("ConsumeRecovery", () => {
	// While the exchange is in flight, a brief in-progress indication is shown and
	// nothing is asked of the person.
	test("shows an in-progress indication while the exchange is pending", () => {
		// A never-settling promise holds the component in its pending state.
		mutateAsyncMock.mockReturnValue(new Promise(() => {}));

		renderWithLanguage(<ConsumeRecovery token="raw-token" />);

		expect(screen.getByText("Getting you back into your list…")).toBeTruthy();
		expect(navigateMock).not.toHaveBeenCalled();
	});

	// The happy path: the exchange resolves, the token is stored, and the browser
	// lands in the owner editor — with the store proven to precede the redirect.
	test("stores the minted token before navigating to the owner editor", async () => {
		mutateAsyncMock.mockResolvedValue({
			id: "ranking-123",
			ownerToken: "minted-token",
		});

		renderWithLanguage(<ConsumeRecovery token="raw-token" />);

		await waitFor(() => {
			expect(navigateMock).toHaveBeenCalledWith({
				to: "/ranking/$rankingId/edit",
				params: {
					rankingId: "ranking-123",
				},
			});
		});
		// The token was already in storage when navigation fired, so the owner
		// guard sees the grant after the redirect instead of racing it.
		expect(tokenStoredAtNavigate).toBe("minted-token");
		expect(getOwnerToken("ranking-123")).toBe("minted-token");
	});

	// A transient failure (network / 5xx) falls back to a generic retry with a
	// link back to the request form, and opens no owner view.
	test("shows a generic retry with a request-form link on a transient failure", async () => {
		mutateAsyncMock.mockRejectedValue(new Error("Internal Server Error"));

		renderWithLanguage(<ConsumeRecovery token="raw-token" />);

		expect(
			await screen.findByText(/Something went wrong, please try again later\./),
		).toBeTruthy();
		const retryLink = screen.getByRole("link", {
			name: "request a new link",
		});
		expect(retryLink.getAttribute("href")).toBe("/recover/request");
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
