import { useLocalized } from "#/lib/language/LanguageProvider.tsx";
import { HorizontalRule } from "#/ui/HorizontalRule.tsx";
import { homeMessages } from "./messages.ts";

export function HomePage() {
	const messages = useLocalized(homeMessages);
	return (
		<section>
			<HorizontalRule />
			<h1>{messages.heading}</h1>
		</section>
	);
}
