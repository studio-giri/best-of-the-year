import { RecoveryRejected } from "@boty/shared/api/rankings/recover/RecoveryRejected.error";
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
 * Mock the recovery mutation (would otherwise hit the network) so each test can
 * drive its outcome: a resolved value for the sent confirmation, or a rejected
 * `RecoveryRejected` for the inline email rejections.
 */
const mutateAsyncMock = vi.fn();
vi.mock("./useRequestRecovery.mutation.ts", () => ({
	useRequestRecovery: () => ({
		mutateAsync: mutateAsyncMock,
		isPending: false,
	}),
}));

import { RequestRecovery } from "./RequestRecovery.tsx";

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
			name: /email me a link/i,
		}),
	);
}

beforeEach(() => {
	mutateAsyncMock.mockReset();
});

afterEach(() => {
	cleanup();
});

describe("RequestRecovery", () => {
	test("renders an email field marked required from the start", () => {
		renderWithLanguage(<RequestRecovery />);
		const email = screen.getByLabelText("Email") as HTMLInputElement;
		expect(email.required).toBe(true);
	});

	// An invalid email shows its mapped message and blocks submit.
	test("blocks submit and shows the message for an invalid email", async () => {
		renderWithLanguage(<RequestRecovery />);
		fill("Email", "foo@");
		submit();

		expect(await screen.findByText("Email is invalid.")).toBeTruthy();
		expect(mutateAsyncMock).not.toHaveBeenCalled();
	});

	// A blank email shows its mapped message and blocks submit.
	test("blocks submit and shows the message for a blank email", async () => {
		renderWithLanguage(<RequestRecovery />);
		submit();

		expect(await screen.findByText("Email cannot be empty.")).toBeTruthy();
		expect(mutateAsyncMock).not.toHaveBeenCalled();
	});

	// A `sent` outcome renders the check-inbox message.
	test("renders the check-inbox message on a sent outcome", async () => {
		mutateAsyncMock.mockResolvedValue({
			outcome: "sent",
		});

		renderWithLanguage(<RequestRecovery />);
		fill("Email", "me@example.com");
		submit();

		expect(
			await screen.findByText(
				"Check your inbox. We've emailed you a link to get back into your ranking.",
			),
		).toBeTruthy();
	});

	// An unknown email is refused inline and the person stays on the form —
	// no confirmation, no offer to create a new ranking.
	test("shows the unknown-email message inline and keeps the form", async () => {
		mutateAsyncMock.mockRejectedValue(
			new RecoveryRejected({
				code: "email_unknown",
			}),
		);

		renderWithLanguage(<RequestRecovery />);
		fill("Email", "nobody@example.com");
		submit();

		expect(
			await screen.findByText("No ranking exists for this email."),
		).toBeTruthy();
		expect(screen.getByLabelText("Email")).toBeTruthy();
		expect(
			screen.queryByText(
				"Check your inbox. We've emailed you a link to get back into your ranking.",
			),
		).toBeNull();
	});

	// The current Language rides along in the request body so the email matches
	// what the person is reading.
	test("sends the current Language in the recovery request", async () => {
		mutateAsyncMock.mockResolvedValue({
			outcome: "sent",
		});

		renderWithLanguage(<RequestRecovery />, "fr");
		fill("E-mail", "moi@example.com");
		fireEvent.click(
			screen.getByRole("button", {
				name: /envoyez-moi un lien/i,
			}),
		);

		await waitFor(() => {
			expect(mutateAsyncMock).toHaveBeenCalledWith({
				email: "moi@example.com",
				language: "fr",
			});
		});
	});

	// A French render shows French copy throughout (REQ-8: wholly one Language).
	test("renders the form in French when the Language is fr", () => {
		renderWithLanguage(<RequestRecovery />, "fr");

		expect(screen.getByLabelText("E-mail")).toBeTruthy();
		expect(
			screen.getByRole("button", {
				name: /envoyez-moi un lien/i,
			}),
		).toBeTruthy();
	});
});
