import { getAuthContext } from "@/lib/kernel";
import { requireProductEntitlement } from "@/lib/commerce/guards";
import { CompactPilotBanner } from "@/components/pilot/pilot-notices";

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
    <div className="eos-engineering-work-surface min-h-0 flex-1" data-eos-light-work-surface="yes">
      <div className="px-6 pt-3 sm:px-8" data-testid="engineering-pilot-banner-slot">
        <CompactPilotBanner />
      </div>
      {children}
    </div>
  );
}
