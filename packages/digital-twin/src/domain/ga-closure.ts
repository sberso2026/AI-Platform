/**
 * Phase 12N — V1.0 GA closure readiness helpers.
 */

import {
  DIGITAL_TWIN_BACKUP_RESTORE_CERTIFIED,
  DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL,
  DIGITAL_TWIN_V1_FROZEN,
  DIGITAL_TWIN_V1_GA_CERTIFIED,
  PRODUCTION_DIGITAL_TWIN_READY,
  SPATIAL_OWNERSHIP_FULLY_RESOLVED,
} from "../version";
import { assertNoModuleRegistryDrift } from "./registry-drift";

export function assertDigitalTwinGaClosureReady(): {
  ok: true;
  productionDigitalTwinReady: true;
  digitalTwinV1GaCertified: true;
  digitalTwinV1Frozen: true;
  digitalTwinBackupRestoreCertified: true;
  spatialOwnershipFullyResolved: true;
  digitalTwinMayOwnCanonicalSpatial: false;
} {
  if (!PRODUCTION_DIGITAL_TWIN_READY) {
    throw new Error("production_digital_twin_not_ready");
  }
  if (!DIGITAL_TWIN_V1_GA_CERTIFIED) {
    throw new Error("digital_twin_v1_not_ga_certified");
  }
  if (!DIGITAL_TWIN_V1_FROZEN) {
    throw new Error("digital_twin_v1_not_frozen");
  }
  if (!DIGITAL_TWIN_BACKUP_RESTORE_CERTIFIED) {
    throw new Error("digital_twin_backup_restore_not_certified");
  }
  if (!SPATIAL_OWNERSHIP_FULLY_RESOLVED) {
    throw new Error("spatial_ownership_not_resolved_via_ssd");
  }
  if (DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL) {
    throw new Error("digital_twin_must_not_own_canonical_spatial");
  }
  assertNoModuleRegistryDrift();
  return {
    ok: true,
    productionDigitalTwinReady: true,
    digitalTwinV1GaCertified: true,
    digitalTwinV1Frozen: true,
    digitalTwinBackupRestoreCertified: true,
    spatialOwnershipFullyResolved: true,
    digitalTwinMayOwnCanonicalSpatial: false,
  };
}
