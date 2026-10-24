import { INSPECTION_INTELLIGENCE_MODULE_KEY } from "../version";

export const INSPECTION_INTELLIGENCE_ENTITLEMENT_CATALOG = {
  applicationKey: INSPECTION_INTELLIGENCE_MODULE_KEY,
  seatRequired: true,
  workspaceRequired: true,
  actions: [
    "access",
    "inspection.read",
    "inspection.write",
    "inspection.review",
    "inspection.approve",
    "inspection.report",
    "inspection.admin",
  ],
} as const;
