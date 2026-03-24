import { randomUUID } from "node:crypto";

export function randomString(): string {
	return randomUUID().substring(0, 8);
}
