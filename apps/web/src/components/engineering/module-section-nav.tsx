"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type ModuleNavLink = {
  href: string;
  label: string;
  /** Exact match only (default: prefix match for nested routes). */
  exact?: boolean;
  testId?: string;
};

export function ModuleSectionNav({
  links,
  ariaLabel,
}: {
  links: readonly ModuleNavLink[];
  ariaLabel: string;
}) {
  const pathname = usePathname() ?? "";

  return (
    <nav className="mt-3 flex flex-wrap gap-2 text-sm" aria-label={ariaLabel} role="tablist">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            role="tab"
            aria-selected={active}
            {...(link.testId ? { "data-testid": link.testId } : {})}
            data-active={active ? "true" : "false"}
            className={
              active
                ? "inline-flex min-h-11 items-center rounded-md bg-slate-900 px-3 py-2 font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
                : "inline-flex min-h-11 items-center rounded-md px-3 py-2 text-slate-800 underline-offset-2 hover:bg-slate-100 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
