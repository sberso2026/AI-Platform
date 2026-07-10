import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/kernel";
import { assertCommercePolicyForPage } from "@/lib/commerce/guards";
import type { CommerceAccessPolicy } from "@rtb/platform-commerce";

export async function ApplicationEntitlementLayout({
  policy,
  children,
  returnPath,
}: {
  policy: CommerceAccessPolicy;
  children: React.ReactNode;
  returnPath: string;
}) {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");

  await assertCommercePolicyForPage(ctx, policy, returnPath);
  return <>{children}</>;
}
