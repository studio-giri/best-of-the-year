/**
 * A moment as `HH:MM:SS` on the reader's own clock. Seconds are shown because two
 * commits of one pass often land in the same minute, and a time that does not move
 * between them reads as a save that did not happen. Formatted by hand rather than
 * by locale: the site localizes words and nothing else, so a locale-formatted time
 * would be the first thing on it whose shape depends on the Language.
 */
export function formatClockTime(moment: Date): string {
	const hours = String(moment.getHours()).padStart(2, "0");
	const minutes = String(moment.getMinutes()).padStart(2, "0");
	const seconds = String(moment.getSeconds()).padStart(2, "0");
	return `${hours}:${minutes}:${seconds}`;
}
