import { useBlocker } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

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

	// Guard navigations inside the site only while something is unsaved. The router's
	// own tab-close prompt is off: it skips the next unload after a programmatic back,
	// even one that was cancelled.
	useBlocker({
		shouldBlockFn,
		enableBeforeUnload: false,
		disabled: !hasUnsaved,
	});

	// Have the browser ask before the tab is closed or reloaded with unsaved years.
	useEffect(() => {
		if (!hasUnsaved) {
			return;
		}
		const onBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
		};
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => window.removeEventListener("beforeunload", onBeforeUnload);
	}, [
		hasUnsaved,
	]);
}
