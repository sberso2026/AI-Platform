import * as React from "react";
import { cn } from "../lib/utils";
import { TYPOGRAPHY } from "../lib/typography";

/**
 * Batch 2.11 — nav item chrome.
 * Parent is a flex row; SidebarNavItem supplies fixed-width icon + spaced label.
 */
export function sidebarNavItemClassName({
  active,
  className,
}: {
  active?: boolean;
  className?: string;
}) {
  return cn(
    "flex min-h-10 items-center rounded-lg px-4 py-2.5 transition-colors",
    "gap-3", // 12px minimum between icon rail and label
    TYPOGRAPHY.sidebarItem,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
    active
      ? "bg-sidebar-accent font-semibold text-white shadow-sm ring-1 ring-white/10"
      : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
    className
  );
}

export interface SidebarNavItemProps {
  active?: boolean;
  icon?: React.ReactNode;
  compact?: boolean;
  label: string;
  className?: string;
}

/**
 * Icon + label for sidebar links.
 * Never uses `display: contents` — that collapsed icon/label spacing in Batch 2.10.
 * Icon rail is fixed 24px wide so text cannot overlap the glyph.
 */
export function SidebarNavItem({
  active,
  icon,
  compact,
  label,
  className,
}: SidebarNavItemProps) {
  return (
    <span
      className={cn("flex min-w-0 flex-1 items-center gap-3", className)}
      data-testid="sidebar-nav-item"
      data-active={active ? "true" : "false"}
    >
      {icon ? (
        <span
          className="nav-icon flex h-5 w-6 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5"
          data-testid="sidebar-nav-icon"
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      {!compact ? (
        <span
          className="nav-label min-w-0 truncate text-[0.9375rem] font-medium leading-5"
          data-testid="sidebar-nav-label"
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
