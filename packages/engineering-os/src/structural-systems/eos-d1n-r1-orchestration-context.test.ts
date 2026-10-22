import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  D1N_0_NEXT_PHASE_STARTED,
  D1N_ARCHITECTURE_DEFINED,
  D1N_R1_CANONICAL_PHASE,
  D1N_R1_CANONICAL_SCOPE,
  D1N_RUNTIME_COUNT as HISTORICAL_D1N_RUNTIME_COUNT,
  D1N_RUNTIME_STARTED as HISTORICAL_D1N_RUNTIME_STARTED,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1N_ARCHITECTURE_DEFINED as HISTORICAL_D1N_ARCHITECTURE_DEFINED } from "./d1n-foundational-decisions";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_LIFECYCLE_STAGE_CONTEXT,
  AI_CAN_INVENT_ORCHESTRATION_CONTEXT_IDENTITY,
  AI_CAN_INVENT_PROJECT_CONTEXT,
  AI_CAN_INVENT_TENANT_CONTEXT,
  AI_CAN_INVENT_WORKSPACE_CONTEXT,
  AI_CAN_MARK_CONTEXT_ENGINEERING_VALIDATED,
  AI_EQUALS_D1N_ENGINEERING_AUTHORITY,
  CANONICAL_DIGITAL_THREAD_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  CITED_LIFECYCLE_STAGE_EQUALS_D1N_DESIGN_PROGRESSION_STATE,
  D1A_IDENTITY_REUSED,
  D1N_ALTERNATIVE_BRANCH_RUNTIME_COUNT,
  D1N_ALTERNATIVE_BRANCH_RUNTIME_READY,
  D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT,
  D1N_CERTIFICATION_RUNTIME_COUNT,
  D1N_CONFORMANCE_RUNTIME_COUNT,
  D1N_CONTEXT_AUTHORITY,
  D1N_CONTEXT_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY,
  D1N_CONTEXT_AUTHORITY_EQUALS_ENGINEERING_APPROVAL_AUTHORITY,
  D1N_CONTEXT_AUTHORITY_EQUALS_ENGINEERING_VALIDATION_AUTHORITY,
  D1N_CONTEXT_AUTHORITY_PRESERVED,
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY,
  D1N_D1K_RUNTIME_INTEGRATION_COUNT,
  D1N_D1L_RUNTIME_INTEGRATION_COUNT,
  D1N_D1M_RUNTIME_INTEGRATION_COUNT,
  D1N_DESIGN_PROGRESSION_RUNTIME_COUNT,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_DUPLICATE_ORCHESTRATION_CONTEXT_GOVERNED,
  D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT,
  D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D1N_EVIDENCE_GAP_RUNTIME_COUNT,
  D1N_HANDOFF_INTEGRATION_RUNTIME_READY,
  D1N_HUMAN_DECISION_GATE_RUNTIME_COUNT,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_LIFECYCLE_STAGE_CONTEXT_CITATION_IMPLEMENTED,
  D1N_NEXT_ACTION_RUNTIME_COUNT,
  D1N_ORCHESTRATION_CONTEXT_FINGERPRINT_IMPLEMENTED,
  D1N_ORCHESTRATION_CONTEXT_HISTORY_PRESERVED,
  D1N_ORCHESTRATION_CONTEXT_RUNTIME_COUNT,
  D1N_ORCHESTRATION_CONTEXT_RUNTIME_IMPLEMENTED,
  D1N_ORCHESTRATION_CONTEXT_SPOOFING_PROTECTION_IMPLEMENTED,
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_ORCHESTRATION_PROVENANCE_PRESERVED,
  D1N_ORCHESTRATION_PROVENANCE_REQUIRED,
  D1N_PREREQUISITE_RUNTIME_COUNT,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_R1_C10_DEBT,
  D1N_R1_CLOSEOUT_PATH,
  D1N_R1_D1F_DEBT,
  D1N_R1_D1G_BLOCKER_PRESERVED,
  D1N_R1_D1G_DEBT,
  D1N_R1_D1H_DEBT,
  D1N_R1_D1I_DEBT,
  D1N_R1_D1J_DEBT,
  D1N_R1_D1K_DEBT,
  D1N_R1_D1K_INTELLIGENCE_READY,
  D1N_R1_D1K_INTERNAL_INTEGRATION_READY,
  D1N_R1_D1K_LIMITATIONS_PRESERVED,
  D1N_R1_D1L_DEBT,
  D1N_R1_D1L_TRACK_COMPLETE,
  D1N_R1_D1L_TRACK_STATUS,
  D1N_R1_D1M_REOPENED,
  D1N_R1_D1M_TRACK_COMPLETE,
  D1N_R1_D1M_TRACK_STATUS,
  D1N_R1_DATABASE_SCHEMA_CHANGED,
  D1N_R1_DEBT_PRESERVED,
  D1N_R1_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R1_MACHINE_READABLE_ROADMAP_UPDATED,
  D1N_R1_MATURITY_STATE,
  D1N_R1_NEW_DEPENDENCY_ADDED,
  D1N_R1_PARENT_ARCHITECTURE_PATH,
  D1N_R1_POST_D1J_DEBT_LEDGER,
  D1N_R1_READY_FOR_NEXT_PHASE,
  D1N_R1_SCOPE,
  D1N_R1_STRUCTURAL_PACK_COMPLETE,
  D1N_R2_CANONICAL_PHASE,
  D1N_R2_CANONICAL_SCOPE,
  D1N_R2_PHASE_TYPE,
  D1N_REVIEW_GATE_RUNTIME_COUNT,
  D1N_RUNTIME_COUNT,
  D1N_RUNTIME_STARTED,
  D1N_SOLVER_EXECUTION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_RUNTIME_READY,
  D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT,
  D2_D8_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  FINGERPRINT_VERIFIED_EQUALS_CERTIFIED,
  FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED,
  FINGERPRINT_VERIFIED_EQUALS_STAGE_APPROVED,
  ORCHESTRATION_EQUALS_AUTONOMOUS_DESIGN_AUTHORITY,
  ORCHESTRATION_EQUALS_CERTIFICATION,
  ORCHESTRATION_EQUALS_ENGINEERING_APPROVAL,
  ORCHESTRATION_EQUALS_ENGINEERING_VALIDATION,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  PARALLEL_D1N_STRUCTURAL_IDENTITY_CREATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_ORCHESTRATION_CONTEXT_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_ORCHESTRATION_SCOPE_ENFORCED,
  advanceDesignProgression,
  assessPrerequisites,
  certifyContext,
  createD1nR1Store,
  mutateOrchestrationContext,
  recordOrchestrationContext,
  reconstructOrchestrationContext,
  requestStageTransition,
  selectAlternative,
  validateEngineering,
  type D1nR1Actor,
  type D1nR1Input,
  type D1nR1Store,
} from "./orchestration-context";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../../../..");
const debt = "DOES_NOT_BLOCK_D1N_BUT_REMAINS_LIMITATION";

const actor: D1nR1Actor = {
  actorId: "recorder-1",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "ORCHESTRATION_CONTEXT_AUTHORITY",
};

function store(): D1nR1Store {
  return createD1nR1Store([
    { id: "member-1", kind: "MEMBER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" },
    { id: "member-b", kind: "MEMBER", tenantId: "tenant-b", workspaceId: "workspace-a", projectId: "project-a" },
    { id: "member-w", kind: "BEAM", tenantId: "tenant-a", workspaceId: "workspace-b", projectId: "project-a" },
    { id: "member-p", kind: "COLUMN", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-b" },
  ]);
}

function input(overrides: Partial<D1nR1Input> = {}): D1nR1Input {
  return {
    contextId: "ctx-1",
    structuralIdentityId: "member-1",
    citedLifecycleStage: "FEASIBILITY",
    provenanceRef: "prov-1",
    ...overrides,
  };
}

describe("EOS-D1N-R1 orchestration context", () => {
  it("records one scoped context that cites a lifecycle stage without progressing it", () => {
    const saved = store();
    const record = recordOrchestrationContext(saved, actor, input());
    expect(record.contextId).toBe("ctx-1");
    expect(record.structuralIdentityId).toBe("member-1");
    expect(record.structuralIdentityKind).toBe("MEMBER");
    expect(record.tenantId).toBe("tenant-a");
    expect(record.workspaceId).toBe("workspace-a");
    expect(record.projectId).toBe("project-a");
    expect(record.citedLifecycleStage).toBe("FEASIBILITY");
    expect(record.designProgressionState).toBeNull();
    expect(record.authority).toBe(D1N_CONTEXT_AUTHORITY);
    expect(record.provenanceRef).toBe("prov-1");
    expect(record.engineeringValidated).toBe(false);
    expect(record.engineeringApproved).toBe(false);
    expect(record.certified).toBe(false);
    expect(recordOrchestrationContext(saved, actor, input())).toBe(record);
    expect(() => recordOrchestrationContext(saved, actor, input({ tenantId: "tenant-b" }))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordOrchestrationContext(saved, actor, input({ workspaceId: "workspace-b" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordOrchestrationContext(saved, actor, input({ projectId: "project-b" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordOrchestrationContext(saved, actor, input({ contextId: "ctx-b", structuralIdentityId: "member-b" }))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordOrchestrationContext(saved, actor, input({ contextId: "ctx-w", structuralIdentityId: "member-w" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordOrchestrationContext(saved, actor, input({ contextId: "ctx-p", structuralIdentityId: "member-p" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordOrchestrationContext(saved, actor, input({ contextId: "ctx-missing", structuralIdentityId: "missing" }))).toThrow("STRUCTURAL_IDENTITY_REQUIRED");
    expect(() => recordOrchestrationContext(saved, actor, input({ structuralIdentityKind: "BEAM" }))).toThrow("STRUCTURAL_IDENTITY_MISMATCH");
    expect(() => recordOrchestrationContext(saved, actor, input({ contextId: "ctx-out", citedLifecycleStage: "CONSTRUCTION" }))).toThrow("OUT_OF_SCOPE_LIFECYCLE_STAGE");
    expect(() => recordOrchestrationContext(saved, actor, input({ contextId: "ctx-bad", citedLifecycleStage: "PRELIMINARY" }))).toThrow("LIFECYCLE_STAGE_INVALID");
    expect(D1A_IDENTITY_REUSED).toBe(true);
    expect(PARALLEL_D1N_STRUCTURAL_IDENTITY_CREATED).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_ORCHESTRATION_SCOPE_ENFORCED).toBe(true);
    expect(D1N_LIFECYCLE_STAGE_CONTEXT_CITATION_IMPLEMENTED).toBe(true);
    expect(CITED_LIFECYCLE_STAGE_EQUALS_D1N_DESIGN_PROGRESSION_STATE).toBe(false);
    expect(advanceDesignProgression).toThrow("DESIGN_PROGRESSION_NOT_IN_R1");
  });

  it("preserves provenance, authority, canonical fingerprint, and immutable history", () => {
    const saved = store();
    expect(() => recordOrchestrationContext(saved, actor, input({ provenanceRef: "" }))).toThrow("MISSING_PROVENANCE");
    const record = recordOrchestrationContext(saved, actor, input());
    const expected = fingerprintCanonical({
      provenanceRef: "prov-1",
      contextId: "ctx-1",
      authority: D1N_CONTEXT_AUTHORITY,
      projectId: "project-a",
      citedLifecycleStage: "FEASIBILITY",
      structuralIdentityKind: "MEMBER",
      workspaceId: "workspace-a",
      predecessorContextId: null,
      tenantId: "tenant-a",
      structuralIdentityId: "member-1",
    });
    expect(record.fingerprint).toBe(expected);
    expect(recordOrchestrationContext(saved, actor, input()).fingerprint).toBe(record.fingerprint);
    expect(() => recordOrchestrationContext(saved, actor, input({ assertedFingerprint: "substituted" }))).toThrow("FINGERPRINT_MISMATCH");
    expect(() => recordOrchestrationContext(saved, actor, input({ provenanceRef: "prov-2" }))).toThrow("CONTEXT_ALREADY_RECORDED");
    expect(() => recordOrchestrationContext(saved, actor, input({ contextId: "ctx-dup" }))).toThrow("DUPLICATE_CONTEXT_REJECTED");
    const successor = recordOrchestrationContext(saved, actor, input({ contextId: "ctx-2", provenanceRef: "prov-2", predecessorContextId: "ctx-1" }));
    expect(successor.predecessorContextId).toBe("ctx-1");
    expect(successor.fingerprint).not.toBe(record.fingerprint);
    const prior = reconstructOrchestrationContext(saved, "ctx-1");
    expect(prior.recordStatus).toBe("SUPERSEDED");
    expect(prior.fingerprint).toBe(record.fingerprint);
    expect(prior.provenanceRef).toBe("prov-1");
    expect(saved.history.map((row) => row.action)).toEqual(["CREATED", "SUPERSEDED", "CREATED"]);
    expect(Object.isFrozen(successor)).toBe(true);
    expect(() => mutateOrchestrationContext()).toThrow("CONTEXT_MUTATION_REJECTED");
    expect(() => {
      (successor as { provenanceRef: string }).provenanceRef = "stripped";
    }).toThrow();
    expect(successor.provenanceRef).toBe("prov-2");
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1N_ORCHESTRATION_CONTEXT_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_STAGE_APPROVED).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_CERTIFIED).toBe(false);
    expect(SILENT_ORCHESTRATION_CONTEXT_MUTATION_ALLOWED).toBe(false);
    expect(D1N_ORCHESTRATION_CONTEXT_HISTORY_PRESERVED).toBe(true);
    expect(D1N_DUPLICATE_ORCHESTRATION_CONTEXT_GOVERNED).toBe(true);
    expect(D1N_ORCHESTRATION_PROVENANCE_REQUIRED).toBe(true);
    expect(D1N_ORCHESTRATION_PROVENANCE_PRESERVED).toBe(true);
    expect(D1N_CONTEXT_AUTHORITY_PRESERVED).toBe(true);
  });

  it("rejects spoofed scope, identity, lifecycle, provenance, authority, and engineering claims", () => {
    const saved = store();
    const ai = { ...actor, actorId: "AI_ASSISTANT" };
    const admin = { ...actor, authority: "ADMINISTRATOR" };
    expect(() => recordOrchestrationContext(saved, ai, input())).toThrow("AI_NOT_CONTEXT_AUTHORITY");
    expect(() => recordOrchestrationContext(saved, { ...actor, authority: "LLM_OPERATOR" }, input())).toThrow("AI_NOT_CONTEXT_AUTHORITY");
    expect(() => recordOrchestrationContext(saved, admin, input())).toThrow("ADMIN_NOT_CONTEXT_AUTHORITY");
    expect(() => recordOrchestrationContext(saved, { ...actor, authority: "ENGINEERING_APPROVAL_AUTHORITY" }, input())).toThrow("CONTEXT_AUTHORITY_NOT_ENGINEERING_APPROVAL");
    expect(() => recordOrchestrationContext(saved, { ...actor, authority: "ENGINEERING_VALIDATION_AUTHORITY" }, input())).toThrow("CONTEXT_AUTHORITY_NOT_ENGINEERING_VALIDATION");
    expect(() => recordOrchestrationContext(saved, { ...actor, authority: "CERTIFICATION_AUTHORITY" }, input())).toThrow("CONTEXT_AUTHORITY_NOT_CERTIFIER");
    expect(() => recordOrchestrationContext(saved, actor, input({ contextId: "AI_CONTEXT" }))).toThrow("AI_NOT_CONTEXT_AUTHORITY");
    expect(() => recordOrchestrationContext(saved, actor, input({ citedLifecycleStage: "AI_STAGE" }))).toThrow("AI_NOT_CONTEXT_AUTHORITY");
    expect(() => recordOrchestrationContext(saved, actor, input({ provenanceRef: "AI_PROVENANCE" }))).toThrow("AI_NOT_CONTEXT_AUTHORITY");
    expect(() => recordOrchestrationContext(saved, actor, input({ designProgression: true }))).toThrow("DESIGN_PROGRESSION_NOT_IN_R1");
    expect(() => recordOrchestrationContext(saved, actor, input({ prerequisiteAssessment: true }))).toThrow("PREREQUISITE_NOT_IN_R1");
    expect(() => recordOrchestrationContext(saved, actor, input({ stageTransitionRequest: true }))).toThrow("STAGE_TRANSITION_NOT_IN_R1");
    expect(() => recordOrchestrationContext(saved, actor, input({ humanGate: true }))).toThrow("HUMAN_GATE_NOT_IN_R1");
    expect(() => recordOrchestrationContext(saved, actor, input({ alternativeSelection: true }))).toThrow("ALTERNATIVE_SELECTION_NOT_IN_R1");
    expect(() => recordOrchestrationContext(saved, actor, input({ engineeringValidated: true }))).toThrow("ENGINEERING_VALIDATION_NOT_IN_R1");
    expect(() => recordOrchestrationContext(saved, actor, input({ engineeringApproved: true }))).toThrow("ENGINEERING_APPROVAL_NOT_IN_R1");
    expect(() => recordOrchestrationContext(saved, actor, input({ certified: true }))).toThrow("CERTIFICATION_NOT_IN_R1");
    expect(() => recordOrchestrationContext(saved, actor, input({ solverExecution: true }))).toThrow("SOLVER_NOT_IN_R1");
    expect(() => recordOrchestrationContext(saved, actor, input({ conformance: true }))).toThrow("CONFORMANCE_NOT_IN_R1");
    expect(() => recordOrchestrationContext(saved, actor, input({ cadBimInterpretation: true }))).toThrow("CAD_BIM_INTERPRETATION_NOT_IN_R1");
    expect(() => recordOrchestrationContext(saved, actor, input({ citedCurrentness: "STALE" }))).toThrow("CURRENTNESS_REASSESSMENT_NOT_IN_R1");
    expect(assessPrerequisites).toThrow("PREREQUISITE_NOT_IN_R1");
    expect(requestStageTransition).toThrow("STAGE_TRANSITION_NOT_IN_R1");
    expect(selectAlternative).toThrow("ALTERNATIVE_SELECTION_NOT_IN_R1");
    expect(validateEngineering).toThrow("ENGINEERING_VALIDATION_NOT_IN_R1");
    expect(certifyContext).toThrow("CERTIFICATION_NOT_IN_R1");
    expect(D1N_CONTEXT_AUTHORITY_EQUALS_ENGINEERING_APPROVAL_AUTHORITY).toBe(false);
    expect(D1N_CONTEXT_AUTHORITY_EQUALS_ENGINEERING_VALIDATION_AUTHORITY).toBe(false);
    expect(D1N_CONTEXT_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(AI_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_ORCHESTRATION_CONTEXT_IDENTITY).toBe(false);
    expect(AI_CAN_INVENT_TENANT_CONTEXT).toBe(false);
    expect(AI_CAN_INVENT_WORKSPACE_CONTEXT).toBe(false);
    expect(AI_CAN_INVENT_PROJECT_CONTEXT).toBe(false);
    expect(AI_CAN_INVENT_LIFECYCLE_STAGE_CONTEXT).toBe(false);
    expect(AI_CAN_MARK_CONTEXT_ENGINEERING_VALIDATED).toBe(false);
    expect(D1N_ORCHESTRATION_CONTEXT_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
  });

  it("keeps the consolidated boundary, debt, and next phase unchanged", () => {
    expect(D1N_RUNTIME_STARTED).toBe(true);
    expect(D1N_RUNTIME_COUNT).toBe(1);
    expect(D1N_ORCHESTRATION_CONTEXT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1N_ORCHESTRATION_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY).toBe(true);
    expect(HISTORICAL_D1N_RUNTIME_STARTED).toBe(false);
    expect(HISTORICAL_D1N_RUNTIME_COUNT).toBe(0);
    expect(HISTORICAL_D1N_ARCHITECTURE_DEFINED).toBe(false);
    expect(D1N_ARCHITECTURE_DEFINED).toBe(true);
    expect(D1N_0_NEXT_PHASE_STARTED).toBe(false);
    expect([
      D1N_DESIGN_PROGRESSION_RUNTIME_COUNT,
      D1N_PREREQUISITE_RUNTIME_COUNT,
      D1N_EVIDENCE_GAP_RUNTIME_COUNT,
      D1N_NEXT_ACTION_RUNTIME_COUNT,
      D1N_STAGE_TRANSITION_RUNTIME_COUNT,
      D1N_STAGE_TRANSITION_REQUEST_RUNTIME_COUNT,
      D1N_HUMAN_DECISION_GATE_RUNTIME_COUNT,
      D1N_REVIEW_GATE_RUNTIME_COUNT,
      D1N_ALTERNATIVE_BRANCH_RUNTIME_COUNT,
      D1N_D1M_RUNTIME_INTEGRATION_COUNT,
      D1N_D1K_RUNTIME_INTEGRATION_COUNT,
      D1N_D1L_RUNTIME_INTEGRATION_COUNT,
      D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT,
      D1N_SOLVER_EXECUTION_RUNTIME_COUNT,
      D1N_CONFORMANCE_RUNTIME_COUNT,
      D1N_CERTIFICATION_RUNTIME_COUNT,
      D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT,
      D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT,
      D9_RUNTIME_COUNT,
      D2_D8_RUNTIME_COUNT,
    ].every((count) => count === 0)).toBe(true);
    expect(D1N_DESIGN_PROGRESSION_RUNTIME_READY).toBe(false);
    expect(D1N_PREREQUISITE_RUNTIME_READY).toBe(false);
    expect(D1N_STAGE_TRANSITION_RUNTIME_READY).toBe(false);
    expect(D1N_HUMAN_GATE_RUNTIME_READY).toBe(false);
    expect(D1N_ALTERNATIVE_BRANCH_RUNTIME_READY).toBe(false);
    expect(D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY).toBe(false);
    expect(D1N_HANDOFF_INTEGRATION_RUNTIME_READY).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D2_D8_RUNTIME_STARTED).toBe(false);
    expect(ORCHESTRATION_EQUALS_ENGINEERING_VALIDATION).toBe(false);
    expect(ORCHESTRATION_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(ORCHESTRATION_EQUALS_CERTIFICATION).toBe(false);
    expect(ORCHESTRATION_EQUALS_AUTONOMOUS_DESIGN_AUTHORITY).toBe(false);
    expect(D1N_R1_D1M_TRACK_COMPLETE).toBe(true);
    expect(D1N_R1_D1M_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1N_R1_D1M_REOPENED).toBe(false);
    expect(D1N_R1_D1K_INTERNAL_INTEGRATION_READY).toBe(false);
    expect(D1N_R1_D1K_INTELLIGENCE_READY).toBe(false);
    expect(D1N_R1_D1K_LIMITATIONS_PRESERVED).toBe(true);
    expect(D1N_R1_D1L_TRACK_COMPLETE).toBe(true);
    expect(D1N_R1_D1L_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D1N_DIGITAL_THREAD_CREATED).toBe(false);
    expect(CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(D1N_R1_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1N_R1_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1N_R1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect([D1N_R1_C10_DEBT, D1N_R1_D1F_DEBT, D1N_R1_D1G_DEBT, D1N_R1_D1H_DEBT, D1N_R1_D1I_DEBT, D1N_R1_D1J_DEBT, D1N_R1_D1K_DEBT, D1N_R1_D1L_DEBT].every((row) => row === debt)).toBe(true);
    expect(D1N_R1_DEBT_PRESERVED).toBe(true);
    expect(D1N_R1_POST_D1J_DEBT_LEDGER).toContain("Concrete C10 engineer review pending.");
    expect(D1N_R1_POST_D1J_DEBT_LEDGER).toContain("NOT_AVAILABLE");
    expect(D1N_R1_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1N_R1_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1N_R1_CANONICAL_PHASE).toBe("EOS-D1N-R1-ORCHESTRATION-IDENTITY-AND-STATE-FOUNDATION");
    expect(D1N_R1_SCOPE).toBe(D1N_R1_CANONICAL_SCOPE);
    expect(D1N_R1_MATURITY_STATE).toBe("STRUCTURAL_ORCHESTRATION_IDENTITY_AND_STATE_IMPLEMENTED");
    expect(D1N_R2_CANONICAL_PHASE).toBe("EOS-D1N-R2-DESIGN-PROGRESSION-CONTEXT");
    expect(D1N_R2_PHASE_TYPE).toBe("DESIGN_PROGRESSION_CONTEXT");
    expect(D1N_R2_CANONICAL_SCOPE).toContain("CONCEPT");
    expect(D1N_R1_READY_FOR_NEXT_PHASE).toBe(true);
    expect(D1N_R1_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    const source = readFileSync(join(here, "orchestration-context.ts"), "utf8");
    const doc = readFileSync(join(root, D1N_R1_CLOSEOUT_PATH), "utf8");
    const index = readFileSync(join(here, "index.ts"), "utf8");
    const capability = readFileSync(join(root, "packages/engineering-os/src/structural-concrete/capability.ts"), "utf8");
    const pkg = readFileSync(join(root, "packages/engineering-os/package.json"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toContain("createHash");
    expect(source).not.toContain('from "@rtb/engineering-review"');
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("CREATE TABLE");
    expect(scanAnalysisFormulaBypass("orchestration-context.ts", source)).toEqual([]);
    expect(doc).toContain("EOS-D1N-R2-DESIGN-PROGRESSION-CONTEXT");
    expect(doc).not.toContain("```");
    expect(existsSync(join(root, D1N_R1_PARENT_ARCHITECTURE_PATH))).toBe(true);
    expect(scanAnalysisFormulaBypass(D1N_R1_CLOSEOUT_PATH, doc)).toEqual([]);
    expect(index).toContain("recordOrchestrationContext");
    expect(index).not.toContain("D1N_R1_CANONICAL_PHASE");
    expect(capability).toContain("D1N.R1.ORCHESTRATION_IDENTITY_AND_STATE_FOUNDATION");
    expect(pkg).not.toContain("orchestration-framework");
  });
});
