import { Loader2 } from "lucide-react";
import type React from "react";

export function Button({
	children,
	loading = false,
	disabled,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
	loading?: boolean;
}) {
	return (
		<button
			className="bg-brand enabled:hover:bg-brand-hover rounded-md text-white font-bold h-8 px-3 inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:cursor-default disabled:opacity-60"
			disabled={disabled || loading}
			aria-busy={loading}
			{...props}
		>
			{/* The spinner is a flex item like the label, so it takes its own room
			    rather than sitting over the word it is meant to accompany. The button
			    widens for the moment it is working, which is the honest reading: it
			    holds more while it does. The gap only exists between two items, so a
			    button at rest keeps its plain padding. */}
			{loading && (
				<Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
			)}
			{children}
		</button>
	);
}
