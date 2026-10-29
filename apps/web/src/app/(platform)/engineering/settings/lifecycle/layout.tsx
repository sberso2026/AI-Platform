import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";
import { ApplicationEntitlementLayout } from "@/components/commerce/application-entitlement-layout";

export default async function LifecycleSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApplicationEntitlementLayout
      policy={ENGINEERING_PAGE_POLICIES["/engineering/settings/lifecycle"]}
      returnPath="/system/products"
    >
      {children}
    </ApplicationEntitlementLayout>
  );
}
