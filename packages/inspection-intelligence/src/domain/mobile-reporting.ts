/**
 * Phase 9G pack-aware mobile reporting — promote mobileReady after certification.
 */
import type { InspectionPackSdkManifest } from "../pack-sdk";
import { INSPECTION_REPORTING_DATA_MODELS } from "./reporting-preparation";

export type InspectionMobileReport = {
  reportId: string;
  reportKey: string;
  packId: string;
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  offlineOrigin: boolean;
  synchronizationStatus: "pending" | "synced" | "conflict" | "published";
  evidenceVersions: readonly string[];
  publicationAuthority: "server" | "local_draft_unauthoritative";
  mobileReady: true;
  generatedAt: string;
};

export function buildPackAwareMobileReports(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  pack: InspectionPackSdkManifest;
  evidenceVersions: readonly string[];
  offlineOrigin: boolean;
  synchronizationStatus: InspectionMobileReport["synchronizationStatus"];
}): InspectionMobileReport[] {
  return INSPECTION_REPORTING_DATA_MODELS.filter((m) => m.packAware).map((model, index) => ({
    reportId: `mrep_${input.pack.packId}_${model.kind}_${index}`,
    reportKey: model.reportKey,
    packId: input.pack.packId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    offlineOrigin: input.offlineOrigin,
    synchronizationStatus: input.synchronizationStatus,
    evidenceVersions: input.evidenceVersions,
    publicationAuthority:
      input.synchronizationStatus === "published" || input.synchronizationStatus === "synced"
        ? "server"
        : "local_draft_unauthoritative",
    mobileReady: true as const,
    generatedAt: new Date().toISOString(),
  }));
}
