import { createHash } from "node:crypto";

/**
 * Hash a raw bearer token to its storage form (SHA-256 hex). Shared by every
 * token kind — long-lived Owner tokens and single-use recovery links alike — so
 * the write path (store the hash) and any future verify path (hash an incoming
 * token to look it up) share one definition and never keep a raw secret at rest.
 */
export function hashToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}
