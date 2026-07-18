import { useMessages } from "#/lib/language/commonMessages.ts";
import { HorizontalRule } from "#/ui/HorizontalRule.tsx";

export function Footer() {
	const messages = useMessages();
	return (
		<footer>
			<HorizontalRule />
			<p className="py-2 text-center  text-white">
				{messages.footerCredit}{" "}
				<a
					className="underline"
					href="https://github.com/studio-giri/best-of-the-year"
				>
					GitHub
				</a>
			</p>
		</footer>
	);
}
