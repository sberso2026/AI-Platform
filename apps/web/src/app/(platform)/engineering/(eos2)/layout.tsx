import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/kernel";
import { requireProductEntitlement } from "@/lib/commerce/guards";
import { readEos2Access } from "@/lib/commerce/eos2-rollout-server";

export default async function Eos2Layout({ children }: { children: React.ReactNode }) {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");
  await requireProductEntitlement(ctx, "engineering-os", "/engineering");
  const decision = await readEos2Access(ctx);
  if (!decision.allowed) {
    redirect("/access-denied?reason=eos2_not_enabled&return=%2Fengineering");
  }
  return children;
}
