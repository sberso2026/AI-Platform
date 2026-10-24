import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D1M_0_FORMAT_DISPOSITIONS, D1M_0_SUPPORTED_FORMATS, D1M_R1_CANONICAL_PHASE } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1M_R6_ADAPTER_BOUNDARY_RUNTIME_READY,
  D1M_R6_ADAPTER_CAN_SELF_PROMOTE,
  D1M_R6_ADAPTER_CONTRACT_RUNTIME_COUNT,
  D1M_R6_ADAPTER_CONTRACT_RUNTIME_IMPLEMENTED,
  D1M_R6_ADAPTER_IDENTITY_RUNTIME_COUNT,
  D1M_R6_ADAPTER_IDENTITY_RUNTIME_IMPLEMENTED,
  D1M_R6_ADMIN_EQUALS_ENGINEERING_AUTHORITY,
  D1M_R6_AI_CAN_BYPASS_UNSUPPORTED_FORMAT,
  D1M_R6_AI_CAN_DECLARE_FORMAT_SUPPORTED,
  D1M_R6_AI_CAN_DECLARE_PARSER_TRUSTED,
  D1M_R6_AI_CAN_INVENT_IDENTITY,
  D1M_R6_AI_CAN_INVENT_PROVENANCE,
  D1M_R6_AI_CAN_INVENT_VERSION,
  D1M_R6_AI_CAN_MARK_OUTPUT_VALIDATED,
  D1M_R6_AI_FORMAT_ADAPTER_RUNTIME_COUNT,
  D1M_R6_AI_PARSE_RUNTIME_COUNT,
  D1M_R6_API_AUTHENTICATED_EQUALS_ENGINEERING_APPROVED,
  D1M_R6_API_HIGHER_TRUST_THAN_FILE,
  D1M_R6_ARCHITECTURE_READY,
  D1M_R6_AUTHENTICATED_EQUALS_AUTHORIZED,
  D1M_R6_AUTHENTICATED_EQUALS_ENGINEERING_VALIDATED,
  D1M_R6_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY,
  D1M_R6_AUTHORITY_EQUALS_ENGINEERING_APPROVAL,
  D1M_R6_AUTHORITY_PRESERVED,
  D1M_R6_AXIS_INFERENCE_RUNTIME_COUNT,
  D1M_R6_AXIS_TRANSFORMATION_RUNTIME_COUNT,
  D1M_R6_BIM_AUTHORING_RUNTIME_COUNT,
  D1M_R6_CAD_AUTHORING_RUNTIME_COUNT,
  D1M_R6_CAN_BYPASS_R1,
  D1M_R6_CAN_BYPASS_R2,
  D1M_R6_CAN_BYPASS_R3,
  D1M_R6_CAN_BYPASS_R4,
  D1M_R6_CAN_BYPASS_R5,
  D1M_R6_CAN_SUBMIT_WITHOUT_PROVENANCE,
  D1M_R6_CANONICAL_DIGITAL_THREAD_REUSED,
  D1M_R6_CANONICAL_FINGERPRINT_REUSED,
  D1M_R6_CAPABILITY_AUTO_PROMOTED,
  D1M_R6_CAPABILITY_DECLARATION_RUNTIME_COUNT,
  D1M_R6_CAPABILITY_DECLARATION_RUNTIME_IMPLEMENTED,
  D1M_R6_CAPABILITY_HISTORY_PRESERVED,
  D1M_R6_CHANGE_GOVERNANCE_RUNTIME_READY,
  D1M_R6_CLASH_DETECTION_RUNTIME_COUNT,
  D1M_R6_CONNECTIVITY_INFERENCE_RUNTIME_COUNT,
  D1M_R6_CONNECTOR_RUNTIME_COUNT,
  D1M_R6_CONTRACT_AUTO_UPGRADED,
  D1M_R6_CONTRACT_FINGERPRINT_IMPLEMENTED,
  D1M_R6_CONTRACT_HISTORY_PRESERVED,
  D1M_R6_COORDINATE_TRANSFORMATION_RUNTIME_COUNT,
  D1M_R6_COORDINATION_RUNTIME_COUNT,
  D1M_R6_CROSS_PROJECT_ALLOWED,
  D1M_R6_CROSS_WORKSPACE_ALLOWED,
  D1M_R6_D1G_BLOCKER_PRESERVED,
  D1M_R6_D1K_GOVERNANCE_REUSED,
  D1M_R6_D1K_INTELLIGENCE_READY,
  D1M_R6_D1K_INTERNAL_INTEGRATION_READY,
  D1M_R6_D1K_LIMITATIONS_PRESERVED,
  D1M_R6_D1L_TRACK_COMPLETE,
  D1M_R6_D1L_TRACK_STATUS,
  D1M_R6_D1N_ABSORBED,
  D1M_R6_D1N_CURRENT_STATUS,
  D1M_R6_D1N_RUNTIME_COUNT,
  D1M_R6_D1N_RUNTIME_STARTED,
  D1M_R6_D2_D8_RUNTIME_COUNT,
  D1M_R6_D2_D8_RUNTIME_STARTED,
  D1M_R6_D9_ABSORBED,
  D1M_R6_D9_RUNTIME_COUNT,
  D1M_R6_D9_RUNTIME_STARTED,
  D1M_R6_DATABASE_SCHEMA_CHANGED,
  D1M_R6_DECLARED_CAPABILITY_EQUALS_SUPPORTED,
  D1M_R6_DECLARED_SOURCE_FORMAT_EQUALS_SUPPORTED,
  D1M_R6_DWG_RUNTIME_SUPPORTED,
  D1M_R6_DXF_RUNTIME_SUPPORTED,
  D1M_R6_DUPLICATE_SUBMISSION_GOVERNED,
  D1M_R6_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT,
  D1M_R6_EQUALS_D1L_CERTIFICATION_ELIGIBLE,
  D1M_R6_EXACT_ADAPTER_VERSION_REQUIRED,
  D1M_R6_FILE_API_DISTINCTION_IMPLEMENTED,
  D1M_R6_FILE_INGESTION_RUNTIME_COUNT,
  D1M_R6_FLOATING_ADAPTER_VERSION_ALLOWED,
  D1M_R6_FORMAT_ADAPTER_RUNTIME_COUNT,
  D1M_R6_FORMAT_ADAPTER_RUNTIME_READY,
  D1M_R6_FORMAT_DISPOSITIONS,
  D1M_R6_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1M_R6_GENERIC_FILE_INGESTION_RUNTIME_COUNT,
  D1M_R6_GEOMETRY_RELATIONSHIP_INFERENCE_RUNTIME_COUNT,
  D1M_R6_GEOMETRY_TRANSFORMATION_RUNTIME_COUNT,
  D1M_R6_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1M_R6_GLOBAL_DEPENDENCY_REASONING_RUNTIME_COUNT,
  D1M_R6_IFC_RUNTIME_SUPPORTED,
  D1M_R6_LOAD_PATH_INFERENCE_RUNTIME_COUNT,
  D1M_R6_MATURITY_STATE,
  D1M_R6_MODEL_CORRECTION_RUNTIME_COUNT,
  D1M_R6_MODEL_EVIDENCE_RUNTIME_READY,
  D1M_R6_NEW_DEPENDENCY_ADDED,
  D1M_R6_OBJECT_EXTRACTION_RUNTIME_COUNT,
  D1M_R6_OUTPUT_EQUALS_CERTIFIED,
  D1M_R6_OUTPUT_EQUALS_ENGINEERING_VALIDATED,
  D1M_R6_OUTPUT_EQUALS_INTERPRETATION_APPROVED,
  D1M_R6_PARALLEL_ARTIFACT_GOVERNANCE_CREATED,
  D1M_R6_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED,
  D1M_R6_PARALLEL_DIGITAL_THREAD_CREATED,
  D1M_R6_PARALLEL_EVIDENCE_ENGINE_CREATED,
  D1M_R6_PARALLEL_MAPPING_ENGINE_CREATED,
  D1M_R6_PARALLEL_REFERENCE_ENGINE_CREATED,
  D1M_R6_PARALLEL_RELATIONSHIP_ENGINE_CREATED,
  D1M_R6_PARSE_RUNTIME_COUNT,
  D1M_R6_PARSER_OUTPUT_EQUALS_VALIDATED_EVIDENCE,
  D1M_R6_PARSER_TRUST_SCORE_IMPLEMENTED,
  D1M_R6_PARSER_TRUSTED_EQUALS_ENGINEERING_VALIDATED,
  D1M_R6_PERMITTED_OPERATIONS,
  D1M_R6_PHASE,
  D1M_R6_POST_D1J_DEBT_PRESERVED,
  D1M_R6_PROVENANCE_PRESERVED,
  D1M_R6_R1_REUSED,
  D1M_R6_R2_REUSED,
  D1M_R6_R3_REUSED,
  D1M_R6_R4_REUSED,
  D1M_R6_R5_REUSED,
  D1M_R6_RVT_RUNTIME_SUPPORTED,
  D1M_R6_RUNTIME_COUNT,
  D1M_R6_RUNTIME_STARTED,
  D1M_R6_SCOPE,
  D1M_R6_SCOPE_ENFORCED,
  D1M_R6_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D1M_R6_SEMANTIC_RELATIONSHIP_INFERENCE_RUNTIME_COUNT,
  D1M_R6_SILENT_MUTATION_ALLOWED,
  D1M_R6_SOURCE_AUTHENTICATION_IMPLEMENTED,
  D1M_R6_SOURCE_REFERENCE_RUNTIME_READY,
  D1M_R6_SPOOFING_PROTECTION_IMPLEMENTED,
  D1M_R6_STATUS,
  D1M_R6_STRUCTURAL_INTERPRETATION_RUNTIME_READY,
  D1M_R6_STRUCTURAL_PACK_COMPLETE,
  D1M_R6_SUPPORTED_FORMAT_COUNT,
  D1M_R6_TEKLA_RUNTIME_SUPPORTED,
  D1M_R6_TOPOLOGY_INFERENCE_RUNTIME_COUNT,
  D1M_R6_TRANSITIVE_INFERENCE_RUNTIME_COUNT,
  D1M_R6_TRUST_POLICY_RUNTIME_COUNT,
  D1M_R6_TRUST_POLICY_RUNTIME_IMPLEMENTED,
  D1M_R6_UNAUTHORIZED_PRODUCT_CLAIM,
  D1M_R6_UNIT_CONVERSION_RUNTIME_COUNT,
  D1M_R6_UNKNOWN_FORMAT_DEFAULTS_SUPPORTED,
  D1M_R6_UNSUPPORTED_FORMAT_AUTO_ACCEPTED,
  D1M_R6_URL_FETCH_RUNTIME_COUNT,
  D1M_R6_VENDOR_CONNECTOR_RUNTIME_COUNT,
  D1M_R7_CANONICAL_PHASE,
  D1M_R7_CANONICAL_SCOPE,
  D1M_R7_PHASE_TYPE,
  adaptCadBimFormat,
  authorBimModel,
  authorCadModel,
  connectCadBimVendor,
  convertAdapterUnits,
  coordinateMultidisciplinaryBim,
  correctCadBimModel,
  createD1mR6Store,
  declareFormatCapability,
  detectCadBimClash,
  detectGlobalCycle,
  extractCadBimObjects,
  fetchExternalUrl,
  inferAdapterAxis,
  inferAdapterRelationship,
  inferLoadPath,
  inferModelTopology,
  inferStructuralConnectivity,
  ingestCadBimFile,
  interpretCadBimEngineeringProperties,
  mutateAdapterContract,
  parseByAi,
  parseCadBimArtifact,
  promoteFormatSupport,
  reasonGlobalModelDependency,
  recordAdapterContract,
  recordAdapterIdentity,
  submitAdapterEvidence,
  transformAdapterCoordinates,
  transformAdapterGeometry,
  upgradeAdapterContract,
  type D1mR6Actor,
} from "./cad-bim-adapter-boundary";
import { D1M_R6_CANONICAL_PHASE, D1M_R6_CANONICAL_SCOPE } from "./cad-bim-model-relationship";
import { scanAnalysisFormulaBypass } from "./formula-scan";

const now = () => "2026-10-22T00:00:00.000Z";
function actor(overrides: Partial<D1mR6Actor> = {}): D1mR6Actor {
  return { actorId: "recorder-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: "INTERFACE_RECORD_AUTHORITY", ...overrides };
}
function identity(store = createD1mR6Store(now)) {
  const recorded = recordAdapterIdentity(store, actor(), {
    adapterId: "adapter-1", adapterVersion: "1.0.0", boundaryClass: "FILE_SOURCE_BOUNDARY",
    sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE", owningModule: "packages/engineering-os/src/structural-systems/cad-bim-adapter-boundary.ts", provenanceRef: "prov-adapter-1",
  });
  return { store, recorded };
}

describe("EOS-D1M-R6 file and API adapter boundary", () => {
  it("records an exact adapter identity and contract without treating either as format support", () => {
    const { store, recorded } = identity();
    const repeated = recordAdapterIdentity(store, actor(), {
      adapterId: "adapter-1", adapterVersion: "1.0.0", boundaryClass: "FILE_SOURCE_BOUNDARY",
      sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE", owningModule: recorded.owningModule, provenanceRef: "prov-adapter-1", displayName: "IFC reader",
    });
    expect(recorded).toBe(repeated);
    expect(recorded.formatSupported).toBe(false);
    expect(recorded.adapterVersion).toBe("1.0.0");
    expect(() => recordAdapterIdentity(store, actor(), { ...{ adapterId: "adapter-2", adapterVersion: "latest", boundaryClass: "FILE_SOURCE_BOUNDARY", sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE", owningModule: recorded.owningModule, provenanceRef: "prov-2" } })).toThrow("FLOATING_ADAPTER_VERSION_REJECTED");
    const contract = recordAdapterContract(store, actor(), {
      contractId: "contract-1", adapterId: "adapter-1", contractVersion: "1", permittedOperation: D1M_R1_CANONICAL_PHASE, parserTrust: "UNTRUSTED", provenanceRef: "prov-contract-1",
    });
    const replay = recordAdapterContract(store, actor(), {
      contractId: "contract-1", adapterId: "adapter-1", contractVersion: "1", permittedOperation: D1M_R1_CANONICAL_PHASE, parserTrust: "UNTRUSTED", provenanceRef: "prov-contract-1",
    });
    expect(replay).toBe(contract);
    expect(contract.contractFingerprint).toBe(fingerprintCanonical({
      contractId: "contract-1", adapterId: "adapter-1", adapterVersion: "1.0.0", contractVersion: "1", boundaryClass: "FILE_SOURCE_BOUNDARY",
      permittedOperation: D1M_R1_CANONICAL_PHASE, parserTrust: "UNTRUSTED", provenanceRef: "prov-contract-1",
      tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", predecessorContractId: null,
    }));
    expect(contract.formatSupported).toBe(false);
    expect(contract.engineeringValidated).toBe(false);
    expect(contract.apiHigherTrustThanFile).toBe(false);
    expect(contract.parserTrust).toBe("UNTRUSTED");
    expect(() => recordAdapterContract(store, actor(), { contractId: "contract-score", adapterId: "adapter-1", contractVersion: "1", permittedOperation: D1M_R1_CANONICAL_PHASE, parserTrust: "UNTRUSTED", provenanceRef: "prov-score", trustScore: 0.9 })).toThrow("PARSER_TRUST_SCORE_REJECTED");
    expect(() => recordAdapterContract(store, actor(), { contractId: "contract-trust", adapterId: "adapter-1", contractVersion: "2", permittedOperation: D1M_R1_CANONICAL_PHASE, parserTrust: "TRUSTED", provenanceRef: "prov-trust" })).toThrow("PARSER_TRUST_UNSUPPORTED");
    expect(() => upgradeAdapterContract()).toThrow("ADAPTER_AUTO_UPGRADE_REJECTED");
    expect(() => mutateAdapterContract()).toThrow("SILENT_ADAPTER_MUTATION_REJECTED");
    const successor = recordAdapterContract(store, actor(), { contractId: "contract-2", adapterId: "adapter-1", contractVersion: "2", permittedOperation: D1M_R1_CANONICAL_PHASE, parserTrust: "ISOLATED", provenanceRef: "prov-contract-2", predecessorContractId: "contract-1" });
    expect(contract.recordStatus).toBe("SUPERSEDED");
    expect(successor.parserTrust).toBe("ISOLATED");
    expect(store.history.map((row) => row.action)).toEqual(["CREATED", "CREATED", "SUPERSEDED", "CREATED"]);
    expect(D1M_R6_PHASE).toBe(D1M_R6_CANONICAL_PHASE);
    expect(D1M_R6_SCOPE).toBe(D1M_R6_CANONICAL_SCOPE);
    expect(D1M_R6_STATUS).toBe("ADAPTER_BOUNDARY_IMPLEMENTED");
    expect(D1M_R6_MATURITY_STATE).toBe("STRUCTURAL_CAD_OR_BIM_FILE_API_ADAPTER_BOUNDARY_IMPLEMENTED");
    expect(D1M_R6_ARCHITECTURE_READY).toBe(true);
    expect(D1M_R6_SOURCE_REFERENCE_RUNTIME_READY).toBe(true);
    expect(D1M_R6_MODEL_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(D1M_R6_ADAPTER_BOUNDARY_RUNTIME_READY).toBe(true);
    expect(D1M_R6_FORMAT_ADAPTER_RUNTIME_READY).toBe(false);
    expect(D1M_R6_STRUCTURAL_INTERPRETATION_RUNTIME_READY).toBe(false);
    expect(D1M_R6_CHANGE_GOVERNANCE_RUNTIME_READY).toBe(false);
    expect(D1M_R6_ADAPTER_IDENTITY_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1M_R6_ADAPTER_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(D1M_R6_EXACT_ADAPTER_VERSION_REQUIRED).toBe(true);
    expect(D1M_R6_FLOATING_ADAPTER_VERSION_ALLOWED).toBe(false);
    expect(D1M_R6_ADAPTER_CONTRACT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1M_R6_ADAPTER_CONTRACT_RUNTIME_COUNT).toBe(1);
    expect(D1M_R6_CONTRACT_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(D1M_R6_CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D1M_R6_SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1M_R6_CONTRACT_HISTORY_PRESERVED).toBe(true);
    expect(D1M_R6_SILENT_MUTATION_ALLOWED).toBe(false);
    expect(D1M_R6_CONTRACT_AUTO_UPGRADED).toBe(false);
    expect(D1M_R6_PARSER_TRUST_SCORE_IMPLEMENTED).toBe(false);
    expect(D1M_R6_PARSER_TRUSTED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R6_PARSER_OUTPUT_EQUALS_VALIDATED_EVIDENCE).toBe(false);
    expect(D1M_R6_TRUST_POLICY_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1M_R6_TRUST_POLICY_RUNTIME_COUNT).toBe(1);
    expect(D1M_R6_RUNTIME_STARTED).toBe(true);
    expect(D1M_R6_RUNTIME_COUNT).toBe(6);
  });

  it("declares capability without support and rejects unknown or self-promoted formats", () => {
    const { store } = identity();
    recordAdapterContract(store, actor(), { contractId: "contract-1", adapterId: "adapter-1", contractVersion: "1", permittedOperation: D1M_R1_CANONICAL_PHASE, parserTrust: "UNAVAILABLE", provenanceRef: "prov-contract-1" });
    const capability = declareFormatCapability(store, actor(), { capabilityId: "cap-ifc", contractId: "contract-1", formatToken: "IFC", disposition: "CANDIDATE_FUTURE_ADAPTER", provenanceRef: "prov-cap-1" });
    expect(capability.formatSupported).toBe(false);
    expect(capability.disposition).toBe("CANDIDATE_FUTURE_ADAPTER");
    expect(D1M_R6_FORMAT_DISPOSITIONS).toBe(D1M_0_FORMAT_DISPOSITIONS);
    expect(D1M_R6_SUPPORTED_FORMAT_COUNT).toBe(D1M_0_SUPPORTED_FORMATS.length);
    expect(D1M_R6_SUPPORTED_FORMAT_COUNT).toBe(0);
    const unsupported = declareFormatCapability(store, actor(), { capabilityId: "cap-rvt", contractId: "contract-1", formatToken: "RVT", disposition: "UNSUPPORTED_IN_D1M_0", provenanceRef: "prov-cap-rvt" });
    expect(unsupported.formatSupported).toBe(false);
    expect(() => declareFormatCapability(store, actor(), { capabilityId: "cap-step", contractId: "contract-1", formatToken: "STEP", disposition: "CANDIDATE_FUTURE_ADAPTER", provenanceRef: "prov-step" })).toThrow("UNKNOWN_FORMAT_NOT_SUPPORTED");
    expect(() => declareFormatCapability(store, actor(), { capabilityId: "cap-promote", contractId: "contract-1", formatToken: "IFC", disposition: "SUPPORTED", provenanceRef: "prov-promote", formatSupported: true })).toThrow("ADAPTER_SELF_PROMOTION_REJECTED");
    expect(() => declareFormatCapability(store, actor(), { capabilityId: "cap-swap", contractId: "contract-1", formatToken: "DWG", disposition: "CANDIDATE_FUTURE_ADAPTER", provenanceRef: "prov-swap" })).toThrow("CAPABILITY_SUBSTITUTION_REJECTED");
    expect(() => promoteFormatSupport()).toThrow("ADAPTER_SELF_PROMOTION_REJECTED");
    expect(D1M_R6_CAPABILITY_DECLARATION_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1M_R6_CAPABILITY_DECLARATION_RUNTIME_COUNT).toBe(1);
    expect(D1M_R6_DECLARED_CAPABILITY_EQUALS_SUPPORTED).toBe(false);
    expect(D1M_R6_DECLARED_SOURCE_FORMAT_EQUALS_SUPPORTED).toBe(false);
    expect(D1M_R6_UNSUPPORTED_FORMAT_AUTO_ACCEPTED).toBe(false);
    expect(D1M_R6_UNKNOWN_FORMAT_DEFAULTS_SUPPORTED).toBe(false);
    expect(D1M_R6_ADAPTER_CAN_SELF_PROMOTE).toBe(false);
    expect(D1M_R6_CAPABILITY_AUTO_PROMOTED).toBe(false);
    expect(D1M_R6_CAPABILITY_HISTORY_PRESERVED).toBe(true);
    expect(D1M_R6_IFC_RUNTIME_SUPPORTED).toBe(false);
    expect(D1M_R6_RVT_RUNTIME_SUPPORTED).toBe(false);
    expect(D1M_R6_DWG_RUNTIME_SUPPORTED).toBe(false);
    expect(D1M_R6_DXF_RUNTIME_SUPPORTED).toBe(false);
    expect(D1M_R6_TEKLA_RUNTIME_SUPPORTED).toBe(false);
    expect(D1M_R6_FORMAT_ADAPTER_RUNTIME_COUNT).toBe(0);
  });

  it("admits a submission only as a governed envelope and does not execute R1 through R5", () => {
    const { store } = identity();
    recordAdapterIdentity(store, actor(), { adapterId: "adapter-api", adapterVersion: "1.0.0", boundaryClass: "API_SOURCE_BOUNDARY", sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE", owningModule: "boundary", provenanceRef: "prov-api" });
    const file = recordAdapterContract(store, actor(), { contractId: "contract-file", adapterId: "adapter-1", contractVersion: "1", permittedOperation: D1M_R1_CANONICAL_PHASE, parserTrust: "UNTRUSTED", provenanceRef: "prov-file" });
    const api = recordAdapterContract(store, actor(), { contractId: "contract-api", adapterId: "adapter-api", contractVersion: "1", permittedOperation: D1M_R6_PERMITTED_OPERATIONS[1], parserTrust: "ISOLATED", provenanceRef: "prov-api-contract" });
    expect(file.boundaryClass).toBe("FILE_SOURCE_BOUNDARY");
    expect(api.boundaryClass).toBe("API_SOURCE_BOUNDARY");
    expect(file.apiHigherTrustThanFile).toBe(false);
    expect(api.apiHigherTrustThanFile).toBe(false);
    declareFormatCapability(store, actor(), { capabilityId: "cap-ifc", contractId: "contract-file", formatToken: "IFC", disposition: "CANDIDATE_FUTURE_ADAPTER", provenanceRef: "prov-cap" });
    const submission = submitAdapterEvidence(store, actor(), {
      submissionId: "sub-1", contractId: "contract-file", capabilityId: "cap-ifc", authenticatorId: "auth-1", authenticated: true,
      declaredSourceFormat: "IFC", evidenceFingerprint: "fp-ev-1", intendedOperation: D1M_R1_CANONICAL_PHASE, locator: "source-key:artifact-1", provenanceRef: "prov-sub-1",
    });
    expect(submission.executionPerformed).toBe(false);
    expect(submission.formatSupported).toBe(false);
    expect(submission.declaredSourceFormatEqualsSupported).toBe(false);
    expect(submission.sourceAuthorized).toBe(false);
    expect(submission.engineeringValidated).toBe(false);
    expect(submission.engineeringApproved).toBe(false);
    expect(submission.authenticated).toBe(true);
    expect(submitAdapterEvidence(store, actor(), { submissionId: "sub-1", contractId: "contract-file", capabilityId: "cap-ifc", authenticatorId: "auth-1", authenticated: true, declaredSourceFormat: "IFC", evidenceFingerprint: "fp-ev-1", intendedOperation: D1M_R1_CANONICAL_PHASE, locator: "source-key:artifact-1", provenanceRef: "prov-sub-1" })).toBe(submission);
    expect(() => submitAdapterEvidence(store, actor(), { submissionId: "sub-2", contractId: "contract-file", capabilityId: "cap-ifc", authenticatorId: "auth-1", authenticated: true, evidenceFingerprint: "fp-ev-1", intendedOperation: D1M_R1_CANONICAL_PHASE, locator: "source-key:artifact-1", provenanceRef: "prov-sub-2" })).toThrow("DUPLICATE_SUBMISSION_REJECTED");
    expect(() => submitAdapterEvidence(store, actor(), { submissionId: "sub-exec", contractId: "contract-file", capabilityId: "cap-ifc", authenticatorId: "auth-1", authenticated: true, evidenceFingerprint: "fp-ev-2", intendedOperation: D1M_R1_CANONICAL_PHASE, locator: "source-key:artifact-2", provenanceRef: "prov-exec", execute: true })).toThrow("ADAPTER_GOVERNANCE_BYPASS_REJECTED");
    expect(() => submitAdapterEvidence(store, actor(), { submissionId: "sub-authz", contractId: "contract-file", capabilityId: "cap-ifc", authenticatorId: "auth-1", authenticated: true, sourceAuthorized: true, evidenceFingerprint: "fp-ev-3", intendedOperation: D1M_R1_CANONICAL_PHASE, locator: "source-key:artifact-3", provenanceRef: "prov-authz" })).toThrow("AUTHENTICATION_NOT_AUTHORIZATION");
    expect(() => submitAdapterEvidence(store, actor(), { submissionId: "sub-op", contractId: "contract-file", capabilityId: "cap-ifc", authenticatorId: "auth-1", authenticated: true, evidenceFingerprint: "fp-ev-4", intendedOperation: D1M_R6_PERMITTED_OPERATIONS[2], locator: "source-key:artifact-4", provenanceRef: "prov-op" })).toThrow("CONTRACT_SUBSTITUTION_REJECTED");
    expect(() => submitAdapterEvidence(store, actor(), { submissionId: "sub-url", contractId: "contract-file", capabilityId: "cap-ifc", authenticatorId: "auth-1", authenticated: true, evidenceFingerprint: "fp-ev-5", intendedOperation: D1M_R1_CANONICAL_PHASE, locator: "https://example.invalid/model.ifc", provenanceRef: "prov-url", fetchUrl: true })).toThrow("ARBITRARY_URL_FETCH_REJECTED");
    expect(() => submitAdapterEvidence(store, actor(), { submissionId: "sub-path", contractId: "contract-file", capabilityId: "cap-ifc", authenticatorId: "auth-1", authenticated: true, evidenceFingerprint: "fp-ev-6", intendedOperation: D1M_R1_CANONICAL_PHASE, locator: "../secrets/model.ifc", provenanceRef: "prov-path" })).toThrow("UNSAFE_LOCATOR_REJECTED");
    expect(() => submitAdapterEvidence(store, actor(), { submissionId: "sub-bare", contractId: "contract-file", capabilityId: "cap-ifc", authenticatorId: "auth-1", authenticated: true, evidenceFingerprint: "fp-ev-7", intendedOperation: D1M_R1_CANONICAL_PHASE, locator: "source-key:artifact-7", provenanceRef: "" })).toThrow("MISSING_ADAPTER_PROVENANCE");
    expect(D1M_R6_PERMITTED_OPERATIONS).toContain(D1M_R1_CANONICAL_PHASE);
    expect(D1M_R6_FILE_API_DISTINCTION_IMPLEMENTED).toBe(true);
    expect(D1M_R6_SOURCE_AUTHENTICATION_IMPLEMENTED).toBe(true);
    expect(D1M_R6_AUTHENTICATED_EQUALS_AUTHORIZED).toBe(false);
    expect(D1M_R6_AUTHENTICATED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R6_API_AUTHENTICATED_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(D1M_R6_API_HIGHER_TRUST_THAN_FILE).toBe(false);
    expect(D1M_R6_R1_REUSED).toBe(true);
    expect(D1M_R6_R2_REUSED).toBe(true);
    expect(D1M_R6_R3_REUSED).toBe(true);
    expect(D1M_R6_R4_REUSED).toBe(true);
    expect(D1M_R6_R5_REUSED).toBe(true);
    expect(D1M_R6_PARALLEL_ARTIFACT_GOVERNANCE_CREATED).toBe(false);
    expect(D1M_R6_PARALLEL_MAPPING_ENGINE_CREATED).toBe(false);
    expect(D1M_R6_PARALLEL_EVIDENCE_ENGINE_CREATED).toBe(false);
    expect(D1M_R6_PARALLEL_REFERENCE_ENGINE_CREATED).toBe(false);
    expect(D1M_R6_PARALLEL_RELATIONSHIP_ENGINE_CREATED).toBe(false);
    expect(D1M_R6_CAN_BYPASS_R1).toBe(false);
    expect(D1M_R6_CAN_BYPASS_R2).toBe(false);
    expect(D1M_R6_CAN_BYPASS_R3).toBe(false);
    expect(D1M_R6_CAN_BYPASS_R4).toBe(false);
    expect(D1M_R6_CAN_BYPASS_R5).toBe(false);
    expect(D1M_R6_OUTPUT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R6_OUTPUT_EQUALS_INTERPRETATION_APPROVED).toBe(false);
    expect(D1M_R6_OUTPUT_EQUALS_CERTIFIED).toBe(false);
    expect(D1M_R6_CAN_SUBMIT_WITHOUT_PROVENANCE).toBe(false);
    expect(D1M_R6_DUPLICATE_SUBMISSION_GOVERNED).toBe(true);
    expect(D1M_R6_PROVENANCE_PRESERVED).toBe(true);
    expect(D1M_R6_FILE_INGESTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_URL_FETCH_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_VENDOR_CONNECTOR_RUNTIME_COUNT).toBe(0);
  });

  it("rejects elevated authority, cross-scope submission, and adapter spoofing", () => {
    const { store } = identity();
    expect(() => recordAdapterIdentity(store, actor({ authority: "AI_ASSISTANT" }), { adapterId: "adapter-ai", adapterVersion: "1", boundaryClass: "FILE_SOURCE_BOUNDARY", sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE", owningModule: "boundary", provenanceRef: "prov-ai" })).toThrow("AI_NOT_ADAPTER_AUTHORITY");
    expect(() => recordAdapterIdentity(store, actor({ actorId: "LLM-1" }), { adapterId: "adapter-llm", adapterVersion: "1", boundaryClass: "FILE_SOURCE_BOUNDARY", sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE", owningModule: "boundary", provenanceRef: "prov-llm" })).toThrow("AI_NOT_ADAPTER_AUTHORITY");
    expect(() => recordAdapterIdentity(store, actor({ authority: "ADMINISTRATOR" }), { adapterId: "adapter-admin", adapterVersion: "1", boundaryClass: "FILE_SOURCE_BOUNDARY", sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE", owningModule: "boundary", provenanceRef: "prov-admin" })).toThrow("ADMIN_NOT_ADAPTER_AUTHORITY");
    expect(() => recordAdapterIdentity(store, actor({ authority: "ENGINEERING_APPROVAL_AUTHORITY" }), { adapterId: "adapter-eng", adapterVersion: "1", boundaryClass: "FILE_SOURCE_BOUNDARY", sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE", owningModule: "boundary", provenanceRef: "prov-eng" })).toThrow("ADAPTER_AUTHORITY_NOT_ENGINEERING_APPROVAL");
    expect(() => recordAdapterIdentity(store, actor({ authority: "CERTIFICATION_AUTHORITY" }), { adapterId: "adapter-cert", adapterVersion: "1", boundaryClass: "FILE_SOURCE_BOUNDARY", sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE", owningModule: "boundary", provenanceRef: "prov-cert" })).toThrow("ADAPTER_AUTHORITY_NOT_CERTIFIER");
    recordAdapterContract(store, actor(), { contractId: "contract-1", adapterId: "adapter-1", contractVersion: "1", permittedOperation: D1M_R1_CANONICAL_PHASE, parserTrust: "UNTRUSTED", provenanceRef: "prov-contract" });
    declareFormatCapability(store, actor(), { capabilityId: "cap-ifc", contractId: "contract-1", formatToken: "IFC", disposition: "CANDIDATE_FUTURE_ADAPTER", provenanceRef: "prov-cap" });
    expect(() => submitAdapterEvidence(store, actor({ tenantId: "tenant-b" }), { submissionId: "sub-b", contractId: "contract-1", capabilityId: "cap-ifc", authenticatorId: "auth-1", authenticated: true, evidenceFingerprint: "fp-b", intendedOperation: D1M_R1_CANONICAL_PHASE, locator: "source-key:b", provenanceRef: "prov-b" })).toThrow("CROSS_TENANT_OPERATION");
    expect(() => submitAdapterEvidence(store, actor({ workspaceId: "workspace-b" }), { submissionId: "sub-w", contractId: "contract-1", capabilityId: "cap-ifc", authenticatorId: "auth-1", authenticated: true, evidenceFingerprint: "fp-w", intendedOperation: D1M_R1_CANONICAL_PHASE, locator: "source-key:w", provenanceRef: "prov-w" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => submitAdapterEvidence(store, actor({ projectId: "project-b" }), { submissionId: "sub-p", contractId: "contract-1", capabilityId: "cap-ifc", authenticatorId: "auth-1", authenticated: true, evidenceFingerprint: "fp-p", intendedOperation: D1M_R1_CANONICAL_PHASE, locator: "source-key:p", provenanceRef: "prov-p" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordAdapterIdentity(store, actor(), { adapterId: "adapter-1", adapterVersion: "9.9.9", boundaryClass: "API_SOURCE_BOUNDARY", sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE", owningModule: "boundary", provenanceRef: "prov-spoof" })).toThrow("ADAPTER_ALREADY_RECORDED");
    expect(D1M_R6_AUTHORITY_PRESERVED).toBe(true);
    expect(D1M_R6_AUTHORITY_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(D1M_R6_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1M_R6_ADMIN_EQUALS_ENGINEERING_AUTHORITY).toBe(false);
    expect(D1M_R6_AI_CAN_INVENT_IDENTITY).toBe(false);
    expect(D1M_R6_AI_CAN_INVENT_VERSION).toBe(false);
    expect(D1M_R6_AI_CAN_DECLARE_FORMAT_SUPPORTED).toBe(false);
    expect(D1M_R6_AI_CAN_DECLARE_PARSER_TRUSTED).toBe(false);
    expect(D1M_R6_AI_CAN_INVENT_PROVENANCE).toBe(false);
    expect(D1M_R6_AI_CAN_BYPASS_UNSUPPORTED_FORMAT).toBe(false);
    expect(D1M_R6_AI_CAN_MARK_OUTPUT_VALIDATED).toBe(false);
    expect(D1M_R6_SCOPE_ENFORCED).toBe(true);
    expect(D1M_R6_CROSS_WORKSPACE_ALLOWED).toBe(false);
    expect(D1M_R6_CROSS_PROJECT_ALLOWED).toBe(false);
    expect(D1M_R6_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
  });

  it("does not parse, ingest, connect, or promote closed tracks", () => {
    expect(() => parseCadBimArtifact()).toThrow("PARSE_NOT_IN_R6");
    expect(() => extractCadBimObjects()).toThrow("OBJECT_EXTRACTION_NOT_IN_R6");
    expect(() => ingestCadBimFile()).toThrow("FILE_INGESTION_NOT_IN_R6");
    expect(() => fetchExternalUrl()).toThrow("ARBITRARY_URL_FETCH_REJECTED");
    expect(() => connectCadBimVendor()).toThrow("VENDOR_CONNECTOR_NOT_IN_R6");
    expect(() => adaptCadBimFormat()).toThrow("FORMAT_ADAPTER_NOT_IN_R6");
    expect(() => convertAdapterUnits()).toThrow("UNIT_CONVERSION_NOT_IN_R6");
    expect(() => transformAdapterCoordinates()).toThrow("COORDINATE_TRANSFORMATION_NOT_IN_R6");
    expect(() => inferAdapterAxis()).toThrow("AXIS_INFERENCE_NOT_IN_R6");
    expect(() => transformAdapterGeometry()).toThrow("GEOMETRY_TRANSFORMATION_NOT_IN_R6");
    expect(() => inferAdapterRelationship()).toThrow("RELATIONSHIP_INFERENCE_NOT_IN_R6");
    expect(() => inferModelTopology()).toThrow("TOPOLOGY_INFERENCE_NOT_IN_R6");
    expect(() => inferStructuralConnectivity()).toThrow("CONNECTIVITY_INFERENCE_NOT_IN_R6");
    expect(() => inferLoadPath()).toThrow("LOAD_PATH_INFERENCE_NOT_IN_R6");
    expect(() => detectCadBimClash()).toThrow("CLASH_DETECTION_NOT_IN_R6");
    expect(() => coordinateMultidisciplinaryBim()).toThrow("MULTIDISCIPLINARY_COORDINATION_NOT_IN_R6");
    expect(() => reasonGlobalModelDependency()).toThrow("GLOBAL_DEPENDENCY_REASONING_NOT_IN_R6");
    expect(() => detectGlobalCycle()).toThrow("GLOBAL_CYCLE_DETECTION_NOT_IN_R6");
    expect(() => interpretCadBimEngineeringProperties()).toThrow("ENGINEERING_PROPERTY_INTERPRETATION_NOT_IN_R6");
    expect(() => correctCadBimModel()).toThrow("MODEL_CORRECTION_NOT_IN_R6");
    expect(() => authorCadModel()).toThrow("CAD_AUTHORING_NOT_IN_R6");
    expect(() => authorBimModel()).toThrow("BIM_AUTHORING_NOT_IN_R6");
    expect(() => parseByAi()).toThrow("AI_PARSE_NOT_IN_R6");
    expect(D1M_R6_PARSE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_OBJECT_EXTRACTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_GENERIC_FILE_INGESTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_CONNECTOR_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_AI_PARSE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_AI_FORMAT_ADAPTER_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_UNIT_CONVERSION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_COORDINATE_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_AXIS_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_AXIS_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_GEOMETRY_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_GEOMETRY_RELATIONSHIP_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_SEMANTIC_RELATIONSHIP_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_TOPOLOGY_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_TRANSITIVE_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_CONNECTIVITY_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_LOAD_PATH_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_CLASH_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_COORDINATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_GLOBAL_DEPENDENCY_REASONING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_MODEL_CORRECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_CAD_AUTHORING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_BIM_AUTHORING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_D1K_GOVERNANCE_REUSED).toBe(true);
    expect(D1M_R6_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED).toBe(false);
    expect(D1M_R6_D1K_INTERNAL_INTEGRATION_READY).toBe(false);
    expect(D1M_R6_D1K_INTELLIGENCE_READY).toBe(false);
    expect(D1M_R6_D1K_LIMITATIONS_PRESERVED).toBe(true);
    expect(D1M_R6_D1L_TRACK_COMPLETE).toBe(true);
    expect(D1M_R6_D1L_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1M_R6_EQUALS_D1L_CERTIFICATION_ELIGIBLE).toBe(false);
    expect(D1M_R6_D1N_CURRENT_STATUS).toBe("NOT_ABSORBED");
    expect(D1M_R6_D1N_ABSORBED).toBe(false);
    expect(D1M_R6_D1N_RUNTIME_STARTED).toBe(false);
    expect(D1M_R6_D1N_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_D9_ABSORBED).toBe(false);
    expect(D1M_R6_D9_RUNTIME_STARTED).toBe(false);
    expect(D1M_R6_D9_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_D2_D8_RUNTIME_STARTED).toBe(false);
    expect(D1M_R6_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1M_R6_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1M_R6_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1M_R6_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1M_R6_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1M_R6_POST_D1J_DEBT_PRESERVED).toContain("NOT_AVAILABLE");
    expect(D1M_R6_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1M_R6_UNAUTHORIZED_PRODUCT_CLAIM).toBe(false);
    expect(D1M_R6_CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(D1M_R6_PARALLEL_DIGITAL_THREAD_CREATED).toBe(false);
    expect(D1M_R7_CANONICAL_PHASE).toBe("EOS-D1M-R7-CHANGE-STALENESS-SUPERSESSION");
    expect(D1M_R7_PHASE_TYPE).toBe("CAD_OR_BIM_CHANGE_STALENESS_SUPERSESSION");
    expect(D1M_R7_CANONICAL_SCOPE).toContain("Do not automatically revalidate");
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "cad-bim-adapter-boundary.ts"), "utf8");
    expect(source.includes('from "@rtb/engineering-review"')).toBe(false);
    expect(source.includes("fetch(")).toBe(false);
    expect(source.includes("recordCadBimSourceRevision")).toBe(false);
    expect(source.includes("recordSourceObjectMapping")).toBe(false);
    expect(source.includes("recordGeometryEvidence")).toBe(false);
    expect(source.includes("recordReferenceContext")).toBe(false);
    expect(source.includes("recordModelRelationship")).toBe(false);
    expect(scanAnalysisFormulaBypass("cad-bim-adapter-boundary.ts", source)).toEqual([]);
  });
});
