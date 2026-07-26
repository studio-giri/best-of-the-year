/**
 * The static rules a Ranking Item answers to, shared by both sides so the
 * column, the contract and the editor cannot drift apart on the same number.
 *
 * The name ceiling is a storage limit surfaced as a rule: it is the width of the
 * column the name is stored in, and it exists to refuse pasted nonsense rather
 * than to shape a title.
 */
export const MAX_ITEM_NAME_LENGTH = 255;
