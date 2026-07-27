import { coveredYears } from "@boty/shared/api/lists/items/coveredYears";
import type { List } from "@boty/shared/api/lists/List.schema";
import { useId, useRef, useState } from "react";
import { useMessages } from "#/lib/language/commonMessages.ts";
import { useLocalized } from "#/lib/language/LanguageProvider.tsx";
import { Button } from "#/ui/form/Button.tsx";
import { HorizontalRule } from "#/ui/HorizontalRule.tsx";
import { ListRow } from "#/ui/ListRow.tsx";
import { toListItems, toSaveItems } from "./listItems.ts";
import { mergeSavedList } from "./mergeSavedList.ts";
import { editMessages } from "./messages.ts";
import { PassReport } from "./PassReport.tsx";
import { unsavedYears } from "./unsavedYears.ts";
import { useCommitShortcut } from "./useCommitShortcut.ts";
import { useSaveListItems } from "./useSaveListItems.mutation.ts";

interface Props {
	listId: string;
	items: List["items"];
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
export function ListEditForm({ listId, items }: Props) {
	const messages = useLocalized(editMessages);
	const common = useMessages();
	const saveItems = useSaveListItems(listId);
	const reportId = useId();

	// The pass is held here and nowhere else until it is committed: a reader
	// loading the public list meets what was published, not what is being typed.
	const [names, setNames] = useState(() => toListItems(items));

	// The last-saved list, the one yardstick everything the report says is measured
	// against. Seeded from the fetch, then replaced whole by each answer.
	const [baseline, setBaseline] = useState(() => toListItems(items));

	// When this visit last committed, and null until it has. The stored time of a
	// fetched List is deliberately not it: on a freshly claimed List that is the
	// claim's timestamp, so reporting it would state a save nobody took.
	const [savedAt, setSavedAt] = useState<Date | null>(null);

	// The years typed into since the last commit left, so its answer can land on
	// every other year without overwriting text it never carried.
	const typedSinceCommit = useRef<Set<number>>(new Set());

	// What the pass would carry, so the commit is withheld on the games it would
	// actually publish rather than on how many fields merely look filled in — the
	// same count the server judges, which is what keeps the two from disagreeing.
	const pass = toSaveItems(names);
	const wouldPublishNothing = pass.length === 0;

	// A commit is offered only for work it would carry: an unchanged pass has
	// nothing to save, and an empty one would break the floor.
	const unsaved = unsavedYears(names, baseline);
	const commitWithheld = wouldPublishNothing || unsaved.length === 0;

	// The one commit, wherever it was taken from — the control, or the shortcut
	// that stands in for it — so neither route can drift from the other.
	function commitPass() {
		// From here on, typing belongs to the person rather than to the answer on
		// its way back.
		typedSinceCommit.current = new Set();

		saveItems.mutate(pass, {
			// The answer is the stored list, so the form adopts it rather than what
			// it sent: what a person sees as committed is what everyone else will
			// read. Years typed into since are the exception, kept as typed.
			onSuccess: (saved) => {
				setNames((current) =>
					mergeSavedList({
						fields: current,
						saved: saved.items,
						keepYears: typedSinceCommit.current,
					}),
				);
				setBaseline(toListItems(saved.items));
				setSavedAt(saved.updatedAt);
			},
		});
	}

	// The shortcut is offered on exactly what the control is offered on: a pass
	// worth carrying, and no request already in the air.
	useCommitShortcut({
		commit: commitPass,
		offered: !commitWithheld && !saveItems.isPending,
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				commitPass();
			}}
		>
			{/* The list reserves the height of the bar below it, so its last years stay
			    reachable rather than sitting under it. */}
			<div className="pb-28">
				<HorizontalRule />
				{coveredYears().map((year) => (
					<ListRow key={year} year={year}>
						<input
							type="text"
							value={names[year] ?? ""}
							aria-label={messages.yearFieldLabel(year)}
							onChange={(event) => {
								typedSinceCommit.current.add(year);
								setNames((current) => ({
									...current,
									[year]: event.target.value,
								}));
							}}
							className="w-full bg-transparent focus:outline-none"
						/>
					</ListRow>
				))}
			</div>

			{/* One commit for the whole pass, with whatever the last one has to say
			    beside it. The bar is pinned to the viewport rather than to the end of
			    the list, which spans every covered year: from anywhere in it, the one
			    action that publishes is in reach, and neither the page footer nor the
			    last years can slide over it. */}
			<div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 py-3 backdrop-blur">
				{/* The bar's column is the bands' column, padding included, so the commit
				    starts on the same edge as every year down the list. */}
				<div className="mx-auto flex max-w-150 items-center justify-start gap-4 px-8">
					<Button
						type="submit"
						loading={saveItems.isPending}
						disabled={commitWithheld}
						aria-describedby={commitWithheld ? reportId : undefined}
					>
						{saveItems.isPending ? messages.saving : messages.save}
					</Button>

					{/* Where the pass stands sits where the commit it describes sits, so a
					    withheld control is read alongside the reason it is withheld rather
					    than only after a refusal. A refusal stacks under that same slot
					    rather than beside it: both speak about the last commit, so they
					    read as one column of news about it. */}
					<div className="flex flex-col">
						<PassReport
							id={reportId}
							savedAt={savedAt}
							unsavedCount={unsaved.length}
							wouldPublishNothing={wouldPublishNothing}
						/>

						{saveItems.isError ? (
							<span role="alert" className="text-sm text-danger">
								{common.genericError}
							</span>
						) : null}
					</div>
				</div>
			</div>
		</form>
	);
}
