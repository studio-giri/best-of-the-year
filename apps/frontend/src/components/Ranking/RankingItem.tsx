import { HorizontalRule } from "../HorizontalRule";

interface Props {
	year: string;
	game: string;
}
export function RankingItem({ year, game }: Props) {
	return (
		<div
			style={{
				backgroundColor: "#00000033",
			}}
		>
			<div className="flex justify-between px-8 py-2 max-w-150 mx-auto ">
				<p className="text-white font-bold text-xl">
					{year} - {game}
				</p>
			</div>
			<HorizontalRule />
		</div>
	);
}
