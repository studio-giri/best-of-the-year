import { validateEmail } from "@boty/shared/api/rankings/claim/claimRules";
import { RecoveryRejected } from "@boty/shared/api/rankings/recover/RecoveryRejected.error";
import { useForm } from "@tanstack/react-form";
import { Schema } from "effect";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useMessages } from "#/lib/language/commonMessages.ts";
import { useLanguage, useLocalized } from "#/lib/language/LanguageProvider.tsx";
import { Button } from "#/ui/form/Button.tsx";
import { TextField } from "#/ui/form/TextField.tsx";
import { Subtitle } from "#/ui/Subtitle.tsx";
import { recoverMessages } from "./messages.ts";
import { useRequestRecovery } from "./useRequestRecovery.mutation.ts";

/**
 * Recovery-request form: a single email field, validated up front with the same
 * rule and copy the claim form uses. A ranking-backed email shows the check-inbox
 * confirmation; any email rejection — empty, malformed, or backing no ranking —
 * comes back as a `RecoveryRejected` code that maps to an inline message, so the
 * person corrects the address without leaving the form. The reader's current
 * Language rides along in the request so the email arrives in that Language.
 */
export function RequestRecovery() {
	const messages = useLocalized(recoverMessages);
	const common = useMessages();
	const { language } = useLanguage();
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
				// Carry the current Language so the email matches what the person is
				// reading now — not the Language they claimed in.
				await requestRecovery.mutateAsync({
					email: value.email,
					language,
				});
				setSent(true);
			} catch (error) {
				// The server re-runs the same email rule and owns the existence check;
				// map its code to the inline message the field would show.
				if (Schema.is(RecoveryRejected)(error)) {
					setServerError(messages.rejections[error.code]);
					return;
				}
				// Anything else (network blip, 5xx) is transient: show a generic
				// retryable message; the raw error is data, appended untranslated.
				setServerError(`${common.genericError} (${String(error)})`);
				console.error(error);
			}
		},
	});

	if (sent) {
		return (
			<>
				<Subtitle>{messages.subtitle}</Subtitle>
				<div className="max-w-xl mx-auto">
					<div className="bg-surface/90 rounded-2xl mx-3 p-8">
						<p role="status" className="text-white">
							{messages.sent}
						</p>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<Subtitle>{messages.subtitle}</Subtitle>
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
								return code ? messages.rejections[code] : undefined;
							},
						}}
					>
						{(field) => (
							<TextField
								label={messages.emailLabel}
								hint={messages.emailHint}
								icon={Mail}
								error={field.state.meta.errors[0]}
								input={{
									type: "email",
									required: true,
									placeholder: messages.emailPlaceholder,
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
						{messages.submit}
					</Button>
				</form>
			</div>
		</>
	);
}
