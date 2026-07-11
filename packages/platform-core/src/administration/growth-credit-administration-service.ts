import type {
  GrowthCreditAccountView,
  GrowthCreditTransactionView,
  GrowthCreditTransactionType,
} from "./administration-types";

export const GROWTH_CREDIT_DISCLAIMERS = [
  "Growth Credits are not shares.",
  "Growth Credits are not investments.",
  "Growth Credits are not cash.",
  "Growth Credits do not track RTB valuation.",
  "Growth Credits are subject to expiry and program terms.",
] as const;

export interface RawGrowthCreditAccount {
  available_balance: number;
  reserved_balance: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
}

export interface RawGrowthCreditTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  source?: string | null;
  description?: string | null;
  expires_at?: string | null;
  created_at: string;
}

export function mapGrowthCreditAccount(
  account: RawGrowthCreditAccount | null,
  expiringSoonAmount = 0
): GrowthCreditAccountView {
  return {
    availableBalance: account?.available_balance ?? 0,
    reservedBalance: account?.reserved_balance ?? 0,
    expiringSoon: expiringSoonAmount,
    lifetimeEarned: account?.lifetime_earned ?? 0,
    lifetimeRedeemed: account?.lifetime_redeemed ?? 0,
  };
}

export function mapGrowthCreditTransactions(
  rows: RawGrowthCreditTransaction[]
): GrowthCreditTransactionView[] {
  return rows.map((row) => ({
    id: row.id,
    transactionType: row.transaction_type as GrowthCreditTransactionType,
    amount: row.amount,
    source: row.source ?? undefined,
    description: row.description ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
  }));
}
