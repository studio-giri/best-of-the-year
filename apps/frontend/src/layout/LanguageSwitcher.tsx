import {
	type Language,
	supportedLanguages,
} from "@boty/shared/language/Language.schema";
import { useRouter } from "@tanstack/react-router";
import { useMessages } from "#/lib/language/commonMessages.ts";
import { useLanguage } from "#/lib/language/LanguageProvider.tsx";

// Two-letter button text and full endonym (each language named in itself) for
// the accessible name — these are language names, shown the same whatever the
// current UI Language.
const shortLabels: Record<Language, string> = {
	en: "EN",
	fr: "FR",
};
const endonyms: Record<Language, string> = {
	en: "English",
	fr: "Français",
};

/**
 * EN/FR switcher. Choosing a Language updates the in-memory state (an instant
 * re-render of the current screen) and persists the cookie; invalidating the
 * router then re-resolves SSR-derived state so a reload lands on the same
 * Language.
 */
export function LanguageSwitcher() {
	const { language, setLanguage } = useLanguage();
	const messages = useMessages();
	const router = useRouter();

	const choose = (next: Language) => {
		if (next === language) return;
		setLanguage(next);
		void router.invalidate();
	};

	return (
		<fieldset
			aria-label={messages.languageSwitcherLabel}
			className="flex gap-2 text-sm border-0 m-0 p-0 min-w-0"
		>
			{supportedLanguages.map((option) => {
				const active = option === language;
				return (
					<button
						key={option}
						type="button"
						aria-label={endonyms[option]}
						aria-pressed={active}
						onClick={() => choose(option)}
						className={`cursor-pointer uppercase ${
							active ? "font-bold text-white" : "text-white/60 hover:text-white"
						}`}
					>
						{shortLabels[option]}
					</button>
				);
			})}
		</fieldset>
	);
}
