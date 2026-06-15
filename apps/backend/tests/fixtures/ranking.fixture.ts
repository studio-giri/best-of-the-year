import { randomString } from "./helpers/random.ts";

export function newRanking() {
	return {
		author: `author-${randomString()}`,
		updatedAt: new Date(),
	} as const;
}
