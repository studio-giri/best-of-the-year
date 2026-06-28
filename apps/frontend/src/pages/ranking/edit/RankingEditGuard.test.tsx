import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { setOwnerToken } from "#/lib/ownerTokens.ts";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, ...props }: { children: ReactNode }) => (
		<a {...props}>{children}</a>
	),
}));

import { RankingEditGuard } from "./RankingEditGuard.tsx";

afterEach(() => {
	cleanup();
	window.localStorage.clear();
});

describe("RankingEditGuard", () => {
	// AC4 durability: a browser that holds a token (e.g. from an earlier visit)
	// opens the owner view with no re-authentication.
	test("renders the owner view when a token is present", async () => {
		setOwnerToken("ranking-1", "stored-token");

		render(<RankingEditGuard rankingId="ranking-1" />);

		expect(await screen.findByTestId("owner-view")).toBeTruthy();
		expect(screen.queryByTestId("edit-denied")).toBeNull();
	});

	// AC5: a browser without a token is refused the owner view and shown an
	// access-denied message with a link to the public read-only view.
	test("shows the access-denied message when no token is held", async () => {
		render(<RankingEditGuard rankingId="ranking-1" />);

		expect(await screen.findByTestId("edit-denied")).toBeTruthy();
		expect(screen.queryByTestId("owner-view")).toBeNull();
	});
});
