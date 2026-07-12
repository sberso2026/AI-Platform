"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, type KeyboardEvent } from "react";
import { cn } from "@rtb/ui";
import {
  PRODUCT_DETAIL_TABS,
  PRODUCT_DETAIL_TAB_LABELS,
  type ProductDetailTab,
} from "@rtb/platform-core";

export function ProductDetailTabs({ activeTab }: { activeTab: ProductDetailTab }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const hrefFor = useCallback(
    (tab: ProductDetailTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const index = PRODUCT_DETAIL_TABS.indexOf(activeTab);
      if (index < 0) return;
      const nextIndex =
        event.key === "ArrowRight"
          ? (index + 1) % PRODUCT_DETAIL_TABS.length
          : (index - 1 + PRODUCT_DETAIL_TABS.length) % PRODUCT_DETAIL_TABS.length;
      const next = PRODUCT_DETAIL_TABS[nextIndex]!;
      router.push(hrefFor(next));
    },
    [activeTab, hrefFor, router]
  );

  return (
    <div
      className="mb-6 border-b border-border"
      role="tablist"
      aria-label="Product administration sections"
      data-testid="product-detail-tabs"
      onKeyDown={onKeyDown}
    >
      <div className="-mb-px flex flex-wrap gap-1 overflow-x-auto">
        {PRODUCT_DETAIL_TABS.map((tab) => {
          const href = hrefFor(tab);
          const selected = activeTab === tab;

          return (
            <Link
              key={tab}
              href={href}
              role="tab"
              aria-selected={selected}
              aria-controls={`product-tabpanel-${tab}`}
              id={`product-tab-${tab}`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "whitespace-nowrap rounded-t-md border border-transparent px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-border border-b-white bg-white text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
              data-testid={`product-tab-${tab}`}
            >
              {PRODUCT_DETAIL_TAB_LABELS[tab]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
