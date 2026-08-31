import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";
import { ApplicationEntitlementLayout } from "@/components/commerce/application-entitlement-layout";
import { ModelInteroperabilityShell } from "@/components/engineering/model-interoperability-shell";

export default function EngineeringModelInteropLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApplicationEntitlementLayout
      policy={ENGINEERING_PAGE_POLICIES["/engineering/apps/model-interoperability"]}
      returnPath="/engineering/modules"
    >
      <ModelInteroperabilityShell>{children}</ModelInteroperabilityShell>
    </ApplicationEntitlementLayout>
  );
}
