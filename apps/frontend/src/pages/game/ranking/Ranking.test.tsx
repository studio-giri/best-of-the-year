import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Ranking } from "./Ranking";

test("renders items newest-first regardless of input order", () => {
	/**
	 * Items deliberately unordered — the component owns the ordering guarantee
	 * (the API does not provide one)
	 */
	render(
		<Ranking
			items={[
				{
					id: "1",
					year: 2021,
					name: "It Takes Two",
				},
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
