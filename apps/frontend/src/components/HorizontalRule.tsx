const colorBig = "C6C2DC";
const size1Big = 25;
const size2Big = 5;

const colorSml = "A6A2BC";
const size1Sml = "100px";
const size2Sml = "15px";

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
								#${colorBig}00 calc(50% - ${size1Big}%),
								#${colorBig}33 calc(50% - ${size1Big / 2}%),
								#${colorBig}ff calc(50% - ${size2Big}px),
								#${colorBig}ff calc(50% + ${size2Big}px),
								#${colorBig}33 calc(50% + ${size1Big / 2}%),
								#${colorBig}00 calc(50% + ${size1Big}%),
								#${colorBig}00 100%)
							`
						: `linear-gradient(to right, #${colorSml}00 0%, #${colorSml}00 calc(50% - ${size1Sml}), #${colorSml}ff calc(50% - ${size2Sml}), #${colorSml}ff calc(50% + ${size2Sml}), #${colorSml}00 calc(50% + ${size1Sml}), #${colorSml}00 100%)`,
			}}
		/>
	);
}
