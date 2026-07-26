import { FIRST_COVERED_YEAR } from "@boty/shared/api/rankings/items/coveredYears";
import type { SaveRankingItemsBody } from "@boty/shared/api/rankings/items/SaveRankingItemsBody.schema";
import type { Ranking } from "@boty/shared/api/rankings/Ranking.schema";
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
			items: SaveRankingItemsBody["items"],
			options?: {
				onSuccess?: (saved: Ranking) => void;
			},
		) => void
	>();
let mutationState = {
	isPending: false,
	isError: false,
};
vi.mock("./useSaveRankingItems.mutation.ts", () => ({
	useSaveRankingItems: () => ({
		mutate: mutateMock,
		...mutationState,
	}),
}));

import { RankingEditForm } from "./RankingEditForm.tsx";

const RANKING_ID = "ranking-1";

// The years the editor offers, derived from the clock the same way the site
// derives Covered Years — never a literal, or the list would rot in January.
const CURRENT_YEAR = new Date().getUTCFullYear();
const EXPECTED_YEARS = Array.from(
	{
		length: CURRENT_YEAR - FIRST_COVERED_YEAR + 1,
	},
	(_, index) => CURRENT_YEAR - index,
);

function renderForm(items: Ranking["items"] = []) {
	return renderWithLanguage(
		<RankingEditForm rankingId={RANKING_ID} items={items} />,
	);
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

function commitAction() {
	return screen.getByRole("button", {
		name: "Save all",
	});
}

function commit() {
	fireEvent.click(commitAction());
}

/** What the one commit of a pass carried, and the callbacks it was given. */
function theCommit() {
	const call = mutateMock.mock.calls[0];
	if (!call) {
		throw new Error("no commit was taken");
	}
	return {
		items: call[0],
		options: call[1],
	};
}

function seededItem(year: number, name: string) {
	return {
		id: `item-${year}`,
		year,
		name,
	};
}

/** A stored Ranking, as the server answers a commit with it. */
function savedRanking(items: Ranking["items"]): Ranking {
	return {
		id: RANKING_ID,
		username: "the-username",
		updatedAt: new Date("2026-07-26T10:00:00.000Z"),
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

describe("RankingEditForm", () => {
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
				savedRanking([
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
				savedRanking([
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

			expect(commitAction()).toHaveProperty("disabled", true);
			expect(screen.getByText("A list needs at least one game.")).toBeTruthy();

			// Withheld means withheld: taking the action anyway sends nothing.
			commit();
			expect(mutateMock).not.toHaveBeenCalled();
		});

		test("withholds the commit until some year holds a game again", () => {
			renderForm([
				seededItem(2020, "Hades"),
			]);

			// A list holding one game commits like any other, until that game is the
			// one being cleared.
			expect(commitAction()).toHaveProperty("disabled", false);
			type(2020, "");
			expect(commitAction()).toHaveProperty("disabled", true);

			// Filling a different year is what brings the commit back — and it then
			// publishes both changes, the year emptied and the year filled, together.
			type(2011, "Portal 2");
			expect(commitAction()).toHaveProperty("disabled", false);
			expect(screen.queryByText("A list needs at least one game.")).toBeNull();

			commit();
			expect(theCommit().items).toEqual([
				{
					year: 2011,
					name: "Portal 2",
				},
			]);
		});
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
