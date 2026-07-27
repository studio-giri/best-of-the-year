import { randomString } from "./helpers/random.ts";

export function newList() {
	return {
		username: `username-${randomString()}`,
		email: `${randomString()}@example.com`,
		updatedAt: new Date(),
	} as const;
}
