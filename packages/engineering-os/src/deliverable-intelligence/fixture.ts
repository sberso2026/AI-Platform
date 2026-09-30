import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "../lifecycle-intelligence/fixture";
import { crusherCanonicalHarvestRecords } from "../lifecycle-intelligence/fixture";
import { DEFAULT_LIFECYCLE_PROFILE_ID, DEFAULT_LIFECYCLE_PROFILE_VERSION } from "../lifecycle-intelligence/profile";
import {
  DEFAULT_DELIVERABLE_MATURITY_PROFILE_ID,
  DEFAULT_DELIVERABLE_MATURITY_PROFILE_VERSION,
  deliverableDefinitionByCode,
} from "./catalog";
import type { DeliverableArtifactBinding, DeliverableExpectation } from "./types";

export const A9C_STRUCTURAL_ANALYSIS_CODE = "STR-ANL-FEED";
export const A9C_INTERFACE_PACKAGE_CODE = "IFACE-PKG-FEED";
export const A9C_STRUCTURAL_EXPECTATION_ID = "a9c-str-anl-expectation";
export const A9C_INTERFACE_EXPECTATION_ID = "a9c-iface-expectation";

export function crusherDeliverableExpectation(
  tenantId: string,
  workspaceId: string,
  code: string,
  overrides: Partial<DeliverableExpectation> = {},
): DeliverableExpectation {
  const definition = deliverableDefinitionByCode(code)!;
  const id = code === A9C_STRUCTURAL_ANALYSIS_CODE ? A9C_STRUCTURAL_EXPECTATION_ID : code === A9C_INTERFACE_PACKAGE_CODE ? A9C_INTERFACE_EXPECTATION_ID : crypto.randomUUID();
  return {
    id,
    tenantId,
    workspaceId,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    definitionId: definition.definitionId,
    definitionVersion: definition.definitionVersion,
    definitionCode: definition.code,
    lifecycleProfileId: DEFAULT_LIFECYCLE_PROFILE_ID,
    lifecycleProfileVersion: DEFAULT_LIFECYCLE_PROFILE_VERSION,
    lifecycleStage: "FEED",
    scopeType: "PROJECT",
    scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    requirementState: "REQUIRED",
    intendedPurpose: "FOR_ENGINEERING_REVIEW",
    maturityProfileId: DEFAULT_DELIVERABLE_MATURITY_PROFILE_ID,
    maturityProfileVersion: DEFAULT_DELIVERABLE_MATURITY_PROFILE_VERSION,
    responsibleDiscipline: definition.responsibleDiscipline,
    contributingDisciplines: [...definition.contributingDisciplines],
    scheduleObjectId: code === A9C_STRUCTURAL_ANALYSIS_CODE ? "structural-analysis-complete" : null,
    scheduleStatus: "complete",
    origin: "HUMAN_GOVERNED",
    createdBy: "eng-admin",
    createdAt: "2026-09-30T12:00:00.000Z",
    ...overrides,
  };
}

export function structuralBindings(
  tenantId: string,
  workspaceId: string,
  options?: { includeReview?: boolean; includeAnalysis?: boolean },
): DeliverableArtifactBinding[] {
  const rows: DeliverableArtifactBinding[] = [];
  if (options?.includeAnalysis !== false) {
    rows.push({
      id: "bind-anl",
      tenantId,
      workspaceId,
      expectationId: A9C_STRUCTURAL_EXPECTATION_ID,
      artifactClass: "analysis_result",
      artifactId: "anl-struct",
      artifactRole: "PRIMARY",
      boundBy: "engineer-a1",
      boundAt: "2026-09-30T12:01:00.000Z",
    });
    rows.push({
      id: "bind-calc",
      tenantId,
      workspaceId,
      expectationId: A9C_STRUCTURAL_EXPECTATION_ID,
      artifactClass: "analysis_result",
      artifactId: "anl-struct",
      artifactRole: "CALCULATION",
      boundBy: "engineer-a1",
      boundAt: "2026-09-30T12:01:00.000Z",
    });
  }
  if (options?.includeReview) {
    rows.push({
      id: "bind-rev",
      tenantId,
      workspaceId,
      expectationId: A9C_STRUCTURAL_EXPECTATION_ID,
      artifactClass: "review_package",
      artifactId: "rev-feed-exit",
      artifactRole: "REVIEW",
      boundBy: "engineer-a1",
      boundAt: "2026-09-30T12:02:00.000Z",
    });
  }
  return rows;
}

export { crusherCanonicalHarvestRecords, CRUSHER_EXPANSION_FEED_PROJECT_ID };
