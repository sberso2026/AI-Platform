/**
 * Certified Engineering OS V1 module catalog for launcher / reports entitlement UI.
 * Commerce remains the authoritative access check; this is presentation metadata only.
 */

export type EngineeringModuleAccessUiState =
  | "included"
  | "not_included"
  | "unavailable"
  | "seat_required"
  | "blocked";

export type EngineeringCertifiedModule = {
  key: string;
  applicationKey: string;
  name: string;
  description: string;
  href: string;
  reportHref: string;
  reportLabel: string;
};

export const ENGINEERING_CERTIFIED_V1_MODULES: readonly EngineeringCertifiedModule[] = [
  {
    key: "project_intelligence",
    applicationKey: "project_intelligence",
    name: "Project Intelligence",
    description: "Documents, meetings, findings, and project decision support",
    href: "/engineering/apps/project-intelligence",
    reportHref: "/engineering/apps/project-intelligence/reports",
    reportLabel: "Project Intelligence reports",
  },
  {
    key: "inspection_intelligence",
    applicationKey: "inspection_intelligence",
    name: "Inspection Intelligence",
    description: "Inspection planning, field capture, and review workflows",
    href: "/engineering/apps/inspection-intelligence",
    reportHref: "/engineering/apps/inspection-intelligence/release",
    reportLabel: "Inspection Intelligence",
  },
  {
    key: "asset_intelligence",
    applicationKey: "asset_intelligence",
    name: "Asset Intelligence",
    description: "Asset condition, criticality, reliability, and advisory signals",
    href: "/engineering/apps/asset-intelligence",
    reportHref: "/engineering/apps/asset-intelligence",
    reportLabel: "Asset Intelligence",
  },
  {
    key: "project_controls",
    applicationKey: "project_controls",
    name: "Project Controls",
    description: "Governed cost, schedule, progress, and controls intelligence",
    href: "/engineering/apps/project-controls",
    reportHref: "/engineering/apps/project-controls",
    reportLabel: "Project Controls",
  },
  {
    key: "digital_twin",
    applicationKey: "digital_twin",
    name: "Digital Twin",
    description: "Twin identity, state, simulation, and digital thread",
    href: "/engineering/apps/digital-twin",
    reportHref: "/engineering/apps/digital-twin",
    reportLabel: "Digital Twin artifacts",
  },
  {
    key: "engineering_model_interoperability",
    applicationKey: "engineering_model_interoperability",
    name: "Engineering Model Interoperability",
    description:
      "IFC / SPACE GASS / ETABS export federation with governed mapping — V1.0 GA",
    href: "/engineering/apps/model-interoperability",
    reportHref: "/engineering/apps/model-interoperability",
    reportLabel: "Engineering model federation",
  },
] as const;

export function mapEntitlementReasonToUiState(
  allowed: boolean,
  reasonCode?: string | null,
): EngineeringModuleAccessUiState {
  if (allowed) return "included";
  switch (reasonCode) {
    case "application_not_in_plan":
    case "feature_not_enabled":
    case "subscription_not_found":
    case "subscription_missing":
    case "licence_missing":
    case "licence_not_found":
      return "not_included";
    case "seat_not_assigned":
      return "seat_required";
    case "application_not_installed":
    case "installation_not_found":
    case "installation_not_active":
    case "workspace_not_entitled":
    case "workspace_not_assigned":
      return "blocked";
    default:
      return "unavailable";
  }
}

export function moduleAccessLabel(state: EngineeringModuleAccessUiState): string {
  switch (state) {
    case "included":
      return "Included";
    case "not_included":
      return "Not included in plan";
    case "seat_required":
      return "Seat required";
    case "blocked":
      return "Blocked";
    case "unavailable":
    default:
      return "Unavailable";
  }
}

export function moduleAccessChipStatus(
  state: EngineeringModuleAccessUiState,
): "complete" | "pending" | "critical" | "medium" {
  switch (state) {
    case "included":
      return "complete";
    case "not_included":
    case "seat_required":
      return "pending";
    case "blocked":
    case "unavailable":
      return "critical";
    default:
      return "medium";
  }
}
