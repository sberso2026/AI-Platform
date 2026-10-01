import { SPACE_GASS_CATALOG_ENTRY, getCatalogEntry, type ExternalToolReadiness } from "../external-tools/catalog";
import { buildNotReadySpaceGassProfile } from "../external-tools/spacegass-profile";
import type { HandoffCapability, HandoffMode } from "./types";

export function officeToolReadiness(): { toolCode: string; name: string; readiness: ExternalToolReadiness; mode: HandoffMode; message: string }[] {
  return [
    { toolCode: "microsoft-excel", name: "Excel", readiness: "READY", mode: "BROWSER_DOWNLOAD", message: "Available through download/open. EOS does not launch Excel." },
    { toolCode: "microsoft-word", name: "Word", readiness: "READY", mode: "BROWSER_DOWNLOAD", message: "Available through download/open. EOS does not launch Word." },
    { toolCode: "microsoft-powerpoint", name: "PowerPoint", readiness: "READY", mode: "BROWSER_DOWNLOAD", message: "Available through download/open. EOS does not launch PowerPoint." },
    { toolCode: "adobe-acrobat", name: "Acrobat/PDF", readiness: "CONFIGURED", mode: "MANAGED_REPOSITORY_OPEN", message: "Open current governed PDF. PDF generation remains deferred. No PDF editing automation." },
    { toolCode: "autocad", name: "AutoCAD", readiness: "NOT_CONFIGURED", mode: "DESKTOP_BRIDGE", message: "Desktop integration not connected." },
    { toolCode: SPACE_GASS_CATALOG_ENTRY.toolCode, name: SPACE_GASS_CATALOG_ENTRY.name, readiness: "BLOCKED", mode: "EXECUTION_HOST", message: "Not certified for automated execution." },
  ];
}

export function spaceGassExecutionBoundary(tenantId: string) {
  const profile = buildNotReadySpaceGassProfile({ tenantId });
  const catalog = getCatalogEntry("spacegass") ?? SPACE_GASS_CATALOG_ENTRY;
  return {
    toolCode: catalog.toolCode,
    version: "14.2 Trial",
    apiAvailable: false,
    automationPermission: profile.automationPermission,
    realSolverExecution: "NOT_CERTIFIED" as const,
    productionUsePermitted: false,
    readiness: profile.readiness,
    capability: "RUN_STRUCTURAL_ANALYSIS" as HandoffCapability,
    executionBlocked: true,
    reason: "CAPABILITY_NOT_CERTIFIED" as const,
  };
}

export const CAD_HANDOFF_CONTRACT = {
  tools: ["AutoCAD", "Revit", "MicroStation"],
  pluginImplemented: false,
  futureFlow: "managed drawing → Desktop Bridge → approved CAD tool → publish to managed repository → SOURCE_REVISED / DRAWING_ISSUED",
  commandLevelMonitoring: false,
};
