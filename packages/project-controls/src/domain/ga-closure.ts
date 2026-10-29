/**
 * Phase 11N — V1.0 GA closure readiness helpers.
 */

import {
  PROJECT_CONTROLS_BACKUP_RESTORE_CERTIFIED,
  PROJECT_CONTROLS_V1_FROZEN,
  PROJECT_CONTROLS_V1_GA_CERTIFIED,
  PRODUCTION_PROJECT_CONTROLS_READY,
} from "../version";
import { assertNoModuleRegistryDrift } from "./registry-drift";

export function assertProjectControlsGaClosureReady(): {
  ok: true;
  productionProjectControlsReady: true;
  projectControlsV1GaCertified: true;
  projectControlsV1Frozen: true;
  projectControlsBackupRestoreCertified: true;
} {
  if (!PRODUCTION_PROJECT_CONTROLS_READY) {
    throw new Error("production_project_controls_not_ready");
  }
  if (!PROJECT_CONTROLS_V1_GA_CERTIFIED) {
    throw new Error("project_controls_v1_not_ga_certified");
  }
  if (!PROJECT_CONTROLS_V1_FROZEN) {
    throw new Error("project_controls_v1_not_frozen");
  }
  if (!PROJECT_CONTROLS_BACKUP_RESTORE_CERTIFIED) {
    throw new Error("project_controls_backup_restore_not_certified");
  }
  assertNoModuleRegistryDrift();
  return {
    ok: true,
    productionProjectControlsReady: true,
    projectControlsV1GaCertified: true,
    projectControlsV1Frozen: true,
    projectControlsBackupRestoreCertified: true,
  };
}
