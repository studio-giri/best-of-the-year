import { Loader2 } from "lucide-react";
import type React from "react";
import { useMessages } from "#/lib/language/commonMessages.ts";

export function Button({
	children,
	loading = false,
	disabled,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
	loading?: boolean;
}) {
	const messages = useMessages();
	return (
		<button
			className="relative bg-brand enabled:hover:bg-brand-hover rounded-md text-white font-bold h-8 px-3 inline-flex items-center justify-center cursor-pointer transition-colors disabled:cursor-default disabled:opacity-60"
			disabled={disabled || loading}
			aria-busy={loading}
			{...props}
		>
			{loading && (
				<>
					<Loader2
						className="absolute left-3 top-1/2 -translate-y-1/2 size-4 animate-spin"
						aria-hidden="true"
					/>
					{/* The spinner is decorative; give assistive tech the busy state in words. */}
					<span className="sr-only">{messages.buttonLoading}</span>
				</>
			)}
			{children}
		</button>
	);
}
