import { HorizontalRule } from "#/components/HorizontalRule";

export function Footer() {
	return (
		<footer>
			<HorizontalRule />
			<p className="py-2 text-center  text-white">
				Crafted with 🤘 by Paulin ·{" "}
				<a
					className="underline"
					href="https://github.com/studio-giri/best-of-the-year"
				>
					Github
				</a>
			</p>
		</footer>
	);
}
