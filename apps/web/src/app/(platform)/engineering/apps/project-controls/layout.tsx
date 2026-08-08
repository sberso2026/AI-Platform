import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";
import { ApplicationEntitlementLayout } from "@/components/commerce/application-entitlement-layout";
import { ProjectControlsShell } from "@/components/engineering/project-controls-shell";

export default function ProjectControlsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApplicationEntitlementLayout
      policy={ENGINEERING_PAGE_POLICIES["/engineering/apps/project-controls"]}
      returnPath="/system/products"
    >
      <ProjectControlsShell>{children}</ProjectControlsShell>
    </ApplicationEntitlementLayout>
  );
}
