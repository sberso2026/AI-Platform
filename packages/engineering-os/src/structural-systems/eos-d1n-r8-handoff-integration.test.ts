import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { createD1mR7Store, registerChange, registerGovernedRecord, type D1mR7Actor } from "./cad-bim-change-governance";
import { D1M_R8_D1N_HANDOFF_CONTRACT_IMPLEMENTED, createD1mR8Store, issueEvidenceHandoff, refreshHandoffCurrentness } from "./cad-bim-evidence-handoff";
import { type D1lR1Catalog, type D1lR1ClaimInput, type D1lR1Evidence, createD1lR1Store, recordCertificationClaimManifest } from "./certification-claim-manifest";
import {
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY as R7_CURRENTNESS_READY,
  D1N_D1K_RUNTIME_INTEGRATION_COUNT as R7_D1K_COUNT,
  D1N_D1L_RUNTIME_INTEGRATION_COUNT as R7_D1L_COUNT,
  D1N_D1M_RUNTIME_INTEGRATION_COUNT as R7_D1M_COUNT,
  D1N_HANDOFF_INTEGRATION_RUNTIME_READY as R7_HANDOFF_READY,
  D1N_RUNTIME_COUNT as R7_RUNTIME_COUNT,
} from "./currentness-reassessment";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_D1K_INTERFACE_EVIDENCE,
  AI_CAN_INVENT_D1L_ELIGIBILITY,
  AI_CAN_INVENT_D1M_HANDOFF_EVIDENCE,
  AI_CAN_OVERRIDE_STALE_HANDOFF,
  AI_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT,
  CANONICAL_DIGITAL_THREAD_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY,
  D1K_LIMITATIONS_PROPAGATED_TO_D1N,
  D1K_HANDOFF_AUTO_REPOINTED_TO_NEWER_EVIDENCE,
  D1K_HANDOFF_EQUALS_D1N_INTERFACE_AUTHORITY,
  D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY,
  D1K_LIMITATIONS_PRESERVED,
  D1L_GOVERNANCE_REFERENCE_PRESENT_EQUALS_CERTIFIED,
  D1L_HANDOFF_AUTO_REPOINTED_TO_NEWER_GOVERNANCE_STATE,
  D1L_HANDOFF_EQUALS_D1N_CERTIFICATION_AUTHORITY,
  D1L_LIMITATIONS_PROPAGATED_TO_D1N,
  D1L_TRACK_COMPLETE,
  D1L_TRACK_STATUS,
  D1M_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  D1M_HANDOFF_AUTO_REPOINTED_TO_NEWER_EVIDENCE,
  D1M_HANDOFF_EQUALS_D1N_CAD_BIM_AUTHORITY,
  D1M_LIMITATIONS_PROPAGATED_TO_D1N,
  D1M_REOPENED,
  D1M_TO_D1N_HANDOFF_CONTRACT_REUSED,
  D1M_TRACK_COMPLETE,
  D1N_ABSORBS_D1K,
  D1N_ABSORBS_D1L,
  D1N_ABSORBS_D1M,
  D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT,
  D1N_CERTIFICATION_RUNTIME_COUNT,
  D1N_CONFORMANCE_RUNTIME_COUNT,
  D1N_D1K_RUNTIME_INTEGRATION_COUNT,
  D1N_D1K_RUNTIME_INTEGRATION_IMPLEMENTED,
  D1N_D1L_RUNTIME_INTEGRATION_COUNT,
  D1N_D1L_RUNTIME_INTEGRATION_IMPLEMENTED,
  D1N_D1M_RUNTIME_INTEGRATION_COUNT,
  D1N_D1M_RUNTIME_INTEGRATION_IMPLEMENTED,
  D1N_DETERMINES_D1L_ELIGIBILITY,
  D1N_DUPLICATE_HANDOFF_GOVERNED,
  D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT,
  D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D1N_EQUALS_D1K_AUTHORITY,
  D1N_EQUALS_D1L_CERTIFICATION_AUTHORITY,
  D1N_EQUALS_D1M_AUTHORITY,
  D1N_HANDOFF_FINGERPRINT_IMPLEMENTED,
  D1N_HANDOFF_HISTORY_PRESERVED,
  D1N_HANDOFF_INTEGRATION_RUNTIME_READY,
  D1N_HANDOFF_PROVENANCE_PRESERVED,
  D1N_HANDOFF_PROVENANCE_REQUIRED,
  D1N_HANDOFF_REPLAY_GOVERNED,
  D1N_HANDOFF_SPOOFING_PROTECTION_IMPLEMENTED,
  D1N_ISSUES_D1L_CERTIFICATION,
  D1N_R7_CURRENTNESS_REUSED,
  D1N_R8_C10_DEBT,
  D1N_R8_CLOSEOUT_PATH,
  D1N_R8_D1F_DEBT,
  D1N_R8_D1G_BLOCKER_PRESERVED,
  D1N_R8_D1G_DEBT,
  D1N_R8_D1H_DEBT,
  D1N_R8_D1I_DEBT,
  D1N_R8_D1J_DEBT,
  D1N_R8_D1K_DEBT,
  D1N_R8_D1L_DEBT,
  D1N_R8_DATABASE_SCHEMA_CHANGED,
  D1N_R8_DEBT_PRESERVED,
  D1N_R8_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R8_MACHINE_READABLE_ROADMAP_UPDATED,
  D1N_R8_MATURITY_STATE,
  D1N_R8_NEW_DEPENDENCY_ADDED,
  D1N_R8_POST_D1J_DEBT_LEDGER,
  D1N_R8_SCOPE,
  D1N_R8_STATUS,
  D1N_R8_STRUCTURAL_PACK_COMPLETE,
  D1N_R9_CANONICAL_PHASE,
  D1N_R9_CANONICAL_SCOPE,
  D1N_R9_PHASE_TYPE,
  D1N_REVOKES_D1L_CERTIFICATION,
  D1N_RUNTIME_COUNT,
  D1N_RUNTIME_STARTED,
  D1N_SOLVER_EXECUTION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY,
  D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT,
  D2_D8_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  D1K_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  EXACT_D1K_EVIDENCE_REFERENCE_REQUIRED,
  EXACT_D1L_GOVERNANCE_REFERENCE_REQUIRED,
  EXACT_D1M_HANDOFF_REFERENCE_REQUIRED,
  FLOATING_D1K_REFERENCE_ALLOWED,
  FLOATING_D1L_REFERENCE_ALLOWED,
  FLOATING_D1M_REFERENCE_ALLOWED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  PARALLEL_R8_CURRENTNESS_ENGINE_CREATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_HANDOFF_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_HANDOFF_SCOPE_ENFORCED,
  changeDesignProgression,
  createD1nR8Store,
  determineD1lEligibility,
  executeStageTransition,
  interpretCadBim,
  issueD1lCertification,
  mutateHandoffIntegration,
  reassessHandoffIntegration,
  recordHandoffIntegration,
  reconstructHandoffIntegration,
  repointHandoffIntegration,
  resolveInterfaceAuthority,
  revokeD1lCertification,
  type D1nR8Input,
  type D1nR8Sources,
} from "./handoff-integration";
import { createD1kR3Store, recordInterfaceSourceChange, type D1kR3Actor } from "./interface-handoff-governance";
import {
  createD1kR1Store,
  registerStructuralInterfaceIdentity,
  supersedeStructuralInterfaceSource,
  type D1kR1Actor,
  type D1kR1Catalog,
  type D1kR1CatalogSource,
  type D1kR1InterfaceInput,
  type D1kR1StructuralTarget,
} from "./interface-identity-foundation";
import { createD1nR1Store, recordOrchestrationContext, type D1nR1Actor } from "./orchestration-context";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..", "..");
const now = () => "2026-10-22T00:00:00.000Z";
const scope = { tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const debt = "DOES_NOT_BLOCK_D1N_BUT_REMAINS_LIMITATION";
const orchestrator: D1nR1Actor = { actorId: "orchestrator-1", ...scope, authority: "ORCHESTRATION_CONTEXT_AUTHORITY" };
const modelActor: D1mR7Actor = { actorId: "recorder-1", ...scope, authority: "INTERFACE_RECORD_AUTHORITY" };
const interfaceActor: D1kR1Actor = { actorId: "engineer-1", ...scope, authority: "HUMAN_ENGINEER" };
const provider: D1kR3Actor = { ...interfaceActor, role: "PROVIDER" };
const claimActor = { actorId: "eng-1", ...scope, authority: "EVIDENCE_PRODUCER" };

function evidence(overrides: Partial<D1lR1Evidence> = {}): D1lR1Evidence {
  return {
    ...scope,
    evidenceId: "ev-design",
    slot: "design",
    category: "SOURCE_ENGINEERING_EVIDENCE",
    sourceKind: "calculation",
    revision: "rev-1",
    sourceFingerprint: "fp-design",
    authority: "EVIDENCE_PRODUCER",
    provenanceRef: "prov-design",
    solverQualificationState: null,
    stale: false,
    upstreamDiagnostic: null,
    d1k: null,
    ...overrides,
  };
}
function claimCatalog(): D1lR1Catalog {
  return {
    targets: [{ ...scope, kind: "MEMBER", id: "member-1", revision: "rev-1" }],
    designStages: [{ ...scope, designStageId: "detailed-design", revision: "stage-1" }],
    standards: [{ ...scope, profileId: "std-1", standardFamily: "steel", standardCode: "GOVERNED-STEEL", edition: "2016", amendment: "A1", version: "2016-A1", fingerprint: "fp-std" }],
    jurisdictions: [{ ...scope, profileId: "jur-1", jurisdictionId: "australia", version: "jur-2024.1", fingerprint: "fp-jur" }],
    consequenceProfiles: [],
    evidence: [
      evidence(),
      evidence({ evidenceId: "ev-analysis", slot: "analysis", sourceFingerprint: "fp-analysis", provenanceRef: "prov-analysis" }),
      evidence({ evidenceId: "ev-review", slot: "engineerReview", category: "ENGINEER_REVIEW_EVIDENCE", sourceKind: "human_input", provenanceRef: "prov-review" }),
      evidence({ evidenceId: "ev-conformance", slot: "conformance", category: "CONFORMANCE_EVIDENCE", provenanceRef: "prov-conf" }),
      evidence({ evidenceId: "ev-solver", slot: "solver", category: "SOLVER_QUALIFICATION_EVIDENCE", sourceKind: "solver_output", solverQualificationState: "NOT_CERTIFIED", upstreamDiagnostic: "D1G_CERTIFIED_SOLVER_REQUIRED", provenanceRef: "prov-solver" }),
    ],
  };
}
function claimInput(overrides: Partial<D1lR1ClaimInput> = {}): D1lR1ClaimInput {
  return {
    claimId: "claim-1",
    manifestId: "manifest-1",
    claimType: "DESIGN_CHECK_CLAIM",
    claimScope: "CHECK",
    structuralTargetKind: "MEMBER",
    structuralTargetId: "member-1",
    designStageId: "detailed-design",
    standardProfileId: "std-1",
    jurisdictionProfileId: "jur-1",
    consequenceProfileId: null,
    designEvidenceId: "ev-design",
    analysisEvidenceId: "ev-analysis",
    validationEvidenceId: null,
    engineerReviewEvidenceId: "ev-review",
    conformanceEvidenceId: "ev-conformance",
    solverQualificationEvidenceId: "ev-solver",
    crossDisciplineEvidenceId: null,
    authorityEvidenceId: null,
    crossDisciplineDependency: false,
    provenanceRef: "prov-claim",
    ...overrides,
  };
}
function target(overrides: Partial<D1kR1StructuralTarget> = {}): D1kR1StructuralTarget {
  return { kind: "MEMBER", id: "member-1", structuralSystemId: "system-1", ...scope, revision: "sys-4", ...overrides };
}
function source(overrides: Partial<D1kR1CatalogSource> = {}): D1kR1CatalogSource {
  return {
    sourceId: "src-civil-4",
    ...scope,
    sourceClass: "MANUAL_GOVERNED_REFERENCE",
    sourceDiscipline: "civil",
    objectId: "civil-grade-4",
    documentId: "doc-grade-4",
    revision: "rev-4",
    evidenceId: "evidence-4",
    evidenceKind: "source_document",
    authority: "CIVIL_ENGINEER_OF_RECORD",
    provenanceRef: "provenance-civil-4",
    issuedAt: "2026-10-20T00:00:00.000Z",
    nativePackContractExposed: false,
    operationalExternalReference: false,
    ...overrides,
  };
}
function interfaceCatalog(): D1kR1Catalog {
  return { targets: [target()], sources: [source(), source({ sourceId: "src-civil-5", revision: "rev-5", documentId: "doc-grade-5", evidenceId: "evidence-5", provenanceRef: "provenance-civil-5" })] };
}
function interfaceInput(overrides: Partial<D1kR1InterfaceInput> = {}): D1kR1InterfaceInput {
  return {
    interfaceId: "interface-1",
    relation: "PROVIDES_INPUT_TO",
    sourceDiscipline: "civil",
    targetDiscipline: "structural",
    counterpartyDiscipline: "civil",
    structuralTargetKind: "MEMBER",
    structuralTargetId: "member-1",
    sourceId: "src-civil-4",
    humanReviewRequired: true,
    description: "Civil grade input cited by orchestration",
    ...overrides,
  };
}

function world() {
  const orchestration = createD1nR1Store([{ id: "member-1", kind: "MEMBER", ...scope }], now);
  const context = recordOrchestrationContext(orchestration, orchestrator, { contextId: "ctx-1", structuralIdentityId: "member-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-ctx" });
  const r7 = createD1mR7Store(now);
  const d1m = createD1mR8Store(r7, now);
  const artifact = registerGovernedRecord(r7, modelActor, { subjectId: "art-1", recordClass: "R1_ARTIFACT", recordId: "artifact-1", fingerprint: "fp-art-1", provenanceRef: "prov-art", snapshot: { revision: "rev-1" } });
  const manifest = issueEvidenceHandoff(d1m, modelActor, { handoffId: "d1m-hand-1", destination: "D1N_FUTURE_ORCHESTRATION_INPUT", references: [{ subjectId: artifact.subjectId, fingerprint: artifact.fingerprint }], provenanceRef: "prov-d1m" });
  const d1k = createD1kR1Store(interfaceCatalog(), now);
  const d1kEvents = createD1kR3Store(now);
  const iface = registerStructuralInterfaceIdentity(d1k, interfaceActor, interfaceInput());
  const d1l = createD1lR1Store(claimCatalog(), now);
  const claim = recordCertificationClaimManifest(d1l, claimActor, claimInput());
  const sources: D1nR8Sources = { orchestration, d1m, d1k, d1kEvents, d1l };
  return { sources, context, r7, manifest, iface, claim, handoffs: createD1nR8Store(now) };
}
function bindInput(env: ReturnType<typeof world>, overrides: Partial<D1nR8Input> = {}): D1nR8Input {
  return {
    handoffId: "hand-1",
    orchestrationContextId: env.context.contextId,
    orchestrationContextFingerprint: env.context.fingerprint,
    d1mHandoffId: env.manifest.handoffId,
    d1mFingerprint: env.manifest.manifestFingerprint,
    d1kInterfaceId: env.iface.interfaceId,
    d1kFingerprint: env.iface.fingerprint,
    d1lManifestId: env.claim.manifestId,
    d1lFingerprint: env.claim.manifestFingerprint,
    provenanceRef: "prov-handoff",
    ...overrides,
  };
}

describe("EOS-D1N-R8 D1M D1K D1L handoff integration", () => {
  it("binds exact current D1M, D1K, and D1L references without taking their authority", () => {
    const env = world();
    const before = [JSON.stringify(env.manifest), JSON.stringify(env.iface), JSON.stringify(env.claim)];
    const recorded = recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env));
    expect(D1M_TO_D1N_HANDOFF_CONTRACT_REUSED).toBe(D1M_R8_D1N_HANDOFF_CONTRACT_IMPLEMENTED);
    expect(D1M_R8_D1N_HANDOFF_CONTRACT_IMPLEMENTED).toBe(true);
    expect(recorded.d1m).toEqual({ id: "d1m-hand-1", fingerprint: env.manifest.manifestFingerprint, authority: "INTERFACE_RECORD_AUTHORITY", currentnessAtBind: "CURRENT" });
    expect(recorded.d1k.authority).toBe("CIVIL_ENGINEER_OF_RECORD");
    expect(recorded.d1l.id).toBe("manifest-1");
    expect(recorded.currentnessState).toBe("CURRENT");
    expect(recorded.engineeringValidated).toBe(false);
    expect(recorded.certified).toBe(false);
    expect(recorded.d1lEligible).toBe(false);
    expect(recorded.cadBimInterpreted).toBe(false);
    expect(recorded.authority).toBe("ORCHESTRATION_CONTEXT_AUTHORITY");
    expect(recorded.upstreamAuthorities.d1m).not.toBe(recorded.authority);
    expect(recorded.limitations.d1m).toContain("NOT_CAD_BIM_AUTHORITY");
    expect(recorded.limitations.d1k).toContain("INTERNAL_DISCIPLINE_INTEGRATION_NOT_READY");
    expect(recorded.limitations.d1k).toContain("CROSS_DISCIPLINE_INTELLIGENCE_NOT_READY");
    expect(recorded.limitations.d1l).toContain("CLAIM_RECORDED_IS_NOT_ELIGIBLE");
    expect(recorded.limitations.d1l).toContain("CLAIM_RECORDED_IS_NOT_CERTIFIED");
    expect(recorded.limitations.d1l).toContain("D1G_CERTIFIED_SOLVER_REQUIRED");
    expect(recorded.missingCertificationPrerequisites).toEqual(["validationEvidence", "crossDisciplineEvidence", "authorityEvidence"]);
    expect(JSON.stringify(env.manifest)).toBe(before[0]);
    expect(JSON.stringify(env.iface)).toBe(before[1]);
    expect(JSON.stringify(env.claim)).toBe(before[2]);
    expect(env.claim.designEvidence?.stale).toBe(false);
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-float", d1mHandoffId: "latest" }))).toThrow("FLOATING_D1M_REFERENCE_REJECTED");
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-float-k", d1kFingerprint: "current interface" }))).toThrow("FLOATING_D1K_REFERENCE_REJECTED");
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-float-l", d1lManifestId: "current certification record" }))).toThrow("FLOATING_D1L_REFERENCE_REJECTED");
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-miss", d1mFingerprint: "fp-other" }))).toThrow("FINGERPRINT_MISMATCH");
    expect(D1M_HANDOFF_EQUALS_D1N_CAD_BIM_AUTHORITY).toBe(false);
    expect(D1K_HANDOFF_EQUALS_D1N_INTERFACE_AUTHORITY).toBe(false);
    expect(D1L_HANDOFF_EQUALS_D1N_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1M_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1K_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1L_GOVERNANCE_REFERENCE_PRESENT_EQUALS_CERTIFIED).toBe(false);
    expect(D1N_EQUALS_D1M_AUTHORITY).toBe(false);
    expect(D1N_EQUALS_D1K_AUTHORITY).toBe(false);
    expect(D1N_EQUALS_D1L_CERTIFICATION_AUTHORITY).toBe(false);
    expect(EXACT_D1M_HANDOFF_REFERENCE_REQUIRED).toBe(true);
    expect(EXACT_D1K_EVIDENCE_REFERENCE_REQUIRED).toBe(true);
    expect(EXACT_D1L_GOVERNANCE_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D1M_REFERENCE_ALLOWED).toBe(false);
    expect(FLOATING_D1K_REFERENCE_ALLOWED).toBe(false);
    expect(FLOATING_D1L_REFERENCE_ALLOWED).toBe(false);
  });

  it("marks the handoff stale or reassessment-required through R7 currentness and does not repoint", () => {
    const staleModel = world();
    const first = recordHandoffIntegration(staleModel.sources, staleModel.handoffs, orchestrator, bindInput(staleModel));
    const cited = first.d1m.fingerprint;
    registerChange(staleModel.r7, modelActor, { changeEventId: "chg-art", priorSubjectId: "art-1", priorFingerprint: "fp-art-1", newSubjectId: "art-2", newRecordId: "artifact-2", newFingerprint: "fp-art-2", changeClass: "ARTIFACT_REVISION", provenanceRef: "prov-chg", reason: "new revision", snapshot: { revision: "rev-2" } });
    const refreshed = refreshHandoffCurrentness(staleModel.sources.d1m, "d1m-hand-1");
    expect(refreshed.currentness).toBe("STALE");
    expect(refreshed.references[0]?.fingerprint).toBe("fp-art-1");
    const stale = reassessHandoffIntegration(staleModel.sources, staleModel.handoffs, orchestrator, bindInput(staleModel, {
      handoffId: "hand-stale-m",
      predecessorHandoffId: "hand-1",
      triggerCategory: "DEPENDENCY_STALE",
      triggeringDependencyId: "d1m-hand-1",
      observedFingerprint: "fp-art-2",
      provenanceRef: "prov-stale-m",
    }));
    expect(stale.currentnessState).toBe("STALE");
    expect(stale.reassessmentRequired).toBe(true);
    expect(stale.d1m.fingerprint).toBe(cited);
    expect(stale.referencesRepointed).toBe(false);
    expect(stale.engineeringValidated).toBe(false);
    expect(stale.certified).toBe(false);
    expect(reconstructHandoffIntegration(staleModel.handoffs, "hand-1").currentnessState).toBe("CURRENT");
    expect(reconstructHandoffIntegration(staleModel.handoffs, "hand-1").recordStatus).toBe("SUPERSEDED");
    expect(reconstructHandoffIntegration(staleModel.handoffs, "hand-1").d1m.fingerprint).toBe(cited);
    expect(() => reassessHandoffIntegration(staleModel.sources, staleModel.handoffs, orchestrator, bindInput(staleModel, { handoffId: "hand-repoint", predecessorHandoffId: "hand-stale-m", d1mFingerprint: "fp-newer", triggerCategory: "DEPENDENCY_STALE", triggeringDependencyId: "d1m-hand-1" }))).toThrow("AUTO_REPOINT_NOT_IN_R8");

    const staleInterface = world();
    recordHandoffIntegration(staleInterface.sources, staleInterface.handoffs, orchestrator, bindInput(staleInterface));
    const originalInterface = staleInterface.iface.fingerprint;
    const changed = recordInterfaceSourceChange(staleInterface.sources.d1k, staleInterface.sources.d1kEvents, provider, {
      eventId: "evt-src",
      predecessorInterfaceId: "interface-1",
      successor: interfaceInput({ interfaceId: "interface-2", sourceId: "src-civil-5", predecessorInterfaceId: "interface-1" }),
    });
    expect(changed.events.some((event) => event.handoffState === "STALE_DEPENDENCY")).toBe(true);
    const interfaceStale = reassessHandoffIntegration(staleInterface.sources, staleInterface.handoffs, orchestrator, bindInput(staleInterface, {
      handoffId: "hand-stale-k",
      predecessorHandoffId: "hand-1",
      triggerCategory: "DEPENDENCY_STALE",
      triggeringDependencyId: "interface-1",
      observedFingerprint: changed.successor.fingerprint,
      provenanceRef: "prov-stale-k",
    }));
    expect(interfaceStale.currentnessState).toBe("STALE");
    expect(interfaceStale.d1k.id).toBe("interface-1");
    expect(interfaceStale.d1k.fingerprint).toBe(originalInterface);
    expect(interfaceStale.d1k.id).not.toBe(changed.successor.interfaceId);

    const staleClaim = world();
    recordHandoffIntegration(staleClaim.sources, staleClaim.handoffs, orchestrator, bindInput(staleClaim));
    const design = staleClaim.sources.d1l.catalog.evidence.find((row) => row.evidenceId === "ev-design");
    if (!design) throw new Error("design evidence missing");
    design.stale = true;
    const claimStale = reassessHandoffIntegration(staleClaim.sources, staleClaim.handoffs, orchestrator, bindInput(staleClaim, {
      handoffId: "hand-stale-l",
      predecessorHandoffId: "hand-1",
      triggerCategory: "DEPENDENCY_STALE",
      triggeringDependencyId: "manifest-1",
      provenanceRef: "prov-stale-l",
    }));
    expect(claimStale.currentnessState).toBe("STALE");
    expect(claimStale.d1l.fingerprint).toBe(staleClaim.claim.manifestFingerprint);
    expect(staleClaim.claim.designEvidence?.stale).toBe(false);
    expect(claimStale.d1lEligible).toBe(false);

    const superseded = world();
    const prior = recordHandoffIntegration(superseded.sources, superseded.handoffs, orchestrator, bindInput(superseded));
    supersedeStructuralInterfaceSource(superseded.sources.d1k, interfaceActor, interfaceInput({ interfaceId: "interface-2", sourceId: "src-civil-5", predecessorInterfaceId: "interface-1" }));
    const required = reassessHandoffIntegration(superseded.sources, superseded.handoffs, orchestrator, bindInput(superseded, {
      handoffId: "hand-required",
      predecessorHandoffId: "hand-1",
      triggerCategory: "DEPENDENCY_SUPERSEDED",
      triggeringDependencyId: "interface-1",
      provenanceRef: "prov-required",
    }));
    expect(D1N_R7_CURRENTNESS_REUSED).toBe(true);
    expect(PARALLEL_R8_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(required.currentnessState).toBe("REASSESSMENT_REQUIRED");
    expect(required.reassessmentRequired).toBe(true);
    expect(required.certified).toBe(false);
    expect(required.d1lEligible).toBe(false);
    expect(required.progressionChanged).toBe(false);
    expect(required.d1k.fingerprint).toBe(prior.d1k.fingerprint);
    expect(D1M_HANDOFF_AUTO_REPOINTED_TO_NEWER_EVIDENCE).toBe(false);
    expect(D1K_HANDOFF_AUTO_REPOINTED_TO_NEWER_EVIDENCE).toBe(false);
    expect(D1L_HANDOFF_AUTO_REPOINTED_TO_NEWER_GOVERNANCE_STATE).toBe(false);
    expect(() => reassessHandoffIntegration(superseded.sources, superseded.handoffs, orchestrator, bindInput(superseded, { handoffId: "hand-wrong", predecessorHandoffId: "hand-required", triggerCategory: "DEPENDENCY_STALE", triggeringDependencyId: "interface-1", provenanceRef: "prov-wrong" }))).toThrow("STALENESS_NOT_CITED");
  });

  it("preserves provenance, fingerprint, history, scope, and authority boundaries", () => {
    const env = world();
    const recorded = recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env));
    const replay = recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env));
    expect(replay).toBe(recorded);
    const again = world();
    const twin = recordHandoffIntegration(again.sources, again.handoffs, orchestrator, bindInput(again));
    expect(twin.fingerprint).toBe(recorded.fingerprint);
    expect(twin.fingerprint).toBe(fingerprintCanonical({
      handoffId: "hand-1",
      orchestrationContextId: env.context.contextId,
      orchestrationContextFingerprint: env.context.fingerprint,
      d1m: recorded.d1m,
      d1k: recorded.d1k,
      d1l: recorded.d1l,
      claimId: "claim-1",
      currentnessState: "CURRENT",
      reassessmentRequired: false,
      triggerCategory: "BASELINE",
      triggeringDependencyId: null,
      observedFingerprint: null,
      limitations: { d1m: [...recorded.limitations.d1m], d1k: [...recorded.limitations.d1k], d1l: [...recorded.limitations.d1l] },
      missingCertificationPrerequisites: [...recorded.missingCertificationPrerequisites],
      upstreamAuthorities: recorded.upstreamAuthorities,
      provenanceRef: "prov-handoff",
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      projectId: "project-a",
      predecessorHandoffId: null,
    }));
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { provenanceRef: "prov-other" }))).toThrow("HANDOFF_ALREADY_RECORDED");
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-2", provenanceRef: "prov-2" }))).toThrow("DUPLICATE_HANDOFF_REJECTED");
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-spoof", assertedFingerprint: "forged" }))).toThrow("FINGERPRINT_MISMATCH");
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-tenant", tenantId: "tenant-b" }))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-project", projectId: "project-b" }))).toThrow("CROSS_PROJECT_OPERATION");
    const foreignModel = createD1mR8Store(createD1mR7Store(now), now);
    const foreignArtifact = registerGovernedRecord(foreignModel.r7, { ...modelActor, tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" }, { subjectId: "art-b", recordClass: "R1_ARTIFACT", recordId: "artifact-b", fingerprint: "fp-art-b", provenanceRef: "prov-b", snapshot: { revision: "rev-b" } });
    issueEvidenceHandoff(foreignModel, { ...modelActor, tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" }, { handoffId: "d1m-b", destination: "D1N_FUTURE_ORCHESTRATION_INPUT", references: [{ subjectId: foreignArtifact.subjectId, fingerprint: foreignArtifact.fingerprint }], provenanceRef: "prov-b" });
    expect(() => recordHandoffIntegration({ ...env.sources, d1m: foreignModel }, createD1nR8Store(now), orchestrator, bindInput(env, { handoffId: "hand-foreign", d1mHandoffId: "d1m-b", d1mFingerprint: foreignModel.manifests[0]?.manifestFingerprint ?? "" }))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordHandoffIntegration(env.sources, createD1nR8Store(now), { ...orchestrator, actorId: "AI_ASSISTANT" }, bindInput(env))).toThrow("AI_NOT_HANDOFF_AUTHORITY");
    expect(() => recordHandoffIntegration(env.sources, createD1nR8Store(now), { ...orchestrator, authority: "ADMIN" }, bindInput(env))).toThrow("ADMIN_NOT_HANDOFF_AUTHORITY");
    expect(() => recordHandoffIntegration(env.sources, createD1nR8Store(now), { ...orchestrator, authority: "CERTIFICATION_AUTHORITY" }, bindInput(env))).toThrow("HANDOFF_AUTHORITY_NOT_CERTIFIER");
    expect(() => recordHandoffIntegration(env.sources, createD1nR8Store(now), { ...orchestrator, authority: "INTERFACE_RECORD_AUTHORITY" }, bindInput(env))).toThrow("UPSTREAM_AUTHORITY_DOES_NOT_RECORD_D1N_HANDOFF");
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-force", forceCurrent: true }))).toThrow("FORCED_CURRENTNESS_NOT_IN_R8");
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-strip", stripLimitations: true }))).toThrow("LIMITATION_STRIP_REJECTED");
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-eligible", determineEligibility: true }))).toThrow("D1L_ELIGIBILITY_NOT_IN_R8");
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-cert", certify: true }))).toThrow("CERTIFICATION_NOT_IN_R8");
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-ai", inventD1m: true }))).toThrow("D1M_EVIDENCE_INVENTION_REJECTED");
    expect(() => recordHandoffIntegration(env.sources, env.handoffs, orchestrator, bindInput(env, { handoffId: "hand-override", overrideStale: true }))).toThrow("STALE_HANDOFF_OVERRIDE_REJECTED");
    expect(() => mutateHandoffIntegration()).toThrow("HANDOFF_MUTATION_REJECTED");
    expect(() => repointHandoffIntegration()).toThrow("AUTO_REPOINT_NOT_IN_R8");
    expect(() => interpretCadBim()).toThrow("CAD_BIM_INTERPRETATION_NOT_IN_R8");
    expect(() => resolveInterfaceAuthority()).toThrow("INTERFACE_RESOLUTION_NOT_IN_R8");
    expect(() => determineD1lEligibility()).toThrow("D1L_ELIGIBILITY_NOT_IN_R8");
    expect(() => issueD1lCertification()).toThrow("CERTIFICATION_NOT_IN_R8");
    expect(() => revokeD1lCertification()).toThrow("CERTIFICATION_REVOCATION_NOT_IN_R8");
    expect(() => executeStageTransition()).toThrow("STAGE_TRANSITION_EXECUTION_NOT_IN_R8");
    expect(() => changeDesignProgression()).toThrow("PROGRESSION_MUTATION_NOT_IN_R8");
    expect(recorded.provenanceRef).toBe("prov-handoff");
    expect(env.handoffs.history.map((row) => row.action)).toContain("CREATED");
    expect(recorded.deleted).toBe(false);
    expect(D1N_HANDOFF_PROVENANCE_REQUIRED).toBe(true);
    expect(D1N_HANDOFF_PROVENANCE_PRESERVED).toBe(true);
    expect(D1N_HANDOFF_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(D1N_HANDOFF_HISTORY_PRESERVED).toBe(true);
    expect(D1N_DUPLICATE_HANDOFF_GOVERNED).toBe(true);
    expect(D1N_HANDOFF_REPLAY_GOVERNED).toBe(true);
    expect(D1N_HANDOFF_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(SILENT_HANDOFF_MUTATION_ALLOWED).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_HANDOFF_SCOPE_ENFORCED).toBe(true);
    expect(AI_CAN_INVENT_D1M_HANDOFF_EVIDENCE).toBe(false);
    expect(AI_CAN_INVENT_D1K_INTERFACE_EVIDENCE).toBe(false);
    expect(AI_CAN_INVENT_D1L_ELIGIBILITY).toBe(false);
    expect(AI_CAN_OVERRIDE_STALE_HANDOFF).toBe(false);
    expect(AI_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(D1M_LIMITATIONS_PROPAGATED_TO_D1N).toBe(true);
    expect(D1K_LIMITATIONS_PROPAGATED_TO_D1N).toBe(true);
    expect(D1L_LIMITATIONS_PROPAGATED_TO_D1N).toBe(true);
  });

  it("keeps the consolidated boundary, debt, and next closeout phase unstarted", () => {
    expect(D1N_ABSORBS_D1M).toBe(false);
    expect(D1N_ABSORBS_D1K).toBe(false);
    expect(D1N_ABSORBS_D1L).toBe(false);
    expect(D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(D1N_SOLVER_EXECUTION_RUNTIME_COUNT).toBe(0);
    expect(D1N_CONFORMANCE_RUNTIME_COUNT).toBe(0);
    expect(D1N_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT).toBe(0);
    expect(D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT).toBe(0);
    expect(D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT).toBe(0);
    expect(AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY).toBe(false);
    expect(D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY).toBe(false);
    expect(D1K_LIMITATIONS_PRESERVED).toBe(true);
    expect(D1L_TRACK_COMPLETE).toBe(true);
    expect(D1L_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1N_DETERMINES_D1L_ELIGIBILITY).toBe(false);
    expect(D1N_ISSUES_D1L_CERTIFICATION).toBe(false);
    expect(D1N_REVOKES_D1L_CERTIFICATION).toBe(false);
    expect(D1M_TRACK_COMPLETE).toBe(true);
    expect(D1M_REOPENED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(D2_D8_RUNTIME_STARTED).toBe(false);
    expect(D2_D8_RUNTIME_COUNT).toBe(0);
    expect(CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(PARALLEL_D1N_DIGITAL_THREAD_CREATED).toBe(false);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1N_R8_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1N_R8_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1N_R8_DEBT_PRESERVED).toBe(true);
    expect(D1N_R8_POST_D1J_DEBT_LEDGER).toContain("NOT_AVAILABLE");
    expect(D1N_R8_POST_D1J_DEBT_LEDGER).toContain("GA security debt remains.");
    expect(D1N_R8_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1N_R8_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1N_R8_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_R8_C10_DEBT).toBe(debt);
    expect(D1N_R8_D1F_DEBT).toBe(debt);
    expect(D1N_R8_D1G_DEBT).toBe(debt);
    expect(D1N_R8_D1H_DEBT).toBe(debt);
    expect(D1N_R8_D1I_DEBT).toBe(debt);
    expect(D1N_R8_D1J_DEBT).toBe(debt);
    expect(D1N_R8_D1K_DEBT).toBe(debt);
    expect(D1N_R8_D1L_DEBT).toBe(debt);
    expect(R7_RUNTIME_COUNT).toBe(7);
    expect(R7_HANDOFF_READY).toBe(false);
    expect(R7_CURRENTNESS_READY).toBe(true);
    expect(R7_D1M_COUNT).toBe(0);
    expect(R7_D1K_COUNT).toBe(0);
    expect(R7_D1L_COUNT).toBe(0);
    expect(D1N_RUNTIME_STARTED).toBe(true);
    expect(D1N_RUNTIME_COUNT).toBe(8);
    expect(D1N_HANDOFF_INTEGRATION_RUNTIME_READY).toBe(true);
    expect(D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY).toBe(false);
    expect(D1N_D1M_RUNTIME_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(D1N_D1M_RUNTIME_INTEGRATION_COUNT).toBe(1);
    expect(D1N_D1K_RUNTIME_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(D1N_D1K_RUNTIME_INTEGRATION_COUNT).toBe(1);
    expect(D1N_D1L_RUNTIME_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(D1N_D1L_RUNTIME_INTEGRATION_COUNT).toBe(1);
    expect(D1N_R8_STATUS).toBe("HANDOFF_INTEGRATION_IMPLEMENTED");
    expect(D1N_R8_MATURITY_STATE).toBe("STRUCTURAL_D1M_D1K_D1L_HANDOFF_INTEGRATION_IMPLEMENTED");
    expect(D1N_R8_SCOPE).toContain("Do not absorb D1M");
    expect(D1N_R9_CANONICAL_PHASE).toBe("EOS-D1N-R9-CONCEPT-TO-DETAILED-ORCHESTRATION-CLOSEOUT");
    expect(D1N_R9_PHASE_TYPE).toBe("CONCEPT_TO_DETAILED_ORCHESTRATION_CLOSEOUT");
    expect(D1N_R9_CANONICAL_SCOPE).toContain("no new substantive runtime");
    expect(D1N_R8_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    const source = readFileSync(join(here, "handoff-integration.ts"), "utf8");
    const doc = readFileSync(join(root, D1N_R8_CLOSEOUT_PATH), "utf8");
    const index = readFileSync(join(here, "index.ts"), "utf8");
    expect(scanAnalysisFormulaBypass(join(here, "handoff-integration.ts"), source)).toEqual([]);
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|spawn\(|new Function|fetch\(/);
    expect(doc).toContain("EOS-D1N-R9-CONCEPT-TO-DETAILED-ORCHESTRATION-CLOSEOUT");
    expect(doc).not.toContain("```");
    expect(index.match(/D1N_R8_CANONICAL_PHASE/g)).toHaveLength(1);
    expect(index.match(/D1N_R9_CANONICAL_PHASE/g)).toHaveLength(1);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1N.R8.D1M_D1K_D1L_HANDOFF_INTEGRATION")).toBe(true);
  });
});
