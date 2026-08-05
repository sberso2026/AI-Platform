import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";
import { ApplicationEntitlementLayout } from "@/components/commerce/application-entitlement-layout";

export default function ProjectIntelligenceReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApplicationEntitlementLayout
      policy={ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/reports"]}
      returnPath="/system/products"
    >
      {children}
    </ApplicationEntitlementLayout>
  );
}
