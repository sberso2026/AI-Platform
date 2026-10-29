import { getAuthContext } from "@/lib/kernel";
import { requireProductEntitlement } from "@/lib/commerce/guards";
import { EngineeringAuthorityNotice, PilotDataNotice } from "@/components/pilot/pilot-notices";

export default async function EngineeringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthContext();
  if (ctx) {
    await requireProductEntitlement(ctx, "engineering-os", "/system/products");
  }

  return (
    <>
      <div className="px-6 pt-4 sm:px-8">
        <PilotDataNotice />
        <EngineeringAuthorityNotice />
      </div>
      {children}
    </>
  );
}
