import { Schema } from "effect";

/**
 * Returned once when a recovery link is exchanged for edit access. Carries only
 * what the consuming browser needs: `id` to navigate to the owner editor, and
 * `ownerToken` — the opaque bearer secret it stores to own the ranking from now
 * on (the server keeps only its hash, so this is the sole moment it is visible).
 * Never carries the email: recovery restores access without ever exposing it.
 */
export const ConsumeRecoveryResponse = Schema.Struct({
	id: Schema.String,
	ownerToken: Schema.String,
});

export type ConsumeRecoveryResponse = Schema.Schema.Type<
	typeof ConsumeRecoveryResponse
>;
