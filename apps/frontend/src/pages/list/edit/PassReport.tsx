import { useLocalized } from "#/lib/language/LanguageProvider.tsx";
import { formatClockTime } from "./formatClockTime.ts";
import { editMessages } from "./messages.ts";

interface Props {
	id: string;
	savedAt: Date | null;
	unsavedCount: number;
	wouldPublishNothing: boolean;
}

/**
 * Where the pass stands, as one line of at most two clauses: when this visit last
 * committed, and what the pass is doing now. It sits beside the commit and states
 * whichever reason that control is withheld for, so the two are read together.
 */
export function PassReport({
	id,
	savedAt,
	unsavedCount,
	wouldPublishNothing,
}: Props) {
	const messages = useLocalized(editMessages);

	// What the pass is doing now: the floor it would break first, then the work it
	// is carrying. A settled list says nothing once a save of this visit is named,
	// rather than answering a confirmation with "no changes".
	let passState: string | null = null;
	let passStateClassName: string | undefined;
	if (wouldPublishNothing) {
		passState = messages.needsOneEntry;
	} else if (unsavedCount > 0) {
		passState = messages.entriesUnsaved(unsavedCount);
		// Work at risk is the one clause someone can act on, so it is the one the
		// line spends its full text colour on; the rest is context around it.
		passStateClassName = "text-white";
	} else if (!savedAt) {
		passState = messages.noChangesToSave;
	}

	return (
		<span id={id} className="text-sm text-white/60">
			{/* Only the confirmation is announced — entries crossing to unsaved as
			    someone types are there to be read, not read out. The live region is in
			    the tree even when empty: one inserted at the same moment as its text
			    does not reliably announce. */}
			<span role="status">
				{savedAt ? messages.lastSavedAt(formatClockTime(savedAt)) : ""}
			</span>
			{savedAt && passState ? " - " : null}
			{passState ? (
				<span className={passStateClassName}>{passState}</span>
			) : null}
		</span>
	);
}
