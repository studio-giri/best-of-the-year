import { useMessages } from "#/lib/language/commonMessages.ts";
import { LanguageSwitcher } from "./LanguageSwitcher.tsx";

export function Header() {
	const messages = useMessages();
	return (
		<header className="relative">
			<div className="absolute top-4 right-4">
				<LanguageSwitcher />
			</div>
			<h1 className="pt-8 px-8 pb-2 text-center text-4xl font-bold text-white uppercase">
				{messages.siteTitle}
			</h1>
		</header>
	);
}
