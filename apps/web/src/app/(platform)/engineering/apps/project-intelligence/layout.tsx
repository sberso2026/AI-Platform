import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";
import { ApplicationEntitlementLayout } from "@/components/commerce/application-entitlement-layout";
import { ProjectIntelligenceShell } from "@/components/engineering/project-intelligence-shell";

export default function ProjectIntelligenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApplicationEntitlementLayout
      policy={ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence"]}
      returnPath="/system/products"
    >
      <ProjectIntelligenceShell>{children}</ProjectIntelligenceShell>
    </ApplicationEntitlementLayout>
  );
}
