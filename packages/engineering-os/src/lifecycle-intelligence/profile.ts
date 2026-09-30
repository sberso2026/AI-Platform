import { LIFECYCLE_STAGES, type LifecycleProfile, type LifecycleStage } from "./types";

export const DEFAULT_LIFECYCLE_PROFILE_ID = "EOS-DEFAULT-ENGINEERING";
export const DEFAULT_LIFECYCLE_PROFILE_VERSION = "v1";

const DEFAULT_TRANSITIONS: ReadonlyArray<{ from: LifecycleStage; to: LifecycleStage }> = [
  { from: "CONCEPT", to: "PREFEASIBILITY" },
  { from: "PREFEASIBILITY", to: "CONCEPT" },
  { from: "PREFEASIBILITY", to: "FEASIBILITY" },
  { from: "FEASIBILITY", to: "PREFEASIBILITY" },
  { from: "FEASIBILITY", to: "FEED" },
  { from: "FEED", to: "FEASIBILITY" },
  { from: "FEED", to: "DETAILED_DESIGN" },
  { from: "DETAILED_DESIGN", to: "FEED" },
  { from: "DETAILED_DESIGN", to: "CONSTRUCTION" },
  { from: "CONSTRUCTION", to: "DETAILED_DESIGN" },
  { from: "CONSTRUCTION", to: "COMMISSIONING" },
  { from: "COMMISSIONING", to: "CONSTRUCTION" },
  { from: "COMMISSIONING", to: "OPERATIONS" },
  { from: "OPERATIONS", to: "MODIFICATION" },
  { from: "MODIFICATION", to: "FEED" },
  { from: "MODIFICATION", to: "DETAILED_DESIGN" },
  { from: "MODIFICATION", to: "CONSTRUCTION" },
  { from: "MODIFICATION", to: "COMMISSIONING" },
  { from: "MODIFICATION", to: "OPERATIONS" },
];

export const DEFAULT_ENGINEERING_LIFECYCLE_PROFILE: LifecycleProfile = {
  profileId: DEFAULT_LIFECYCLE_PROFILE_ID,
  profileVersion: DEFAULT_LIFECYCLE_PROFILE_VERSION,
  name: "Default Engineering Lifecycle",
  enabled: true,
  stages: LIFECYCLE_STAGES,
  omittedStages: [],
  allowedTransitions: DEFAULT_TRANSITIONS,
  gates: [
    { gateId: "FEED_EXIT", name: "FEED EXIT REVIEW", fromStage: "FEED", toStage: "DETAILED_DESIGN", required: true },
    { gateId: "DD_RETURN_FEED", name: "RETURN TO FEED", fromStage: "DETAILED_DESIGN", toStage: "FEED", required: true },
    { gateId: "OPS_TO_MOD", name: "MODIFICATION ENTRY", fromStage: "OPERATIONS", toStage: "MODIFICATION", required: true },
  ],
  criteria: [
    {
      criterionId: "A9A-CFG-FEED-001",
      criterionVersion: "v1",
      type: "CONFIGURATION_BASELINE_REQUIRED",
      gateId: "FEED_EXIT",
      name: "Frozen FEED baseline",
      description: "A frozen FEED configuration baseline must exist. Does not prove the design is correct.",
      enabled: true,
      baselineType: "FEED",
      requiredBaselineStatus: "frozen",
    },
    {
      criterionId: "A9A-REQ-001",
      criterionVersion: "v1",
      type: "REQUIREMENTS_CONTEXT_REQUIRED",
      gateId: "FEED_EXIT",
      name: "Requirements allocation context",
      description: "Selected non-draft requirements are allocated. Does not create lifecycle-specific requirements.",
      enabled: true,
    },
    {
      criterionId: "A9A-ASM-001",
      criterionVersion: "v1",
      type: "ASSUMPTION_REVIEW_REQUIRED",
      gateId: "FEED_EXIT",
      name: "Material assumptions reviewed",
      description: "High/critical assumptions are reviewed or not expired. Does not auto-invalidate the project.",
      enabled: true,
      minMateriality: "HIGH",
    },
    {
      criterionId: "A9A-IFC-001",
      criterionVersion: "v1",
      type: "INTERFACE_INFORMATION_REQUIRED",
      gateId: "FEED_EXIT",
      name: "Critical Mechanical → Structural load information",
      description: "Configured interface information must be PROVIDED or ACCEPTED. Not every interface is required.",
      enabled: true,
      sourceDiscipline: "MECHANICAL",
      receivingDiscipline: "STRUCTURAL",
      informationKey: "OPERATING_LOAD",
      requiredInterfaceStatus: ["PROVIDED", "ACCEPTED"],
    },
    {
      criterionId: "A9A-ANL-001",
      criterionVersion: "v1",
      type: "ANALYSIS_EVIDENCE_REQUIRED",
      gateId: "FEED_EXIT",
      name: "Applicable analysis evidence",
      description: "Where analysis is applicable, a valid non-stale reviewed result is required. SPACE GASS unavailability does not block unrelated scopes.",
      enabled: true,
      applicableDisciplines: ["STRUCTURAL"],
    },
    {
      criterionId: "A9A-REV-001",
      criterionVersion: "v1",
      type: "ENGINEERING_REVIEW_REQUIRED",
      gateId: "FEED_EXIT",
      name: "Canonical Engineering Review",
      description: "A canonical Review Package exists. Findings remain owned by Engineering Review.",
      enabled: true,
    },
    {
      criterionId: "A9A-DEC-001",
      criterionVersion: "v1",
      type: "DECISION_EVIDENCE_REQUIRED",
      gateId: "FEED_EXIT",
      name: "Concept/FEED decision context",
      description: "Uses canonical Decision Intelligence. Does not mint lifecycle-specific decisions.",
      enabled: true,
    },
    {
      criterionId: "A9A-ASR-001",
      criterionVersion: "v1",
      type: "ASSURANCE_EVALUATION_COMPLETE",
      gateId: "FEED_EXIT",
      name: "Assurance evaluation complete",
      description: "Assurance evaluation completeness must be COMPLETE. PARTIAL cannot ready a gate.",
      enabled: true,
    },
    {
      criterionId: "A9A-ASR-002",
      criterionVersion: "v1",
      type: "NO_OPEN_BLOCKING_ASSURANCE_CONDITIONS",
      gateId: "FEED_EXIT",
      name: "Configured blocking Assurance Conditions",
      description: "Only HIGH/CRITICAL incomplete-interface and missing-allocation families block. Other open conditions do not.",
      enabled: true,
      blockingConditionTypes: ["INCOMPLETE_INTERFACE_INFORMATION", "MISSING_ALLOCATION"],
      minMateriality: "HIGH",
    },
    {
      criterionId: "A9A-CHG-001",
      criterionVersion: "v1",
      type: "CHANGE_SURFACED",
      gateId: "FEED_EXIT",
      name: "Material changes surfaced",
      description: "Active material Changes are surfaced. They do not automatically block or confirm Impacts.",
      enabled: true,
    },
    {
      criterionId: "A9A-OPT-001",
      criterionVersion: "v1",
      type: "OPTIMIZATION_CONTEXT",
      gateId: "FEED_EXIT",
      name: "Optimization applicability",
      description: "Optimization is OPTIONAL for the default FEED gate. Not universally required. Does not select alternatives.",
      enabled: true,
      optimizationPolicy: "OPTIONAL",
    },
    {
      criterionId: "A9A-DD-FEED-001",
      criterionVersion: "v1",
      type: "DECISION_EVIDENCE_REQUIRED",
      gateId: "DD_RETURN_FEED",
      name: "Authorized return rationale context",
      description: "Back-transition to FEED requires a canonical Decision or recorded rationale context.",
      enabled: true,
    },
    {
      criterionId: "A9A-OPS-MOD-001",
      criterionVersion: "v1",
      type: "CHANGE_SURFACED",
      gateId: "OPS_TO_MOD",
      name: "Modification entry change context",
      description: "Operations → Modification is a governed loop, not a terminal stage.",
      enabled: true,
    },
  ],
};

export function lifecycleProfileById(profileId: string, profileVersion: string): LifecycleProfile | null {
  if (profileId === DEFAULT_LIFECYCLE_PROFILE_ID && profileVersion === DEFAULT_LIFECYCLE_PROFILE_VERSION) {
    return DEFAULT_ENGINEERING_LIFECYCLE_PROFILE;
  }
  return null;
}

export function unknownProfileRejected(profileId: string, profileVersion: string): boolean {
  return lifecycleProfileById(profileId, profileVersion) == null;
}

export function transitionAllowed(profile: LifecycleProfile, from: LifecycleStage, to: LifecycleStage): boolean {
  return profile.allowedTransitions.some((row) => row.from === from && row.to === to);
}

export function gateForTransition(profile: LifecycleProfile, from: LifecycleStage, to: LifecycleStage) {
  return profile.gates.find((gate) => gate.fromStage === from && gate.toStage === to) ?? null;
}

export function criteriaForGate(profile: LifecycleProfile, gateId: string, enabledIds?: readonly string[] | null) {
  const rows = profile.criteria.filter((row) => row.gateId === gateId);
  if (enabledIds == null) return rows;
  const allowed = new Set(enabledIds);
  return rows.filter((row) => allowed.has(row.criterionId));
}
