import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";
import { ApplicationEntitlementLayout } from "@/components/commerce/application-entitlement-layout";
import { DigitalTwinShell } from "@/components/engineering/digital-twin-shell";

export default function DigitalTwinLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApplicationEntitlementLayout
      policy={ENGINEERING_PAGE_POLICIES["/engineering/apps/digital-twin"]}
      returnPath="/system/products"
    >
      <DigitalTwinShell>{children}</DigitalTwinShell>
    </ApplicationEntitlementLayout>
  );
}
