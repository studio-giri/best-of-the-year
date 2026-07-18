import { Link } from "@tanstack/react-router";
import { useMessages } from "#/lib/language/commonMessages.ts";
import { HorizontalRule } from "#/ui/HorizontalRule.tsx";

export function Footer() {
	const messages = useMessages();
	return (
		<footer>
			<HorizontalRule />
			<p className="py-2 text-center  text-white">
				<a
					href="https://github.com/studio-giri/best-of-the-year"
					target="_blank"
					rel="noopener"
				>
					{messages.footerCredit}
				</a>
				{" · "}
				<Link to="/ranking/claim" className="underline">
					{messages.createYourOwn}
				</Link>
			</p>
		</footer>
	);
}
