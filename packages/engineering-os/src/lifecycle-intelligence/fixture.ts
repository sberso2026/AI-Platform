import type { CanonicalHarvestBundle, CanonicalHarvestRecord } from "./harvest";
import type { LifecycleEvidence, LifecycleScope } from "./types";

export const CRUSHER_EXPANSION_FEED_PROJECT_ID = "proj-crusher-feed";

export const A9A_FEED_ASSIGNMENT_ID = "a9a-feed-project-assignment";
export const A9A_PROCESS_SYSTEM_ID = "a9a-primary-crushing-system";
export const A9A_STRUCTURAL_PACKAGE_ID = "a9a-crusher-support-frame";
export const A9A_EARLY_WORKS_ID = "a9a-early-works";

export const A9A_MIXED_SCOPES: readonly LifecycleScope[] = [
  { objectType: "PROJECT", objectId: CRUSHER_EXPANSION_FEED_PROJECT_ID, label: "Crusher Expansion FEED" },
  { objectType: "SYSTEM", objectId: A9A_PROCESS_SYSTEM_ID, parentObjectId: CRUSHER_EXPANSION_FEED_PROJECT_ID, label: "Primary Crushing" },
  { objectType: "SYSTEM", objectId: A9A_STRUCTURAL_PACKAGE_ID, parentObjectId: CRUSHER_EXPANSION_FEED_PROJECT_ID, label: "Crusher Support Frame" },
  { objectType: "ASSET", objectId: A9A_EARLY_WORKS_ID, parentObjectId: CRUSHER_EXPANSION_FEED_PROJECT_ID, label: "Early Works" },
];

function evidence(overrides: Partial<LifecycleEvidence> = {}): LifecycleEvidence {
  return {
    truncated: false,
    failed: false,
    optimizationPolicy: "OPTIONAL",
    optimizationPresent: false,
    baselines: [],
    requirements: [],
    assumptions: [],
    interfaces: [],
    analyses: [],
    reviews: [],
    decisions: [],
    changes: [],
    assurance: { completeness: "COMPLETE", conditions: [] },
    ...overrides,
  };
}

export function incompleteFeedEvidence(): LifecycleEvidence {
  return evidence({
    baselines: [{ id: "feed-draft", baselineType: "FEED", status: "draft" }],
    requirements: [{ id: "req-feed-1", allocated: false, status: "active" }],
    assumptions: [{ id: "asm-1", materiality: "HIGH", reviewed: false, expired: false }],
    interfaces: [
      {
        id: "iir-load",
        informationKey: "OPERATING_LOAD",
        sourceDiscipline: "MECHANICAL",
        receivingDiscipline: "STRUCTURAL",
        status: "REQUESTED",
      },
    ],
    analyses: [{ id: "anl-struct", applicable: true, valid: false, reviewed: false, stale: false }],
    reviews: [],
    decisions: [],
    changes: [{ id: "chg-1", material: true, status: "open" }],
    assurance: {
      completeness: "COMPLETE",
      conditions: [
        { id: "ac-ifc", conditionType: "INCOMPLETE_INTERFACE_INFORMATION", materiality: "HIGH", status: "OPEN" },
      ],
    },
  });
}

export function readyFeedEvidence(): LifecycleEvidence {
  return evidence({
    baselines: [{ id: "feed-frozen", baselineType: "FEED", status: "frozen" }],
    requirements: [{ id: "req-feed-1", allocated: true, status: "active" }],
    assumptions: [{ id: "asm-1", materiality: "HIGH", reviewed: true, expired: false }],
    interfaces: [
      {
        id: "iir-load",
        informationKey: "OPERATING_LOAD",
        sourceDiscipline: "MECHANICAL",
        receivingDiscipline: "STRUCTURAL",
        status: "ACCEPTED",
      },
    ],
    analyses: [{ id: "anl-struct", applicable: true, valid: true, reviewed: true, stale: false }],
    reviews: [{ id: "rev-feed-exit", status: "complete" }],
    decisions: [{ id: "dec-concept-select", status: "approved" }],
    changes: [{ id: "chg-1", material: true, status: "open" }],
    assurance: { completeness: "COMPLETE", conditions: [] },
  });
}

export function truncatedFeedEvidence(): LifecycleEvidence {
  return {
    ...readyFeedEvidence(),
    truncated: true,
  };
}

export function staleAfterReadyEvidence(): LifecycleEvidence {
  return {
    ...readyFeedEvidence(),
    analyses: [{ id: "anl-struct", applicable: true, valid: true, reviewed: true, stale: true }],
  };
}

export function processOnlyAnalysisEvidence(): LifecycleEvidence {
  return {
    ...readyFeedEvidence(),
    analyses: [{ id: "anl-spacegass", applicable: false, valid: false, reviewed: false, stale: false }],
  };
}

export function crusherCanonicalHarvestRecords(
  tenantId: string,
  workspaceId: string,
  options?: { interfaceStatus?: string; truncated?: boolean; failed?: boolean; assuranceCompleteness?: "COMPLETE" | "PARTIAL" | "FAILED" },
): CanonicalHarvestBundle {
  const projectId = CRUSHER_EXPANSION_FEED_PROJECT_ID;
  const interfaceStatus = options?.interfaceStatus ?? "ACCEPTED";
  const records: CanonicalHarvestRecord[] = [
    {
      tenantId, workspaceId, projectId, objectType: "configuration_baseline", objectId: "feed-frozen",
      state: "frozen", fields: { baselineType: "FEED", status: "frozen" },
    },
    {
      tenantId, workspaceId, projectId, objectType: "requirement", objectId: "req-feed-1",
      state: "active", fields: { allocated: true, status: "active" },
    },
    {
      tenantId, workspaceId, projectId, objectType: "assumption", objectId: "asm-1",
      state: "active", fields: { materiality: "HIGH", reviewed: true, expired: false, validationStatus: "validated" },
    },
    {
      tenantId, workspaceId, projectId, objectType: "interface", objectId: "iir-load",
      state: interfaceStatus, fields: {
        informationKey: "OPERATING_LOAD", status: interfaceStatus,
        sourceDiscipline: "MECHANICAL", receivingDiscipline: "STRUCTURAL",
      },
    },
    {
      tenantId, workspaceId, projectId, objectType: "analysis_result", objectId: "anl-struct",
      state: "valid", fields: { applicable: true, valid: true, reviewed: true, accepted: true, stale: false },
    },
    {
      tenantId, workspaceId, projectId, objectType: "review_package", objectId: "rev-feed-exit",
      state: "complete", fields: { status: "complete" },
    },
    {
      tenantId, workspaceId, projectId, objectType: "decision", objectId: "dec-concept-select",
      state: "approved", fields: { status: "approved", decisionClass: "CONCEPT_SELECT" },
    },
    {
      tenantId, workspaceId, projectId, objectType: "change", objectId: "chg-1",
      state: "open", fields: { status: "open", material: true },
    },
    {
      tenantId, workspaceId, projectId, scopeId: A9A_STRUCTURAL_PACKAGE_ID, objectType: "analysis_result", objectId: "anl-structural-dd",
      state: "valid", fields: { applicable: true, valid: true, reviewed: true, stale: false },
    },
    {
      tenantId, workspaceId, projectId, scopeId: A9A_EARLY_WORKS_ID, objectType: "review_package", objectId: "rev-early-works",
      state: "complete", fields: { status: "complete" },
    },
  ];
  return {
    records,
    truncated: Boolean(options?.truncated),
    failed: Boolean(options?.failed),
    assuranceCompleteness: options?.assuranceCompleteness ?? "COMPLETE",
    optimizationPolicy: "OPTIONAL",
    optimizationPresent: false,
  };
}

export function mixedLifecycleAssignments(tenantId: string, workspaceId: string) {
  const now = "2026-09-30T11:00:00.000Z";
  return [
    {
      id: A9A_FEED_ASSIGNMENT_ID,
      tenantId,
      workspaceId,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT" as const,
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "FEED" as const,
      profileId: "EOS-DEFAULT-ENGINEERING",
      profileVersion: "v1",
      version: 1,
      assignedAt: now,
    },
    {
      id: "a9a-process-assignment",
      tenantId,
      workspaceId,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "SYSTEM" as const,
      scopeId: A9A_PROCESS_SYSTEM_ID,
      parentScopeType: "PROJECT" as const,
      parentScopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "FEED" as const,
      profileId: "EOS-DEFAULT-ENGINEERING",
      profileVersion: "v1",
      version: 1,
      assignedAt: now,
    },
    {
      id: "a9a-structural-assignment",
      tenantId,
      workspaceId,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "SYSTEM" as const,
      scopeId: A9A_STRUCTURAL_PACKAGE_ID,
      parentScopeType: "PROJECT" as const,
      parentScopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "DETAILED_DESIGN" as const,
      profileId: "EOS-DEFAULT-ENGINEERING",
      profileVersion: "v1",
      version: 1,
      assignedAt: now,
    },
    {
      id: "a9a-early-works-assignment",
      tenantId,
      workspaceId,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "ASSET" as const,
      scopeId: A9A_EARLY_WORKS_ID,
      parentScopeType: "PROJECT" as const,
      parentScopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "CONSTRUCTION" as const,
      profileId: "EOS-DEFAULT-ENGINEERING",
      profileVersion: "v1",
      version: 1,
      assignedAt: now,
    },
  ];
}
