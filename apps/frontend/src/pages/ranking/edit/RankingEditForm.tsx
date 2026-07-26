import { coveredYears } from "@boty/shared/api/rankings/items/coveredYears";
import type { Ranking } from "@boty/shared/api/rankings/Ranking.schema";
import { useId, useState } from "react";
import { useMessages } from "#/lib/language/commonMessages.ts";
import { useLocalized } from "#/lib/language/LanguageProvider.tsx";
import { Button } from "#/ui/form/Button.tsx";
import { HorizontalRule } from "#/ui/HorizontalRule.tsx";
import { RankingRow } from "#/ui/RankingRow.tsx";
import { editMessages } from "./messages.ts";
import { toRankingItems, toSaveItems } from "./rankingItems.ts";
import { useSaveRankingItems } from "./useSaveRankingItems.mutation.ts";

interface Props {
	rankingId: string;
	items: Ranking["items"];
}

/**
 * The whole list as one form: every covered year is a field, in the band it will
 * be published in, and nothing reaches the server until the one commit.
 *
 * Editing a year in place is the point — the page being edited is the page being
 * published, so a name is judged where readers will meet it. Years holding no game
 * are bands like any other, which is what makes filling one in move nothing on
 * screen.
 */
export function RankingEditForm({ rankingId, items }: Props) {
	const messages = useLocalized(editMessages);
	const common = useMessages();
	const saveItems = useSaveRankingItems(rankingId);
	const emptyPassReasonId = useId();

	// The pass is held here and nowhere else until it is committed: a reader
	// loading the public list meets what was published, not what is being typed.
	const [names, setNames] = useState(() => toRankingItems(items));

	// What the pass would carry, so the commit is withheld on the games it would
	// actually publish rather than on how many fields merely look filled in — the
	// same count the server judges, which is what keeps the two from disagreeing.
	const pass = toSaveItems(names);
	const wouldPublishNothing = pass.length === 0;

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				saveItems.mutate(pass, {
					// The answer is the stored list, so the form adopts it rather than
					// what it sent: what a person sees as committed is what everyone else
					// will read.
					onSuccess: (saved) => setNames(toRankingItems(saved.items)),
				});
			}}
		>
			{/* The list reserves the height of the bar below it, so its last years stay
			    reachable rather than sitting under it. */}
			<div className="pb-28">
				<HorizontalRule />
				{coveredYears().map((year) => (
					<RankingRow key={year} year={year}>
						<input
							type="text"
							value={names[year] ?? ""}
							aria-label={messages.yearFieldLabel(year)}
							onChange={(event) =>
								setNames((current) => ({
									...current,
									[year]: event.target.value,
								}))
							}
							className="w-full bg-transparent focus:outline-none"
						/>
					</RankingRow>
				))}
			</div>

			{/* One commit for the whole pass, with whatever the last one has to say
			    beside it. The bar is pinned to the viewport rather than to the end of
			    the list, which spans every covered year: from anywhere in it, the one
			    action that publishes is in reach, and neither the page footer nor the
			    last years can slide over it. Its column is the rows', so the control
			    lines up with the list it commits. */}
			<div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-6 py-3 backdrop-blur">
				<div className="mx-auto flex max-w-150 items-center justify-end gap-4">
					{saveItems.isError ? (
						<span role="alert" className="text-sm text-danger">
							{common.genericError}
						</span>
					) : null}

					{/* A pass that would publish nothing says so where the commit it
					    withholds sits, so the reason is read alongside the control it
					    explains rather than after a refusal. */}
					{wouldPublishNothing ? (
						<span id={emptyPassReasonId} className="text-sm text-muted">
							{messages.needsOneGame}
						</span>
					) : null}
					<Button
						type="submit"
						loading={saveItems.isPending}
						disabled={wouldPublishNothing}
						aria-describedby={
							wouldPublishNothing ? emptyPassReasonId : undefined
						}
					>
						{messages.save}
					</Button>
				</div>
			</div>
		</form>
	);
}
