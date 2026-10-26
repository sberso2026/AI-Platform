import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D6_REOPENED, D7_REOPENED, D8_REOPENED } from "@rtb/types";
import { D2_CONTEXT_AUTHORITY, D2_DISCIPLINE } from "../civil/identity-foundation";
import { D2_R11_STATUS } from "../civil/d9-source-contract";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D2_TRACK_COMPLETE,
  D3_TRACK_COMPLETE,
  D4_TRACK_COMPLETE,
  D5_TRACK_COMPLETE,
  D6_STATUS,
  D6_TRACK_COMPLETE,
  D7_STATUS,
  D7_TRACK_COMPLETE,
  D8_STATUS,
  D8_TRACK_COMPLETE,
} from "../instrumentation-control/instrumentation-control-bounded-closeout";
import { D6_CONTEXT_AUTHORITY, D6_DISCIPLINE } from "../process/identity-foundation";
import { D6_R11_STATUS } from "../process/d9-source-contract";
import { D1N_REOPENED, D2_REOPENED, D3_REOPENED, D4_REOPENED, D5_REOPENED } from "../process/process-bounded-closeout";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import {
  AI_CAN_PROMOTE_D9_OBSERVATION_TO_CONFLICT,
  AI_EQUALS_D9_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY,
  CROSS_TENANT_D9_R2_ACCESS_ALLOWED,
  CURRENT_OBSERVATION_EQUALS_VALIDATED,
  D9_APPROVAL_RUNTIME_COUNT,
  D9_AUTO_VALIDATES_D1_STRUCTURAL,
  D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT,
  D9_CANONICAL_MILESTONE_COUNT,
  D9_CANONICAL_PHASE_LIST,
  D9_CERTIFICATION_RUNTIME_COUNT,
  D9_CONFLICT_DETECTION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT,
  D9_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RECORD_IMPLEMENTED,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_IMPLEMENTED,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY,
  D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D9_ENGINEERING_DECISION_RUNTIME_COUNT,
  D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT,
  D9_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D9_EQUALS_D6_PROCESS_AUTHORITY,
  D9_EQUALS_D8_IAC_AUTHORITY,
  D9_OBSERVATION_EQUALS_D9_INFERENCE,
  D9_OBSERVATION_EQUALS_ENGINEERING_FACT,
  D9_R2_AUTO_CONVERTS_ENGINEERING_UNITS,
  D9_R2_AUTO_MUTATES_D1_STRUCTURAL,
  D9_R2_AUTO_MUTATES_D8_IAC,
  D9_R2_BLOCKER,
  D9_R2_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS,
  D9_R2_CANONICAL_NEXT_PHASE,
  D9_R2_CANONICAL_NEXT_PHASE_SCOPE,
  D9_R2_CONFIRMS_ENGINEERING_CONFLICT,
  D9_R2_CREATES_CONFLICT_CANDIDATE,
  D9_R2_CREATES_ENGINEERING_ESCALATION,
  D9_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D9_R2_EXACT_SOURCE_REVISION_REQUIRED,
  D9_R2_FLOATING_SOURCE_REFERENCE_ALLOWED,
  D9_R2_GENERATES_ENGINEERING_RECOMMENDATION,
  D9_R2_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D9_R2_INFERS_MISSING_ENGINEERING_VALUE,
  D9_R2_INFERS_RELATIONSHIP_FROM_NAME,
  D9_R2_LIMITATIONS_EXPLICIT,
  D9_R2_MACHINE_READABLE_ROADMAP_UPDATED,
  D9_R2_MAKES_ENGINEERING_DECISION,
  D9_R2_MATURITY,
  D9_R2_OBSERVATION_CURRENTNESS_INTEGRATED,
  D9_R2_PERFORMS_CONFLICT_DETECTION,
  D9_R2_PERFORMS_CROSS_DISCIPLINE_INFERENCE,
  D9_R2_PERFORMS_ENGINEERING_DERIVATION,
  D9_R2_PERFORMS_NUMERIC_DERIVATION,
  D9_R2_PRESERVES_CLOSED_TRACKS,
  D9_R2_PRESERVES_D1_INCOMPLETE_STATUS,
  D9_R2_PRESERVES_SOURCE_DISCIPLINE,
  D9_R2_PRESERVES_SOURCE_IDENTITY,
  D9_R2_PRESERVES_SOURCE_OBJECT_TYPE,
  D9_R2_PROVENANCE_PRESERVED,
  D9_R2_R1_RUNTIME_REMAINS_ONE,
  D9_R2_RECORDER_AUTHORITY,
  D9_R2_REPLAY_PROTECTION_IMPLEMENTED,
  D9_R2_SOURCE_AUTO_REPOINTED,
  D9_R2_SOURCE_BASIS_TRACEABLE,
  D9_R2_SOURCE_CHANGE_AUTO_RECOMPUTES_OBSERVATION,
  D9_R2_SOURCE_CHANGE_AUTO_REPOINTS_OBSERVATION,
  D9_R2_SOURCE_LIMITATIONS_PRESERVED,
  D9_R2_SOURCE_UNITS_PRESERVED,
  D9_R2_SOURCE_VALUES_PRESERVED,
  D9_R2_SPOOFING_PROTECTION_IMPLEMENTED,
  D9_R2_STATUS,
  D9_R2_USES_R1_SOURCE_REVISION_MANIFEST,
  D9_R3_STARTED,
  D9_RECOMMENDATION_RUNTIME_COUNT,
  D9_REVIEW_VALIDATION_RUNTIME_COUNT,
  D9_REUSES_CANONICAL_CURRENTNESS,
  D9_REUSES_CANONICAL_DIGITAL_THREAD,
  D9_REUSES_CANONICAL_FINGERPRINT,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY,
  D9_TREATS_D1_STRUCTURAL_AS_COMPLETE,
  EOS_ALL_DISCIPLINES_COMPLETE,
  EOS_GA_READY,
  OBSERVED_DIFFERENCE_EQUALS_CONFLICT_CANDIDATE,
  OBSERVED_DIFFERENCE_EQUALS_CONFIRMED_ENGINEERING_CONFLICT,
  OBSERVED_RELATIONSHIP_EQUALS_APPROVAL,
  OBSERVED_RELATIONSHIP_EQUALS_ENGINEERING_AUTHORITY,
  PARALLEL_D9_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D9_DIGITAL_THREAD_CREATED,
  SECOND_D9_FINGERPRINT_ALGORITHM_CREATED,
  STALE_OBSERVATION_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D9_R2_SCOPE_ENFORCED,
  confirmConflictFromObservation,
  convertObservationUnits,
  createD9R2Store,
  detectConflictFromObservation,
  inferFromD9Observation,
  mutateD9ObservationSource,
  readD9Observations,
  recomputeD9Observation,
  recordD9CrossDisciplineObservation,
  recommendFromObservation,
  repointD9Observation,
  type D9R2ObservationInput,
} from "./cross-discipline-observation";
import { D9_R1_D1_STANDING_LIMITATION, D9_R1_RECORDER_AUTHORITY, createD9R1Store, recordD1IncompletePosture, recordD9SourceContractEntry, type D9R1SourceEntryInput } from "./source-contract-read-model";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const reader = { actorId: "reader-1", authority: D9_R1_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const observer = { actorId: "observer-1", authority: D9_R2_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };

function entry(overrides: Partial<D9R1SourceEntryInput> = {}): D9R1SourceEntryInput {
  return {
    entryId: "entry-civil-1",
    sourceDiscipline: "D2_CIVIL",
    sourceDisciplineToken: D2_DISCIPLINE,
    contractId: "civil-contract-1",
    contractVersion: D2_R11_STATUS,
    objectId: "civil-object-1",
    objectType: "CIVIL_SURFACE",
    exactRevision: "rev-civil-1",
    currentness: "STALE",
    provenanceRef: "prov-civil-1",
    sourceBasisRef: "basis-civil-1",
    applicability: "site pad A only",
    limitations: "survey control not closed",
    authority: D2_CONTEXT_AUTHORITY,
    lineage: [{ lineageId: "lin-1", fromRevision: "rev-civil-0", toRevision: "rev-civil-1" }],
    relationships: [{ relationshipId: "rel-1", sourceEndpointId: "civil-object-1", sourceRevision: "rev-civil-1", targetEndpointId: "process-object-1", targetRevision: "rev-process-1" }],
    sourceValues: [{ quantityId: "pad-level", valueText: "12.5", unitText: "m" }],
    ...overrides,
  };
}

describe("EOS-D9-R2 cross-discipline observation", () => {
  it("adds one observation runtime over the exact R1 manifest", () => {
    expect(D9_R2_STATUS).toBe("CROSS_DISCIPLINE_OBSERVATION_IMPLEMENTED");
    expect(D9_R2_MATURITY).toBe(D9_R2_STATUS);
    expect(D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_IMPLEMENTED && D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY && D9_CROSS_DISCIPLINE_OBSERVATION_RECORD_IMPLEMENTED).toBe(true);
    expect(D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT).toBe(1);
    expect(D9_RUNTIME_STARTED).toBe(true);
    expect(D9_RUNTIME_COUNT).toBe(2);
    expect(D9_R2_R1_RUNTIME_REMAINS_ONE).toBe(true);
    expect(D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT).toBe(1);
    expect(D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY).toBe(true);
    expect(D9_CANONICAL_MILESTONE_COUNT).toBe(9);
    expect(D9_CANONICAL_PHASE_LIST[2]).toBe("EOS-D9-R2-CROSS-DISCIPLINE-OBSERVATION");
    expect(D9_CANONICAL_PHASE_LIST).toHaveLength(9);
    expect(D9_R2_USES_R1_SOURCE_REVISION_MANIFEST && D9_R2_EXACT_SOURCE_REVISION_REQUIRED && D9_R2_PRESERVES_SOURCE_DISCIPLINE && D9_R2_PRESERVES_SOURCE_IDENTITY && D9_R2_PRESERVES_SOURCE_OBJECT_TYPE).toBe(true);
    expect(D9_R2_FLOATING_SOURCE_REFERENCE_ALLOWED || D9_R2_SOURCE_AUTO_REPOINTED || D9_TREATS_D1_STRUCTURAL_AS_COMPLETE || D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D9_R2_PRESERVES_D1_INCOMPLETE_STATUS).toBe(true);
    expect(D9_OBSERVATION_EQUALS_D9_INFERENCE || D9_OBSERVATION_EQUALS_ENGINEERING_FACT || OBSERVED_DIFFERENCE_EQUALS_CONFLICT_CANDIDATE || OBSERVED_DIFFERENCE_EQUALS_CONFIRMED_ENGINEERING_CONFLICT).toBe(false);
    expect(D9_R2_PERFORMS_CROSS_DISCIPLINE_INFERENCE || D9_R2_PERFORMS_CONFLICT_DETECTION || D9_R2_CREATES_CONFLICT_CANDIDATE || D9_R2_CONFIRMS_ENGINEERING_CONFLICT || D9_R2_CREATES_ENGINEERING_ESCALATION || D9_R2_GENERATES_ENGINEERING_RECOMMENDATION || D9_R2_MAKES_ENGINEERING_DECISION).toBe(false);
    expect([D9_CONFLICT_DETECTION_RUNTIME_COUNT, D9_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT, D9_RECOMMENDATION_RUNTIME_COUNT, D9_ENGINEERING_DECISION_RUNTIME_COUNT, D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D9_APPROVAL_RUNTIME_COUNT, D9_CERTIFICATION_RUNTIME_COUNT, D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT, D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT, D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D9_REVIEW_VALIDATION_RUNTIME_COUNT]).toEqual(Array(13).fill(0));
    expect(D9_R2_SOURCE_BASIS_TRACEABLE && D9_R2_PROVENANCE_PRESERVED && D9_R2_LIMITATIONS_EXPLICIT && D9_R2_SOURCE_LIMITATIONS_PRESERVED && D9_R2_OBSERVATION_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D9_R2_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS || CURRENT_OBSERVATION_EQUALS_VALIDATED || STALE_OBSERVATION_EQUALS_INVALID || D9_R2_SOURCE_CHANGE_AUTO_REPOINTS_OBSERVATION || D9_R2_SOURCE_CHANGE_AUTO_RECOMPUTES_OBSERVATION).toBe(false);
    expect(D9_REUSES_CANONICAL_CURRENTNESS && D9_REUSES_CANONICAL_DIGITAL_THREAD && D9_REUSES_CANONICAL_FINGERPRINT && D9_R2_SOURCE_UNITS_PRESERVED && D9_R2_SOURCE_VALUES_PRESERVED).toBe(true);
    expect(PARALLEL_D9_CURRENTNESS_ENGINE_CREATED || PARALLEL_D9_DIGITAL_THREAD_CREATED || SECOND_D9_FINGERPRINT_ALGORITHM_CREATED || D9_R2_PERFORMS_ENGINEERING_DERIVATION || D9_R2_PERFORMS_NUMERIC_DERIVATION || D9_R2_INFERS_MISSING_ENGINEERING_VALUE || D9_R2_AUTO_CONVERTS_ENGINEERING_UNITS || D9_R2_INFERS_RELATIONSHIP_FROM_NAME).toBe(false);
    expect(D9_R2_HISTORICAL_REFERENCE_AUTO_REPOINTED || OBSERVED_RELATIONSHIP_EQUALS_ENGINEERING_AUTHORITY || OBSERVED_RELATIONSHIP_EQUALS_APPROVAL || D9_EQUALS_D1_STRUCTURAL_AUTHORITY || D9_EQUALS_D6_PROCESS_AUTHORITY || D9_EQUALS_D8_IAC_AUTHORITY).toBe(false);
    expect(AI_EQUALS_D9_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY || AI_CAN_PROMOTE_D9_OBSERVATION_TO_CONFLICT || D9_AUTO_VALIDATES_D1_STRUCTURAL || D9_R2_AUTO_MUTATES_D1_STRUCTURAL || D9_R2_AUTO_MUTATES_D8_IAC).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D9_R2_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D9_R2_ACCESS_ALLOWED).toBe(false);
    expect(D9_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED && D9_R2_REPLAY_PROTECTION_IMPLEMENTED && D9_R2_SPOOFING_PROTECTION_IMPLEMENTED && D9_R2_PRESERVES_CLOSED_TRACKS).toBe(true);
    expect(D9_R3_STARTED).toBe(false);
    expect(D9_R2_CANONICAL_NEXT_PHASE).toBe("EOS-D9-R3-CONFLICT-CANDIDATE-DETECTION");
    expect(D9_R2_CANONICAL_NEXT_PHASE_SCOPE).toContain("conflict candidate is not a confirmed engineering conflict");
    expect(D1N_REOPENED || D2_REOPENED || D3_REOPENED || D4_REOPENED || D5_REOPENED || D6_REOPENED || D7_REOPENED || D8_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && D3_TRACK_COMPLETE && D4_TRACK_COMPLETE && D5_TRACK_COMPLETE && D6_TRACK_COMPLETE && D7_TRACK_COMPLETE && D8_TRACK_COMPLETE).toBe(true);
    expect(D6_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D7_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D8_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(EOS_ALL_DISCIPLINES_COMPLETE || EOS_GA_READY).toBe(false);
    expect(D9_R2_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    expect(D9_R2_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R2.CROSS_DISCIPLINE_OBSERVATION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R3.CONFLICT_CANDIDATE_DETECTION")?.implementationState).toBe("NOT_IMPLEMENTED");
    const sourceText = readFileSync(join(here, "cross-discipline-observation.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "cross-discipline-observation.ts"), sourceText)).toEqual([]);
  });

  it("binds an explicit difference to exact source revisions without creating a conflict", () => {
    const r1 = createD9R1Store({ tenantId: reader.tenantId, workspaceId: reader.workspaceId, projectId: reader.projectId });
    const civil = recordD9SourceContractEntry(r1, reader, entry());
    const process = recordD9SourceContractEntry(r1, reader, entry({
      entryId: "entry-process-1",
      sourceDiscipline: "D6_PROCESS",
      sourceDisciplineToken: D6_DISCIPLINE,
      contractId: "process-contract-1",
      contractVersion: D6_R11_STATUS,
      objectId: "process-object-1",
      objectType: "PROCESS_STREAM",
      exactRevision: "rev-process-1",
      currentness: "CURRENT",
      provenanceRef: "prov-process-1",
      sourceBasisRef: "basis-process-1",
      applicability: "train 1",
      limitations: "composition not validated",
      authority: D6_CONTEXT_AUTHORITY,
      lineage: [{ lineageId: "lin-2", fromRevision: "rev-process-0", toRevision: "rev-process-1" }],
      relationships: [],
      sourceValues: [{ quantityId: "flow", valueText: "10", unitText: "m3/h" }],
    }));
    recordD1IncompletePosture(r1, reader);
    const before = JSON.stringify(r1.entries);
    const historyBefore = r1.history.length;
    const store = createD9R2Store(r1);
    const input: D9R2ObservationInput = {
      observationId: "obs-1",
      observationType: "EXPLICIT_DIFFERENCE",
      sourceAContractId: civil.contractId,
      sourceAExactRevision: civil.exactRevision,
      sourceAFingerprint: civil.fingerprint,
      sourceBContractId: process.contractId,
      sourceBExactRevision: process.exactRevision,
      sourceBFingerprint: process.fingerprint,
      observedStatement: "Civil revision specifies pad level 12.5 m; Process revision specifies flow 10 m3/h.",
      sourceBasisRef: "basis-civil-1 and basis-process-1",
      provenanceRef: "civil-contract-1 and process-contract-1",
      applicability: "site pad A only; train 1",
      limitations: `survey control not closed; composition not validated; ${D9_R1_D1_STANDING_LIMITATION}`,
      citedCurrentness: "STALE",
    };
    const observed = recordD9CrossDisciplineObservation(r1, store, observer, input);
    expect(JSON.stringify(r1.entries)).toBe(before);
    expect(r1.history).toHaveLength(historyBefore);
    expect(observed.inference || observed.engineeringFact || observed.conflictCandidate || observed.confirmedConflict || observed.validated || observed.authorityTransferred).toBe(false);
    expect(observed.sourceA.exactRevision).toBe("rev-civil-1");
    expect(observed.sourceA.objectType).toBe("CIVIL_SURFACE");
    expect(observed.sourceA.sourceValues[0]?.unitText).toBe("m");
    expect(observed.sourceB.sourceDisciplineToken).toBe(D6_DISCIPLINE);
    expect(observed.sourceB.sourceValues[0]?.valueText).toBe("10");
    expect(observed.d1PackComplete).toBe(false);
    expect(observed.d1Limitations).toContain("incomplete");
    expect(observed.citedCurrentness).toBe("STALE");
    expect(recordD9CrossDisciplineObservation(r1, store, observer, input)).toBe(observed);
    expect(store.history).toHaveLength(1);
    const linked = recordD9CrossDisciplineObservation(r1, store, observer, {
      ...input,
      observationId: "obs-2",
      observationType: "EXPLICIT_RELATIONSHIP",
      relationshipId: "rel-1",
      observedStatement: "Civil revision rel-1 names Process revision rev-process-1.",
    });
    expect(linked.relationshipId).toBe("rel-1");
    expect(linked.authorityTransferred).toBe(false);
    expect(readD9Observations(r1, store, observer)).toHaveLength(2);
    expect(() => recordD9CrossDisciplineObservation(r1, store, observer, { ...input, observationId: "float", sourceAExactRevision: "current", sourceAFingerprint: civil.fingerprint })).toThrow(/EXACT_REVISION_REQUIRED|SOURCE_REVISION_NOT_ON_MANIFEST/);
    expect(() => recordD9CrossDisciplineObservation(r1, store, observer, { ...input, observationId: "missing", sourceAExactRevision: "rev-civil-2" })).toThrow(/SOURCE_REVISION_NOT_ON_MANIFEST/);
    expect(() => recordD9CrossDisciplineObservation(r1, store, observer, { ...input, observationId: "bad-fp", sourceAFingerprint: "deadbeef" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordD9CrossDisciplineObservation(r1, store, observer, { ...input, limitations: "survey control not closed only" })).toThrow(/SOURCE_LIMITATION_NOT_PRESERVED/);
    expect(() => recordD9CrossDisciplineObservation(r1, store, observer, { ...input, observationId: "therefore", observedStatement: "Therefore the design is incorrect." })).toThrow(/CONCLUSION_REJECTED/);
    expect(() => recordD9CrossDisciplineObservation(r1, store, observer, { ...input, observationId: "infer", inferFromName: true })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordD9CrossDisciplineObservation(r1, store, observer, { ...input, observationId: "conflict", detectConflict: true })).toThrow(/CONFLICT_DETECTION_REJECTED/);
    expect(() => recordD9CrossDisciplineObservation(r1, store, observer, { ...input, observationId: "units", convertUnits: true })).toThrow(/UNIT_CONVERSION_REJECTED/);
    expect(() => recordD9CrossDisciplineObservation(r1, store, observer, { ...input, limitations: `${input.limitations} extra` })).toThrow(/REPLAY_REJECTED/);
    expect(() => recordD9CrossDisciplineObservation(r1, store, observer, { ...input, observationId: "dup" })).toThrow(/DUPLICATE_OBSERVATION_REJECTED/);
    expect(() => recordD9CrossDisciplineObservation(r1, store, { ...observer, tenantId: "tenant-b" }, { ...input, observationId: "cross" })).toThrow(/SCOPE_REQUIRED|CROSS_SCOPE_REJECTED/);
    expect(() => recordD9CrossDisciplineObservation(r1, store, { ...observer, actorKind: "ai" }, { ...input, observationId: "ai" })).toThrow(/AI_NOT_D9_AUTHORITY/);
    expect(() => recordD9CrossDisciplineObservation(r1, store, { ...observer, authority: "ADMIN" }, { ...input, observationId: "admin" })).toThrow(/ADMIN_CANNOT_OVERRIDE/);
    expect(() => repointD9Observation()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => recomputeD9Observation()).toThrow(/AUTO_RECOMPUTE_REJECTED/);
    expect(() => mutateD9ObservationSource()).toThrow(/SOURCE_MUTATION_REJECTED/);
    expect(() => inferFromD9Observation()).toThrow(/INFERENCE_NOT_IN_R2/);
    expect(() => detectConflictFromObservation()).toThrow(/CONFLICT_DETECTION_REJECTED/);
    expect(() => confirmConflictFromObservation()).toThrow(/CONFLICT_CONFIRMATION_REJECTED/);
    expect(() => recommendFromObservation()).toThrow(/RECOMMENDATION_REJECTED/);
    expect(() => convertObservationUnits()).toThrow(/UNIT_CONVERSION_REJECTED/);
    expect(store.observations).toHaveLength(2);
    expect(store.observations[0]?.sourceA.exactRevision).toBe("rev-civil-1");
  });
});
