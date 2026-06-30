import { createHash } from "node:crypto";

/**
 * Hash a raw Owner token to its storage form (SHA-256 hex). Kept separate so the
 * write path (store the hash) and a future verify path (hash an incoming bearer
 * token to look it up) share one definition.
 */
export function hashOwnerToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}
