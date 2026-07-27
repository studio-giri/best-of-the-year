import type { List } from "@boty/shared/api/lists/List.schema";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { Effect } from "effect";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { setOwnerToken } from "#/lib/ownerTokens.ts";

/**
 * Mock the derived API client, the one seam that would reach the network. The
 * hook under test is everything between a commit and the cache, so the request it
 * builds is what these assertions read.
 */
const saveItemsMock = vi.fn();
vi.mock("#/lib/api/client.ts", () => ({
	client: {
		lists: {
			saveItems: (request: unknown) => saveItemsMock(request),
		},
	},
}));

import { useSaveListItems } from "./useSaveListItems.mutation.ts";

const LIST_ID = "019f9ef4-9536-7413-9891-6bbc555fc225";

const STORED: List = {
	id: LIST_ID,
	username: "the-username",
	updatedAt: new Date("2026-07-26T10:00:00.000Z"),
	items: [
		{
			id: "item-2022",
			year: 2022,
			name: "Elden Ring",
		},
	],
};

function renderSaveHook() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	});

	const { result } = renderHook(() => useSaveListItems(LIST_ID), {
		wrapper: ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		),
	});

	return {
		queryClient,
		result,
	};
}

beforeEach(() => {
	saveItemsMock.mockReset();
	saveItemsMock.mockReturnValue(Effect.succeed(STORED));
	setOwnerToken(LIST_ID, "the-browsers-token");
});

afterEach(() => {
	window.localStorage.clear();
});

describe("useSaveListItems", () => {
	test("presents the token this browser holds for the list it is committing to", async () => {
		const { result } = renderSaveHook();

		result.current.mutate([
			{
				year: 2022,
				name: "Elden Ring",
			},
		]);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});
		expect(saveItemsMock).toHaveBeenCalledWith({
			params: {
				id: LIST_ID,
			},
			headers: {
				authorization: "Bearer the-browsers-token",
			},
			payload: {
				items: [
					{
						year: 2022,
						name: "Elden Ring",
					},
				],
			},
		});
	});

	test("hands the stored list to every view of it", async () => {
		const { result, queryClient } = renderSaveHook();

		result.current.mutate([]);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});
		// The answer *is* the stored state, so it is seeded rather than invalidated:
		// a refetch would only fetch back what is already in hand.
		expect(
			queryClient.getQueryData([
				"list",
				LIST_ID,
			]),
		).toEqual(STORED);
	});
});
