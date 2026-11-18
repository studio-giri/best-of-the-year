import type { SaveListItemsBody } from "@boty/shared/api/lists/items/SaveListItemsBody.schema";
import type { List } from "@boty/shared/api/lists/List.schema";
import {
	createBrowserHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";
import { LanguageProvider } from "#/lib/language/LanguageProvider.tsx";

/**
 * The commit is the one side-effecting seam: mock it so a pass can be committed
 * and answered without a request.
 */
const mutateMock =
	vi.fn<
		(
			items: SaveListItemsBody["items"],
			options?: {
				onSuccess?: (saved: List) => void;
			},
		) => void
	>();
vi.mock("./useSaveListItems.mutation.ts", () => ({
	useSaveListItems: () => ({
		mutate: mutateMock,
		isPending: false,
		isError: false,
	}),
}));

import { ListEditForm } from "./ListEditForm.tsx";

const LIST_ID = "list-1";

/**
 * The editor on a page of its own beside a second page, mounted in a real router
 * so leaving goes through the same navigation a person's click triggers.
 */
async function renderEditorPage(items: List["items"] = []) {
	const rootRoute = createRootRoute({
		component: () => (
			<LanguageProvider initialLanguage="en">
				<Outlet />
			</LanguageProvider>
		),
	});
	const editorRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
		component: () => <ListEditForm listId={LIST_ID} items={items} />,
	});
	const elsewhereRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/elsewhere",
		component: () => <p>Somewhere else</p>,
	});
	const router = createRouter({
		routeTree: rootRoute.addChildren([
			editorRoute,
			elsewhereRoute,
		]),
		// The browser's own history, since that is what answers a tab being closed.
		history: createBrowserHistory(),
	});

	render(<RouterProvider router={router} />);
	await screen.findByLabelText("Best game of 2011");
	return router;
}

type EditorRouter = Awaited<ReturnType<typeof renderEditorPage>>;

function fieldFor(year: number) {
	return screen.getByLabelText(`Best game of ${year}`);
}

function type(year: number, value: string) {
	fireEvent.change(fieldFor(year), {
		target: {
			value,
		},
	});
}

/** Navigate out of the editor and let the navigation settle. */
async function leaveEditor(router: EditorRouter) {
	await act(async () => {
		router.history.push("/elsewhere");
	});
}

/** Press the browser's back button and let the history settle. */
async function pressBack(router: EditorRouter) {
	await act(async () => {
		router.history.back();
		await new Promise((resolve) => setTimeout(resolve, 50));
	});
}

/** Answer the commit a pass took with the list the server stored. */
function answerCommit(items: List["items"]) {
	const call = mutateMock.mock.calls[0];
	if (!call) {
		throw new Error("no commit was taken");
	}
	act(() => {
		call[1]?.onSuccess?.({
			id: LIST_ID,
			username: "the-username",
			updatedAt: new Date(2026, 6, 26, 14, 32, 9),
			items,
		});
	});
}

/**
 * Close or reload the tab. Answers whether the browser was asked to confirm
 * first, which a page signals by cancelling the event.
 */
function closeTab() {
	const event = new Event("beforeunload", {
		cancelable: true,
	});
	window.dispatchEvent(event);
	return {
		browserAsksToConfirm: event.defaultPrevented,
	};
}

const confirmSpy = vi.spyOn(window, "confirm");

beforeEach(() => {
	window.history.replaceState(null, "", "/");
	mutateMock.mockReset();
	confirmSpy.mockReset();
});

afterEach(() => {
	cleanup();
});

afterAll(() => {
	confirmSpy.mockRestore();
});

describe("leaving the editor", () => {
	test("asks before leaving an unsaved pass, and cancelling keeps every year", async () => {
		const router = await renderEditorPage();
		confirmSpy.mockReturnValue(false);

		type(2011, "Portal 2");
		type(2013, "The Last of Us");
		await leaveEditor(router);

		expect(confirmSpy).toHaveBeenCalledWith(
			"You have 2 unsaved entries. Leave anyway?",
		);
		expect(router.state.location.pathname).toBe("/");
		expect(fieldFor(2011)).toHaveProperty("value", "Portal 2");
		expect(fieldFor(2013)).toHaveProperty("value", "The Last of Us");
	});

	test("asks before going back to the previous page, and cancelling stays", async () => {
		// The editor was reached from another page, so going back leaves it.
		window.history.replaceState(null, "", "/elsewhere");
		window.history.pushState(null, "", "/");
		const router = await renderEditorPage();
		confirmSpy.mockReturnValue(false);

		type(2011, "Portal 2");
		await pressBack(router);

		expect(confirmSpy).toHaveBeenCalledWith(
			"You have 1 unsaved entry. Leave anyway?",
		);
		expect(router.state.location.pathname).toBe("/");
		expect(fieldFor(2011)).toHaveProperty("value", "Portal 2");
	});

	test("leaves once the person confirms", async () => {
		const router = await renderEditorPage();
		confirmSpy.mockReturnValue(true);

		type(2011, "Portal 2");
		await leaveEditor(router);

		expect(router.state.location.pathname).toBe("/elsewhere");
		expect(screen.getByText("Somewhere else")).toBeTruthy();
	});

	test("asks nothing when leaving an untouched visit", async () => {
		const router = await renderEditorPage([
			{
				id: "item-2022",
				year: 2022,
				name: "Elden Ring",
			},
		]);

		await leaveEditor(router);

		expect(confirmSpy).not.toHaveBeenCalled();
		expect(router.state.location.pathname).toBe("/elsewhere");
	});

	test("asks nothing when leaving right after a commit lands", async () => {
		const router = await renderEditorPage();

		type(2011, "Portal 2");
		fireEvent.click(screen.getByRole("button"));
		answerCommit([
			{
				id: "item-2011",
				year: 2011,
				name: "Portal 2",
			},
		]);
		await leaveEditor(router);

		expect(confirmSpy).not.toHaveBeenCalled();
		expect(router.state.location.pathname).toBe("/elsewhere");
	});

	test("has the browser ask before closing or reloading an unsaved pass", async () => {
		await renderEditorPage();

		type(2011, "Portal 2");

		expect(closeTab().browserAsksToConfirm).toBe(true);
	});

	test("lets the tab close without asking when nothing is unsaved", async () => {
		await renderEditorPage();

		expect(closeTab().browserAsksToConfirm).toBe(false);
	});
});
