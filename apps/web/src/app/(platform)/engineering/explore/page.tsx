"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { SectionHeader } from "@rtb/ui";
import { ENGINEERING_EXPLORE_GROUPS } from "@/lib/engineering/experience-surfaces";
import { useExperiencePerf } from "@/hooks/use-experience-perf";
import { buildAskHref } from "@/hooks/use-engineering-context";
import { useEngineeringProjectFilter } from "@/hooks/use-engineering-project-filter";

export default function ExplorePage() {
  useExperiencePerf("explore");
  const projectId = useEngineeringProjectFilter();

  return (
    <>
      <Header
        title="Explore"
        description="Structured navigation across engineering records and tools"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="explore-engineering"
      >
        <div className="mb-6 flex flex-wrap gap-3 text-sm">
          <Link
            href="/engineering/search"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
            data-testid="explore-search-entry"
          >
            Open search
          </Link>
          <Link
            href={buildAskHref({ projectId })}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
          >
            Ask with current context
          </Link>
        </div>

        <div className="space-y-8">
          {ENGINEERING_EXPLORE_GROUPS.map((group) => (
            <section key={group.id} data-testid={`explore-group-${group.id}`}>
              <SectionHeader title={group.title} description="" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 hover:border-slate-400"
                    data-testid={`explore-item-${item.id}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
