import { getAuthContext } from "@/lib/kernel";
import { requireProductEntitlement } from "@/lib/commerce/guards";

export default async function EngineeringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthContext();
  if (ctx) {
    await requireProductEntitlement(ctx, "engineering-os", "/system/products");
  }

  return <>{children}</>;
}
