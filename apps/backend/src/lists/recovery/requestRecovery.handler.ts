import { validateEmail } from "@boty/shared/api/lists/claim/claimRules";
import { RecoveryRejected } from "@boty/shared/api/lists/recover/RecoveryRejected.error";
import type { RequestRecoveryBody } from "@boty/shared/api/lists/recover/RequestRecoveryBody.schema";
import type { RequestRecoveryResponse } from "@boty/shared/api/lists/recover/RequestRecoveryResponse.schema";
import { sql } from "drizzle-orm";
import { Effect } from "effect";
import { PgDrizzle } from "../../db/PgDrizzle.ts";
import { listsTable } from "../../db/schema/lists.table.ts";
import { Env } from "../../env.ts";
import { Mailer } from "../../mailer/Mailer.ts";
import { coerceLanguage } from "./coerceLanguage.ts";
import { issueRecoveryToken } from "./recoveryToken.service.ts";

/**
 * Request recovery by email: validate the email (first failure wins, before any
 * lookup runs), then look up the list it backs. A match issues a recovery
 * link and emails it; a miss is refused as `email_unknown` — a mistyped address
 * the person corrects in place. The response never echoes the submitted email
 * nor the raw token.
 */
export function requestRecovery(
	body: RequestRecoveryBody,
): Effect.Effect<
	RequestRecoveryResponse,
	RecoveryRejected,
	PgDrizzle | Env | Mailer
> {
	return Effect.gen(function* () {
		// Reuse the same email validation used at claim time, so rejection codes
		// and messages match across both flows. Refuse before any lookup runs.
		const trimmedEmail = body.email.trim();
		const emailErrorCode = validateEmail(trimmedEmail);
		if (emailErrorCode) {
			return yield* Effect.fail(
				new RecoveryRejected({
					code: emailErrorCode,
				}),
			);
		}

		// Match case and whitespace insensitively against the same
		// lower(trim(email)) expression the unique index is built on.
		const db = yield* PgDrizzle;
		const matches = yield* db
			.select({
				id: listsTable.id,
			})
			.from(listsTable)
			.where(
				sql`lower(trim(${listsTable.email})) = ${trimmedEmail.toLowerCase()}`,
			)
			.pipe(Effect.orDie);

		const list = matches[0];
		if (!list) {
			// No list backs this email: the address is mistyped. Refuse it as an
			// email rejection, the same shape as a malformed one, so the form shows
			// the reason inline and the person fixes it without leaving.
			return yield* Effect.fail(
				new RecoveryRejected({
					code: "email_unknown",
				}),
			);
		}

		// Issue a fresh single-use link (stored hashed) and email the raw token in
		// an absolute URL built from the configured frontend origin.
		const rawToken = yield* issueRecoveryToken(list.id);
		const env = yield* Env;
		const url = `${env.appBaseUrl}/recover/consume/${rawToken}`;

		// The email follows the reader's current Language, carried in the request
		// body and coerced with an English fallback.
		const language = coerceLanguage(body.language);

		// Send the email
		const mailer = yield* Mailer;
		yield* mailer.sendOwnerLink({
			to: trimmedEmail,
			url,
			language,
		});

		return {
			outcome: "sent",
		};
	});
}
