"use client";

import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { SearchInput } from "@rtb/ui";
import type { ReactNode } from "react";

export function CommerceAdminShell({
  title,
  description,
  children,
  searchPlaceholder = "Search…",
  onSearch,
  filters,
  actions,
}: {
  title: string;
  description: string;
  children: ReactNode;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filters?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <>
      <Header title={title} description={description} showEngineeringChrome={false} />
      <PageMain>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {onSearch && (
              <SearchInput
                placeholder={searchPlaceholder}
                className="max-w-xs"
                onChange={(e) => onSearch(e.target.value)}
                data-testid="commerce-search"
              />
            )}
            {filters}
          </div>
          {actions}
        </div>
        {children}
      </PageMain>
    </>
  );
}
