import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "../lifecycle-intelligence/fixture";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import { A10A_MECH_LOAD_ID } from "../information-intelligence/fixture";
import type { ManagedEngineeringRepository, SourceWorkflowSignal } from "./types";

export const A10B_REPO_ID = "repo-project-a-structural-calcs";
export const A10B_SHAREPOINT_LIKE_ROOT = "C:\\Users\\User\\Company\\Project-A\\Engineering\\";
export const A10B_PERSONAL_PATH = "C:\\Users\\Test\\Documents\\Personal\\Mortgage.xlsx";
export const A10B_SCRATCH_PATH = "C:\\Temp\\scratch_calc.xlsx";

function now() {
  return "2026-10-01T00:00:00.000Z";
}

export function crusherManagedRepository(
  tenantId = CRUSHER_FEED_TENANT,
  workspaceId = CRUSHER_FEED_WORKSPACE,
): ManagedEngineeringRepository {
  return {
    id: A10B_REPO_ID,
    tenantId,
    workspaceId,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    scope: "PROJECT",
    repositoryType: "CORPORATE_SYNCED_FOLDER",
    externalRepositoryId: "sp-project-a-structural",
    displayName: "Project A Structural Calculations",
    approvedRoot: A10B_SHAREPOINT_LIKE_ROOT,
    connectionId: "conn-m365-project-a",
    enabled: true,
    capturePolicy: "MANAGED",
    createdBy: "eng-admin",
    createdAt: now(),
    updatedAt: now(),
  };
}

export function sharePointLikeSignal(overrides: Partial<SourceWorkflowSignal> = {}): SourceWorkflowSignal {
  return {
    sourceSystem: "sharepoint",
    sourceEventType: "FILE_REVISED",
    sourceEventId: "sp-evt-load-rev-2",
    sourceObjectType: "document",
    sourceObjectId: "ds-mech-operating-load",
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    occurredAt: "2026-09-30T08:00:00.000Z",
    actorId: "mech-lead",
    path: `${A10B_SHAREPOINT_LIKE_ROOT}Mechanical\\operating_load.xlsx`,
    managedRepositoryId: A10B_REPO_ID,
    informationRefId: A10A_MECH_LOAD_ID,
    disciplineId: "MECHANICAL",
    systemId: "sys-primary-crushing",
    lifecycleStage: "FEED",
    ...overrides,
  };
}

export function personalFileSignal(): SourceWorkflowSignal {
  return {
    sourceSystem: "local_filesystem",
    sourceEventType: "FILE_REVISED",
    sourceEventId: "personal-mortgage",
    sourceObjectType: "file",
    sourceObjectId: "Mortgage.xlsx",
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    occurredAt: "2026-09-30T07:00:00.000Z",
    path: A10B_PERSONAL_PATH,
  };
}

export function unmanagedScratchSignal(published = false): SourceWorkflowSignal {
  return {
    sourceSystem: "local_filesystem",
    sourceEventType: "FILE_REVISED",
    sourceEventId: published ? "scratch-published-1" : "scratch-local-1",
    sourceObjectType: "file",
    sourceObjectId: published ? "managed-scratch-calc.xlsx" : "scratch_calc.xlsx",
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    occurredAt: "2026-09-30T07:30:00.000Z",
    path: published ? `${A10B_SHAREPOINT_LIKE_ROOT}Structural\\scratch_calc.xlsx` : A10B_SCRATCH_PATH,
    publishedToEos: published,
    managedRepositoryId: published ? A10B_REPO_ID : null,
  };
}

export function officeWorkflowSignals(): SourceWorkflowSignal[] {
  const base = sharePointLikeSignal();
  return [
    sharePointLikeSignal({ sourceEventType: "FILE_CREATED", sourceEventId: "sp-evt-load-create", occurredAt: "2026-09-29T08:00:00.000Z" }),
    sharePointLikeSignal(),
    sharePointLikeSignal({
      sourceEventType: "INTERFACE_INFORMATION_CHANGED",
      sourceEventId: "if-evt-load",
      sourceObjectType: "interface",
      sourceObjectId: "if-cr-cv-01",
      disciplineId: "STRUCTURAL",
      occurredAt: "2026-09-30T09:00:00.000Z",
    }),
    sharePointLikeSignal({
      sourceEventType: "ANALYSIS_JOB_COMPLETED",
      sourceEventId: "anl-evt-struct",
      sourceSystem: "engineering-os",
      sourceObjectType: "analysis_result",
      sourceObjectId: "anl-struct",
      disciplineId: "STRUCTURAL",
      occurredAt: "2026-09-30T10:00:00.000Z",
    }),
    sharePointLikeSignal({
      sourceEventType: "EXCEL_CALCULATION_PUBLISHED",
      sourceEventId: "calc-evt-1",
      sourceObjectType: "document",
      sourceObjectId: "calc-str-feed",
      disciplineId: "STRUCTURAL",
      occurredAt: "2026-09-30T11:00:00.000Z",
    }),
    sharePointLikeSignal({
      sourceEventType: "CAD_DRAWING_ISSUED",
      sourceEventId: "dwg-evt-1",
      sourceObjectType: "document",
      sourceObjectId: "dwg-str-feed",
      disciplineId: "STRUCTURAL",
      occurredAt: "2026-09-30T12:00:00.000Z",
    }),
    sharePointLikeSignal({
      sourceEventType: "REVIEW_COMPLETED",
      sourceEventId: "rev-evt-1",
      sourceObjectType: "review_package",
      sourceObjectId: "rev-str-feed",
      occurredAt: "2026-09-30T13:00:00.000Z",
    }),
    sharePointLikeSignal({
      sourceEventType: "DECISION_RECORDED",
      sourceEventId: "dec-evt-1",
      sourceObjectType: "decision",
      sourceObjectId: "edn-014",
      occurredAt: "2026-09-30T14:00:00.000Z",
    }),
    sharePointLikeSignal({
      sourceEventType: "DELIVERABLE_UPDATED",
      sourceEventId: "del-evt-1",
      sourceObjectType: "deliverable_expectation",
      sourceObjectId: "str-anl-feed",
      deliverableId: "str-anl-feed",
      occurredAt: "2026-09-30T15:00:00.000Z",
    }),
    { ...base, sourceEventType: "FILE_PUBLISHED", sourceEventId: "sp-evt-load-pub", occurredAt: "2026-09-30T08:30:00.000Z" },
  ];
}
