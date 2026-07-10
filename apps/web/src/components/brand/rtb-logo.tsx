"use client";

import { BRANDING, cn } from "@rtb/ui";

/**
 * RTB brand mark — official asset at `/public/brand/rtb-logo.png`.
 */
interface RtbLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "brand";
  variant?: "full" | "mark";
  inverted?: boolean;
}

const SIZE = {
  sm: { mark: "h-8 w-8", text: "text-sm", px: 32 },
  md: { mark: "h-9 w-9", text: "text-sm", px: 36 },
  lg: { mark: "h-12 w-12", text: "text-base", px: 48 },
  brand: { mark: "h-11 w-11", text: "text-base", px: BRANDING.logoSizePx }, // 44px
} as const;

export function RtbLogo({
  className,
  size = "md",
  variant = "full",
  inverted = true,
}: RtbLogoProps) {
  const dims = SIZE[size];
  const fg = inverted ? "text-white" : "text-slate-900";
  const muted = inverted ? "text-slate-400" : "text-slate-500";

  return (
    <div className={cn("flex min-w-0 items-center gap-3.5", className)} data-testid="rtb-logo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/rtb-logo.png"
        alt="RTB Engineering"
        className={cn(dims.mark, "shrink-0 rounded-md object-contain")}
        width={dims.px}
        height={dims.px}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div
        className={cn(
          dims.mark,
          "hidden shrink-0 items-center justify-center rounded-lg bg-blue-600"
        )}
        aria-hidden
        data-testid="rtb-logo-fallback"
      >
        <svg viewBox="0 0 32 32" className="h-5 w-5 text-white" fill="none" aria-hidden>
          <path
            d="M6 8h10.5a5.5 5.5 0 010 11H11v5H6V8zm5 4v3h5.5a1.5 1.5 0 000-3H11z"
            fill="currentColor"
          />
          <path d="M20 24l6-16h4L24 24h-4z" fill="currentColor" opacity="0.85" />
        </svg>
      </div>
      {variant === "full" && (
        <div className="min-w-0 leading-tight">
          <p className={cn("truncate text-[1.0625rem] font-bold tracking-wide", fg)}>{BRANDING.org}</p>
          <p className={cn("truncate text-[1.1875rem] font-semibold", fg)}>{BRANDING.product}</p>
          <p className={cn("truncate text-[0.8125rem] font-medium", muted)}>{BRANDING.edition}</p>
        </div>
      )}
    </div>
  );
}
