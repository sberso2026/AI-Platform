/**
 * Certified Engineering OS V1 module catalog for launcher entitlement UI.
 * Commerce remains the authoritative access check; this is presentation metadata only.
 */

export type EngineeringModuleAccessUiState =
  | "included"
  | "not_included"
  | "unavailable"
  | "seat_required"
  | "blocked";

export type EngineeringModuleMatrixState =
  | "installed"
  | "available"
  | "not_included"
  | "preview"
  | "unavailable";

export type EngineeringModuleMatrixAction = "open" | "install" | "view_plan" | "view_details" | "none";

export type EngineeringCertifiedModule = {
  key: string;
  applicationKey: string;
  name: string;
  description: string;
  href: string;
  reportHref: string;
  reportLabel: string;
  releaseEligible: boolean;
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
    releaseEligible: true,
  },
  {
    key: "inspection_intelligence",
    applicationKey: "inspection_intelligence",
    name: "Inspection Intelligence",
    description: "Inspection planning, field capture, and review workflows",
    href: "/engineering/apps/inspection-intelligence",
    reportHref: "/engineering/apps/inspection-intelligence/release",
    reportLabel: "Inspection Intelligence",
    releaseEligible: true,
  },
  {
    key: "asset_intelligence",
    applicationKey: "asset_intelligence",
    name: "Asset Intelligence",
    description: "Asset condition, criticality, reliability, and advisory signals",
    href: "/engineering/apps/asset-intelligence",
    reportHref: "/engineering/apps/asset-intelligence",
    reportLabel: "Asset Intelligence",
    releaseEligible: true,
  },
  {
    key: "project_controls",
    applicationKey: "project_controls",
    name: "Project Controls",
    description: "Governed cost, schedule, progress, and controls intelligence",
    href: "/engineering/apps/project-controls",
    reportHref: "/engineering/apps/project-controls",
    reportLabel: "Project Controls",
    releaseEligible: true,
  },
  {
    key: "digital_twin",
    applicationKey: "digital_twin",
    name: "Digital Twin",
    description: "Twin identity, state, simulation, and digital thread",
    href: "/engineering/apps/digital-twin",
    reportHref: "/engineering/apps/digital-twin",
    reportLabel: "Digital Twin artifacts",
    releaseEligible: true,
  },
  {
    key: "engineering_model_interoperability",
    applicationKey: "engineering_model_interoperability",
    name: "Engineering Models",
    description: "IFC / SPACE GASS / ETABS federation with governed mapping",
    href: "/engineering/apps/model-interoperability",
    reportHref: "/engineering/apps/model-interoperability",
    reportLabel: "Engineering model federation",
    releaseEligible: true,
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

export function resolveModuleMatrixPresentation(input: {
  releaseEligible: boolean;
  entitled: boolean;
  installed: boolean;
  accessible: boolean;
  canInstall: boolean;
  reasonCode?: string | null;
}): {
  state: EngineeringModuleMatrixState;
  badge: string;
  action: EngineeringModuleMatrixAction;
  actionLabel: string;
  chipStatus: "complete" | "open" | "pending" | "ai-review" | "critical";
} {
  if (!input.releaseEligible) {
    return {
      state: "preview",
      badge: "Preview",
      action: "view_details",
      actionLabel: "View details",
      chipStatus: "ai-review",
    };
  }

  if (input.accessible && input.installed) {
    return {
      state: "installed",
      badge: "Installed",
      action: "open",
      actionLabel: "Open system",
      chipStatus: "complete",
    };
  }

  if (input.accessible) {
    return {
      state: "available",
      badge: "Available",
      action: "open",
      actionLabel: "Open system",
      chipStatus: "open",
    };
  }

  if (input.entitled && !input.installed) {
    return {
      state: "available",
      badge: "Available",
      action: input.canInstall ? "install" : "none",
      actionLabel: input.canInstall ? "Install" : "Available",
      chipStatus: "open",
    };
  }

  if (
    input.reasonCode === "application_not_in_plan" ||
    input.reasonCode === "licence_not_found" ||
    input.reasonCode === "licence_missing" ||
    !input.entitled
  ) {
    return {
      state: "not_included",
      badge: "Not included",
      action: "view_plan",
      actionLabel: "View plan",
      chipStatus: "pending",
    };
  }

  return {
    state: "unavailable",
    badge: "Unavailable",
    action: "none",
    actionLabel: "Unavailable",
    chipStatus: "critical",
  };
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
