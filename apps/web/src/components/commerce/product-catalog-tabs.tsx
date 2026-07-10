"use client";

import { cn } from "@rtb/ui";
import type { ProductCatalogTab } from "@rtb/platform-core";
import { CATALOG_TAB_LABELS } from "@rtb/platform-core";

const TABS: ProductCatalogTab[] = [
  "installed",
  "available",
  "trials",
  "coming_soon",
];

export function ProductCatalogTabs({
  activeTab,
  onTabChange,
  counts,
}: {
  activeTab: ProductCatalogTab;
  onTabChange: (tab: ProductCatalogTab) => void;
  counts: Record<ProductCatalogTab, number>;
}) {
  return (
    <div
      className="flex flex-wrap gap-2 border-b border-border pb-3"
      role="tablist"
      aria-label="Product catalog"
      data-testid="product-catalog-tabs"
    >
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={activeTab === tab}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === tab
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
          data-testid={`catalog-tab-${tab}`}
          onClick={() => onTabChange(tab)}
        >
          {CATALOG_TAB_LABELS[tab]}
          <span className="ml-1.5 text-xs opacity-80">({counts[tab]})</span>
        </button>
      ))}
    </div>
  );
}
