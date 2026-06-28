import { HorizontalRule } from "./HorizontalRule.tsx";

interface Props {
	children: React.ReactNode;
}
export function Subtitle({ children }: Props) {
	return (
		<>
			<HorizontalRule size="small" />
			<h2 className="text-white text-center font-semibold p-8 pt-2">
				{children}
			</h2>
		</>
	);
}
