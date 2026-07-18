import { ClaimRejected } from "@boty/shared/api/rankings/claim/ClaimRejected.error";
import type { Language } from "@boty/shared/language/Language.schema";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { LanguageProvider } from "#/lib/language/LanguageProvider.tsx";

/**
 * Mock the two side-effecting seams: navigation (needs a router context we do
 * not spin up) and the claim mutation (would hit the network). The mutation
 * mock lets each test drive success / username_taken / etc.
 */
const navigateMock = vi.fn();
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => navigateMock,
}));

const mutateAsyncMock = vi.fn();
vi.mock("./useClaimRanking.mutation.ts", () => ({
	useClaimRanking: () => ({
		mutateAsync: mutateAsyncMock,
		isPending: false,
	}),
}));

import { ClaimRanking } from "./ClaimRanking.tsx";

// Every screen reads its copy through the LanguageProvider; render inside one,
// defaulting to English so the existing assertions stand.
function renderWithLanguage(ui: ReactElement, language: Language = "en") {
	return render(
		<LanguageProvider initialLanguage={language}>{ui}</LanguageProvider>,
	);
}

function fill(label: string, value: string) {
	fireEvent.change(screen.getByLabelText(label), {
		target: {
			value,
		},
	});
}

function submit() {
	fireEvent.click(
		screen.getByRole("button", {
			name: /lezgoo/i,
		}),
	);
}

beforeEach(() => {
	navigateMock.mockReset();
	mutateAsyncMock.mockReset();
});

afterEach(() => {
	cleanup();
	window.localStorage.clear();
});

describe("ClaimRanking", () => {
	test("renders an email field marked required from the start", () => {
		renderWithLanguage(<ClaimRanking />);
		const email = screen.getByLabelText("Email") as HTMLInputElement;
		const username = screen.getByLabelText("Username") as HTMLInputElement;
		expect(email.required).toBe(true);
		expect(username.required).toBe(true);
	});

	test("blocks submit and shows the message for an invalid email", async () => {
		renderWithLanguage(<ClaimRanking />);
		fill("Email", "foo@");
		fill("Username", "valid-name");
		submit();

		expect(await screen.findByText("Email is invalid.")).toBeTruthy();
		expect(mutateAsyncMock).not.toHaveBeenCalled();
	});

	test("blocks submit and shows the message for a blank email", async () => {
		renderWithLanguage(<ClaimRanking />);
		fill("Username", "valid-name");
		submit();

		expect(await screen.findByText("Email cannot be empty.")).toBeTruthy();
		expect(mutateAsyncMock).not.toHaveBeenCalled();
	});

	test("blocks submit and shows the message for a too-short username", async () => {
		renderWithLanguage(<ClaimRanking />);
		fill("Email", "me@example.com");
		fill("Username", "a");
		submit();

		expect(
			await screen.findByText("Username must be at least 2 characters."),
		).toBeTruthy();
		expect(mutateAsyncMock).not.toHaveBeenCalled();
	});

	// A valid claim navigates straight to the owner view.
	// The token is stored inside the mutation, mocked here.
	test("navigates to the owner view on a successful claim", async () => {
		mutateAsyncMock.mockResolvedValue({
			id: "ranking-123",
			username: "MyUsername",
			ownerToken: "tok",
		});

		renderWithLanguage(<ClaimRanking />);
		fill("Email", "me@example.com");
		fill("Username", "MyUsername");
		submit();

		await waitFor(() => {
			expect(navigateMock).toHaveBeenCalledWith({
				to: "/ranking/$rankingId/edit",
				params: {
					rankingId: "ranking-123",
				},
			});
		});
	});

	// A server username_taken refusal shows its message inline and the user
	// stays on the form (no navigation, not routed into recovery).
	test("shows the taken message inline and stays on the form", async () => {
		mutateAsyncMock.mockRejectedValue(
			new ClaimRejected({
				code: "username_taken",
			}),
		);

		renderWithLanguage(<ClaimRanking />);
		fill("Email", "me@example.com");
		fill("Username", "taken-name");
		submit();

		expect(
			await screen.findByText("Username taken. Pick another."),
		).toBeTruthy();
		expect(navigateMock).not.toHaveBeenCalled();
	});

	// A 500 (or any non-ClaimRejected failure) is treated as transient: show the
	// generic retryable message and keep the user on the form.
	test("shows a generic retryable message on a server 500 and stays on the form", async () => {
		mutateAsyncMock.mockRejectedValue(new Error("Internal Server Error"));

		renderWithLanguage(<ClaimRanking />);
		fill("Email", "me@example.com");
		fill("Username", "valid-name");
		submit();

		expect(
			await screen.findByText(/Something went wrong, please try again later\./),
		).toBeTruthy();
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
