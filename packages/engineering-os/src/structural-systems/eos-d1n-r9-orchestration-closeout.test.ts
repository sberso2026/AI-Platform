import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { createD1nR6Store, recordAlternativeBranch } from "./alternative-branch";
import { createD1mR7Store, registerGovernedRecord, type D1mR7Actor } from "./cad-bim-change-governance";
import { createD1mR8Store, issueEvidenceHandoff } from "./cad-bim-evidence-handoff";
import { type D1lR1Catalog, type D1lR1ClaimInput, type D1lR1Evidence, createD1lR1Store, recordCertificationClaimManifest } from "./certification-claim-manifest";
import { createD1nR7Store, recordCurrentness, reconstructReassessment } from "./currentness-reassessment";
import { createD1nR2Store, recordDesignProgression } from "./design-progression-context";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { createD1nR8Store, recordHandoffIntegration } from "./handoff-integration";
import { createD1nR5Store, recordHumanDecision } from "./human-decision-record";
import { createD1kR3Store } from "./interface-handoff-governance";
import { createD1kR1Store, registerStructuralInterfaceIdentity, type D1kR1Actor, type D1kR1Catalog, type D1kR1CatalogSource, type D1kR1InterfaceInput, type D1kR1StructuralTarget } from "./interface-identity-foundation";
import {
  ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AI_EQUALS_D1N_ENGINEERING_AUTHORITY,
  C10_DEBT_D1N_CLASSIFICATION,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_DIGITAL_THREAD_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D1F_DEBT_D1N_CLASSIFICATION,
  D1G_CERTIFICATION_BLOCKER_PRESERVED,
  D1G_DEBT_D1N_CLASSIFICATION,
  D1H_DEBT_D1N_CLASSIFICATION,
  D1I_DEBT_D1N_CLASSIFICATION,
  D1J_DEBT_D1N_CLASSIFICATION,
  D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY,
  D1K_DEBT_D1N_CLASSIFICATION,
  D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY,
  D1K_LIMITATIONS_PRESERVED,
  D1L_DEBT_D1N_CLASSIFICATION,
  D1L_TRACK_COMPLETE,
  D1L_TRACK_STATUS,
  D1M_REOPENED,
  D1M_TRACK_COMPLETE,
  D1M_TRACK_STATUS,
  D1N_ABSORBS_D1K,
  D1N_ABSORBS_D1L,
  D1N_ABSORBS_D1M,
  D1N_ALTERNATIVE_BRANCH_RUNTIME_READY,
  D1N_ARCHITECTURE_DEFINED,
  D1N_ARCHITECTURE_READY,
  D1N_AUTHORITY_MODEL_PRESERVED,
  D1N_BOUNDARY_MATRIX_INTACT,
  D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT,
  D1N_CERTIFICATION_RUNTIME_COUNT,
  D1N_CONFORMANCE_RUNTIME_COUNT,
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY,
  D1N_DESIGN_MATURITY_MODEL_PRESERVED,
  D1N_DESIGN_MATURITY_STATES,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_DETERMINES_D1L_ELIGIBILITY,
  D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT,
  D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D1N_EQUALS_D1K_AUTHORITY,
  D1N_EQUALS_D1L_CERTIFICATION_AUTHORITY,
  D1N_EQUALS_D1M_AUTHORITY,
  D1N_HANDOFF_INTEGRATION_RUNTIME_READY,
  D1N_HISTORY_INTEGRITY_PRESERVED,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_ISSUES_D1L_CERTIFICATION,
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_PROVENANCE_INTEGRITY_PRESERVED,
  D1N_R1_COHERENT,
  D1N_R1_R8_END_TO_END_COHERENCE,
  D1N_R2_COHERENT,
  D1N_R3_COHERENT,
  D1N_R4_COHERENT,
  D1N_R5_COHERENT,
  D1N_R6_COHERENT,
  D1N_R7_COHERENT,
  D1N_R8_COHERENT,
  D1N_R9_BLOCKER,
  D1N_R9_CANONICAL_NEXT_PHASE,
  D1N_R9_CANONICAL_NEXT_PHASE_SCOPE,
  D1N_R9_CLOSEOUT_PATH,
  D1N_R9_DECOMPOSITION_ENDS_AT_CLOSEOUT,
  D1N_R9_HISTORICAL_D1N_STATUS_PRESERVED,
  D1N_R9_MACHINE_READABLE_ROADMAP_UPDATED,
  D1N_R9_MATURITY_STATE,
  D1N_R9_NEXT_PHASE,
  D1N_R9_NEXT_PHASE_TYPE,
  D1N_R9_POST_D1J_DEBT_LEDGER,
  D1N_R9_READY_FOR_NEXT_PHASE,
  D1N_R9_RUNTIME_COUNT,
  D1N_R9_STATUS,
  D1N_R9_TRACK_COMPLETE_EQUALS_CERTIFIED,
  D1N_R9_TRACK_COMPLETE_EQUALS_GENERAL_AVAILABILITY,
  D1N_R9_TRACK_COMPLETE_EQUALS_PACK_COMPLETE,
  D1N_R9_UNAUTHORIZED_PRODUCT_CLAIM,
  D1N_REVOKES_D1L_CERTIFICATION,
  D1N_RUNTIME_COUNT,
  D1N_RUNTIME_STARTED,
  D1N_SCOPE_INTEGRITY_PRESERVED,
  D1N_SOLVER_EXECUTION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY,
  D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT,
  D1N_TRACK_COMPLETE,
  D1N_TRACK_STATUS,
  D1_STRUCTURAL_PACK_COMPLETE,
  D2_D8_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  DESIGN_MATURITY_STAGE_EQUALS_CERTIFICATION,
  DESIGN_MATURITY_STAGE_EQUALS_ENGINEERING_APPROVAL,
  DESIGN_MATURITY_STAGE_EQUALS_ENGINEERING_VALIDATION,
  GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  INFERRED_DEPENDENCY_PROPAGATION_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  NEW_SUBSTANTIVE_RUNTIME_ADDED,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  POST_D1J_DEBT_PRESERVED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D1N_HISTORICAL_REFERENCE_MUTATION_ALLOWED,
  D1N_RECORD_AUTO_REPOINTED_TO_NEWER_DEPENDENCY,
} from "./orchestration-closeout";
import { createD1nR1Store, recordOrchestrationContext, type D1nR1Actor } from "./orchestration-context";
import { D1N_TRACK_STATUS as HISTORICAL_D1N_TRACK_STATUS } from "./post-d1l-roadmap";
import { createD1nR3Store, recordPrerequisiteAssessment } from "./prerequisite-assessment";
import { D1N_CURRENT_STATUS } from "./roadmap-after-twin-closeout";
import { createD1nR4Store, recordTransitionRequest } from "./stage-transition-request";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..", "..");
const now = () => "2026-10-22T00:00:00.000Z";
const scope = { tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const debt = "DOES_NOT_BLOCK_D1N_BUT_REMAINS_LIMITATION";
const orchestrator: D1nR1Actor = { actorId: "orchestrator-1", ...scope, authority: "ORCHESTRATION_CONTEXT_AUTHORITY" };
const decider: D1nR1Actor = { ...orchestrator, actorId: "gate-1", authority: "LIFECYCLE_GATE_DECISION" };

function evidence(overrides: Partial<D1lR1Evidence> = {}): D1lR1Evidence {
  return { ...scope, evidenceId: "ev-design", slot: "design", category: "SOURCE_ENGINEERING_EVIDENCE", sourceKind: "calculation", revision: "rev-1", sourceFingerprint: "fp-design", authority: "EVIDENCE_PRODUCER", provenanceRef: "prov-design", solverQualificationState: null, stale: false, upstreamDiagnostic: null, d1k: null, ...overrides };
}
function claimCatalog(): D1lR1Catalog {
  return {
    targets: [{ ...scope, kind: "MEMBER", id: "member-1", revision: "rev-1" }],
    designStages: [{ ...scope, designStageId: "detailed-design", revision: "stage-1" }],
    standards: [{ ...scope, profileId: "std-1", standardFamily: "steel", standardCode: "GOVERNED-STEEL", edition: "2016", amendment: "A1", version: "2016-A1", fingerprint: "fp-std" }],
    jurisdictions: [{ ...scope, profileId: "jur-1", jurisdictionId: "australia", version: "jur-2024.1", fingerprint: "fp-jur" }],
    consequenceProfiles: [],
    evidence: [evidence(), evidence({ evidenceId: "ev-analysis", slot: "analysis", sourceFingerprint: "fp-analysis", provenanceRef: "prov-analysis" })],
  };
}
function claimInput(): D1lR1ClaimInput {
  return { claimId: "claim-1", manifestId: "manifest-1", claimType: "DESIGN_CHECK_CLAIM", claimScope: "CHECK", structuralTargetKind: "MEMBER", structuralTargetId: "member-1", designStageId: "detailed-design", standardProfileId: "std-1", jurisdictionProfileId: "jur-1", consequenceProfileId: null, designEvidenceId: "ev-design", analysisEvidenceId: "ev-analysis", validationEvidenceId: null, engineerReviewEvidenceId: null, conformanceEvidenceId: null, solverQualificationEvidenceId: null, crossDisciplineEvidenceId: null, authorityEvidenceId: null, crossDisciplineDependency: false, provenanceRef: "prov-claim" };
}
function target(): D1kR1StructuralTarget {
  return { kind: "MEMBER", id: "member-1", structuralSystemId: "system-1", ...scope, revision: "sys-4" };
}
function source(): D1kR1CatalogSource {
  return { sourceId: "src-civil-4", ...scope, sourceClass: "MANUAL_GOVERNED_REFERENCE", sourceDiscipline: "civil", objectId: "civil-grade-4", documentId: "doc-grade-4", revision: "rev-4", evidenceId: "evidence-4", evidenceKind: "source_document", authority: "CIVIL_ENGINEER_OF_RECORD", provenanceRef: "provenance-civil-4", issuedAt: "2026-10-20T00:00:00.000Z", nativePackContractExposed: false, operationalExternalReference: false };
}
function interfaceCatalog(): D1kR1Catalog {
  return { targets: [target()], sources: [source()] };
}
function interfaceInput(): D1kR1InterfaceInput {
  return { interfaceId: "interface-1", relation: "PROVIDES_INPUT_TO", sourceDiscipline: "civil", targetDiscipline: "structural", counterpartyDiscipline: "civil", structuralTargetKind: "MEMBER", structuralTargetId: "member-1", sourceId: "src-civil-4", humanReviewRequired: true, description: "Civil grade input cited by orchestration" };
}

describe("EOS-D1N-R9 concept-to-detailed orchestration closeout", () => {
  it("walks R1 through R8 without executing a transition or adding a runtime", () => {
    const orchestration = createD1nR1Store([{ id: "member-1", kind: "MEMBER", ...scope }], now);
    const context = recordOrchestrationContext(orchestration, orchestrator, { contextId: "ctx-1", structuralIdentityId: "member-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-ctx" });
    const progressionStore = createD1nR2Store();
    const progression = recordDesignProgression(orchestration, progressionStore, orchestrator, { progressionId: "prog-1", orchestrationContextId: context.contextId, orchestrationContextFingerprint: context.fingerprint, designProgressionState: "CONCEPT", provenanceRef: "prov-prog" });
    const assessments = createD1nR3Store();
    const assessment = recordPrerequisiteAssessment(orchestration, progressionStore, assessments, orchestrator, { assessmentId: "assess-req", orchestrationContextId: context.contextId, orchestrationContextFingerprint: context.fingerprint, progressionId: progression.progressionId, progressionFingerprint: progression.fingerprint, prerequisiteId: "req-1", inputCategory: "REQUIREMENTS", assessmentStatus: "PRESENT", evidenceRef: "evidence-1", citedCurrentness: "CURRENT", provenanceRef: "prov-assess" });
    const requests = createD1nR4Store();
    const request = recordTransitionRequest(orchestration, progressionStore, assessments, requests, orchestrator, { requestId: "request-1", orchestrationContextId: context.contextId, orchestrationContextFingerprint: context.fingerprint, progressionId: progression.progressionId, progressionFingerprint: progression.fingerprint, destinationStage: "PREFEASIBILITY", prerequisiteReferences: [{ assessmentId: assessment.assessmentId, fingerprint: assessment.fingerprint }], provenanceRef: "prov-request" });
    const decisions = createD1nR5Store();
    const decision = recordHumanDecision(requests, decisions, decider, { decisionId: "decision-1", requestId: request.requestId, requestFingerprint: request.fingerprint, gateId: "MAJOR_SYSTEM_SELECTION", outcome: "APPROVED_TO_TRANSITION", rationale: "Human gate cited this request.", provenanceRef: "prov-decision", aal: "aal2" });
    const branches = createD1nR6Store();
    const branch = recordAlternativeBranch(orchestration, progressionStore, assessments, decisions, branches, orchestrator, { branchId: "branch-portal", displayLabel: "Portal frame", orchestrationContextId: context.contextId, orchestrationContextFingerprint: context.fingerprint, progressionId: progression.progressionId, progressionFingerprint: progression.fingerprint, selectionDecisionId: decision.decisionId, selectionDecisionFingerprint: decision.fingerprint, provenanceRef: "prov-branch" });
    const currentness = createD1nR7Store();
    const current = recordCurrentness({ orchestration, progression: progressionStore, assessments, requests, decisions, branches }, currentness, orchestrator, { reassessmentId: "current-1", affectedKind: "R2_PROGRESSION", affectedId: progression.progressionId, affectedFingerprint: progression.fingerprint, dependencies: [{ kind: "R1_ORCHESTRATION", id: context.contextId, fingerprint: context.fingerprint }, { kind: "R6_ALTERNATIVE_BRANCH", id: branch.branchId, fingerprint: branch.fingerprint }], provenanceRef: "prov-current" });
    const r7 = createD1mR7Store(now);
    const d1m = createD1mR8Store(r7, now);
    const modelActor: D1mR7Actor = { actorId: "recorder-1", ...scope, authority: "INTERFACE_RECORD_AUTHORITY" };
    const artifact = registerGovernedRecord(r7, modelActor, { subjectId: "art-1", recordClass: "R1_ARTIFACT", recordId: "artifact-1", fingerprint: "fp-art-1", provenanceRef: "prov-art", snapshot: { revision: "rev-1" } });
    const manifest = issueEvidenceHandoff(d1m, modelActor, { handoffId: "d1m-hand-1", destination: "D1N_FUTURE_ORCHESTRATION_INPUT", references: [{ subjectId: artifact.subjectId, fingerprint: artifact.fingerprint }], provenanceRef: "prov-d1m" });
    const interfaceActor: D1kR1Actor = { actorId: "engineer-1", ...scope, authority: "HUMAN_ENGINEER" };
    const d1k = createD1kR1Store(interfaceCatalog(), now);
    const iface = registerStructuralInterfaceIdentity(d1k, interfaceActor, interfaceInput());
    const d1l = createD1lR1Store(claimCatalog(), now);
    const claim = recordCertificationClaimManifest(d1l, { actorId: "eng-1", ...scope, authority: "EVIDENCE_PRODUCER" }, claimInput());
    const handoff = recordHandoffIntegration({ orchestration, d1m, d1k, d1kEvents: createD1kR3Store(now), d1l }, createD1nR8Store(now), orchestrator, { handoffId: "hand-1", orchestrationContextId: context.contextId, orchestrationContextFingerprint: context.fingerprint, d1mHandoffId: manifest.handoffId, d1mFingerprint: manifest.manifestFingerprint, d1kInterfaceId: iface.interfaceId, d1kFingerprint: iface.fingerprint, d1lManifestId: claim.manifestId, d1lFingerprint: claim.manifestFingerprint, provenanceRef: "prov-handoff" });
    expect(progression.designProgressionState).toBe("CONCEPT");
    expect(request.lifecycleState).toBe("OPEN");
    expect(decision.humanTransitionApprovalRecorded).toBe(true);
    expect(decision.progressionChanged).toBe(false);
    expect(branch.selectedByGovernedDecision).toBe(true);
    expect(current.currentnessState).toBe("CURRENT");
    expect(current.progressionChanged).toBe(false);
    expect(reconstructReassessment(currentness, current.reassessmentId).affectedFingerprint).toBe(progression.fingerprint);
    expect(handoff.authority).toBe("ORCHESTRATION_CONTEXT_AUTHORITY");
    expect(handoff.d1m.authority).toBe("INTERFACE_RECORD_AUTHORITY");
    expect(handoff.engineeringValidated).toBe(false);
    expect(handoff.certified).toBe(false);
    expect(handoff.d1lEligible).toBe(false);
    expect(handoff.cadBimInterpreted).toBe(false);
    expect(NEW_SUBSTANTIVE_RUNTIME_ADDED).toBe(false);
    expect(D1N_R9_RUNTIME_COUNT).toBe(0);
  });

  it("closes the bounded track and leaves the next phase uncanonicalized", () => {
    expect(D1N_R1_COHERENT).toBe(true);
    expect(D1N_R2_COHERENT).toBe(true);
    expect(D1N_R3_COHERENT).toBe(true);
    expect(D1N_R4_COHERENT).toBe(true);
    expect(D1N_R5_COHERENT).toBe(true);
    expect(D1N_R6_COHERENT).toBe(true);
    expect(D1N_R7_COHERENT).toBe(true);
    expect(D1N_R8_COHERENT).toBe(true);
    expect(D1N_R1_R8_END_TO_END_COHERENCE).toBe(true);
    expect(D1N_RUNTIME_STARTED).toBe(true);
    expect(D1N_RUNTIME_COUNT).toBe(8);
    expect(D1N_ARCHITECTURE_DEFINED).toBe(true);
    expect(D1N_ARCHITECTURE_READY).toBe(true);
    expect(D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY).toBe(true);
    expect(D1N_DESIGN_PROGRESSION_RUNTIME_READY).toBe(true);
    expect(D1N_PREREQUISITE_RUNTIME_READY).toBe(true);
    expect(D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY).toBe(true);
    expect(D1N_HUMAN_GATE_RUNTIME_READY).toBe(true);
    expect(D1N_ALTERNATIVE_BRANCH_RUNTIME_READY).toBe(true);
    expect(D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY).toBe(true);
    expect(D1N_HANDOFF_INTEGRATION_RUNTIME_READY).toBe(true);
    expect(D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY).toBe(false);
    expect(D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT).toBe(0);
    expect([...D1N_DESIGN_MATURITY_STATES]).toEqual(["CONCEPT", "PREFEASIBILITY", "FEASIBILITY", "FEED", "DETAILED_DESIGN"]);
    expect(D1N_DESIGN_MATURITY_MODEL_PRESERVED).toBe(true);
    expect(DESIGN_MATURITY_STAGE_EQUALS_ENGINEERING_VALIDATION).toBe(false);
    expect(DESIGN_MATURITY_STAGE_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(DESIGN_MATURITY_STAGE_EQUALS_CERTIFICATION).toBe(false);
    expect(CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(PARALLEL_D1N_DIGITAL_THREAD_CREATED).toBe(false);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(INFERRED_DEPENDENCY_PROPAGATION_ALLOWED).toBe(false);
    expect(D1N_RECORD_AUTO_REPOINTED_TO_NEWER_DEPENDENCY).toBe(false);
    expect(D1N_HISTORICAL_REFERENCE_MUTATION_ALLOWED).toBe(false);
    expect(PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D1N_HISTORY_INTEGRITY_PRESERVED).toBe(true);
    expect(D1N_PROVENANCE_INTEGRITY_PRESERVED).toBe(true);
    expect(D1N_SCOPE_INTEGRITY_PRESERVED).toBe(true);
    expect(D1N_AUTHORITY_MODEL_PRESERVED).toBe(true);
    expect(D1N_BOUNDARY_MATRIX_INTACT).toBe(true);
    expect(D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(D1N_SOLVER_EXECUTION_RUNTIME_COUNT).toBe(0);
    expect(D1N_CONFORMANCE_RUNTIME_COUNT).toBe(0);
    expect(D1N_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT).toBe(0);
    expect(D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_TRACK_COMPLETE).toBe(true);
    expect(D1M_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1M_REOPENED).toBe(false);
    expect(D1N_ABSORBS_D1M).toBe(false);
    expect(D1N_EQUALS_D1M_AUTHORITY).toBe(false);
    expect(D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY).toBe(false);
    expect(D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY).toBe(false);
    expect(D1K_LIMITATIONS_PRESERVED).toBe(true);
    expect(D1N_ABSORBS_D1K).toBe(false);
    expect(D1N_EQUALS_D1K_AUTHORITY).toBe(false);
    expect(D1L_TRACK_COMPLETE).toBe(true);
    expect(D1L_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1N_ABSORBS_D1L).toBe(false);
    expect(D1N_EQUALS_D1L_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1N_DETERMINES_D1L_ELIGIBILITY).toBe(false);
    expect(D1N_ISSUES_D1L_CERTIFICATION).toBe(false);
    expect(D1N_REVOKES_D1L_CERTIFICATION).toBe(false);
    expect(AI_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(D2_D8_RUNTIME_STARTED).toBe(false);
    expect(D2_D8_RUNTIME_COUNT).toBe(0);
    expect(C10_DEBT_D1N_CLASSIFICATION).toBe(debt);
    expect(D1F_DEBT_D1N_CLASSIFICATION).toBe(debt);
    expect(D1G_DEBT_D1N_CLASSIFICATION).toBe(debt);
    expect(D1H_DEBT_D1N_CLASSIFICATION).toBe(debt);
    expect(D1I_DEBT_D1N_CLASSIFICATION).toBe(debt);
    expect(D1J_DEBT_D1N_CLASSIFICATION).toBe(debt);
    expect(D1K_DEBT_D1N_CLASSIFICATION).toBe(debt);
    expect(D1L_DEBT_D1N_CLASSIFICATION).toBe(debt);
    expect(POST_D1J_DEBT_PRESERVED).toBe(true);
    expect(D1N_R9_POST_D1J_DEBT_LEDGER).toContain("NOT_AVAILABLE");
    expect(D1N_R9_POST_D1J_DEBT_LEDGER).toContain("GA security debt remains.");
    expect(D1G_CERTIFICATION_BLOCKER_PRESERVED).toBe(true);
    expect(GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_R9_TRACK_COMPLETE_EQUALS_PACK_COMPLETE).toBe(false);
    expect(D1N_R9_TRACK_COMPLETE_EQUALS_CERTIFIED).toBe(false);
    expect(D1N_R9_TRACK_COMPLETE_EQUALS_GENERAL_AVAILABILITY).toBe(false);
    expect(D1N_R9_UNAUTHORIZED_PRODUCT_CLAIM).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1N_R9_HISTORICAL_D1N_STATUS_PRESERVED).toBe(true);
    expect(HISTORICAL_D1N_TRACK_STATUS).toBe("NOT_ABSORBED");
    expect(D1N_CURRENT_STATUS).toBe("NOT_ABSORBED");
    expect(D1N_TRACK_COMPLETE).toBe(true);
    expect(D1N_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1N_R9_STATUS).toBe("CLOSEOUT_DEFINED");
    expect(D1N_R9_MATURITY_STATE).toBe("STRUCTURAL_CONCEPT_TO_DETAILED_ORCHESTRATION_BOUNDED_CLOSEOUT");
    expect(D1N_R9_DECOMPOSITION_ENDS_AT_CLOSEOUT).toBe(true);
    expect(D1N_R9_READY_FOR_NEXT_PHASE).toBe(false);
    expect(D1N_R9_NEXT_PHASE).toBe("NOT_CANONICALIZED");
    expect(D1N_R9_NEXT_PHASE_TYPE).toBe("NOT_CANONICALIZED");
    expect(D1N_R9_CANONICAL_NEXT_PHASE).toBe("NOT_CANONICALIZED");
    expect(D1N_R9_CANONICAL_NEXT_PHASE_SCOPE).toContain("No post-D1N phase identifier is canonical");
    expect(D1N_R9_BLOCKER).toContain("No successor phase identifier is canonical");
    expect(D1N_R9_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    const source = readFileSync(join(here, "orchestration-closeout.ts"), "utf8");
    const doc = readFileSync(join(root, D1N_R9_CLOSEOUT_PATH), "utf8");
    const index = readFileSync(join(here, "index.ts"), "utf8");
    expect(scanAnalysisFormulaBypass(join(here, "orchestration-closeout.ts"), source)).toEqual([]);
    expect(source).not.toMatch(/export function record|createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(doc).toContain("NOT_CANONICALIZED");
    expect(doc).toContain("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(doc).not.toContain("```");
    expect(index.match(/D1N_R9_CANONICAL_PHASE/g)).toHaveLength(1);
    expect(index).toContain("D1N_R9_TRACK_STATUS");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1N.R9.CONCEPT_TO_DETAILED_ORCHESTRATION_CLOSEOUT")).toBe(true);
  });
});
