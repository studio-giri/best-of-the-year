import { useLocalized } from "#/lib/language/LanguageProvider.tsx";
import { aboutMessages } from "./messages.ts";

export function AboutPage() {
	const messages = useLocalized(aboutMessages);
	return <section>{messages.body}</section>;
}
