import { FIRST_COVERED_YEAR } from "@boty/shared/api/lists/items/coveredYears";
import type { SaveListItemsBody } from "@boty/shared/api/lists/items/SaveListItemsBody.schema";
import type { List } from "@boty/shared/api/lists/List.schema";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { LanguageProvider } from "#/lib/language/LanguageProvider.tsx";

/**
 * The commit is the one side-effecting seam: mock it so each test can watch what
 * a submit sends and drive what comes back, without a request.
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
let mutationState = {
	isPending: false,
	isError: false,
};
vi.mock("./useSaveListItems.mutation.ts", () => ({
	useSaveListItems: () => ({
		mutate: mutateMock,
		...mutationState,
	}),
}));

import { ListEditForm } from "./ListEditForm.tsx";

const LIST_ID = "list-1";

// The years the editor offers, derived from the clock the same way the site
// derives Covered Years — never a literal, or the list would rot in January.
const CURRENT_YEAR = new Date().getUTCFullYear();
const EXPECTED_YEARS = Array.from(
	{
		length: CURRENT_YEAR - FIRST_COVERED_YEAR + 1,
	},
	(_, index) => CURRENT_YEAR - index,
);

function renderForm(items: List["items"] = []) {
	return renderWithLanguage(<ListEditForm listId={LIST_ID} items={items} />);
}

function renderWithLanguage(ui: ReactElement) {
	return render(<LanguageProvider initialLanguage="en">{ui}</LanguageProvider>);
}

/** The band one year occupies reads as one line; its year opens that line. */
function yearBands(container: HTMLElement) {
	return Array.from(container.querySelectorAll("p"));
}

function renderedYears(container: HTMLElement) {
	return yearBands(container).map((band) =>
		Number(band.querySelector("span")?.textContent?.replace(" - ", "")),
	);
}

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

/**
 * The one control that commits. Found by role rather than by name: what it is
 * called changes with what it is doing, and the tests below say so themselves.
 */
function commitAction() {
	return screen.getByRole("button");
}

function commit() {
	fireEvent.click(commitAction());
}

/**
 * Ctrl+S, or the Mac's Cmd+S, delivered where the browser delivers it. Answers
 * whether the browser's own Save Page was called off: `fireEvent` passes on what
 * `dispatchEvent` answers, which is false once a default has been prevented.
 */
function pressSaveShortcut(
	modifier: "ctrlKey" | "metaKey" = "ctrlKey",
	init: KeyboardEventInit = {},
) {
	const defaultAllowed = fireEvent.keyDown(window, {
		key: "s",
		[modifier]: true,
		...init,
	});
	return {
		browserSaveSuppressed: !defaultAllowed,
	};
}

/** What one commit of a pass carried, and the callbacks it was given. */
function theCommit(index = 0) {
	const call = mutateMock.mock.calls[index];
	if (!call) {
		throw new Error("no commit was taken");
	}
	return {
		items: call[0],
		options: call[1],
	};
}

/** The whole report line, every clause it currently carries. */
function reportLine() {
	const line = announcedReport().parentElement;
	if (!line) {
		throw new Error("the report is not rendered");
	}
	return line.textContent;
}

/** The part of the report a screen reader is told about without being asked. */
function announcedReport() {
	return screen.getByRole("status");
}

function seededItem(year: number, name: string) {
	return {
		id: `item-${year}`,
		year,
		name,
	};
}

// The moments a commit lands, built on the local calendar: the editor reports the
// clock a person is reading, so a UTC literal would make the expected time depend
// on the machine running the test.
const LANDED_AT = new Date(2026, 6, 26, 14, 32, 9);
const LANDED_AGAIN_AT = new Date(2026, 6, 26, 15, 5, 41);

/** A stored List, as the server answers a commit with it. */
function savedList(items: List["items"], updatedAt = LANDED_AT): List {
	return {
		id: LIST_ID,
		username: "the-username",
		updatedAt,
		items,
	};
}

beforeEach(() => {
	mutateMock.mockReset();
	mutationState = {
		isPending: false,
		isError: false,
	};
});

afterEach(() => {
	cleanup();
});

describe("ListEditForm", () => {
	test("offers every covered year as its own field, newest-first", () => {
		const { container } = renderForm();

		expect(renderedYears(container)).toEqual(EXPECTED_YEARS);
		for (const year of EXPECTED_YEARS) {
			expect(fieldFor(year)).toBeTruthy();
		}
	});

	test("gives a year holding no game the same band as a year that does", () => {
		const { container } = renderForm([
			seededItem(2022, "Elden Ring"),
			seededItem(2020, "Hades"),
		]);

		// One band per covered year, all of them the same band — the filled years are
		// not a different kind of row from the empty ones.
		const bands = yearBands(container);
		expect(bands).toHaveLength(EXPECTED_YEARS.length);
		expect(new Set(bands.map((band) => band.className)).size).toBe(1);

		// What differs between them is only what the field holds.
		expect(fieldFor(2022)).toHaveProperty("value", "Elden Ring");
		expect(fieldFor(2021)).toHaveProperty("value", "");
		expect(fieldFor(2020)).toHaveProperty("value", "Hades");
	});

	test("moves nothing on the list when an empty year is filled in", () => {
		const { container } = renderForm();
		const before = renderedYears(container);

		type(2011, "Portal 2");

		expect(renderedYears(container)).toEqual(before);
		expect(yearBands(container)).toHaveLength(before.length);
	});

	test("names the year each field belongs to, for a screen reader", () => {
		renderForm();

		// The field is reachable by a name that carries its year — nothing else on
		// the list disambiguates it.
		expect(fieldFor(1997).tagName).toBe("INPUT");
		expect(fieldFor(CURRENT_YEAR).tagName).toBe("INPUT");
	});

	test("offers exactly one name per year and no way to give a second", () => {
		const { container } = renderForm([
			seededItem(2022, "Elden Ring"),
		]);

		for (const band of yearBands(container)) {
			expect(band.querySelectorAll("input")).toHaveLength(1);
		}
		expect(container.querySelectorAll("input")).toHaveLength(
			EXPECTED_YEARS.length,
		);
	});

	test("publishes nothing while a person is still typing", () => {
		renderForm();

		type(2011, "Portal 2");
		type(2013, "The Last of Us");
		fireEvent.blur(fieldFor(2013));

		expect(mutateMock).not.toHaveBeenCalled();
	});

	test("publishes every change of the pass with one commit", () => {
		renderForm([
			seededItem(2022, "Elden Ring"),
			seededItem(2020, "Hades"),
		]);

		type(2011, "Portal 2");
		type(2022, "Tunic");
		type(2020, "");
		commit();

		// One request, carrying the end state of the whole list: the year added, the
		// year changed, and no trace of the year emptied.
		expect(mutateMock).toHaveBeenCalledTimes(1);
		expect(theCommit().items).toEqual([
			{
				year: 2022,
				name: "Tunic",
			},
			{
				year: 2011,
				name: "Portal 2",
			},
		]);
	});

	test("takes the committed list from the answer, not from what it sent", () => {
		renderForm([
			seededItem(2022, "Elden Ring"),
		]);

		type(2022, "Tunic");
		commit();

		// The server's answer is the stored state; the form adopts it, so a name it
		// tidied or a year another browser added is what the person now sees.
		act(() => {
			theCommit().options?.onSuccess?.(
				savedList([
					seededItem(2022, "Tunic (stored)"),
					seededItem(2019, "Disco Elysium"),
				]),
			);
		});

		expect(fieldFor(2022)).toHaveProperty("value", "Tunic (stored)");
		expect(fieldFor(2019)).toHaveProperty("value", "Disco Elysium");
	});

	test("leaves a person in the editor after a commit lands", () => {
		const { container } = renderForm([
			seededItem(2022, "Elden Ring"),
		]);

		type(2022, "Tunic");
		commit();
		act(() => {
			theCommit().options?.onSuccess?.(
				savedList([
					seededItem(2022, "Tunic"),
				]),
			);
		});

		// Every year is still in front of them, and the commit is still there to take
		// again.
		expect(renderedYears(container)).toEqual(EXPECTED_YEARS);
		expect(fieldFor(2022)).toHaveProperty("value", "Tunic");
		expect(commitAction()).toBeTruthy();
	});

	describe("a pass that would publish nothing", () => {
		test("does not offer the commit, and says why", () => {
			renderForm();

			// The reason is tied to the control it withholds, so it is read as the
			// explanation of that control rather than as loose text beside it.
			const action = commitAction();
			expect(action).toHaveProperty("disabled", true);
			expect(reportLine()).toBe("A list needs at least one entry");
			expect(action.getAttribute("aria-describedby")).toBe(
				announcedReport().parentElement?.id,
			);

			// Withheld means withheld: taking the action anyway sends nothing.
			commit();
			expect(mutateMock).not.toHaveBeenCalled();
		});

		test("withholds the commit until some year holds a game again", () => {
			renderForm([
				seededItem(2020, "Hades"),
			]);

			// A list holding one game commits like any other once something about it
			// has changed, until that game is the one being cleared.
			type(2020, "Hades II");
			expect(commitAction()).toHaveProperty("disabled", false);
			type(2020, "");
			expect(commitAction()).toHaveProperty("disabled", true);

			// Filling a different year is what brings the commit back — and it then
			// publishes both changes, the year emptied and the year filled, together.
			type(2011, "Portal 2");
			expect(commitAction()).toHaveProperty("disabled", false);
			expect(reportLine()).not.toContain("A list needs at least one entry");

			commit();
			expect(theCommit().items).toEqual([
				{
					year: 2011,
					name: "Portal 2",
				},
			]);
		});

		test("says the floor in place of the count of what is unsaved", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			// Clearing the last game is a change like any other, but the report names
			// the reason the commit is withheld rather than counting it.
			type(2022, "");

			expect(reportLine()).toBe("A list needs at least one entry");
		});
	});

	describe("where the pass stands", () => {
		test("counts the entries a commit would carry, singular at one", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
				seededItem(2020, "Hades"),
			]);

			type(2022, "Tunic");
			expect(reportLine()).toBe("1 entry unsaved");

			// A year emptied and a year filled are changes as much as a year renamed.
			type(2020, "");
			type(2011, "Portal 2");
			expect(reportLine()).toBe("3 entries unsaved");
		});

		test("stops counting a year typed back to what it was", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			type(2022, "Tunic");
			expect(reportLine()).toBe("1 entry unsaved");

			type(2022, "Elden Ring");
			expect(reportLine()).toBe("No changes to save");
		});

		test("treats a year of spaces as the blank year it is", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			type(2011, "   ");

			// Nothing a commit would carry has moved, so there is nothing to report and
			// nothing to commit.
			expect(reportLine()).toBe("No changes to save");
			expect(commitAction()).toHaveProperty("disabled", true);
		});

		test("withholds the commit while nothing has changed", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			expect(commitAction()).toHaveProperty("disabled", true);
			expect(reportLine()).toBe("No changes to save");

			commit();
			expect(mutateMock).not.toHaveBeenCalled();
		});

		test("reports no time for a list committed on an earlier visit", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			// The list carries a stored time, but no commit was taken in this visit, so
			// the report names none.
			expect(reportLine()).toBe("No changes to save");
			expect(reportLine()).not.toMatch(/\d\d:\d\d/);
		});

		test("shows the commit working, refuses a second, and still names the unsaved entries", () => {
			mutationState = {
				isPending: true,
				isError: false,
			};

			renderForm([
				seededItem(2022, "Elden Ring"),
			]);
			type(2022, "Tunic");

			// Only ever one request in the air: the control says it is busy and sends
			// nothing more, while the report keeps naming what is not yet saved.
			const action = commitAction();
			expect(action.getAttribute("aria-busy")).toBe("true");
			expect(action).toHaveProperty("disabled", true);
			commit();
			expect(mutateMock).not.toHaveBeenCalled();
			expect(reportLine()).toBe("1 entry unsaved");
		});

		test("reports when a commit landed as a fixed clock time", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			type(2022, "Tunic");
			commit();
			act(() => {
				theCommit().options?.onSuccess?.(
					savedList([
						seededItem(2022, "Tunic"),
					]),
				);
			});

			// The time comes from the answer, and a settled list says only that.
			expect(reportLine()).toBe("Last saved at 14:32:09");
		});

		test("reports the second commit of a visit, not the first", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			type(2022, "Tunic");
			commit();
			act(() => {
				theCommit(0).options?.onSuccess?.(
					savedList([
						seededItem(2022, "Tunic"),
					]),
				);
			});

			type(2022, "Tunic Redux");
			commit();
			act(() => {
				theCommit(1).options?.onSuccess?.(
					savedList(
						[
							seededItem(2022, "Tunic Redux"),
						],
						LANDED_AGAIN_AT,
					),
				);
			});

			expect(reportLine()).toBe("Last saved at 15:05:41");
		});

		test("carries the last save and what is unsaved since, at once", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			type(2022, "Tunic");
			commit();
			act(() => {
				theCommit().options?.onSuccess?.(
					savedList([
						seededItem(2022, "Tunic"),
					]),
				);
			});

			type(2011, "Portal 2");
			type(2013, "The Last of Us");
			type(2015, "Bloodborne");

			expect(reportLine()).toBe("Last saved at 14:32:09 - 3 entries unsaved");
		});

		test("announces the confirmation and leaves the count to be read", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			// The live region is in the tree from the start: one inserted alongside its
			// text does not reliably announce.
			expect(announcedReport().textContent).toBe("");

			type(2022, "Tunic");
			commit();
			act(() => {
				theCommit().options?.onSuccess?.(
					savedList([
						seededItem(2022, "Tunic"),
					]),
				);
			});
			type(2011, "Portal 2");

			// Only the confirmation is announced; entries crossing to unsaved sit
			// outside the live region.
			expect(announcedReport().textContent).toBe("Last saved at 14:32:09");
			expect(reportLine()).toBe("Last saved at 14:32:09 - 1 entry unsaved");
		});
	});

	describe("typing while a commit is in flight", () => {
		test("keeps a year typed into after the commit left, and reports it unsaved", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
				seededItem(2019, "Disco Elysium"),
			]);

			type(2022, "Tunic");
			commit();
			type(2020, "Hades");

			act(() => {
				theCommit().options?.onSuccess?.(
					savedList([
						seededItem(2022, "Tunic"),
						seededItem(2019, "Disco Elysium (stored)"),
					]),
				);
			});

			// The year typed into keeps what was typed; the year the commit carried and
			// the year left alone throughout both take the answer, tidying included.
			expect(fieldFor(2020)).toHaveProperty("value", "Hades");
			expect(fieldFor(2022)).toHaveProperty("value", "Tunic");
			expect(fieldFor(2019)).toHaveProperty("value", "Disco Elysium (stored)");
			expect(reportLine()).toBe("Last saved at 14:32:09 - 1 entry unsaved");
		});

		test("never rewrites a year still being typed into with the answer's version", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			type(2022, "Tunic");
			commit();
			type(2022, "Tunic Redux");

			act(() => {
				theCommit().options?.onSuccess?.(
					savedList([
						seededItem(2022, "Tunic"),
					]),
				);
			});

			expect(fieldFor(2022)).toHaveProperty("value", "Tunic Redux");
			expect(reportLine()).toBe("Last saved at 14:32:09 - 1 entry unsaved");
		});
	});

	describe("the keyboard shortcut", () => {
		test("takes the same commit the control does", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			type(2022, "Tunic");
			const { browserSaveSuppressed } = pressSaveShortcut();

			expect(mutateMock).toHaveBeenCalledTimes(1);
			expect(theCommit().items).toEqual([
				{
					year: 2022,
					name: "Tunic",
				},
			]);
			expect(browserSaveSuppressed).toBe(true);
		});

		test("answers to the Mac chord as well as the Windows one", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			type(2022, "Tunic");
			pressSaveShortcut("metaKey");

			expect(mutateMock).toHaveBeenCalledTimes(1);
		});

		test("commits once for a chord held down rather than once per repeat", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			type(2022, "Tunic");
			pressSaveShortcut("ctrlKey", {
				repeat: true,
			});

			expect(mutateMock).not.toHaveBeenCalled();
		});

		test("takes no commit the control would not offer, and still swallows the browser's own save", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			// Nothing has changed, so there is nothing to commit — but reaching for the
			// shortcut is still someone meaning to save their list, not the page.
			const { browserSaveSuppressed } = pressSaveShortcut();

			expect(mutateMock).not.toHaveBeenCalled();
			expect(browserSaveSuppressed).toBe(true);
		});

		test("takes no second commit while one is still in flight", () => {
			mutationState = {
				isPending: true,
				isError: false,
			};

			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			type(2022, "Tunic");
			pressSaveShortcut();

			expect(mutateMock).not.toHaveBeenCalled();
		});

		test("leaves the shortcut behind when the editor does", () => {
			renderForm([
				seededItem(2022, "Elden Ring"),
			]);

			type(2022, "Tunic");
			cleanup();
			pressSaveShortcut();

			expect(mutateMock).not.toHaveBeenCalled();
		});
	});

	test("names the commit for what it does, and for what it is doing", () => {
		renderForm([
			seededItem(2022, "Elden Ring"),
		]);

		expect(commitAction().textContent).toBe("Save all");

		mutationState = {
			isPending: true,
			isError: false,
		};
		cleanup();
		renderForm([
			seededItem(2022, "Elden Ring"),
		]);

		expect(commitAction().textContent).toBe("Saving…");
	});

	test("announces a refused commit rather than leaving it silent", () => {
		mutationState = {
			isPending: false,
			isError: true,
		};

		renderForm();

		expect(screen.getByRole("alert").textContent).toBeTruthy();
	});
});
