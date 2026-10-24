import type { EuValidationDebtItem } from "@rtb/types";

export const EU_VALIDATION_DEBT_REGISTER: readonly EuValidationDebtItem[] = [
  { debtId: "EU-VD-EDITION", description: "exact Eurocode generation/edition unknown", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "EU-VD-AMENDMENT", description: "amendment/corrigendum state unknown", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "EU-VD-ANNEX", description: "National Annex datasets not populated", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "EU-VD-NDP", description: "NDP datasets not populated", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "EU-VD-MATERIAL", description: "material/product property sources not certified as EN 1993 design values", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "EU-VD-CLASSIFICATION", description: "section classification rules not implemented", priority: "SAFETY_CRITICAL" },
  { debtId: "EU-VD-TENSION-CODE", description: "tension code resistance not implemented", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "EU-VD-COMPRESSION-CODE", description: "compression code resistance not implemented", priority: "SAFETY_CRITICAL" },
  { debtId: "EU-VD-BUCKLING-CURVES", description: "buckling curves not implemented", priority: "SAFETY_CRITICAL" },
  { debtId: "EU-VD-BENDING-CODE", description: "bending section resistance not implemented", priority: "SAFETY_CRITICAL" },
  { debtId: "EU-VD-LTB-CODE", description: "LTB code resistance not implemented", priority: "SAFETY_CRITICAL" },
  { debtId: "EU-VD-SHEAR-CODE", description: "shear code resistance not implemented", priority: "SAFETY_CRITICAL" },
  { debtId: "EU-VD-WEB-SLENDERNESS", description: "web slenderness rules not implemented", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "EU-VD-WEB-BUCKLING", description: "web buckling code resistance not implemented", priority: "SAFETY_CRITICAL" },
  { debtId: "EU-VD-INTERACTION", description: "interaction equations unavailable", priority: "SAFETY_CRITICAL" },
  { debtId: "EU-VD-SLS-CRITERIA", description: "serviceability code criteria not supplied as default", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "EU-VD-THIRD-PARTY", description: "independent commercial-tool comparisons not available", priority: "COMMERCIAL_RELEASE_CRITICAL" },
  { debtId: "EU-VD-HUMAN", description: "human engineering validation of methods not complete", priority: "CONFORMANCE_CRITICAL" },
  { debtId: "EU-VD-SOLVER", description: "general structural analysis certification not present", priority: "COMMERCIAL_RELEASE_CRITICAL" },
  { debtId: "EU-VD-CONNECTION", description: "connection design outside member scope", priority: "SAFETY_CRITICAL" },
];

export const EU_VALIDATION_PRIORITY_PLAN = [
  { rank: 1, priority: "SAFETY_CRITICAL" as const, items: EU_VALIDATION_DEBT_REGISTER.filter((row) => row.priority === "SAFETY_CRITICAL").map((row) => row.debtId) },
  { rank: 2, priority: "CONFORMANCE_CRITICAL" as const, items: EU_VALIDATION_DEBT_REGISTER.filter((row) => row.priority === "CONFORMANCE_CRITICAL").map((row) => row.debtId) },
  { rank: 3, priority: "COMMERCIAL_RELEASE_CRITICAL" as const, items: EU_VALIDATION_DEBT_REGISTER.filter((row) => row.priority === "COMMERCIAL_RELEASE_CRITICAL").map((row) => row.debtId) },
  { rank: 4, priority: "ENHANCEMENT" as const, items: [] as string[] },
] as const;
