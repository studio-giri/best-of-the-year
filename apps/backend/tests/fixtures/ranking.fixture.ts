import { randomString } from "./helpers/random.ts";

export function newRanking() {
	return {
		username: `username-${randomString()}`,
		email: `${randomString()}@example.com`,
		updatedAt: new Date(),
	} as const;
}
