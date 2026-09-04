import { Suspense } from "react";
import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";
import { ApplicationEntitlementLayout } from "@/components/commerce/application-entitlement-layout";
import { ProjectIntelligenceShell } from "@/components/engineering/project-intelligence-shell";

export default function ProjectIntelligenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApplicationEntitlementLayout
      policy={ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence"]}
      returnPath="/system/products"
    >
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <Suspense
          fallback={
            <div
              className="h-full min-h-0 flex-1 bg-slate-100"
              data-testid="project-intelligence-shell"
            />
          }
        >
          <ProjectIntelligenceShell>{children}</ProjectIntelligenceShell>
        </Suspense>
      </div>
    </ApplicationEntitlementLayout>
  );
}
