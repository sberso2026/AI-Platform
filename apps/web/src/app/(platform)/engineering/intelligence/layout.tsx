import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";
import { ApplicationEntitlementLayout } from "@/components/commerce/application-entitlement-layout";

export const dynamic = "force-dynamic";

export default async function IntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApplicationEntitlementLayout
      policy={ENGINEERING_PAGE_POLICIES["/engineering/intelligence"]}
      returnPath="/engineering"
    >
      {children}
    </ApplicationEntitlementLayout>
  );
}
