import * as React from "react";
import { cn } from "../lib/utils";

export type CommandPanelAccent = "cyan" | "ai" | "warning" | "danger" | "success" | "none";

export function CommandPanel({
  title,
  meta,
  action,
  accent = "none",
  className,
  children,
  testId,
}: {
  title?: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  accent?: CommandPanelAccent;
  className?: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <section
      className={cn("eos-command-panel", className)}
      data-accent={accent === "none" ? undefined : accent}
      data-testid={testId}
      data-eos-card="command"
    >
      {title ? (
        <header className="eos-command-rail">
          <div className="min-w-0">
            <h2 className="truncate text-[1.0625rem] font-semibold tracking-tight text-[color:var(--eos-text-primary)]">
              {title}
            </h2>
            {meta ? <p className="mt-0.5 text-[0.8125rem] text-[color:var(--eos-text-secondary)]">{meta}</p> : null}
          </div>
          {action}
        </header>
      ) : null}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function CommandPageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-6 min-w-0">
      {eyebrow ? (
        <p className="text-[0.8125rem] font-semibold tracking-[0.16em] text-[color:var(--eos-accent)]">{eyebrow}</p>
      ) : null}
      <h1 className="mt-1 text-[2.125rem] font-bold leading-tight tracking-tight text-[color:var(--eos-text-primary)] sm:text-[2.25rem]">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-3xl text-[1rem] leading-relaxed text-[color:var(--eos-text-secondary)]">{description}</p>
      ) : null}
    </header>
  );
}
