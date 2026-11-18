import { useBlocker } from "@tanstack/react-router";
import { useCallback } from "react";

interface Options {
	hasUnsaved: boolean;
	question: string;
}

/**
 * Asks before the editor is left with unsaved years: the browser's confirm box on
 * a navigation inside the site, and its own prompt on a tab close or reload.
 */
export function useConfirmLeave({ hasUnsaved, question }: Options) {
	// Block the navigation unless the person confirms they want to leave.
	const shouldBlockFn = useCallback(
		() => !window.confirm(question),
		[
			question,
		],
	);

	// Guard every way out, the tab close included, only while something is unsaved.
	useBlocker({
		shouldBlockFn,
		enableBeforeUnload: true,
		disabled: !hasUnsaved,
	});
}
