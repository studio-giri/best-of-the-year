import { validateEmail } from "@boty/shared/api/rankings/claim/claimRules";
import { RecoveryRejected } from "@boty/shared/api/rankings/recover/RecoveryRejected.error";
import { useForm } from "@tanstack/react-form";
import { Schema } from "effect";
import { Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "#/ui/form/Button.tsx";
import { TextField } from "#/ui/form/TextField.tsx";
import { Subtitle } from "#/ui/Subtitle.tsx";
import { emailRejectionMessages, recoverySentMessage } from "./messages.ts";
import { useRequestRecovery } from "./useRequestRecovery.mutation.ts";

/**
 * Recovery-request form: a single email field, validated up front with the same
 * rule and copy the claim form uses. A ranking-backed email shows the check-inbox
 * confirmation; any email rejection — empty, malformed, or backing no ranking —
 * comes back as a `RecoveryRejected` code that maps to an inline message, so the
 * person corrects the address without leaving the form.
 */
export function RequestRecovery() {
	const requestRecovery = useRequestRecovery();

	// True once a link has been emailed; the form is replaced by the confirmation.
	const [sent, setSent] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			setServerError(null);
			try {
				await requestRecovery.mutateAsync(value);
				setSent(true);
			} catch (error) {
				// The server re-runs the same email rule and owns the existence check;
				// map its code to the inline message the field would show.
				if (Schema.is(RecoveryRejected)(error)) {
					setServerError(emailRejectionMessages[error.code]);
					return;
				}
				// Anything else (network blip, 5xx) is transient: show a generic
				// retryable message and keep the user on the form.
				setServerError(
					`Something went wrong, please try again later. (${String(error)})`,
				);
				console.error(error);
			}
		},
	});

	if (sent) {
		return (
			<>
				<Subtitle>Recover your ranking</Subtitle>
				<div className="max-w-xl mx-auto">
					<div className="bg-surface/90 rounded-2xl mx-3 p-8">
						<p role="status" className="text-white">
							{recoverySentMessage}
						</p>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<Subtitle>Recover your ranking</Subtitle>
			<div className="max-w-xl mx-auto">
				<form
					// We own validation messaging: suppress the browser's native validation
					noValidate
					className="bg-surface/90 rounded-2xl mx-3 p-8 flex flex-col gap-4"
					onSubmit={(event) => {
						event.preventDefault();
						form.handleSubmit();
					}}
				>
					<form.Field
						name="email"
						validators={{
							onSubmit: ({ value }) => {
								const code = validateEmail(value);
								return code ? emailRejectionMessages[code] : undefined;
							},
						}}
					>
						{(field) => (
							<TextField
								label="Email"
								hint="The address you used when you created your ranking."
								icon={Mail}
								error={field.state.meta.errors[0]}
								input={{
									type: "email",
									required: true,
									placeholder: "your@email.com",
									name: field.name,
									value: field.state.value,
									onBlur: field.handleBlur,
									onChange: (event) => {
										setServerError(null);
										field.handleChange(event.target.value);
									},
								}}
							/>
						)}
					</form.Field>

					{serverError ? (
						<span role="alert" className="text-sm text-danger">
							{serverError}
						</span>
					) : null}

					<Button type="submit" loading={requestRecovery.isPending}>
						Email me a link
					</Button>
				</form>
			</div>
		</>
	);
}
