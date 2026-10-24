import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D6_PROCESS_IDENTITY_RUNTIME_COUNT as ARCHITECTURE_IDENTITY_COUNT,
  D6_PROCESS_OBJECT_TYPES,
  D6_R1_STARTED,
  D6_RUNTIME_COUNT as ARCHITECTURE_D6_RUNTIME_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import {
  ADMIN_CAN_PROMOTE_UNGOVERNED_D6_IDENTITY_TO_ENGINEERING_TRUTH,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_IDENTITY,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D6_IDENTITY_AUTO_ACCEPTED,
  CROSS_TENANT_D6_R1_ACCESS_ALLOWED,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_REOPENED,
  D5_TRACK_COMPLETE,
  D6_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED,
  D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D6_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D6_CERTIFICATION_RUNTIME_COUNT,
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_CONTEXT_AUTHORITY,
  D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_COUNT,
  D6_DESIGN_CASE_IDENTITY_SUPPORTED,
  D6_DISCIPLINE,
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUIPMENT_DUTY_RUNTIME_COUNT,
  D6_EXPLICIT_LINEAGE_REQUIRED,
  D6_FREEFORM_AUTHORITATIVE_OBJECT_TYPES_ALLOWED,
  D6_HISTORICAL_REFERENCE_AUTO_REPOINT_ALLOWED,
  D6_INFERRED_LINEAGE_ALLOWED,
  D6_OPERATING_CASE_IDENTITY_SUPPORTED,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_EVIDENCE_RUNTIME_COUNT,
  D6_PROCESS_FLUID_IDENTITY_SUPPORTED,
  D6_PROCESS_IDENTITY_AUTO_MATURITY_PROGRESSION_ALLOWED,
  D6_PROCESS_IDENTITY_LIFECYCLE_GOVERNANCE_IMPLEMENTED,
  D6_PROCESS_IDENTITY_MATURITY_GOVERNANCE_IMPLEMENTED,
  D6_PROCESS_IDENTITY_RUNTIME_COUNT,
  D6_PROCESS_IDENTITY_RUNTIME_IMPLEMENTED,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_PROCESS_OBJECT_IDENTITY_IMPLEMENTED,
  D6_PROCESS_OBJECT_REVISION_IDENTITY_IMPLEMENTED,
  D6_PROCESS_PHASE_IDENTITY_SUPPORTED,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
  D6_PROCESS_SERVICE_IDENTITY_SUPPORTED,
  D6_PROCESS_STREAM_IDENTITY_SUPPORTED,
  D6_PROCESS_STREAM_REFERENCE_TRANSFERS_D5_AUTHORITY,
  D6_PROCESS_SYSTEM_IDENTITY_SUPPORTED,
  D6_R1_AUTO_REPOINTED,
  D6_R1_BLOCKER,
  D6_R1_CANONICAL_NEXT_PHASE,
  D6_R1_CANONICAL_NEXT_PHASE_SCOPE,
  D6_R1_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D6_R1_HISTORY_PRESERVED,
  D6_R1_MATURITY,
  D6_R1_NEXT_PHASE_TYPE,
  D6_R1_PROVENANCE_PRESERVED,
  D6_R1_PROVENANCE_REQUIRED,
  D6_R1_REPLAY_PROTECTION_IMPLEMENTED,
  D6_R1_SOURCE_BASIS_REQUIRED,
  D6_R1_SOURCE_BASIS_TRACEABLE,
  D6_R1_SPOOFING_PROTECTION_IMPLEMENTED,
  D6_R1_STATUS,
  D6_R2_STARTED,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REUSES_CANONICAL_IDENTITY_GOVERNANCE,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_COUNT,
  D6_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  DESIGN_CASE_IDENTITY_EQUALS_PROCESS_DESIGN_CONDITION,
  MATURITY_STATE_EQUALS_ENGINEERING_VALIDATED,
  NEW_DEPENDENCY_ADDED,
  OPERATING_CASE_IDENTITY_EQUALS_OPERATING_CONDITION,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  PARALLEL_D6_IDENTITY_SYSTEM_CREATED,
  PROCESS_DOCUMENT_IDENTITY_EQUALS_DOCUMENT_CONTENT_VALIDATED,
  PROCESS_EVIDENCE_IDENTITY_EQUALS_ENGINEERING_EVIDENCE_ACCEPTED,
  PROCESS_FLUID_IDENTITY_EQUALS_VALIDATED_COMPOSITION,
  PROCESS_OBJECT_EXISTENCE_EQUALS_ENGINEERING_VALIDATED,
  PROCESS_OBJECT_IDENTITY_EQUALS_PROCESS_ENGINEERING_CONTENT,
  PROCESS_OBJECT_IDENTITY_EQUALS_VALIDATED_PROCESS_DESIGN,
  PROCESS_PHASE_IDENTITY_EQUALS_VALIDATED_PHASE_BEHAVIOR,
  PROCESS_SERVICE_EQUALS_PIPING_SERVICE_CONTEXT,
  PROCESS_SERVICE_IDENTITY_EQUALS_PROCESS_SERVICE_ENGINEERING,
  PROCESS_STREAM_EQUALS_PIPING_LINE,
  PROCESS_STREAM_IDENTITY_EQUALS_PIPING_LINE_IDENTITY,
  PROCESS_STREAM_IDENTITY_EQUALS_PROCESS_STREAM_ENGINEERING,
  PROCESS_SYSTEM_IDENTITY_EQUALS_PROCESS_SYSTEM_DESIGN,
  PROCESS_SYSTEM_IDENTITY_EQUALS_VALIDATED_PROCESS_SYSTEM,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D6_R1_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D6_R1_SCOPE_ENFORCED,
  UNAUTHORIZED_D6_R2_R12_RUNTIME_PROMOTION,
  UNAUTHORIZED_PROCESS_TECHNICAL_CONTEXT_PROMOTION,
  advanceProcessMaturity,
  createD6R1Store,
  createPipingLineFromProcessStream,
  mutateProcessIdentity,
  recordProcessCalculation,
  recordProcessContext,
  recordProcessObjectIdentity,
  recordProcessTechnicalContext,
  repointProcessIdentity,
  validateProcessEngineering,
} from "./identity-foundation";

describe("EOS-D6-R1 Process identity and object foundation", () => {
  it("records governed Process identity without engineering content or a second runtime", () => {
    expect(D6_R1_STATUS).toBe("PROCESS_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED");
    expect(D6_R1_MATURITY).toBe(D6_R1_STATUS);
    expect(D6_RUNTIME_STARTED).toBe(true);
    expect(D6_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_D6_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_IDENTITY_COUNT).toBe(0);
    expect(D6_R1_STARTED).toBe(false);
    expect(D6_PROCESS_IDENTITY_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D6_PROCESS_IDENTITY_RUNTIME_READY).toBe(true);
    expect(D6_PROCESS_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(D6_CANONICAL_OBJECT_TAXONOMY_REUSED).toBe(true);
    expect(D6_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED).toBe(true);
    expect(D6_FREEFORM_AUTHORITATIVE_OBJECT_TYPES_ALLOWED).toBe(false);
    expect(D6_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED).toBe(false);
    expect(D6_PROCESS_OBJECT_TYPES).not.toContain("PROCESS_PHASE");
    expect(D6_PROCESS_OBJECT_TYPES).not.toContain("PIPING_LINE");
    expect(D6_PROCESS_OBJECT_IDENTITY_IMPLEMENTED).toBe(true);
    expect(D6_PROCESS_OBJECT_REVISION_IDENTITY_IMPLEMENTED).toBe(true);
    expect(PROCESS_OBJECT_IDENTITY_EQUALS_PROCESS_ENGINEERING_CONTENT).toBe(false);
    expect(PROCESS_OBJECT_EXISTENCE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(PROCESS_OBJECT_IDENTITY_EQUALS_VALIDATED_PROCESS_DESIGN).toBe(false);
    expect(D6_PROCESS_SYSTEM_IDENTITY_SUPPORTED).toBe(true);
    expect(PROCESS_SYSTEM_IDENTITY_EQUALS_PROCESS_SYSTEM_DESIGN).toBe(false);
    expect(PROCESS_SYSTEM_IDENTITY_EQUALS_VALIDATED_PROCESS_SYSTEM).toBe(false);
    expect(D6_PROCESS_STREAM_IDENTITY_SUPPORTED).toBe(true);
    expect(PROCESS_STREAM_IDENTITY_EQUALS_PROCESS_STREAM_ENGINEERING).toBe(false);
    expect(PROCESS_STREAM_IDENTITY_EQUALS_PIPING_LINE_IDENTITY).toBe(false);
    expect(PROCESS_STREAM_EQUALS_PIPING_LINE).toBe(false);
    expect(D6_PROCESS_STREAM_REFERENCE_TRANSFERS_D5_AUTHORITY).toBe(false);
    expect(D6_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D6_PROCESS_SERVICE_IDENTITY_SUPPORTED).toBe(true);
    expect(PROCESS_SERVICE_IDENTITY_EQUALS_PROCESS_SERVICE_ENGINEERING).toBe(false);
    expect(PROCESS_SERVICE_EQUALS_PIPING_SERVICE_CONTEXT).toBe(false);
    expect(D6_PROCESS_FLUID_IDENTITY_SUPPORTED).toBe(true);
    expect(D6_PROCESS_PHASE_IDENTITY_SUPPORTED).toBe(true);
    expect(PROCESS_FLUID_IDENTITY_EQUALS_VALIDATED_COMPOSITION).toBe(false);
    expect(PROCESS_PHASE_IDENTITY_EQUALS_VALIDATED_PHASE_BEHAVIOR).toBe(false);
    expect(D6_OPERATING_CASE_IDENTITY_SUPPORTED).toBe(true);
    expect(D6_DESIGN_CASE_IDENTITY_SUPPORTED).toBe(true);
    expect(OPERATING_CASE_IDENTITY_EQUALS_OPERATING_CONDITION).toBe(false);
    expect(DESIGN_CASE_IDENTITY_EQUALS_PROCESS_DESIGN_CONDITION).toBe(false);
    expect(PROCESS_DOCUMENT_IDENTITY_EQUALS_DOCUMENT_CONTENT_VALIDATED).toBe(false);
    expect(PROCESS_EVIDENCE_IDENTITY_EQUALS_ENGINEERING_EVIDENCE_ACCEPTED).toBe(false);
    expect(D6_REUSES_CANONICAL_IDENTITY_GOVERNANCE).toBe(true);
    expect(PARALLEL_D6_IDENTITY_SYSTEM_CREATED).toBe(false);
    expect(D6_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(D6_REUSES_CANONICAL_DIGITAL_THREAD).toBe(true);
    expect(D6_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D6_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D6_DIGITAL_THREAD_CREATED).toBe(false);
    expect(SECOND_D6_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D6_EXPLICIT_LINEAGE_REQUIRED).toBe(true);
    expect(D6_INFERRED_LINEAGE_ALLOWED).toBe(false);
    expect(D6_HISTORICAL_REFERENCE_AUTO_REPOINT_ALLOWED).toBe(false);
    expect(D6_PROCESS_IDENTITY_LIFECYCLE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D6_PROCESS_IDENTITY_MATURITY_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D6_PROCESS_IDENTITY_AUTO_MATURITY_PROGRESSION_ALLOWED).toBe(false);
    expect(MATURITY_STATE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D6_R1_PROVENANCE_REQUIRED).toBe(true);
    expect(D6_R1_PROVENANCE_PRESERVED).toBe(true);
    expect(D6_R1_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D6_R1_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D6_IDENTITY_AUTO_ACCEPTED).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D6_R1_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D6_R1_ACCESS_ALLOWED).toBe(false);
    expect(D6_R1_HISTORY_PRESERVED).toBe(true);
    expect(D6_R1_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D6_R1_MUTATION_ALLOWED).toBe(false);
    expect(AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_IDENTITY).toBe(false);
    expect(ADMIN_CAN_PROMOTE_UNGOVERNED_D6_IDENTITY_TO_ENGINEERING_TRUTH).toBe(false);
    expect(D6_R1_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D6_R1_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D6_R1_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
      D6_SYSTEM_STREAM_SERVICE_RUNTIME_COUNT,
      D6_DESIGN_BASIS_CONDITION_RUNTIME_COUNT,
      D6_PROCESS_EVIDENCE_RUNTIME_COUNT,
      D6_EQUIPMENT_DUTY_RUNTIME_COUNT,
      D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
      D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
      D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D6_REVIEW_VALIDATION_RUNTIME_COUNT,
      D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D6_D9_RUNTIME_INTEGRATION_COUNT,
      D6_PROCESS_CALCULATION_RUNTIME_COUNT,
      D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT,
      D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
      D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D6_CERTIFICATION_RUNTIME_COUNT,
      D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
    ]).toEqual(Array(18).fill(0));
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_REOPENED).toBe(false);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_REOPENED).toBe(false);
    expect(D4_TRACK_COMPLETE).toBe(true);
    expect(D4_REOPENED).toBe(false);
    expect(D5_TRACK_COMPLETE).toBe(true);
    expect(D5_REOPENED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(UNAUTHORIZED_D6_R2_R12_RUNTIME_PROMOTION).toBe(false);
    expect(UNAUTHORIZED_PROCESS_TECHNICAL_CONTEXT_PROMOTION).toBe(false);
    expect(D6_R2_STARTED).toBe(false);
    expect(D6_R1_CANONICAL_NEXT_PHASE).toBe("EOS-D6-R2-PROCESS-SYSTEM-STREAM-AND-SERVICE-CONTEXT");
    expect(D6_R1_NEXT_PHASE_TYPE).toBe("PROCESS_SYSTEM_STREAM_AND_SERVICE_CONTEXT");
    expect(D6_R1_CANONICAL_NEXT_PHASE_SCOPE).toContain("exact R1 identities");
    expect(D6_R1_BLOCKER).toBe("NONE");
    expect(D6_CONTEXT_AUTHORITY).toBe("PROCESS_CONTEXT_AUTHORITY");
    expect(D6_DISCIPLINE).toBe("PROCESS");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R1.PROCESS_IDENTITY_AND_OBJECT_FOUNDATION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R2.PROCESS_SYSTEM_STREAM_AND_SERVICE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const actor = { actorId: "proc-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D6_CONTEXT_AUTHORITY };
    const store = createD6R1Store();
    const context = recordProcessContext(store, actor, {
      contextId: "ctx-1",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-ctx-1",
      sourceBasisRef: "basis-ctx-1",
    });
    expect(context.processEngineeringAuthority).toBe(false);
    expect(context.engineeringValidated).toBe(false);
    expect(recordProcessContext(store, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx-1", sourceBasisRef: "basis-ctx-1" })).toBe(context);
    const system = recordProcessObjectIdentity(store, actor, {
      objectId: "sys-1",
      contextId: "ctx-1",
      objectType: "PROCESS_SYSTEM",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-sys-1",
      sourceBasisRef: "basis-sys-1",
      displayName: "Unit 100",
      projectTag: "SYS-100",
    });
    const stream = recordProcessObjectIdentity(store, actor, {
      objectId: "stream-1",
      contextId: "ctx-1",
      objectType: "PROCESS_STREAM",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-stream-1",
      sourceBasisRef: "basis-stream-1",
      parentObjectId: "sys-1",
    });
    const fluid = recordProcessObjectIdentity(store, actor, {
      objectId: "fluid-1",
      contextId: "ctx-1",
      objectType: "PROCESS_FLUID",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-fluid-1",
      sourceBasisRef: "basis-fluid-1",
      phaseClassification: "VAPOR",
    });
    expect(system.systemDesignEstablished).toBe(false);
    expect(stream.streamEngineeringEstablished).toBe(false);
    expect(stream.pipingLineCreated).toBe(false);
    expect(stream.relationships).toEqual([{ kind: "PARENT", targetObjectId: "sys-1" }]);
    expect(fluid.phaseClassification).toBe("VAPOR");
    expect(fluid.compositionValidated).toBe(false);
    expect(fluid.phaseBehaviorValidated).toBe(false);
    expect(fluid.fingerprint).toBe(fingerprintCanonical({
      objectId: "fluid-1",
      contextId: "ctx-1",
      objectType: "PROCESS_FLUID",
      tenantId: "t1",
      workspaceId: "w1",
      projectId: "p1",
      discipline: "PROCESS",
      citedLifecycleStage: "FEED",
      displayName: null,
      projectTag: null,
      phaseClassification: "VAPOR",
      parentObjectId: null,
      relationships: [],
      provenanceRef: "prov-fluid-1",
      sourceBasisRef: "basis-fluid-1",
      authority: D6_CONTEXT_AUTHORITY,
      predecessorObjectId: null,
    }));
    const revised = recordProcessObjectIdentity(store, actor, {
      objectId: "stream-1a",
      contextId: "ctx-1",
      objectType: "PROCESS_STREAM",
      citedLifecycleStage: "DETAILED_DESIGN",
      provenanceRef: "prov-stream-1a",
      sourceBasisRef: "basis-stream-1a",
      predecessorObjectId: "stream-1",
    });
    expect(revised.predecessorObjectId).toBe("stream-1");
    expect(store.objects.find((row) => row.objectId === "stream-1")?.currentness).toBe("SUPERSEDED");
    expect(store.objects.find((row) => row.objectId === "stream-1")?.fingerprint).toBe(stream.fingerprint);
    expect(store.history.some((row) => row.subjectId === "stream-1" && row.action === "SUPERSEDED" && row.fingerprint === stream.fingerprint)).toBe(true);
    const reject = (run: () => void) => expect(run).toThrow();
    reject(() => recordProcessObjectIdentity(store, actor, { objectId: "bad-type", contextId: "ctx-1", objectType: "PROCESS_PHASE", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: "b" }));
    reject(() => recordProcessObjectIdentity(store, actor, { objectId: "bad-line", contextId: "ctx-1", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: "b" }));
    reject(() => recordProcessObjectIdentity(store, actor, { objectId: "bad-free", contextId: "ctx-1", objectType: "FREEFORM", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: "b" }));
    reject(() => recordProcessObjectIdentity(store, actor, { objectId: "sys-1", contextId: "ctx-1", objectType: "PROCESS_SYSTEM", citedLifecycleStage: "FEED", provenanceRef: "other", sourceBasisRef: "other" }));
    reject(() => recordProcessObjectIdentity(store, actor, { objectId: "fluid-phase", contextId: "ctx-1", objectType: "PROCESS_SYSTEM", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: "b", phaseClassification: "VAPOR" }));
    reject(() => recordProcessObjectIdentity(store, actor, { objectId: "cond", contextId: "ctx-1", objectType: "PROCESS_OPERATING_CASE", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: "b", operatingCondition: true }));
    reject(() => recordProcessObjectIdentity(store, actor, { objectId: "duty", contextId: "ctx-1", objectType: "PROCESS_EQUIPMENT_DUTY", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: "b", equipmentDuty: true }));
    reject(() => recordProcessObjectIdentity(store, actor, { objectId: "line", contextId: "ctx-1", objectType: "PROCESS_STREAM", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: "b", createPipingLine: true }));
    reject(() => recordProcessObjectIdentity(store, actor, { objectId: "link", contextId: "ctx-1", objectType: "PROCESS_STREAM", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: "b", relationships: [{ kind: "MATCHING_TAG", targetObjectId: "sys-1" }] }));
    reject(() => recordProcessObjectIdentity(store, actor, { objectId: "latest", contextId: "ctx-1", objectType: "PROCESS_STREAM", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: "b" }));
    reject(() => recordProcessObjectIdentity(store, actor, { objectId: "nobasis", contextId: "ctx-1", objectType: "PROCESS_STREAM", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: " " }));
    reject(() => recordProcessObjectIdentity(store, { ...actor, tenantId: "t2" }, { objectId: "cross", contextId: "ctx-1", objectType: "PROCESS_STREAM", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: "b" }));
    reject(() => recordProcessObjectIdentity(store, { ...actor, actorId: "AI-1" }, { objectId: "ai", contextId: "ctx-1", objectType: "PROCESS_STREAM", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: "b" }));
    reject(() => recordProcessObjectIdentity(store, { ...actor, authority: "ADMIN" }, { objectId: "admin", contextId: "ctx-1", objectType: "PROCESS_STREAM", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: "b" }));
    reject(() => recordProcessObjectIdentity(store, actor, { objectId: "spoof", contextId: "ctx-1", objectType: "PROCESS_SERVICE", citedLifecycleStage: "FEED", provenanceRef: "p", sourceBasisRef: "b", assertedFingerprint: "not-the-fingerprint" }));
    expect(mutateProcessIdentity).toThrow();
    expect(repointProcessIdentity).toThrow();
    expect(advanceProcessMaturity).toThrow();
    expect(recordProcessTechnicalContext).toThrow();
    expect(recordProcessCalculation).toThrow();
    expect(createPipingLineFromProcessStream).toThrow();
    expect(validateProcessEngineering).toThrow();
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "identity-foundation.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "identity-foundation.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
