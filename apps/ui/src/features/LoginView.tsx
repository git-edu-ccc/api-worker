import { Button, Card, Input } from "../components/ui";
import type { NoticeMessage } from "../core/types";

type LoginViewProps = {
  notice: NoticeMessage | null;
  isSubmitting: boolean;
  onSubmit: (event: Event) => void;
};

/**
 * Renders the admin login view.
 *
 * Args:
 *   props: Login view props.
 *
 * Returns:
 *   Login JSX element.
 */
export const LoginView = ({
  notice,
  isSubmitting,
  onSubmit,
}: LoginViewProps) => {
  const toneStyles: Record<NoticeMessage["tone"], string> = {
    success: "app-notice app-notice--success",
    warning: "app-notice app-notice--warning",
    error: "app-notice app-notice--error",
    info: "app-notice app-notice--info",
  };
  return (
    <Card class="animate-fade-up mx-auto mt-24 max-w-md p-8">
      <h1 class="app-title mb-2 text-2xl">api-workers</h1>
      <p class="text-sm text-[color:var(--app-ink-muted)]">
        请输入管理员密码登录管理台。
      </p>
      <form
        class="mt-6 grid gap-4"
        onSubmit={onSubmit}
      >
        <div>
          <label
            class="mb-1.5 block text-xs uppercase tracking-widest text-[color:var(--app-ink-muted)]"
            for="password"
          >
            管理员密码
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
          />
        </div>
        <Button
          variant="primary"
          size="lg"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "登录中..." : "登录"}
        </Button>
      </form>
      <p class="mt-3 text-xs text-[color:var(--app-ink-muted)]">
        按回车键可快速提交。
      </p>
      {notice && (
        <div class={`mt-4 ${toneStyles[notice.tone]}`}>{notice.message}</div>
      )}
    </Card>
  );
};
