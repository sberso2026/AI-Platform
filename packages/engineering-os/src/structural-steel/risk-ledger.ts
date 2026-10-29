/**
 * Canonical D0/D1 risk ledger. Historical checkpoint RETURN fields are evidence,
 * not a license to reopen or silently close risks.
 */
export const RISK_LEDGER_DISCREPANCY_CLASSIFICATION = "REPORTING_ERROR" as const;

export const CANONICAL_D0_D1_RISK_STATE = {
  CLOSED: {
    "D0-R09": "D1A",
    "D0-R02": "D1B",
    "D0-R06": "D1B",
  },
  REDUCED: {
    "D0-R03": "D1B",
    "D0-R05": "D1B",
    "D0-R07": "D1B+D1C",
    "D0-R08": "D1B+D1C",
    "D0-R01": "D1D-0",
  },
  REMAINING: ["D0-R01", "D0-R04", "D0-R05", "D0-R07", "D0-R08", "D0-R10", "D0-R11", "D0-R12"],
  d1cReportingError:
    "D1C remaining listed D0-R02 and D0-R09. Those risks were already CLOSED (D1B/D1A) and were not reopened by D1C code. D0-R07/D0-R08 were correctly REDUCED and omitted from remaining.",
} as const;

export const D1D0_D0_RISK_DISPOSITION = {
  CLOSED: [] as const,
  REDUCED: ["D0-R01", "D0-R03"] as const,
  REMAINING: ["D0-R01", "D0-R04", "D0-R05", "D0-R07", "D0-R08", "D0-R10", "D0-R11", "D0-R12"] as const,
} as const;

export function assertRiskLedgerNotReopened(): void {
  const closed = Object.keys(CANONICAL_D0_D1_RISK_STATE.CLOSED);
  for (const id of ["D0-R02", "D0-R06", "D0-R09"]) {
    if (!closed.includes(id)) throw new Error(`canonical ledger missing closed risk ${id}`);
  }
  if (D1D0_D0_RISK_DISPOSITION.CLOSED.length > 0) {
    throw new Error("D1D-0 must not close standards-implementation risks");
  }
}
