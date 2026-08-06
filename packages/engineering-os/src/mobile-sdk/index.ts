/**
 * Engineering Mobile SDK — reusable mobile/field primitives for all Engineering OS modules.
 * Contains no Inspection Intelligence business rules.
 */
export * from "./offline";

export const ENGINEERING_MOBILE_SDK_VERSION = "0.7.0" as const;

export type MobileViewportClass = "desktop" | "tablet_landscape" | "tablet_portrait" | "phone";

export type MobileCapabilityId =
  | "camera.capture"
  | "qr.scan"
  | "barcode.scan"
  | "image.annotate"
  | "signature.capture"
  | "attestation.confirm"
  | "touch.optimized"
  | "viewport.tablet"
  | "viewport.phone"
  | "media.stage";

export type MobileCapabilityAvailability =
  | "available"
  | "unavailable"
  | "permission_required"
  | "secure_context_required"
  | "unsupported";

export type MobileCapabilityManifest = {
  capabilityId: MobileCapabilityId;
  version: string;
  owner: "engineering_mobile_sdk";
  availability: MobileCapabilityAvailability;
  platformSupport: readonly ("web" | "tablet" | "phone")[];
  browserSupport: readonly string[];
  permissionRequirements: readonly string[];
  secureContextRequired: boolean;
  fallbackBehavior: "fail_explicit" | "manual_entry" | "degrade_ui";
  offlineCompatibility: "none" | "stage_only" | "full"; // full reserved for 9G
  telemetryPolicy: "minimal" | "standard";
  certificationStatus: "certified" | "reserved" | "unimplemented";
};

export const ENGINEERING_MOBILE_CAPABILITY_MANIFESTS: readonly MobileCapabilityManifest[] = [
  {
    capabilityId: "camera.capture",
    version: "1.0.0",
    owner: "engineering_mobile_sdk",
    availability: "permission_required",
    platformSupport: ["web", "tablet", "phone"],
    browserSupport: ["chromium", "webkit", "firefox"],
    permissionRequirements: ["camera"],
    secureContextRequired: true,
    fallbackBehavior: "fail_explicit",
    offlineCompatibility: "stage_only",
    telemetryPolicy: "minimal",
    certificationStatus: "certified",
  },
  {
    capabilityId: "qr.scan",
    version: "1.0.0",
    owner: "engineering_mobile_sdk",
    availability: "permission_required",
    platformSupport: ["web", "tablet", "phone"],
    browserSupport: ["chromium", "webkit"],
    permissionRequirements: ["camera"],
    secureContextRequired: true,
    fallbackBehavior: "manual_entry",
    offlineCompatibility: "none",
    telemetryPolicy: "minimal",
    certificationStatus: "certified",
  },
  {
    capabilityId: "barcode.scan",
    version: "1.0.0",
    owner: "engineering_mobile_sdk",
    availability: "permission_required",
    platformSupport: ["web", "tablet", "phone"],
    browserSupport: ["chromium", "webkit"],
    permissionRequirements: ["camera"],
    secureContextRequired: true,
    fallbackBehavior: "manual_entry",
    offlineCompatibility: "none",
    telemetryPolicy: "minimal",
    certificationStatus: "certified",
  },
  {
    capabilityId: "image.annotate",
    version: "1.0.0",
    owner: "engineering_mobile_sdk",
    availability: "available",
    platformSupport: ["web", "tablet", "phone"],
    browserSupport: ["chromium", "webkit", "firefox"],
    permissionRequirements: [],
    secureContextRequired: false,
    fallbackBehavior: "fail_explicit",
    offlineCompatibility: "stage_only",
    telemetryPolicy: "minimal",
    certificationStatus: "certified",
  },
  {
    capabilityId: "signature.capture",
    version: "1.0.0",
    owner: "engineering_mobile_sdk",
    availability: "available",
    platformSupport: ["web", "tablet", "phone"],
    browserSupport: ["chromium", "webkit", "firefox"],
    permissionRequirements: [],
    secureContextRequired: false,
    fallbackBehavior: "fail_explicit",
    offlineCompatibility: "stage_only",
    telemetryPolicy: "minimal",
    certificationStatus: "certified",
  },
  {
    capabilityId: "attestation.confirm",
    version: "1.0.0",
    owner: "engineering_mobile_sdk",
    availability: "available",
    platformSupport: ["web", "tablet", "phone"],
    browserSupport: ["chromium", "webkit", "firefox"],
    permissionRequirements: [],
    secureContextRequired: true,
    fallbackBehavior: "fail_explicit",
    offlineCompatibility: "none",
    telemetryPolicy: "minimal",
    certificationStatus: "certified",
  },
  {
    capabilityId: "touch.optimized",
    version: "1.0.0",
    owner: "engineering_mobile_sdk",
    availability: "available",
    platformSupport: ["tablet", "phone"],
    browserSupport: ["chromium", "webkit"],
    permissionRequirements: [],
    secureContextRequired: false,
    fallbackBehavior: "degrade_ui",
    offlineCompatibility: "full",
    telemetryPolicy: "minimal",
    certificationStatus: "certified",
  },
  {
    capabilityId: "viewport.tablet",
    version: "1.0.0",
    owner: "engineering_mobile_sdk",
    availability: "available",
    platformSupport: ["tablet"],
    browserSupport: ["chromium", "webkit"],
    permissionRequirements: [],
    secureContextRequired: false,
    fallbackBehavior: "degrade_ui",
    offlineCompatibility: "full",
    telemetryPolicy: "minimal",
    certificationStatus: "certified",
  },
  {
    capabilityId: "viewport.phone",
    version: "1.0.0",
    owner: "engineering_mobile_sdk",
    availability: "available",
    platformSupport: ["phone"],
    browserSupport: ["chromium", "webkit"],
    permissionRequirements: [],
    secureContextRequired: false,
    fallbackBehavior: "degrade_ui",
    offlineCompatibility: "full",
    telemetryPolicy: "minimal",
    certificationStatus: "certified",
  },
  {
    capabilityId: "media.stage",
    version: "1.0.0",
    owner: "engineering_mobile_sdk",
    availability: "available",
    platformSupport: ["web", "tablet", "phone"],
    browserSupport: ["chromium", "webkit", "firefox"],
    permissionRequirements: [],
    secureContextRequired: true,
    fallbackBehavior: "fail_explicit",
    offlineCompatibility: "stage_only",
    telemetryPolicy: "minimal",
    certificationStatus: "certified",
  },
] as const;

export const ENGINEERING_MOBILE_SDK_CAPABILITY_KEYS = [
  "deviceCapabilityDetection",
  "viewportClassification",
  "touchInput",
  "cameraAcquisition",
  "mediaCapture",
  "qrScanning",
  "barcodeScanning",
  "annotation",
  "signatureCapture",
  "authenticatedAttestation",
  "secureMediaStaging",
  "localTemporaryIdentifiers",
  "connectivityState",
  "syncReadinessContracts",
  "devicePermissionHandling",
  "mobileTelemetry",
  "mobileAccessibility",
  "mobileErrorStates",
  "capabilityHealth",
] as const;

export function assertEngineeringMobileSdkComplete(
  keys: readonly string[] = ENGINEERING_MOBILE_SDK_CAPABILITY_KEYS,
): void {
  for (const key of ENGINEERING_MOBILE_SDK_CAPABILITY_KEYS) {
    if (!keys.includes(key)) {
      throw new Error(`engineering_mobile_sdk_missing:${key}`);
    }
  }
}

export function getMobileCapability(capabilityId: MobileCapabilityId): MobileCapabilityManifest {
  const found = ENGINEERING_MOBILE_CAPABILITY_MANIFESTS.find((c) => c.capabilityId === capabilityId);
  if (!found) {
    throw new Error(`mobile_capability_unknown:${capabilityId}`);
  }
  return found;
}

export function assertMobileCapabilityAvailable(
  capabilityId: MobileCapabilityId,
  context: { secureContext: boolean; permissionsGranted: readonly string[] },
): MobileCapabilityManifest {
  const capability = getMobileCapability(capabilityId);
  if (capability.certificationStatus === "unimplemented") {
    throw new Error(`mobile_capability_unimplemented:${capabilityId}`);
  }
  if (capability.secureContextRequired && !context.secureContext) {
    throw new Error(`mobile_capability_secure_context_required:${capabilityId}`);
  }
  for (const permission of capability.permissionRequirements) {
    if (!context.permissionsGranted.includes(permission)) {
      throw new Error(`mobile_capability_permission_denied:${capabilityId}:${permission}`);
    }
  }
  if (capability.availability === "unsupported") {
    throw new Error(`mobile_capability_unsupported:${capabilityId}`);
  }
  return capability;
}

export function classifyViewport(width: number, height: number): MobileViewportClass {
  const min = Math.min(width, height);
  const max = Math.max(width, height);
  if (max < 600) return "phone";
  if (min >= 768 && max <= 1400) {
    return width >= height ? "tablet_landscape" : "tablet_portrait";
  }
  if (min < 768) return "phone";
  return "desktop";
}

export const MOBILE_MIN_TOUCH_TARGET_PX = 44 as const;

export type MobileConnectivityState = "online" | "offline" | "degraded";

export type MobileSyncReadiness =
  | "online_ready"
  | "offline_detected"
  | "upload_pending"
  | "local_draft_warning"
  | "server_confirmed";

/** @deprecated Use MOBILE_OFFLINE_ENGINE_IMPLEMENTED from offline.ts (Phase 9G). */
export type MobileSyncReadinessReserved = {
  durableLocalCommandQueue: true;
  backgroundSynchronization: true;
  multiDeviceConflictResolution: true;
  mergeStrategy: true;
  versionReconciliation: true;
  offlineTemplatePackageDownload: true;
  offlineEntitlementSnapshot: true;
};

/** Phase 9G — offline engine implemented. */
export const MOBILE_SYNC_READINESS_RESERVED: MobileSyncReadinessReserved = {
  durableLocalCommandQueue: true,
  backgroundSynchronization: true,
  multiDeviceConflictResolution: true,
  mergeStrategy: true,
  versionReconciliation: true,
  offlineTemplatePackageDownload: true,
  offlineEntitlementSnapshot: true,
};

export type MobileMediaStage = {
  stageId: string;
  temporaryLocalId: string;
  mimeType: string;
  byteLength: number;
  contentHash?: string;
  state: import("./offline").MobileDraftState;
  createdAt: string;
};

export const MOBILE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
] as const;

export const MOBILE_MAX_MEDIA_BYTES = 15 * 1024 * 1024;

export function assertMediaAllowed(input: { mimeType: string; byteLength: number }): void {
  if (!(MOBILE_ALLOWED_MIME_TYPES as readonly string[]).includes(input.mimeType)) {
    throw new Error(`mobile_media_mime_denied:${input.mimeType}`);
  }
  if (input.byteLength <= 0 || input.byteLength > MOBILE_MAX_MEDIA_BYTES) {
    throw new Error(`mobile_media_size_denied:${input.byteLength}`);
  }
}

export function createMediaStage(input: {
  mimeType: string;
  byteLength: number;
  temporaryLocalId?: string;
}): MobileMediaStage {
  assertMediaAllowed(input);
  return {
    stageId: `stage_${Date.now()}`,
    temporaryLocalId: input.temporaryLocalId ?? `tmp_${Date.now()}`,
    mimeType: input.mimeType,
    byteLength: input.byteLength,
    state: "media_staged",
    createdAt: new Date().toISOString(),
  };
}

export type MobileScanKind = "qr" | "barcode";

export type MobileScanResult = {
  scanId: string;
  kind: MobileScanKind;
  rawValue: string;
  formatValid: boolean;
  resolved?: {
    targetKind: "inspection_target" | "asset" | "equipment" | "location" | "session" | "tag";
    referenceId: string;
    tenantId: string;
    workspaceId: string;
  };
  userConfirmed: boolean;
};

export function validateScanFormat(kind: MobileScanKind, rawValue: string): boolean {
  if (!rawValue || rawValue.length > 512) return false;
  if (kind === "qr") return /^[A-Za-z0-9:_./-]{4,}$/.test(rawValue);
  return /^[A-Za-z0-9-]{4,128}$/.test(rawValue);
}

export type MobileAnnotationShape =
  | "freehand"
  | "arrow"
  | "rectangle"
  | "circle"
  | "text_callout"
  | "severity_marker"
  | "measurement_marker";

export type MobileAnnotationDraft = {
  annotationId: string;
  sourceEvidenceId: string;
  shapes: readonly { type: MobileAnnotationShape; label?: string; accessibleLabel: string }[];
  version: number;
  authorPersonId: string;
  createdAt: string;
  purpose: string;
};

export type MobileSignatureMark = {
  signatureMarkId: string;
  /** Supplementary visual only — not sole identity proof. */
  supplementaryOnly: true;
  mediaStageId?: string;
  capturedAt: string;
};

export type MobileAuthenticatedAttestation = {
  attestationId: string;
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId?: string;
  inspectionId: string;
  workflowTransition: string;
  contentHash: string;
  authenticationContext: string;
  assertedAt: string;
  deviceContext?: Record<string, string>;
  reason: string;
};

export type MobileEventType =
  | "engineering.mobile.capability_checked"
  | "engineering.mobile.camera_opened"
  | "engineering.mobile.evidence_captured"
  | "engineering.mobile.evidence_uploaded"
  | "engineering.mobile.scan_resolved"
  | "engineering.mobile.annotation_created"
  | "engineering.mobile.attestation_recorded"
  | "engineering.mobile.upload_failed"
  | "engineering.mobile.permission_denied"
  | "engineering.mobile.sync.started"
  | "engineering.mobile.sync.completed"
  | "engineering.mobile.sync.failed"
  | "engineering.mobile.sync.conflict_resolved"
  | "engineering.mobile.sync.package_downloaded"
  | "engineering.mobile.sync.entitlement_expired"
  | "engineering.mobile.sync.purged"
  | "engineering.mobile.sync.storage_pressure";

export type MobileSdkEvent = {
  type: MobileEventType;
  tenantId: string;
  workspaceId?: string;
  source: "engineering_mobile_sdk";
  occurredAt: string;
  payload: Record<string, unknown>;
};

export function createMobileSdkEvent(
  partial: Omit<MobileSdkEvent, "source" | "occurredAt"> & { occurredAt?: string },
): MobileSdkEvent {
  return {
    ...partial,
    source: "engineering_mobile_sdk",
    occurredAt: partial.occurredAt ?? new Date().toISOString(),
  };
}

export function createInProcessMobileEventBus(): {
  events: MobileSdkEvent[];
  publish(event: MobileSdkEvent): Promise<void>;
} {
  const events: MobileSdkEvent[] = [];
  return {
    events,
    async publish(event) {
      events.push(event);
    },
  };
}

export function createEngineeringMobileSdkSkeleton() {
  return {
    version: ENGINEERING_MOBILE_SDK_VERSION,
    capabilities: ENGINEERING_MOBILE_SDK_CAPABILITY_KEYS,
    manifests: ENGINEERING_MOBILE_CAPABILITY_MANIFESTS,
    classifyViewport,
    assertMobileCapabilityAvailable,
    createMediaStage,
    validateScanFormat,
    createMobileSdkEvent,
    createInProcessMobileEventBus,
    offlineEngineImplemented: MOBILE_SYNC_READINESS_RESERVED,
    minTouchTargetPx: MOBILE_MIN_TOUCH_TARGET_PX,
  };
}
