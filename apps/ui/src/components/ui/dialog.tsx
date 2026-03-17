import type { JSX } from "hono/jsx";
import { cx } from "./utils";

export type DialogProps = {
	open: boolean;
	onClose?: () => void;
	children?: unknown;
};

export const Dialog = ({ open, onClose, children }: DialogProps) => {
	if (!open) {
		return null;
	}
	return (
		<div class="fixed inset-0 z-50">
			<button
				aria-label="关闭弹窗"
				class="absolute inset-0 bg-slate-950/60"
				type="button"
				onClick={onClose}
			/>
			<div class="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
				{children}
			</div>
		</div>
	);
};

export const DialogContent = ({
	class: className,
	...props
}: JSX.IntrinsicElements["div"]) => (
	<div
		{...props}
		class={cx("app-card w-full max-w-xl p-6", className)}
		role="dialog"
	/>
);

export const DialogHeader = ({
	class: className,
	...props
}: JSX.IntrinsicElements["div"]) => (
	<div
		{...props}
		class={cx("flex items-start justify-between gap-4", className)}
	/>
);

export const DialogTitle = ({
	class: className,
	...props
}: JSX.IntrinsicElements["h3"]) => (
	<h3 {...props} class={cx("app-title text-lg", className)} />
);

export const DialogDescription = ({
	class: className,
	...props
}: JSX.IntrinsicElements["p"]) => (
	<p
		{...props}
		class={cx("mt-2 text-xs text-[color:var(--app-ink-muted)]", className)}
	/>
);

export const DialogFooter = ({
	class: className,
	...props
}: JSX.IntrinsicElements["div"]) => (
	<div
		{...props}
		class={cx("mt-6 flex flex-wrap items-center justify-end gap-2", className)}
	/>
);
