import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";
import { ApplicationEntitlementLayout } from "@/components/commerce/application-entitlement-layout";
import { AssetIntelligenceShell } from "@/components/engineering/asset-intelligence-shell";

export default function AssetIntelligenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApplicationEntitlementLayout
      policy={ENGINEERING_PAGE_POLICIES["/engineering/apps/asset-intelligence"]}
      returnPath="/engineering/modules"
    >
      <AssetIntelligenceShell>{children}</AssetIntelligenceShell>
    </ApplicationEntitlementLayout>
  );
}
