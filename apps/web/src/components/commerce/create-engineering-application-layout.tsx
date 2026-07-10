import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";
import { ApplicationEntitlementLayout } from "@/components/commerce/application-entitlement-layout";

const ROUTES = [
  "/engineering/actions",
  "/engineering/decisions",
  "/engineering/risks",
  "/engineering/issues",
  "/engineering/lessons",
  "/engineering/technical-queries",
  "/engineering/timeline",
  "/engineering/activity",
  "/engineering/companies",
  "/engineering/disciplines",
  "/engineering/search",
] as const;

export function createEngineeringApplicationLayout(routePath: (typeof ROUTES)[number]) {
  const policy = ENGINEERING_PAGE_POLICIES[routePath];
  return async function EngineeringApplicationLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <ApplicationEntitlementLayout policy={policy} returnPath="/system/products">
        {children}
      </ApplicationEntitlementLayout>
    );
  };
}
