import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";
import { ApplicationEntitlementLayout } from "@/components/commerce/application-entitlement-layout";

export const dynamic = "force-dynamic";

export default async function AskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApplicationEntitlementLayout
      policy={ENGINEERING_PAGE_POLICIES["/engineering/ask"]}
      returnPath="/engineering"
    >
      {children}
    </ApplicationEntitlementLayout>
  );
}
