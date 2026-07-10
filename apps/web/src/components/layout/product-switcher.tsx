"use client";

import { useState } from "react";
import { BRANDING, TYPOGRAPHY, cn } from "@rtb/ui";
import { ChevronDown } from "lucide-react";
import { RtbLogo } from "@/components/brand/rtb-logo";

/**
 * Product / workspace switcher — RTB Engineering OS brand header (Batch 2.11).
 */
export function ProductSwitcher({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  if (compact) {
    return (
      <div
        className="flex h-[4.75rem] items-center justify-center border-b border-sidebar-border px-2"
        data-testid="product-switcher"
      >
        <RtbLogo size="brand" variant="mark" inverted className="mx-auto" />
      </div>
    );
  }

  return (
    <div className="relative border-b border-sidebar-border" data-testid="product-switcher">
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-4 px-4 py-4 text-left transition-colors",
          "hover:bg-sidebar-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Product switcher — RTB Engineering OS"
        onClick={() => setOpen((v) => !v)}
      >
        <RtbLogo size="brand" variant="mark" inverted className="shrink-0" />
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className={cn(TYPOGRAPHY.brandMark, "truncate")}>{BRANDING.org}</p>
          <p className={cn(TYPOGRAPHY.brandProduct, "truncate")}>{BRANDING.product}</p>
          <p className={cn(TYPOGRAPHY.brandEdition, "truncate")}>{BRANDING.edition}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-sidebar-foreground/50 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Available operating systems"
          className="absolute left-2 right-2 top-full z-20 mt-1 overflow-hidden rounded-md border border-sidebar-border bg-sidebar-accent shadow-lg"
        >
          <div role="option" aria-selected className="px-3 py-2.5 text-[0.9375rem] text-white">
            {BRANDING.product}
            <span className="ml-2 text-[0.75rem] text-sidebar-foreground/50">Current</span>
          </div>
          <div
            role="option"
            aria-selected={false}
            aria-disabled
            className="cursor-not-allowed px-3 py-2.5 text-[0.9375rem] text-sidebar-foreground/40"
          >
            More OS switching — coming soon
          </div>
        </div>
      )}
    </div>
  );
}
