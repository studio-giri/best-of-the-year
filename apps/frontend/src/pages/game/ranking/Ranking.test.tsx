import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Ranking } from "./Ranking.tsx";

test("renders one row per item, mapping year and name as received", () => {
	/**
	 * Ordering is now the API's guarantee — the component renders items in the
	 * order given. This guards the field mapping (year shown, name → game label)
	 * and that every item produces a row.
	 */
	render(
		<Ranking
			items={[
				{
					id: "2",
					year: 2023,
					name: "Baldur's Gate 3",
				},
				{
					id: "3",
					year: 2022,
					name: "Elden Ring",
				},
				{
					id: "1",
					year: 2021,
					name: "It Takes Two",
				},
			]}
		/>,
	);

	const rows = screen
		.getAllByText(/^\d{4} -/)
		.map((element) => element.textContent);
	expect(rows).toEqual([
		"2023 - Baldur's Gate 3",
		"2022 - Elden Ring",
		"2021 - It Takes Two",
	]);
});
