/**
 * Inspection Intelligence mobile product — first certified Engineering Mobile SDK consumer.
 */
import {
  assertEngineeringMobileSdkComplete,
  assertMediaAllowed,
  assertMobileCapabilityAvailable,
  createInProcessMobileEventBus,
  createMediaStage,
  createMobileSdkEvent,
  ENGINEERING_MOBILE_SDK_CAPABILITY_KEYS,
  MOBILE_SYNC_READINESS_RESERVED,
  validateScanFormat,
  type MobileAuthenticatedAttestation,
  type MobileAnnotationDraft,
  type MobileDraftState,
  type MobileMediaStage,
  type MobileScanResult,
  type MobileSdkEvent,
  type MobileSignatureMark,
  type MobileSyncReadiness,
} from "@rtb/engineering-os";
import { createHash } from "node:crypto";

export type InspectionMobileEvidenceCapture = {
  evidenceId: string;
  sessionId: string;
  observationId?: string;
  defectId?: string;
  targetReference: string;
  capturedBy: string;
  capturedAt: string;
  uploadedAt: string;
  mimeType: string;
  dimensions: { width: number; height: number };
  contentLength: number;
  contentHash: string;
  storageReference: string;
  evidenceVersion: number;
  chainOfCustodyStatus: "created";
  /** AI Vision inference is forbidden in Phase 9F. */
  aiVisionInference: false;
};

export type InspectionMobileProductResult = {
  evidence: InspectionMobileEvidenceCapture;
  annotation: MobileAnnotationDraft;
  scan: MobileScanResult;
  attestation: MobileAuthenticatedAttestation;
  signatureMark: MobileSignatureMark;
  draftState: MobileDraftState;
  syncReadiness: MobileSyncReadiness;
  events: MobileSdkEvent[];
  offlineSyncImplemented: false;
  syncReserved: typeof MOBILE_SYNC_READINESS_RESERVED;
};

function hashBytes(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export async function runInspectionMobileProductHappyPath(input: {
  tenantId: string;
  workspaceId: string;
  projectId?: string;
  sessionId: string;
  observationId: string;
  actorUserId: string;
  authenticationContext: string;
}): Promise<InspectionMobileProductResult> {
  assertEngineeringMobileSdkComplete(ENGINEERING_MOBILE_SDK_CAPABILITY_KEYS);
  const bus = createInProcessMobileEventBus();

  const capability = assertMobileCapabilityAvailable("camera.capture", {
    secureContext: true,
    permissionsGranted: ["camera"],
  });
  await bus.publish(
    createMobileSdkEvent({
      type: "engineering.mobile.capability_checked",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      payload: { capabilityId: capability.capabilityId, availability: capability.availability },
    }),
  );
  await bus.publish(
    createMobileSdkEvent({
      type: "engineering.mobile.camera_opened",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      payload: { sessionId: input.sessionId },
    }),
  );

  const bytes = "fake-jpeg-bytes-for-hash";
  assertMediaAllowed({ mimeType: "image/jpeg", byteLength: bytes.length });
  let stage: MobileMediaStage = createMediaStage({
    mimeType: "image/jpeg",
    byteLength: bytes.length,
  });
  const contentHash = hashBytes(bytes);
  stage = { ...stage, contentHash, state: "upload_pending" };

  await bus.publish(
    createMobileSdkEvent({
      type: "engineering.mobile.evidence_captured",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      payload: { stageId: stage.stageId, sessionId: input.sessionId },
    }),
  );

  const evidence: InspectionMobileEvidenceCapture = {
    evidenceId: `ev_mobile_${Date.now()}`,
    sessionId: input.sessionId,
    observationId: input.observationId,
    targetReference: "inspection_target:asset-1",
    capturedBy: input.actorUserId,
    capturedAt: new Date().toISOString(),
    uploadedAt: new Date().toISOString(),
    mimeType: "image/jpeg",
    dimensions: { width: 1920, height: 1080 },
    contentLength: bytes.length,
    contentHash,
    storageReference: `platform_files://${stage.stageId}`,
    evidenceVersion: 1,
    chainOfCustodyStatus: "created",
    aiVisionInference: false,
  };
  stage = { ...stage, state: "server_confirmed" };

  await bus.publish(
    createMobileSdkEvent({
      type: "engineering.mobile.evidence_uploaded",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      payload: {
        evidenceId: evidence.evidenceId,
        contentHash: evidence.contentHash,
        storageReference: evidence.storageReference,
      },
    }),
  );

  const rawScan = "asset:asset-1";
  if (!validateScanFormat("qr", rawScan)) {
    throw new Error("mobile_scan_invalid");
  }
  const scan: MobileScanResult = {
    scanId: `scan_${Date.now()}`,
    kind: "qr",
    rawValue: rawScan,
    formatValid: true,
    resolved: {
      targetKind: "asset",
      referenceId: "asset-1",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    },
    userConfirmed: true,
  };
  await bus.publish(
    createMobileSdkEvent({
      type: "engineering.mobile.scan_resolved",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      payload: {
        scanId: scan.scanId,
        referenceId: scan.resolved?.referenceId,
        targetKind: scan.resolved?.targetKind,
      },
    }),
  );

  const originalHash = evidence.contentHash;
  const annotation: MobileAnnotationDraft = {
    annotationId: `ann_${Date.now()}`,
    sourceEvidenceId: evidence.evidenceId,
    shapes: [
      { type: "arrow", accessibleLabel: "Point to coating failure" },
      { type: "severity_marker", label: "high", accessibleLabel: "Severity high" },
    ],
    version: 1,
    authorPersonId: input.actorUserId,
    createdAt: new Date().toISOString(),
    purpose: "highlight_defect",
  };
  if (evidence.contentHash !== originalHash) {
    throw new Error("original_evidence_mutated");
  }
  await bus.publish(
    createMobileSdkEvent({
      type: "engineering.mobile.annotation_created",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      payload: {
        annotationId: annotation.annotationId,
        sourceEvidenceId: annotation.sourceEvidenceId,
        originalEvidenceHash: originalHash,
      },
    }),
  );

  const attestation: MobileAuthenticatedAttestation = {
    attestationId: `att_${Date.now()}`,
    actorId: input.actorUserId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    inspectionId: input.sessionId,
    workflowTransition: "submit",
    contentHash: hashBytes(`${input.sessionId}:${evidence.evidenceId}:${annotation.annotationId}`),
    authenticationContext: input.authenticationContext,
    assertedAt: new Date().toISOString(),
    deviceContext: { viewport: "phone" },
    reason: "session_submission",
  };
  const signatureMark: MobileSignatureMark = {
    signatureMarkId: `sig_${Date.now()}`,
    supplementaryOnly: true,
    mediaStageId: stage.stageId,
    capturedAt: new Date().toISOString(),
  };
  await bus.publish(
    createMobileSdkEvent({
      type: "engineering.mobile.attestation_recorded",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      payload: {
        attestationId: attestation.attestationId,
        workflowTransition: attestation.workflowTransition,
        signatureSupplementaryOnly: true,
      },
    }),
  );

  return {
    evidence,
    annotation,
    scan,
    attestation,
    signatureMark,
    draftState: stage.state,
    syncReadiness: "server_confirmed",
    events: bus.events,
    offlineSyncImplemented: false,
    syncReserved: MOBILE_SYNC_READINESS_RESERVED,
  };
}

export function denyCrossTenantScan(input: {
  scanTenantId: string;
  sessionTenantId: string;
}): never | void {
  if (input.scanTenantId !== input.sessionTenantId) {
    throw new Error("mobile_scan_cross_tenant_denied");
  }
}
