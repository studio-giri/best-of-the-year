/**
 * Browser-held Owner tokens (ADR-001): the bearer secret that grants this
 * browser owner access to a list, keyed by list id. Persisted in
 * localStorage so ownership survives across visits without any account.
 *
 * SSR-safe: localStorage exists only in the browser, so every access guards on
 * `window`. On the server these are no-ops (no token → public view), which is
 * the correct default for a request that carries no browser storage.
 */
import { Data, Schema, type Types } from "effect";

const STORAGE_KEY = "boty:owner-tokens";

/**
 * The Owner token could not be written to localStorage (storage full or
 * disabled). The write is the last step of a claim that already succeeded
 * server-side, so the caller must surface this — the browser now holds no proof
 * of an ownership it legitimately has.
 */
export class OwnerTokenNotStored extends Data.TaggedError(
	"OwnerTokenNotStored",
)<{
	listId: string;
}> {}

/**
 * localStorage is untrusted input — a stale format, another script, or manual
 * tampering can put anything under our key. This schema lets us validate the
 * shape rather than cast and hope: a value that isn't a string-to-string map is
 * treated as absent.
 */
const TokenMap = Schema.Record(Schema.String, Schema.String);
type TokenMap = Types.Mutable<Schema.Schema.Type<typeof TokenMap>>;
const isTokenMap = Schema.is(TokenMap);

/**
 * Read the whole token map, tolerating absent/corrupt storage by returning an
 * empty map — a parse failure must never break rendering.
 */
function readTokens(): TokenMap {
	if (typeof window === "undefined") {
		return {};
	}

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return {};
		}

		const parsed: unknown = JSON.parse(raw);
		return isTokenMap(parsed)
			? {
					...parsed,
				}
			: {};
	} catch (error) {
		console.error("Failed to retrieve OwnerToken from localStorage", {
			cause: error,
		});
		return {};
	}
}

/**
 * The Owner token this browser holds for a list, or undefined if none.
 */
export function getOwnerToken(listId: string): string | undefined {
	return readTokens()[listId];
}

/**
 * True when this browser can open the owner view for a list — i.e. it holds
 * a token. This is the client-side edit-access grant the route guard reads.
 */
export function hasOwnerToken(listId: string): boolean {
	return getOwnerToken(listId) !== undefined;
}

/**
 * Persist the token a successful claim handed back, granting this browser owner
 * access to the list from now on.
 *
 * The claim it follows already succeeded server-side by the time we get here, so
 * a storage failure (quota exceeded, storage blocked) is not a retryable request
 * error — it is a distinct, terminal condition. We raise it as a typed
 * `OwnerTokenNotStored` so the caller handles it on its own path instead of
 * mistaking it for a transient failure and inviting a doomed resubmit.
 */
export function setOwnerToken(listId: string, token: string): void {
	if (typeof window === "undefined") {
		return;
	}

	try {
		const tokens = readTokens();
		tokens[listId] = token;
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
	} catch (error) {
		console.error("Failed to persist OwnerToken to localStorage", {
			cause: error,
		});
		throw new OwnerTokenNotStored({
			listId,
		});
	}
}
