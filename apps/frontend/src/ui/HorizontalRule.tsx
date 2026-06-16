// A symmetric horizontal fade rendered as a CSS gradient. The stops are
// positioned relative to the center (50%); colors are raw hex (no leading
// `#`) so they can be interpolated with an alpha suffix below. This is a
// bespoke gradient, not a Tailwind theme token — hence the inline style.
//
// Note the two variants deliberately use different units: "big" sizes its
// stops as a percentage of width, "small" uses fixed pixels. They are not
// unified because % and px produce visually different fades by design.
const colorBig = "C6C2DC";
const fadeOuterBig = 25; // % of width: where the line fully fades to transparent
const coreHalfBig = 5; // px: half-width of the fully-opaque center segment

const colorSml = "A6A2BC";
const fadeOuterSml = "100px"; // distance from center where the line fades out
const coreHalfSml = "15px"; // half-width of the fully-opaque center segment

interface Props {
	size?: "big" | "small";
}
export function HorizontalRule({ size = "big" }: Props) {
	return (
		<div
			className="h-px w-full"
			style={{
				background:
					size === "big"
						? `linear-gradient(
								to right,
								#${colorBig}00 0%,
								#${colorBig}00 calc(50% - ${fadeOuterBig}%),
								#${colorBig}33 calc(50% - ${fadeOuterBig / 2}%),
								#${colorBig}ff calc(50% - ${coreHalfBig}px),
								#${colorBig}ff calc(50% + ${coreHalfBig}px),
								#${colorBig}33 calc(50% + ${fadeOuterBig / 2}%),
								#${colorBig}00 calc(50% + ${fadeOuterBig}%),
								#${colorBig}00 100%)
							`
						: `linear-gradient(to right, #${colorSml}00 0%, #${colorSml}00 calc(50% - ${fadeOuterSml}), #${colorSml}ff calc(50% - ${coreHalfSml}), #${colorSml}ff calc(50% + ${coreHalfSml}), #${colorSml}00 calc(50% + ${fadeOuterSml}), #${colorSml}00 100%)`,
			}}
		/>
	);
}
