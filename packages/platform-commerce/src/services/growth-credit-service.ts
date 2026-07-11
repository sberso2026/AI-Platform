import type { SupabaseClient } from "@rtb/database";

export interface GrowthCreditLedgerSummary {
  availableBalance: number;
  reservedBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  expiringSoon: number;
}

/** Immutable ledger reconciliation — authoritative balances derived from transactions */
export function reconcileGrowthCreditLedger(
  transactions: Array<{ transaction_type: string; amount: number; expires_at?: string | null }>,
  withinDays = 30
): GrowthCreditLedgerSummary {
  let earned = 0;
  let redeemed = 0;
  let reserved = 0;
  let released = 0;
  let expired = 0;
  let reversed = 0;
  let adjusted = 0;

  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);

  let expiringSoon = 0;

  for (const tx of transactions) {
    const amount = Number(tx.amount);
    switch (tx.transaction_type) {
      case "earned":
        earned += amount;
        if (
          tx.expires_at &&
          new Date(tx.expires_at) > now &&
          new Date(tx.expires_at) <= cutoff
        ) {
          expiringSoon += amount;
        }
        break;
      case "redeemed":
        redeemed += amount;
        break;
      case "reserved":
        reserved += amount;
        break;
      case "released":
        released += amount;
        break;
      case "expired":
        expired += amount;
        break;
      case "reversed":
        reversed += amount;
        break;
      case "adjusted":
        adjusted += amount;
        break;
      default:
        break;
    }
  }

  const availableBalance =
    earned + Math.max(0, adjusted) + released - redeemed - reserved - expired - reversed;

  return {
    availableBalance: Math.max(0, availableBalance),
    reservedBalance: reserved,
    lifetimeEarned: earned,
    lifetimeRedeemed: redeemed,
    expiringSoon,
  };
}

export class GrowthCreditService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getAccount(tenantId: string) {
    const { data, error } = await this.supabase
      .from("commercial_growth_credit_accounts")
      .select("*")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  async listTransactions(tenantId: string, limit = 100) {
    const { data, error } = await this.supabase
      .from("commercial_growth_credit_transactions")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async getReconciledSummary(tenantId: string): Promise<GrowthCreditLedgerSummary> {
    const transactions = await this.listTransactions(tenantId, 500);
    return reconcileGrowthCreditLedger(transactions);
  }

  async expiringSoonAmount(tenantId: string, withinDays = 30): Promise<number> {
    const summary = await this.getReconciledSummary(tenantId);
    return summary.expiringSoon;
  }

  async recordTransaction(input: {
    tenantId: string;
    accountId: string;
    transactionType: string;
    amount: number;
    source?: string;
    description?: string;
    expiresAt?: string;
    metadata?: Record<string, unknown>;
  }) {
    const { error } = await this.supabase.from("commercial_growth_credit_transactions").insert({
      tenant_id: input.tenantId,
      account_id: input.accountId,
      transaction_type: input.transactionType,
      amount: input.amount,
      source: input.source ?? null,
      description: input.description ?? null,
      expires_at: input.expiresAt ?? null,
      metadata: input.metadata ?? {},
    } as never);
    if (error) throw new Error(error.message);
  }
}
