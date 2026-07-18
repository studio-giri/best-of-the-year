import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

/**
 * The switcher invalidates the router after a choice so SSR-derived state
 * re-resolves; the router context isn't spun up here, so mock the seam.
 */
const invalidateMock = vi.fn();
vi.mock("@tanstack/react-router", () => ({
	useRouter: () => ({
		invalidate: invalidateMock,
	}),
}));

import {
	LanguageProvider,
	useLanguage,
} from "#/lib/language/LanguageProvider.tsx";
import { LanguageSwitcher } from "./LanguageSwitcher.tsx";

// Reflects the provider's current Language so a re-render is observable.
function LanguageProbe() {
	const { language } = useLanguage();
	return <span data-testid="current-language">{language}</span>;
}

beforeEach(() => {
	invalidateMock.mockReset();
});

afterEach(() => {
	cleanup();
	// Expire the cookie so a persisted choice doesn't leak into the next test.
	// biome-ignore lint/suspicious/noDocumentCookie: test cleanup; the Cookie Store API is async and adds nothing here.
	document.cookie = "lang=; Path=/; Max-Age=0";
});

describe("LanguageSwitcher", () => {
	test("switching to French re-renders in French and persists the cookie", () => {
		render(
			<LanguageProvider initialLanguage="en">
				<LanguageSwitcher />
				<LanguageProbe />
			</LanguageProvider>,
		);

		expect(screen.getByTestId("current-language").textContent).toBe("en");

		fireEvent.click(
			screen.getByRole("button", {
				name: "Français",
			}),
		);

		// Immediate re-render in the new Language...
		expect(screen.getByTestId("current-language").textContent).toBe("fr");
		expect(
			screen
				.getByRole("button", {
					name: "Français",
				})
				.getAttribute("aria-pressed"),
		).toBe("true");
		// ...persisted for future visits...
		expect(document.cookie).toContain("lang=fr");
		// ...and SSR-derived state refreshed.
		expect(invalidateMock).toHaveBeenCalled();
	});
});
