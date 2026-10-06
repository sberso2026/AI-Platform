import type { AuValidationDebtItem } from "@rtb/types";

export const AU_VALIDATION_DEBT_REGISTER: readonly AuValidationDebtItem[] = [
  { debtId: "AU-VD-EDITION", description: "exact AS 4100 edition unknown", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "AU-VD-AMENDMENT", description: "AS 4100 amendment state unknown", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "AU-VD-TENSION-CODE", description: "tension code capacity / φNt not validated", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "AU-VD-COMPRESSION-CODE", description: "compression code capacity not validated", priority: "SAFETY_CRITICAL" },
  { debtId: "AU-VD-CLASSIFICATION", description: "section classification not implemented", priority: "SAFETY_CRITICAL" },
  { debtId: "AU-VD-BENDING-CODE", description: "bending code member capacity not validated", priority: "SAFETY_CRITICAL" },
  { debtId: "AU-VD-LTB-CODE", description: "LTB code member capacity not validated", priority: "SAFETY_CRITICAL" },
  { debtId: "AU-VD-SHEAR-CODE", description: "shear code capacity not validated", priority: "SAFETY_CRITICAL" },
  { debtId: "AU-VD-WEB-SLENDERNESS", description: "web slenderness rules not implemented", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "AU-VD-INTERACTION", description: "combined-action equations unavailable", priority: "SAFETY_CRITICAL" },
  { debtId: "AU-VD-SLS-CRITERIA", description: "serviceability standard criteria not supplied as default", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "AU-VD-THIRD-PARTY", description: "independent commercial-tool comparisons not available", priority: "COMMERCIAL_RELEASE_CRITICAL" },
  { debtId: "AU-VD-HUMAN", description: "human engineering validation of methods not complete", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "AU-VD-SOLVER", description: "general analysis/solver certification not present", priority: "COMMERCIAL_RELEASE_CRITICAL" },
];

export const AU_VALIDATION_PRIORITY_PLAN = [
  { rank: 1, priority: "SAFETY_CRITICAL" as const, items: AU_VALIDATION_DEBT_REGISTER.filter((row) => row.priority === "SAFETY_CRITICAL").map((row) => row.debtId) },
  { rank: 2, priority: "CONFORMANCE_CRITICAL" as const, items: AU_VALIDATION_DEBT_REGISTER.filter((row) => row.priority === "CONFORMANCE_CRITICAL").map((row) => row.debtId) },
  { rank: 3, priority: "COMMERCIAL_RELEASE_CRITICAL" as const, items: AU_VALIDATION_DEBT_REGISTER.filter((row) => row.priority === "COMMERCIAL_RELEASE_CRITICAL").map((row) => row.debtId) },
  { rank: 4, priority: "ENHANCEMENT" as const, items: [] as string[] },
] as const;
