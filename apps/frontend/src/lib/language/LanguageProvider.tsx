import type { Language } from "@boty/shared/language/Language.schema";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { writeLanguageCookie } from "./languageCookie.ts";

interface LanguageContextValue {
	readonly language: Language;
	readonly setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Holds the reader's current Language for the whole client tree, seeded from
 * the server-resolved value so the first paint is already correct. Changing it
 * re-renders every consumer immediately and persists the choice to a cookie. An
 * effect mirrors the Language onto `<html lang>`, which lives above this
 * provider and so can't consume the context directly.
 */
export function LanguageProvider({
	initialLanguage,
	children,
}: {
	initialLanguage: Language;
	children: React.ReactNode;
}) {
	const [language, setLanguageState] = useState(initialLanguage);

	// A switch is both immediate (state drives an instant re-render) and durable
	// (the cookie carries the choice to future SSR renders and the email).
	const setLanguage = useCallback((next: Language) => {
		setLanguageState(next);
		writeLanguageCookie(next);
	}, []);

	// Keep the real `<html lang>` in step with the current Language on the client.
	useEffect(() => {
		document.documentElement.lang = language;
	}, [
		language,
	]);

	const value = useMemo(
		() => ({
			language,
			setLanguage,
		}),
		[
			language,
			setLanguage,
		],
	);

	return (
		<LanguageContext.Provider value={value}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage(): LanguageContextValue {
	const value = useContext(LanguageContext);
	if (value === null) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return value;
}

/**
 * Pick the current-Language slice from a per-Language record. The catalog's
 * shape guarantees every Language is present, so this is a total lookup — the
 * building block the message hooks and per-page catalogs read through.
 */
export function useLocalized<T>(record: Record<Language, T>): T {
	const { language } = useLanguage();
	return record[language];
}
