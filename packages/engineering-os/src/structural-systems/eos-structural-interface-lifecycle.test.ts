import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  createD1kR2Store,
  evaluateInterfaceCompatibility,
  reuseCompatibilityResult,
  type D1kR2Metadata,
  type D1kR2Requirement,
} from "./interface-compatibility";
import {
  D1K_R3_ACKNOWLEDGED_EQUALS_ENGINEERING_ACCEPTED,
  D1K_R3_ACKNOWLEDGED_EQUALS_ENGINEERING_APPROVED,
  D1K_R3_AI_CAN_APPROVE_ENGINEERING,
  D1K_R3_AI_CAN_APPROVE_INTERFACE,
  D1K_R3_AI_CAN_AUTO_RESOLVE_ENGINEERING_CONFLICT,
  D1K_R3_AI_CAN_INVENT_COUNTERPARTY_RESPONSE,
  D1K_R3_AI_CAN_INVENT_HUMAN_DISPOSITION,
  D1K_R3_AI_CAN_INVENT_SOURCE_CHANGE,
  D1K_R3_AI_CAN_PROMOTE_STATE_FROM_FREE_TEXT,
  D1K_R3_AUTOMATIC_ENGINEERING_CONFLICT_RESOLUTION_COUNT,
  D1K_R3_AXIS_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R3_CONFLICT_RESOLVED_EQUALS_CERTIFICATION_APPROVED,
  D1K_R3_CONFLICT_RESOLVED_EQUALS_STRUCTURAL_DESIGN_APPROVED,
  D1K_R3_COORDINATE_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R3_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT,
  D1K_R3_D2_D8_RUNTIME_COUNT,
  D1K_R3_D2_D8_RUNTIME_STARTED,
  D1K_R3_D9_RUNTIME_COUNT,
  D1K_R3_D9_RUNTIME_STARTED,
  D1K_R3_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1K_R3_INTERFACE_CLOSED_EQUALS_CERTIFIED,
  D1K_R3_INTERFACE_CLOSED_EQUALS_DESIGN_APPROVED,
  D1K_R3_INTERFACE_CLOSED_EQUALS_ENGINEERING_APPROVED,
  D1K_R3_INTERFACE_CONFLICT_EQUALS_STRUCTURAL_FAILURE,
  D1K_R3_MATURITY_STATE,
  D1K_R3_NEW_ENGINEERING_FORMULA_COUNT,
  D1K_R3_R2_RESULT_AUTO_CARRIED_TO_CHANGED_SOURCE,
  D1K_R3_SCHEMA_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R3_SIGN_TRANSFORMATION_RUNTIME_COUNT,
  D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED,
  D1K_R3_SOURCE_MUTATION_AUTHORIZED,
  D1K_R3_STATUS,
  D1K_R3_UNIT_CONVERSION_RUNTIME_COUNT,
  D1K_R4_CANONICAL_PHASE,
  D1K_R4_CANONICAL_SCOPE,
  D1K_R4_PHASE_TYPE,
  createD1kR3Store,
  deriveInterfaceGovernanceState,
  recordAuthorityConflict,
  recordConflictFromCompatibility,
  recordHumanDisposition,
  recordInterfaceAcknowledgement,
  recordInterfaceProvision,
  recordInterfaceRequest,
  recordInterfaceResponse,
  recordInterfaceSourceChange,
  type D1kR3Actor,
} from "./interface-handoff-governance";
import {
  createD1kR1Store,
  type D1kR1Actor,
  type D1kR1Catalog,
  type D1kR1CatalogSource,
  type D1kR1InterfaceInput,
  type D1kR1StructuralTarget,
  registerStructuralInterfaceIdentity,
} from "./interface-identity-foundation";

const here = dirname(fileURLToPath(import.meta.url));
const runtimePath = join(here, "interface-handoff-governance.ts");
const docPath = join(here, "../../../../docs/architecture/engineering-os/EOS_D1K_R3_HANDOFF_RESPONSE_CHANGE_CONFLICT_GOVERNANCE_CLOSEOUT.md");

function actor(overrides: Partial<D1kR3Actor> = {}): D1kR3Actor {
  return { actorId: "engineer-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: "HUMAN_ENGINEER", role: "STRUCTURAL_ENGINEER", ...overrides };
}

function target(): D1kR1StructuralTarget {
  return { kind: "MEMBER", id: "member-1", structuralSystemId: "system-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", revision: "sys-4" };
}

function source(overrides: Partial<D1kR1CatalogSource> = {}): D1kR1CatalogSource {
  return {
    sourceId: "src-civil-4",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
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

function catalog(): D1kR1Catalog {
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
    description: "Civil grade input",
    ...overrides,
  };
}

function meta(overrides: Partial<D1kR2Metadata> = {}): D1kR2Metadata {
  return { semanticId: "APPLIED_FORCE", schemaId: "D1K_INTERFACE_QUANTITY", schemaVersion: "1", quantity: "force", unit: "kN", coordinateSystem: "GLOBAL", axisConvention: "UX", signConvention: "FORCE_SIGN", ...overrides };
}

function requirement(overrides: Partial<D1kR2Requirement> = {}): D1kR2Requirement {
  return { ...meta(), requiredDimensions: ["SEMANTICS", "SCHEMA_VERSION", "UNITS", "COORDINATES", "AXIS_SIGN"], ...overrides };
}

function harness() {
  const interfaces = createD1kR1Store(catalog(), () => "2026-10-20T01:00:00.000Z");
  const record = registerStructuralInterfaceIdentity(interfaces, actor(), interfaceInput());
  return { interfaces, record, governance: createD1kR3Store(() => "2026-10-20T03:00:00.000Z"), compatibility: createD1kR2Store(() => "2026-10-20T02:00:00.000Z") };
}

describe("EOS-D1K-R3 handoff governance", () => {
  it("governs request, provision, acknowledgement, and pending response without approval", () => {
    const { interfaces, record, governance } = harness();
    const snapshot = JSON.parse(JSON.stringify(record));
    expect(() => recordInterfaceRequest(interfaces, governance, actor({ role: "REQUESTER" }), { eventId: "req-missing", interfaceId: "missing", requestedSemanticId: "SUPPORT_REACTION" })).toThrow("INTERFACE_NOT_FOUND");
    const request = recordInterfaceRequest(interfaces, governance, actor({ role: "REQUESTER" }), { eventId: "req-1", interfaceId: record.interfaceId, requestedSemanticId: "SUPPORT_REACTION" });
    const repeated = recordInterfaceRequest(interfaces, governance, actor({ role: "REQUESTER" }), { eventId: "req-1b", interfaceId: record.interfaceId, requestedSemanticId: "SUPPORT_REACTION" });
    expect(repeated.fingerprint).toBe(request.fingerprint);
    expect(governance.events).toHaveLength(1);
    expect(() => recordInterfaceProvision(interfaces, governance, actor({ role: "PROVIDER" }), { eventId: "prov-latest", interfaceId: record.interfaceId, sourceId: "latest", sourceFingerprint: record.sourceFingerprint })).toThrow("PROVISION_SOURCE_UNPINNED");
    const provision = recordInterfaceProvision(interfaces, governance, actor({ role: "PROVIDER" }), { eventId: "prov-1", interfaceId: record.interfaceId, sourceId: record.sourceId, sourceFingerprint: record.sourceFingerprint });
    expect(provision.sourceRevision).toBe("rev-4");
    expect(provision.sourceFingerprint).toBe(record.sourceFingerprint);
    expect(() => recordInterfaceAcknowledgement(interfaces, createD1kR3Store(() => "2026-10-20T03:00:00.000Z"), actor({ role: "REVIEWER" }), { eventId: "ack-early", interfaceId: record.interfaceId })).toThrow("ACKNOWLEDGEMENT_WITHOUT_SUBJECT");
    const acknowledgement = recordInterfaceAcknowledgement(interfaces, governance, actor({ role: "REVIEWER" }), { eventId: "ack-1", interfaceId: record.interfaceId });
    expect(acknowledgement.handoffState).toBe("ACKNOWLEDGED");
    expect(acknowledgement.engineeringApproval).toBe(false);
    expect(D1K_R3_ACKNOWLEDGED_EQUALS_ENGINEERING_ACCEPTED).toBe(false);
    expect(D1K_R3_ACKNOWLEDGED_EQUALS_ENGINEERING_APPROVED).toBe(false);
    const response = recordInterfaceResponse(interfaces, governance, actor({ role: "PROVIDER" }), { eventId: "resp-1", interfaceId: record.interfaceId, responseKind: "PENDING", comment: "This appears resolved" });
    const state = deriveInterfaceGovernanceState(interfaces, governance, actor(), record.interfaceId);
    expect(response.handoffState).toBe("RESPONSE_PENDING");
    expect(state.responsePending).toBe(true);
    expect(state.dispositionStatus).toBe("NONE");
    expect(state.engineeringApproval).toBe(false);
    expect(JSON.parse(JSON.stringify(record))).toEqual(snapshot);
    expect(() => recordInterfaceRequest(interfaces, governance, actor({ role: "REQUESTER" }), { eventId: "req-approve", interfaceId: record.interfaceId, requestedSemanticId: "SUPPORT_REACTION", engineeringApproval: true })).toThrow("DIRECT_STATE_INJECTION_REJECTED");
  });

  it("detects a source change, preserves history, and requires compatibility reevaluation", () => {
    const { interfaces, record, governance, compatibility } = harness();
    const prior = evaluateInterfaceCompatibility(interfaces, compatibility, actor(), { resultId: "result-1", interfaceId: record.interfaceId, sourceMetadata: meta(), receivingRequirement: requirement() });
    const priorFingerprint = prior.fingerprint;
    const changed = recordInterfaceSourceChange(interfaces, governance, actor({ role: "PROVIDER" }), {
      eventId: "change-1",
      predecessorInterfaceId: record.interfaceId,
      successor: interfaceInput({ interfaceId: "interface-2", sourceId: "src-civil-5" }),
    });
    expect(record.sourceId).toBe("src-civil-4");
    expect(record.sourceRevision).toBe("rev-4");
    expect(record.sourceFingerprint).not.toBe(changed.successor.sourceFingerprint);
    expect(changed.predecessor.recordStatus).toBe("SUPERSEDED");
    expect(changed.events[0]?.successorInterfaceId).toBe(changed.successor.interfaceId);
    expect(changed.events[1]?.predecessorInterfaceId).toBe(record.interfaceId);
    const stale = deriveInterfaceGovernanceState(interfaces, governance, actor(), record.interfaceId);
    const successor = deriveInterfaceGovernanceState(interfaces, governance, actor(), changed.successor.interfaceId);
    expect(stale.stale).toBe(true);
    expect(stale.handoffState).toBe("STALE_DEPENDENCY");
    expect(successor.reevaluationRequired).toBe(true);
    expect(successor.compatibilityFingerprint).toBeNull();
    expect(D1K_R3_R2_RESULT_AUTO_CARRIED_TO_CHANGED_SOURCE).toBe(false);
    expect(D1K_R3_SOURCE_MUTATION_AUTHORIZED).toBe(false);
    expect(D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED).toBe(false);
    expect(compatibility.results[0]?.fingerprint).toBe(priorFingerprint);
    expect(() => reuseCompatibilityResult(interfaces, compatibility, actor(), prior.resultId, changed.successor.interfaceId)).toThrow("COMPATIBILITY_REEVALUATION_REQUIRED");
    expect(() => recordInterfaceSourceChange(interfaces, governance, actor({ role: "PROVIDER" }), { eventId: "change-same", predecessorInterfaceId: changed.successor.interfaceId, successor: interfaceInput({ interfaceId: "interface-3", sourceId: "src-civil-5" }) })).toThrow("SOURCE_REVISION_UNCHANGED");
  });

  it("records conflicts and authorized dispositions without resolving engineering", () => {
    const { interfaces, record, governance, compatibility } = harness();
    const incompatible = evaluateInterfaceCompatibility(interfaces, compatibility, actor(), {
      resultId: "conflict-result",
      interfaceId: record.interfaceId,
      sourceMetadata: meta({ semanticId: "PRESSURE" }),
      receivingRequirement: requirement(),
    });
    const missing = evaluateInterfaceCompatibility(interfaces, compatibility, actor(), {
      resultId: "missing-result",
      interfaceId: record.interfaceId,
      sourceMetadata: meta({ quantity: null, unit: null }),
      receivingRequirement: requirement({ quantity: null, unit: null, requiredDimensions: ["UNITS"] }),
    });
    expect(missing.aggregateConclusion).toBe("MISSING");
    const conflict = recordConflictFromCompatibility(interfaces, governance, actor({ role: "REQUESTER" }), { eventId: "conflict-1", compatibility: incompatible });
    const missingConflict = recordConflictFromCompatibility(interfaces, governance, actor({ role: "REQUESTER" }), { eventId: "conflict-missing", compatibility: missing });
    const authorityConflict = recordAuthorityConflict(interfaces, governance, actor({ role: "REQUESTER" }), { eventId: "conflict-authority", interfaceId: record.interfaceId, claimedAuthority: "JUNIOR_REVIEWER" });
    expect(conflict.conflictPresent).toBe(true);
    expect(conflict.structuralFailure).toBe(false);
    expect(conflict.engineeringAuthority).toBe(false);
    expect(missingConflict.compatibilityFingerprint).toBe(missing.fingerprint);
    expect(authorityConflict.sourceAuthority).toBe("CIVIL_ENGINEER_OF_RECORD");
    expect(D1K_R3_INTERFACE_CONFLICT_EQUALS_STRUCTURAL_FAILURE).toBe(false);
    expect(() => recordHumanDisposition(interfaces, governance, actor({ role: "REVIEWER" }), { eventId: "disp-role", interfaceId: record.interfaceId, evidenceId: "decision-1", dispositionStatus: "RESOLVED_BY_EVIDENCE" })).toThrow("UNAUTHORIZED");
    expect(() => recordHumanDisposition(interfaces, governance, actor(), { eventId: "disp-empty", interfaceId: record.interfaceId, evidenceId: null, dispositionStatus: "RESOLVED_BY_EVIDENCE" })).toThrow("RESOLUTION_EVIDENCE_REQUIRED");
    const emptyStore = createD1kR3Store(() => "2026-10-20T03:00:00.000Z");
    expect(() => recordHumanDisposition(interfaces, emptyStore, actor(), { eventId: "disp-none", interfaceId: record.interfaceId, evidenceId: "decision-1", dispositionStatus: "RESOLVED_BY_EVIDENCE" })).toThrow("RESOLUTION_WITHOUT_CONFLICT");
    const recorded = recordHumanDisposition(interfaces, governance, actor(), { eventId: "disp-recorded", interfaceId: record.interfaceId, evidenceId: "decision-1", dispositionStatus: "RECORDED" });
    const resolved = recordHumanDisposition(interfaces, governance, actor(), { eventId: "disp-resolved", interfaceId: record.interfaceId, evidenceId: "decision-2", dispositionStatus: "RESOLVED_BY_EVIDENCE" });
    const state = deriveInterfaceGovernanceState(interfaces, governance, actor(), record.interfaceId);
    expect(recorded.dispositionStatus).toBe("RECORDED");
    expect(resolved.engineeringApproval).toBe(false);
    expect(resolved.designApproved).toBe(false);
    expect(resolved.certified).toBe(false);
    expect(state.dispositionStatus).toBe("RESOLVED_BY_EVIDENCE");
    expect(state.conflictPresent).toBe(false);
    expect(state.engineeringApproval).toBe(false);
    expect(governance.events.some((row) => row.eventType === "COMPATIBILITY_CONFLICT_RECORDED")).toBe(true);
    expect(governance.events[0]?.fingerprint).toBe(conflict.fingerprint);
    const again = deriveInterfaceGovernanceState(interfaces, governance, actor(), record.interfaceId);
    expect(again.eventFingerprints).toEqual(state.eventFingerprints);
    expect(() => recordInterfaceRequest(interfaces, governance, actor({ workspaceId: "workspace-b", role: "REQUESTER" }), { eventId: "req-scope", interfaceId: record.interfaceId, requestedSemanticId: "SUPPORT_REACTION" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordInterfaceResponse(interfaces, governance, actor({ authority: "AI_ASSISTANT", role: "PROVIDER" }), { eventId: "resp-ai", interfaceId: record.interfaceId, responseKind: "PENDING", comment: "This appears resolved" })).toThrow("UNAUTHORIZED");
  });

  it("keeps lifecycle governance inside the authorized boundary", () => {
    const runtime = readFileSync(runtimePath, "utf8");
    const doc = readFileSync(docPath, "utf8");
    expect(runtime.includes("from \"@rtb/engineering-review\"")).toBe(false);
    expect(runtime.includes("toForceN(")).toBe(false);
    expect(runtime.includes("resolveConflictAutomatically")).toBe(false);
    expect(doc.includes("```")).toBe(false);
    expect(scanAnalysisFormulaBypass(runtimePath, runtime)).toEqual([]);
    expect(scanAnalysisFormulaBypass(docPath, doc)).toEqual([]);
    expect(D1K_R3_STATUS).toBe("HANDOFF_GOVERNANCE_DEFINED");
    expect(D1K_R3_MATURITY_STATE).toBe("STRUCTURAL_INTERFACE_HANDOFF_RESPONSE_CHANGE_CONFLICT_GOVERNANCE_IMPLEMENTED");
    expect(D1K_R3_AUTOMATIC_ENGINEERING_CONFLICT_RESOLUTION_COUNT).toBe(0);
    expect(D1K_R3_SCHEMA_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R3_UNIT_CONVERSION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R3_COORDINATE_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R3_AXIS_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R3_SIGN_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R3_D2_D8_RUNTIME_STARTED).toBe(false);
    expect(D1K_R3_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1K_R3_D9_RUNTIME_STARTED).toBe(false);
    expect(D1K_R3_D9_RUNTIME_COUNT).toBe(0);
    expect(D1K_R3_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R3_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D1K_R3_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1K_R3_AI_CAN_INVENT_COUNTERPARTY_RESPONSE).toBe(false);
    expect(D1K_R3_AI_CAN_INVENT_SOURCE_CHANGE).toBe(false);
    expect(D1K_R3_AI_CAN_INVENT_HUMAN_DISPOSITION).toBe(false);
    expect(D1K_R3_AI_CAN_AUTO_RESOLVE_ENGINEERING_CONFLICT).toBe(false);
    expect(D1K_R3_AI_CAN_PROMOTE_STATE_FROM_FREE_TEXT).toBe(false);
    expect(D1K_R3_AI_CAN_APPROVE_INTERFACE).toBe(false);
    expect(D1K_R3_AI_CAN_APPROVE_ENGINEERING).toBe(false);
    expect(D1K_R3_CONFLICT_RESOLVED_EQUALS_STRUCTURAL_DESIGN_APPROVED).toBe(false);
    expect(D1K_R3_CONFLICT_RESOLVED_EQUALS_CERTIFICATION_APPROVED).toBe(false);
    expect(D1K_R3_INTERFACE_CLOSED_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(D1K_R3_INTERFACE_CLOSED_EQUALS_DESIGN_APPROVED).toBe(false);
    expect(D1K_R3_INTERFACE_CLOSED_EQUALS_CERTIFIED).toBe(false);
    expect(D1K_R4_CANONICAL_PHASE).toBe("EOS-D1K-R4-INTERNAL-EXTERNAL-REFERENCE-COMPOSITION");
    expect(D1K_R4_PHASE_TYPE).toBe("STRUCTURAL_INTERFACE_INTERNAL_EXTERNAL_REFERENCE_COMPOSITION");
    expect(D1K_R4_CANONICAL_SCOPE).toContain("Do not implement D2 through D8");
    const row = STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1K.R3.HANDOFF_RESPONSE_CHANGE_CONFLICT_GOVERNANCE");
    expect(row?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1K.STRUCTURAL_INTERFACE_RUNTIME")?.implementationState).toBe("NOT_IMPLEMENTED");
    expect(actor() satisfies D1kR1Actor).toBeTruthy();
  });
});
