import type { LucideIcon } from "lucide-react";
import { type InputHTMLAttributes, useId } from "react";

export function TextField({
	label,
	hint,
	input,
	error,
	icon: Icon,
}: {
	label: string;
	hint?: string;
	input: InputHTMLAttributes<HTMLInputElement>;
	error?: string;
	icon: LucideIcon;
}) {
	const inputId = useId();
	const hintId = useId();
	const errorId = useId();
	// The label is explicitly bound to the input via htmlFor/id so the field's
	// accessible name is exactly the label text. The hint and error are separate
	// nodes referenced through aria-describedby rather than folded into the label,
	// which would otherwise pollute that name.
	const describedBy =
		[
			hint ? hintId : null,
			error ? errorId : null,
		]
			.filter(Boolean)
			.join(" ") || undefined;
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={inputId} className="text-white">
				{label}
			</label>
			{hint ? (
				<span id={hintId} className="text-sm text-muted">
					{hint}
				</span>
			) : null}
			<div className="flex items-center rounded-md pl-3 outline-1 -outline-offset-1 outline-muted has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-white">
				<div className="shrink-0 select-none">
					<Icon className="size-4 text-muted" />
				</div>
				<input
					{...input}
					id={inputId}
					aria-invalid={error ? true : undefined}
					aria-describedby={describedBy}
					className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base placeholder-muted focus:outline-none sm:text-sm/6 text-white"
				/>
			</div>

			{error ? (
				<span id={errorId} role="alert" className="text-sm text-danger">
					{error}
				</span>
			) : null}
		</div>
	);
}
