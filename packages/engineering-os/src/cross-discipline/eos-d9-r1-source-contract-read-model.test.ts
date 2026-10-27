import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D2_CONTEXT_AUTHORITY, D2_DISCIPLINE } from "../civil/identity-foundation";
import { D2_R11_STATUS } from "../civil/d9-source-contract";
import { D8_CONTEXT_AUTHORITY, D8_DISCIPLINE } from "../instrumentation-control/identity-foundation";
import { D8_R11_SOURCE_CONTRACT_VERSION } from "../instrumentation-control/d9-source-contract";
import { D6_CONTEXT_AUTHORITY, D6_DISCIPLINE } from "../process/identity-foundation";
import { D6_R11_STATUS } from "../process/d9-source-contract";
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
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1N_REOPENED, D2_REOPENED, D3_REOPENED, D4_REOPENED, D5_REOPENED } from "../process/process-bounded-closeout";
import { D6_REOPENED, D7_REOPENED, D8_REOPENED } from "@rtb/types";
import {
  ADMIN_CAN_BYPASS_SOURCE_DISCIPLINE_AUTHORITY,
  ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_D9_R1_AUTHORITATIVE_SOURCE_FACT,
  AI_EQUALS_D9_ENGINEERING_AUTHORITY,
  CROSS_TENANT_D9_R1_ACCESS_ALLOWED,
  CURRENT_SOURCE_RECORD_EQUALS_VALIDATED,
  D9_APPROVAL_RUNTIME_COUNT,
  D9_AUTO_VALIDATES_D1_STRUCTURAL,
  D9_AUTO_VALIDATES_D8_IAC,
  D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT,
  D9_BYPASSES_DISCIPLINE_SOURCE_CONTRACTS,
  D9_CANONICAL_MILESTONE_COUNT,
  D9_CANONICAL_PHASE_LIST,
  D9_CERTIFICATION_RUNTIME_COUNT,
  D9_CONFLICT_DETECTION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT,
  D9_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D9_ENGINEERING_DECISION_RUNTIME_COUNT,
  D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT,
  D9_R1_ARCHITECTURE_RUNTIME_REMAINS_ZERO,
  D9_R1_AUTO_CONVERTS_ENGINEERING_UNITS,
  D9_R1_AUTO_MUTATES_D1_STRUCTURAL,
  D9_R1_AUTO_MUTATES_D8_IAC,
  D9_R1_BLOCKER,
  D9_R1_CAN_EXPOSE_EXISTING_GOVERNED_RELATIONSHIPS,
  D9_R1_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS,
  D9_R1_CANONICAL_NEXT_PHASE,
  D9_R1_CANONICAL_NEXT_PHASE_SCOPE,
  D9_R1_CONFIRMS_ENGINEERING_CONFLICT,
  D9_R1_CREATES_CONFLICT_CANDIDATE,
  D9_R1_CREATES_NEW_ENGINEERING_DECISION,
  D9_R1_CREATES_NEW_ENGINEERING_FACT,
  D9_R1_CREATES_NEW_RECOMMENDATION,
  D9_R1_D1_SOURCE_CONTRACT_AVAILABLE,
  D9_R1_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D9_R1_EXACT_SOURCE_REVISION_REQUIRED,
  D9_R1_FINGERPRINT_MISMATCH_AUTO_REPAIRED,
  D9_R1_FINGERPRINT_VERIFICATION_SUPPORTED,
  D9_R1_FLOATING_SOURCE_REFERENCE_ALLOWED,
  D9_R1_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D9_R1_INFERS_MISSING_ENGINEERING_VALUE,
  D9_R1_INFERS_RELATIONSHIP_FROM_NAME,
  D9_R1_INFERRED_LINEAGE_ALLOWED,
  D9_R1_LIMITATIONS_PRESERVED,
  D9_R1_MACHINE_READABLE_ROADMAP_UPDATED,
  D9_R1_MATURITY,
  D9_R1_NORMALIZATION_CREATES_NEW_ENGINEERING_FACT,
  D9_R1_NORMALIZATION_PERFORMS_NUMERIC_DERIVATION,
  D9_R1_PERFORMS_CONFLICT_DETECTION,
  D9_R1_PERFORMS_CROSS_DISCIPLINE_INFERENCE,
  D9_R1_PERFORMS_CROSS_DISCIPLINE_OBSERVATION,
  D9_R1_PRESERVES_CLOSED_TRACKS,
  D9_R1_PRESERVES_D1_INCOMPLETE_STATUS,
  D9_R1_PRESERVES_SOURCE_DISCIPLINE,
  D9_R1_PRESERVES_SOURCE_IDENTITY,
  D9_R1_PROVENANCE_PRESERVED,
  D9_R1_RECORDER_AUTHORITY,
  D9_R1_REPLAY_PROTECTION_IMPLEMENTED,
  D9_R1_REUSES_CANONICAL_FINGERPRINT,
  D9_R1_SOURCE_AUTO_REPOINTED,
  D9_R1_SOURCE_BASIS_TRACEABLE,
  D9_R1_SOURCE_REVISION_MANIFEST_EXACT,
  D9_R1_SOURCE_UNITS_PRESERVED,
  D9_R1_SOURCE_VALUES_PRESERVED,
  D9_R1_SPOOFING_PROTECTION_IMPLEMENTED,
  D9_R1_STATUS,
  D9_R2_STARTED,
  D9_READ_ACCESS_EQUALS_D2_CIVIL_AUTHORITY,
  D9_READ_ACCESS_EQUALS_D6_PROCESS_AUTHORITY,
  D9_READ_ACCESS_EQUALS_D8_IAC_AUTHORITY,
  D9_RECOMMENDATION_RUNTIME_COUNT,
  D9_REVIEW_VALIDATION_RUNTIME_COUNT,
  D9_REUSES_CANONICAL_CURRENTNESS,
  D9_REUSES_CANONICAL_DIGITAL_THREAD,
  D9_REUSES_CANONICAL_FINGERPRINT,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_IMPLEMENTED,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY,
  D9_SOURCE_READ_MODEL_CAN_MUTATE_DISCIPLINE_STATE,
  D9_SOURCE_READ_MODEL_CAN_MUTATE_SOURCE_RECORD,
  D9_SOURCE_READ_MODEL_READ_ONLY,
  D9_TREATS_D1_STRUCTURAL_AS_COMPLETE,
  D9_USES_D1_D8_SOURCE_CONTRACTS,
  EOS_ALL_DISCIPLINES_COMPLETE,
  EOS_GA_READY,
  FINGERPRINT_MATCH_EQUALS_APPROVED,
  FINGERPRINT_MATCH_EQUALS_VALIDATED,
  PARALLEL_D9_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D9_DIGITAL_THREAD_CREATED,
  READ_MODEL_AGGREGATION_EQUALS_ENGINEERING_RELATIONSHIP,
  SECOND_D9_FINGERPRINT_ALGORITHM_CREATED,
  SECOND_D9_R1_FINGERPRINT_ALGORITHM_CREATED,
  STALE_SOURCE_RECORD_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D9_R1_SCOPE_ENFORCED,
  confirmD9Conflict,
  convertD9SourceUnits,
  createD9R1Store,
  detectD9Conflict,
  groupD9SourceEntryIds,
  inferAcrossDisciplines,
  mutateD9SourceEntry,
  observeAcrossDisciplines,
  readD9SourceManifest,
  recordD1IncompletePosture,
  recordD9SourceContractEntry,
  recommendFromD9ReadModel,
  repairD9SourceFingerprint,
  repointD9SourceEntry,
  type D9R1Actor,
  type D9R1SourceEntryInput,
} from "./source-contract-read-model";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const actor: D9R1Actor = { actorId: "reader-1", authority: D9_R1_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };

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

describe("EOS-D9-R1 source contract read model", () => {
  it("indexes one read-only runtime and preserves D1 through D8 boundaries", () => {
    expect(D9_R1_STATUS).toBe("SOURCE_CONTRACT_READ_MODEL_IMPLEMENTED");
    expect(D9_R1_MATURITY).toBe(D9_R1_STATUS);
    expect(D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_IMPLEMENTED && D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY).toBe(true);
    expect(D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT).toBe(1);
    expect(D9_RUNTIME_STARTED).toBe(true);
    expect(D9_RUNTIME_COUNT).toBe(1);
    expect(D9_R1_ARCHITECTURE_RUNTIME_REMAINS_ZERO).toBe(true);
    expect(D9_CANONICAL_MILESTONE_COUNT).toBe(9);
    expect(D9_CANONICAL_PHASE_LIST).toEqual([
      "EOS-D9-0-CROSS-DISCIPLINE-INTELLIGENCE-ARCHITECTURE-CANONICALIZATION",
      "EOS-D9-R1-SOURCE-CONTRACT-READ-MODEL",
      "EOS-D9-R2-CROSS-DISCIPLINE-OBSERVATION",
      "EOS-D9-R3-CONFLICT-CANDIDATE-DETECTION",
      "EOS-D9-R4-CONFLICT-GOVERNANCE-AND-ESCALATION",
      "EOS-D9-R5-RECOMMENDATION-SUPPORT",
      "EOS-D9-R6-CURRENTNESS-AND-DIGITAL-THREAD",
      "EOS-D9-R7-REVIEW-AND-VALIDATION-GOVERNANCE",
      "EOS-D9-R8-CROSS-DISCIPLINE-BOUNDED-CLOSEOUT",
    ]);
    expect(D9_SOURCE_READ_MODEL_READ_ONLY).toBe(true);
    expect(D9_SOURCE_READ_MODEL_CAN_MUTATE_SOURCE_RECORD || D9_SOURCE_READ_MODEL_CAN_MUTATE_DISCIPLINE_STATE || D9_BYPASSES_DISCIPLINE_SOURCE_CONTRACTS).toBe(false);
    expect(D9_USES_D1_D8_SOURCE_CONTRACTS && D9_R1_PRESERVES_D1_INCOMPLETE_STATUS && D9_R1_PRESERVES_SOURCE_DISCIPLINE && D9_R1_PRESERVES_SOURCE_IDENTITY).toBe(true);
    expect(D9_R1_D1_SOURCE_CONTRACT_AVAILABLE || D9_TREATS_D1_STRUCTURAL_AS_COMPLETE || D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D9_R1_EXACT_SOURCE_REVISION_REQUIRED && D9_R1_SOURCE_REVISION_MANIFEST_EXACT && D9_R1_PROVENANCE_PRESERVED && D9_R1_SOURCE_BASIS_TRACEABLE && D9_R1_LIMITATIONS_PRESERVED).toBe(true);
    expect(D9_R1_FLOATING_SOURCE_REFERENCE_ALLOWED || D9_R1_SOURCE_AUTO_REPOINTED || D9_R1_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS || D9_R1_INFERRED_LINEAGE_ALLOWED).toBe(false);
    expect(D9_READ_ACCESS_EQUALS_D2_CIVIL_AUTHORITY || D9_READ_ACCESS_EQUALS_D6_PROCESS_AUTHORITY || D9_READ_ACCESS_EQUALS_D8_IAC_AUTHORITY).toBe(false);
    expect(D9_R1_REUSES_CANONICAL_FINGERPRINT && D9_R1_FINGERPRINT_VERIFICATION_SUPPORTED && D9_REUSES_CANONICAL_CURRENTNESS && D9_REUSES_CANONICAL_DIGITAL_THREAD && D9_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D9_R1_FINGERPRINT_ALGORITHM_CREATED || SECOND_D9_FINGERPRINT_ALGORITHM_CREATED || PARALLEL_D9_CURRENTNESS_ENGINE_CREATED || PARALLEL_D9_DIGITAL_THREAD_CREATED).toBe(false);
    expect(CURRENT_SOURCE_RECORD_EQUALS_VALIDATED || STALE_SOURCE_RECORD_EQUALS_INVALID || FINGERPRINT_MATCH_EQUALS_VALIDATED || FINGERPRINT_MATCH_EQUALS_APPROVED).toBe(false);
    expect(D9_R1_FINGERPRINT_MISMATCH_AUTO_REPAIRED || D9_R1_HISTORICAL_REFERENCE_AUTO_REPOINTED || D9_R1_NORMALIZATION_CREATES_NEW_ENGINEERING_FACT || D9_R1_NORMALIZATION_PERFORMS_NUMERIC_DERIVATION).toBe(false);
    expect(D9_R1_SOURCE_UNITS_PRESERVED && D9_R1_SOURCE_VALUES_PRESERVED && D9_R1_CAN_EXPOSE_EXISTING_GOVERNED_RELATIONSHIPS).toBe(true);
    expect(D9_R1_AUTO_CONVERTS_ENGINEERING_UNITS || D9_R1_INFERS_MISSING_ENGINEERING_VALUE || D9_R1_INFERS_RELATIONSHIP_FROM_NAME || D9_R1_CREATES_NEW_ENGINEERING_FACT || D9_R1_CREATES_NEW_ENGINEERING_DECISION || D9_R1_CREATES_NEW_RECOMMENDATION).toBe(false);
    expect([D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT, D9_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D9_CONFLICT_DETECTION_RUNTIME_COUNT, D9_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT, D9_RECOMMENDATION_RUNTIME_COUNT, D9_ENGINEERING_DECISION_RUNTIME_COUNT, D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D9_APPROVAL_RUNTIME_COUNT, D9_CERTIFICATION_RUNTIME_COUNT, D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT, D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT, D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D9_REVIEW_VALIDATION_RUNTIME_COUNT]).toEqual(Array(15).fill(0));
    expect(D9_R1_PERFORMS_CROSS_DISCIPLINE_OBSERVATION || D9_R1_PERFORMS_CROSS_DISCIPLINE_INFERENCE || D9_R1_PERFORMS_CONFLICT_DETECTION || D9_R1_CREATES_CONFLICT_CANDIDATE || D9_R1_CONFIRMS_ENGINEERING_CONFLICT).toBe(false);
    expect(D9_AUTO_VALIDATES_D1_STRUCTURAL || D9_AUTO_VALIDATES_D8_IAC || D9_R1_AUTO_MUTATES_D1_STRUCTURAL || D9_R1_AUTO_MUTATES_D8_IAC).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D9_R1_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D9_R1_ACCESS_ALLOWED || AI_EQUALS_D9_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY || AI_CAN_INVENT_D9_R1_AUTHORITATIVE_SOURCE_FACT || ADMIN_CAN_BYPASS_SOURCE_DISCIPLINE_AUTHORITY).toBe(false);
    expect(D9_R1_DUPLICATE_GOVERNANCE_IMPLEMENTED && D9_R1_REPLAY_PROTECTION_IMPLEMENTED && D9_R1_SPOOFING_PROTECTION_IMPLEMENTED && D9_R1_PRESERVES_CLOSED_TRACKS).toBe(true);
    expect(D9_R2_STARTED).toBe(false);
    expect(D9_R1_CANONICAL_NEXT_PHASE).toBe("EOS-D9-R2-CROSS-DISCIPLINE-OBSERVATION");
    expect(D9_R1_CANONICAL_NEXT_PHASE_SCOPE).toContain("exact D9-R1 source revision manifest");
    expect(D1N_REOPENED || D2_REOPENED || D3_REOPENED || D4_REOPENED || D5_REOPENED || D6_REOPENED || D7_REOPENED || D8_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && D3_TRACK_COMPLETE && D4_TRACK_COMPLETE && D5_TRACK_COMPLETE && D6_TRACK_COMPLETE && D7_TRACK_COMPLETE && D8_TRACK_COMPLETE).toBe(true);
    expect(D6_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D7_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D8_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(EOS_ALL_DISCIPLINES_COMPLETE || EOS_GA_READY).toBe(false);
    expect(READ_MODEL_AGGREGATION_EQUALS_ENGINEERING_RELATIONSHIP).toBe(false);
    expect(D9_R1_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    expect(D9_R1_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R1.SOURCE_CONTRACT_READ_MODEL")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R2.CROSS_DISCIPLINE_OBSERVATION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "source-contract-read-model.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "source-contract-read-model.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });

  it("preserves exact source revisions and rejects inference, mutation, spoofing, and replay", () => {
    const store = createD9R1Store({ tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId });
    const source = entry();
    const before = JSON.stringify(source);
    const recorded = recordD9SourceContractEntry(store, actor, source);
    expect(JSON.stringify(source)).toBe(before);
    expect(recorded.exactRevision).toBe("rev-civil-1");
    expect(recorded.sourceDisciplineToken).toBe(D2_DISCIPLINE);
    expect(recorded.objectType).toBe("CIVIL_SURFACE");
    expect(recorded.currentness).toBe("STALE");
    expect(recorded.validated).toBe(false);
    expect(recorded.sourceValues).toEqual([{ quantityId: "pad-level", valueText: "12.5", unitText: "m" }]);
    expect(recorded.relationships[0]?.targetRevision).toBe("rev-process-1");
    expect(recorded.engineeringFact).toBe(false);
    expect(recordD9SourceContractEntry(store, actor, source)).toBe(recorded);
    expect(store.history).toHaveLength(1);
    const posture = recordD1IncompletePosture(store, actor);
    expect(posture.authoritative).toBe(false);
    expect(posture.packComplete).toBe(false);
    expect(posture.limitations).toContain("incomplete");
    const process = recordD9SourceContractEntry(store, actor, entry({
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
      lineage: [],
      relationships: [],
      sourceValues: [],
    }));
    expect(process.validated).toBe(false);
    expect(process.authority).toBe(D6_CONTEXT_AUTHORITY);
    const iac = recordD9SourceContractEntry(store, actor, entry({
      entryId: "entry-iac-1",
      sourceDiscipline: "D8_INSTRUMENTATION_CONTROL",
      sourceDisciplineToken: D8_DISCIPLINE,
      contractId: "iac-contract-1",
      contractVersion: D8_R11_SOURCE_CONTRACT_VERSION,
      objectId: "iac-object-1",
      objectType: "IAC_INSTRUMENT",
      exactRevision: "rev-iac-1",
      provenanceRef: "prov-iac-1",
      sourceBasisRef: "basis-iac-1",
      applicability: "loop 12",
      limitations: "not SIL verified",
      authority: D8_CONTEXT_AUTHORITY,
      lineage: [],
      relationships: [],
      sourceValues: [{ quantityId: "span", valueText: "100", unitText: "kPa" }],
    }));
    expect(iac.contractVersion).toBe("D8-D9-SOURCE-CONTRACT-1");
    expect(iac.sourceValues[0]?.unitText).toBe("kPa");
    const manifest = readD9SourceManifest(store, actor);
    expect(manifest.reasoningRecord).toBe(false);
    expect(manifest.entries.map((row) => row.exactRevision)).toEqual(["rev-civil-1", "rev-process-1", "rev-iac-1"]);
    expect(manifest.d1.sourceContractAvailable).toBe(false);
    expect(groupD9SourceEntryIds(store, actor).D2_CIVIL).toEqual(["entry-civil-1"]);
    expect(store.entries).toHaveLength(3);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ exactRevision: "current" }))).toThrow(/EXACT_REVISION_REQUIRED/);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ entryId: "entry-civil-2", assertedFingerprint: "not-the-fingerprint" }))).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ limitations: "changed limitation" }))).toThrow(/REPLAY_REJECTED/);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ entryId: "entry-civil-3" }))).toThrow(/DUPLICATE_SOURCE_ENTRY_REJECTED/);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ entryId: "spoof", sourceDisciplineToken: D6_DISCIPLINE }))).toThrow(/DISCIPLINE_SPOOF_REJECTED/);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ entryId: "strip", limitations: " " }))).toThrow(/LIMITATIONS_REQUIRED/);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ entryId: "infer", inferFromName: true }))).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ entryId: "rel", relationships: [{ relationshipId: "rel-x", sourceEndpointId: "a", sourceRevision: "r1", targetEndpointId: "b", targetRevision: "" }] }))).toThrow(/RELATIONSHIP_REVISION_REQUIRED/);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ entryId: "units", convertUnits: true }))).toThrow(/UNIT_CONVERSION_REJECTED/);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ entryId: "fill", fillMissing: true }))).toThrow(/VALUE_INFERENCE_REJECTED/);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ entryId: "fact", createFact: true }))).toThrow(/NEW_FACT_REJECTED/);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ entryId: "observe", observe: true }))).toThrow(/OBSERVATION_NOT_IN_R1/);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ entryId: "conflict", detectConflict: true }))).toThrow(/CONFLICT_DETECTION_REJECTED/);
    expect(() => recordD9SourceContractEntry(store, { ...actor, tenantId: "tenant-b" }, entry({ entryId: "cross" }))).toThrow(/CROSS_SCOPE_REJECTED/);
    expect(() => recordD9SourceContractEntry(store, { ...actor, authority: "ADMIN" }, entry({ entryId: "admin" }))).toThrow(/ADMIN_CANNOT_OVERRIDE/);
    expect(() => recordD9SourceContractEntry(store, { ...actor, actorKind: "ai" }, entry({ entryId: "ai" }))).toThrow(/AI_NOT_D9_AUTHORITY/);
    expect(() => recordD9SourceContractEntry(store, actor, entry({ entryId: "mutate", mutateSource: true }))).toThrow(/SOURCE_MUTATION_REJECTED/);
    expect(() => repointD9SourceEntry()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => mutateD9SourceEntry()).toThrow(/SOURCE_MUTATION_REJECTED/);
    expect(() => observeAcrossDisciplines()).toThrow(/OBSERVATION_NOT_IN_R1/);
    expect(() => inferAcrossDisciplines()).toThrow(/INFERENCE_NOT_IN_R1/);
    expect(() => detectD9Conflict()).toThrow(/CONFLICT_DETECTION_REJECTED/);
    expect(() => confirmD9Conflict()).toThrow(/CONFLICT_CONFIRMATION_REJECTED/);
    expect(() => recommendFromD9ReadModel()).toThrow(/RECOMMENDATION_REJECTED/);
    expect(() => convertD9SourceUnits()).toThrow(/UNIT_CONVERSION_REJECTED/);
    expect(() => repairD9SourceFingerprint()).toThrow(/FINGERPRINT_REBASELINE_REJECTED/);
    expect(store.entries).toHaveLength(3);
    expect(store.entries[0]?.exactRevision).toBe("rev-civil-1");
    expect(store.history[0]?.fingerprint).toBe(recorded.fingerprint);
  });
});
