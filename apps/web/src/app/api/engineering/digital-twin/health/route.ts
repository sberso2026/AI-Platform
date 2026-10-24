import { NextResponse } from "next/server";
import {
  DIGITAL_TWIN_BACKUP_RESTORE_CERTIFIED,
  DIGITAL_TWIN_MODULE_REGISTRY_DRIFT_DETECTED,
  DIGITAL_TWIN_READINESS_MARKER,
  DIGITAL_TWIN_RELEASE_TAG,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_V1_FROZEN,
  DIGITAL_TWIN_V1_GA_CERTIFIED,
  DIGITAL_TWIN_VERSION,
  PHASE_12N_COMPLETE,
  PHYSICAL_ACTUATION_IMPLEMENTED,
  PREDICTIVE_TWIN_IMPLEMENTED,
  PRODUCTION_DIGITAL_TWIN_READY,
  SILENT_FIXTURE_FALLBACK_ENABLED,
  detectModuleRegistryDrift,
} from "@rtb/digital-twin";

export async function GET() {
  const drift = detectModuleRegistryDrift();
  return NextResponse.json({
    module: "digital_twin",
    version: DIGITAL_TWIN_VERSION,
    status: DIGITAL_TWIN_STATUS,
    releaseTag: DIGITAL_TWIN_RELEASE_TAG,
    readinessMarker: DIGITAL_TWIN_READINESS_MARKER,
    productionDigitalTwinReady: PRODUCTION_DIGITAL_TWIN_READY,
    digitalTwinV1GaCertified: DIGITAL_TWIN_V1_GA_CERTIFIED,
    digitalTwinV1Frozen: DIGITAL_TWIN_V1_FROZEN,
    digitalTwinBackupRestoreCertified: DIGITAL_TWIN_BACKUP_RESTORE_CERTIFIED,
    phase12nComplete: PHASE_12N_COMPLETE,
    moduleRegistryDriftDetected: DIGITAL_TWIN_MODULE_REGISTRY_DRIFT_DETECTED,
    registryDriftCheck: drift.ok ? "ok" : drift.error,
    physicalActuationImplemented: PHYSICAL_ACTUATION_IMPLEMENTED,
    predictiveTwinImplemented: PREDICTIVE_TWIN_IMPLEMENTED,
    silentFixtureFallbackEnabled: SILENT_FIXTURE_FALLBACK_ENABLED,
  });
}
