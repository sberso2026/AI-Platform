import { NextResponse } from "next/server";
import {
  mapGrowthCreditAccount,
  mapGrowthCreditTransactions,
} from "@rtb/platform-core";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.roleSlug !== "owner") {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }
  const denied = await requireCommerceAdmin(ctx);
  if (denied) return denied;

  const [account, transactions, reconciled] = await Promise.all([
    ctx.commerce.growthCredits.getAccount(ctx.tenantId),
    ctx.commerce.growthCredits.listTransactions(ctx.tenantId),
    ctx.commerce.growthCredits.getReconciledSummary(ctx.tenantId),
  ]);

  return NextResponse.json({
    data: {
      account: mapGrowthCreditAccount(
        {
          available_balance: reconciled.availableBalance,
          reserved_balance: reconciled.reservedBalance,
          lifetime_earned: reconciled.lifetimeEarned,
          lifetime_redeemed: reconciled.lifetimeRedeemed,
        },
        reconciled.expiringSoon
      ),
      transactions: mapGrowthCreditTransactions(transactions),
      reconciledFromLedger: true,
      storedAccount: account,
    },
  });
}
