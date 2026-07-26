import { HorizontalRule } from "./HorizontalRule.tsx";

interface Props {
	year: number;
	children: React.ReactNode;
}

/**
 * The band one year of a ranking occupies: a full-bleed strip, its content held
 * to the page's column, closed by a rule.
 *
 * The year is the row's own; what fills the name slot is the caller's, so the
 * same band serves a published name and a field editing it. Type and color sit
 * on the band rather than on the children, which keeps those two renderings at
 * one size — form controls inherit font and color under Tailwind's preflight.
 */
export function RankingRow({ year, children }: Props) {
	return (
		<div className="bg-black/20">
			<p className="mx-auto flex max-w-150 px-8 py-2 text-xl font-bold text-white">
				{/* The separator is text, not a flex gap, so the row reads as one line
				    to anything that walks the DOM — preserved rather than collapsed,
				    since a flex item drops the white space it ends with. Tabular digits
				    keep every year the same width down the list. */}
				<span className="shrink-0 tabular-nums whitespace-pre">{`${year} - `}</span>
				<span className="min-w-0 grow">{children}</span>
			</p>
			<HorizontalRule />
		</div>
	);
}
