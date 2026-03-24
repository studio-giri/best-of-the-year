import { randomString } from "./helpers/random";

export function newRanking() {
	return {
		author: `author-${randomString()}`,
		updatedAt: new Date(),
	} as const;
}
