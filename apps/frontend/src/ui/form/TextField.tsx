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
	const errorId = useId();
	return (
		<label className="flex flex-col gap-1">
			<span className="text-white">{label}</span>
			{hint ? <span className="text-sm text-muted">{hint}</span> : null}
			<div className="flex items-center rounded-md pl-3 outline-1 -outline-offset-1 outline-line has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-muted">
				<div className="shrink-0 select-none">
					<Icon className="size-4 text-muted" />
				</div>
				<input
					{...input}
					aria-invalid={error ? true : undefined}
					aria-describedby={error ? errorId : undefined}
					className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base placeholder-muted focus:outline-none sm:text-sm/6 text-white"
				/>
			</div>

			{error ? (
				<span id={errorId} role="alert" className="text-sm text-danger">
					{error}
				</span>
			) : null}
		</label>
	);
}
