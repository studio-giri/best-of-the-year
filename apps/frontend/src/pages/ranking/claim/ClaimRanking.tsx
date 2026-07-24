import { ClaimRejected } from "@boty/shared/api/rankings/claim/ClaimRejected.error";
import {
	validateEmail,
	validateUsername,
} from "@boty/shared/api/rankings/claim/claimRules";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Schema } from "effect";
import { Mail, User2 } from "lucide-react";
import { useState } from "react";
import { useMessages } from "#/lib/language/commonMessages.ts";
import { useLocalized } from "#/lib/language/LanguageProvider.tsx";
import { OwnerTokenNotStored } from "#/lib/ownerTokens.ts";
import { Button } from "#/ui/form/Button.tsx";
import { TextField } from "#/ui/form/TextField.tsx";
import { Subtitle } from "#/ui/Subtitle.tsx";
import { claimMessages } from "./messages.ts";
import { useClaimRanking } from "./useClaimRanking.mutation.ts";

/**
 * Claim form: email + username, both required and validated up front.
 * On success the mutation has already stored the Owner token, so we route
 * straight into the editable owner view. A server-side username collision
 * (only knowable at claim time) maps back to its inline message and
 * keeps the user on the form. A claim that succeeds but whose token can't be
 * stored is its own terminal case: we keep the user on the form with an
 * explanatory message rather than route into a view they can't edit.
 */
export function ClaimRanking() {
	const messages = useLocalized(claimMessages);
	const common = useMessages();
	const navigate = useNavigate();
	const claimRanking = useClaimRanking();

	// The one rejection that can only come from the server (the case/whitespace-
	// insensitive uniqueness check at claim time). Held separately from the
	// field validators so it can be cleared the moment the user edits again.
	// `offerRecovery` marks the duplicate-email case, the only refusal rendered
	// with a link into the recovery flow rather than as plain inline text.
	const [serverError, setServerError] = useState<{
		message: string;
		offerRecovery: boolean;
	} | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
			username: "",
		},
		onSubmit: async ({ value }) => {
			setServerError(null);
			try {
				const claimed = await claimRanking.mutateAsync(value);
				await navigate({
					to: "/ranking/$rankingId/edit",
					params: {
						rankingId: claimed.id,
					},
				});
			} catch (error) {
				// Map a claim refusal to its inline message. A duplicate email is the
				// one refusal that also offers a recovery link; every other code stays
				// plain inline text.
				if (Schema.is(ClaimRejected)(error)) {
					setServerError({
						message: messages.rejections[error.code],
						offerRecovery: error.code === "email_taken",
					});
					return;
				}
				// The claim succeeded but its token couldn't be saved to this browser:
				// terminal, not retryable, so explain it rather than invite a resubmit
				if (error instanceof OwnerTokenNotStored) {
					setServerError({
						message: messages.ownerTokenNotStored,
						offerRecovery: false,
					});
					return;
				}
				// Anything else (network blip, 5xx) is transient, so show a generic
				// retryable message; the raw error is data, appended untranslated.
				setServerError({
					message: `${common.genericError} (${String(error)})`,
					offerRecovery: false,
				});
				console.error(error);
			}
		},
	});

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
						name="username"
						validators={{
							onSubmit: ({ value }) => {
								const code = validateUsername(value);
								return code ? messages.rejections[code] : undefined;
							},
						}}
					>
						{(field) => (
							<>
								<TextField
									label={messages.usernameLabel}
									hint={messages.usernameHint}
									icon={User2}
									error={field.state.meta.errors[0]}
									input={{
										type: "text",
										placeholder: messages.usernamePlaceholder,
										required: true,
										name: field.name,
										value: field.state.value,
										onBlur: field.handleBlur,
										onChange: (event) => {
											setServerError(null);
											field.handleChange(event.target.value);
										},
									}}
								/>
							</>
						)}
					</form.Field>
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
						<div role="alert" className="text-sm text-danger">
							<span>{serverError.message}</span>{" "}
							{serverError.offerRecovery ? (
								<Link to="/recover/request" className="underline">
									{messages.recoverCtaLabel}
								</Link>
							) : null}
						</div>
					) : null}
					<Button type="submit" loading={claimRanking.isPending}>
						{messages.submit}
					</Button>
				</form>
			</div>
		</>
	);
}
