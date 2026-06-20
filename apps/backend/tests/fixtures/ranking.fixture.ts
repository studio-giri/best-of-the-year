import { randomString } from "./helpers/random.ts";

export function newRanking() {
	return {
		username: `username-${randomString()}`,
		updatedAt: new Date(),
	} as const;
}
