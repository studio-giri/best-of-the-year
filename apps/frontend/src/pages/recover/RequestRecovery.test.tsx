import { RecoveryRejected } from "@boty/shared/api/rankings/recover/RecoveryRejected.error";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

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
		render(<RequestRecovery />);
		const email = screen.getByLabelText("Email") as HTMLInputElement;
		expect(email.required).toBe(true);
	});

	// AC1: an invalid email shows its mapped message and blocks submit.
	test("blocks submit and shows the message for an invalid email", async () => {
		render(<RequestRecovery />);
		fill("Email", "foo@");
		submit();

		expect(await screen.findByText("Email is invalid.")).toBeTruthy();
		expect(mutateAsyncMock).not.toHaveBeenCalled();
	});

	// AC1: a blank email shows its mapped message and blocks submit.
	test("blocks submit and shows the message for a blank email", async () => {
		render(<RequestRecovery />);
		submit();

		expect(await screen.findByText("Email cannot be empty.")).toBeTruthy();
		expect(mutateAsyncMock).not.toHaveBeenCalled();
	});

	// AC3: a `sent` outcome renders the check-inbox message.
	test("renders the check-inbox message on a sent outcome", async () => {
		mutateAsyncMock.mockResolvedValue({
			outcome: "sent",
		});

		render(<RequestRecovery />);
		fill("Email", "me@example.com");
		submit();

		expect(
			await screen.findByText(
				"Check your inbox. We've emailed you a link to get back into your ranking.",
			),
		).toBeTruthy();
	});

	// AC4: an unknown email is refused inline and the person stays on the form —
	// no confirmation, no offer to create a new ranking.
	test("shows the unknown-email message inline and keeps the form", async () => {
		mutateAsyncMock.mockRejectedValue(
			new RecoveryRejected({
				code: "email_unknown",
			}),
		);

		render(<RequestRecovery />);
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
});
