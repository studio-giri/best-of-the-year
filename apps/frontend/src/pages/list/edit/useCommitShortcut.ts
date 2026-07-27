import { useEffect, useRef } from "react";

interface Options {
	commit: () => void;
	offered: boolean;
}

/**
 * Ctrl+S — Cmd+S on a Mac — takes the same commit the control does.
 *
 * The browser's own Save Page is suppressed for as long as the editor is on
 * screen, whether or not a commit is on offer: someone reaching for this
 * shortcut means to save their list, and being handed a dialog that saves the
 * HTML instead answers a question nobody asked. A withheld commit does nothing
 * at all, exactly as its control does.
 */
export function useCommitShortcut({ commit, offered }: Options) {
	// The listener is registered once and reads what it needs through a ref. Bound
	// directly, it would be torn down and rebuilt on every keystroke, since the
	// editor re-renders for each character typed into it.
	const latest = useRef<Options>({
		commit,
		offered,
	});
	useEffect(() => {
		latest.current = {
			commit,
			offered,
		};
	});

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			// A held-down chord is one intent, not a commit per repeat.
			if (event.repeat || !(event.metaKey || event.ctrlKey)) {
				return;
			}
			if (event.key.toLowerCase() !== "s") {
				return;
			}

			event.preventDefault();
			if (latest.current.offered) {
				latest.current.commit();
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);
}
