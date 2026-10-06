import { CANONICAL_D0_D1_RISK_STATE } from "../risk-ledger";

export const D1D_RISKS_CLOSED = "NONE" as const;
export const D1D_RISKS_REDUCED = ["D0-R01", "D0-R03"] as const;
export const D1D_RISKS_REMAINING = CANONICAL_D0_D1_RISK_STATE.REMAINING;

export const D1D_D0_RISK_DISPOSITION = {
  CLOSED: [] as const,
  REDUCED: D1D_RISKS_REDUCED,
  REMAINING: D1D_RISKS_REMAINING,
  PRIOR_PHASE_CLOSED: CANONICAL_D0_D1_RISK_STATE.CLOSED,
  PRIOR_PHASE_REDUCED: CANONICAL_D0_D1_RISK_STATE.REDUCED,
} as const;

export function assertD1dRiskLedgerReconciled(): void {
  const remaining = [...CANONICAL_D0_D1_RISK_STATE.REMAINING];
  const expected = ["D0-R01", "D0-R04", "D0-R05", "D0-R07", "D0-R08", "D0-R10", "D0-R11", "D0-R12"];
  if (remaining.join() !== expected.join()) {
    throw new Error("canonical remaining D0/D1 risks drifted");
  }
  if (D1D_D0_RISK_DISPOSITION.CLOSED.length > 0) {
    throw new Error("D1D closeout must not close remaining D0 risks merely because architecture exists");
  }
  for (const id of ["D0-R02", "D0-R06", "D0-R09"] as const) {
    if (!(id in CANONICAL_D0_D1_RISK_STATE.CLOSED)) {
      throw new Error(`canonical ledger missing prior-phase closed risk ${id}`);
    }
  }
}
