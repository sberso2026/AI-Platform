import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";
import { ApplicationEntitlementLayout } from "@/components/commerce/application-entitlement-layout";
import { InspectionIntelligenceShell } from "@/components/engineering/inspection-intelligence-shell";

export default function InspectionIntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApplicationEntitlementLayout
      policy={ENGINEERING_PAGE_POLICIES["/engineering/apps/inspection-intelligence"]}
      returnPath="/system/products"
    >
      <InspectionIntelligenceShell>{children}</InspectionIntelligenceShell>
    </ApplicationEntitlementLayout>
  );
}
