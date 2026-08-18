import { requireBusinessOsAccess } from "@/lib/business/access";
import { getAuthContext } from "@/lib/kernel";

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthContext();
  await requireBusinessOsAccess(ctx, "business_os.view", "/business");
  return <>{children}</>;
}
