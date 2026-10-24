/**
 * EOS-D1K-0 cross-discipline structural interfaces architecture.
 * Contracts only. No interface runtime, compatibility runtime, or other-discipline calculation.
 */
import { EOS_CROSS_DISCIPLINE_RELATIONS, EOS_DISCIPLINE_IDS } from "./discipline-capability";

export const D1K_CANONICAL_NAME = "CROSS-DISCIPLINE STRUCTURAL INTERFACES" as const;
export const D1K_0_PHASE = "EOS-D1K-0-CROSS-DISCIPLINE-STRUCTURAL-INTERFACES-ARCHITECTURE" as const;
export const D1K_0_PHASE_TYPE = "CROSS_DISCIPLINE_STRUCTURAL_INTERFACES_ARCHITECTURE" as const;
export const D1K_0_STATUS = "ARCHITECTURE_DEFINED" as const;
export const D1K_0_MATURITY = "STRUCTURAL_CROSS_DISCIPLINE_INTERFACE_ARCHITECTURE_DEFINED" as const;
export const D1K_0_RUNTIME_STATUS = "NOT_STARTED" as const;
export const D1K_0_ARCHITECTURE_PATH =
  "docs/architecture/engineering-os/EOS_D1K_0_CROSS_DISCIPLINE_STRUCTURAL_INTERFACES_ARCHITECTURE.md" as const;
export const D1K_0_PARENT_ROADMAP_PATH = "docs/architecture/engineering-os/EOS_POST_D1J_CANONICAL_ROADMAP.md" as const;
export const D1K_0_DEPENDENCIES = "D1A and D1F. Cycle detection remains D9. D1K does not depend on D1J runtime." as const;
export const D1K_0_DEPENDS_ON_D1J = false as const;

export const D1K_0_REUSED_CONTRACTS =
  "Reuse EosCrossDisciplineInterface and EOS_CROSS_DISCIPLINE_RELATIONS from the D0 discipline contract. Reuse EOS_DISCIPLINE_IDS. Reuse D1A structural object identity and D1F structural system, member, support, and foundation-interface identity. Reuse fingerprintCanonical. Reuse the digital-thread provenance chain. Reuse existingUnitPairCompatible for unit compatibility. Reuse the engineering-review decision workflow for formal approval. Do not create a second interface identity, asset identity, unit system, digital thread, fingerprint algorithm, or approval engine." as const;
export const D1K_0_D1A_REUSE_CONFIRMED = true as const;
export const D1K_0_D1F_REUSE_CONFIRMED = true as const;
export const D1K_0_D0_INTERFACE_CONTRACT_REUSED = true as const;
export const D1K_0_PARALLEL_INTERFACE_IDENTITY_CREATED = false as const;
export const D1K_0_PARALLEL_STRUCTURAL_ASSET_IDENTITY_CREATED = false as const;
export const D1K_0_FREEFORM_DISCIPLINE_IDENTITY_ALLOWED = false as const;
export const D1K_0_DISCIPLINE_IDENTITY_ALLOWLIST = EOS_DISCIPLINE_IDS;
export const D1K_0_RELATION_ALLOWLIST = EOS_CROSS_DISCIPLINE_RELATIONS;
export const D1K_0_EOS_CROSS_DISCIPLINE_RELATIONS_REUSED = true as const;
export const D1K_0_DISCIPLINE_PACK_ORDER =
  "D1 STRUCTURAL, D2 CIVIL, D3 GEOTECHNICAL, D4 MECHANICAL, D5 PIPING, D6 PROCESS, D7 ELECTRICAL, D8 INSTRUMENTATION_CONTROL, D9 CROSS_DISCIPLINE_INTELLIGENCE." as const;

export const D1K_0_INTERFACE_IDENTITY_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_INTERFACE_IDENTITY_CONTRACT =
  "A Structural interface keeps the D0 interfaceId. It adds tenant, workspace, project, a D1A or D1F structural target, counterparty discipline from EOS_DISCIPLINE_IDS, a registry semantic for the counterparty domain, source and target discipline, source object reference, receiving target, governing relation, semantic identity, schema identity and version, exact source reference, source revision, authority, validation state, applicability, requiredness, evidence references, provenance, humanReviewRequired, fingerprint, history, and staleness. These fields extend the D0 contract. They do not create a second interface identity." as const;
export const D1K_0_STRUCTURAL_TARGET_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_COUNTERPARTY_DISCIPLINE_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_INTERFACE_DIRECTION_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_INTERFACE_DIRECTION_CONTRACT =
  "Direction is sourceDiscipline, targetDiscipline, and a relation from EOS_CROSS_DISCIPLINE_RELATIONS. No separate inbound, outbound, or bidirectional enum is a governing name. A two-way exchange exists only when explicit governed relations say so." as const;

export const D1K_SOURCE_CLASSES = [
  "NATIVE_EOS_DISCIPLINE_SOURCE",
  "EXTERNAL_GOVERNED_ENGINEERING_SOURCE",
  "MANUAL_GOVERNED_REFERENCE",
] as const;
export type D1kSourceClass = (typeof D1K_SOURCE_CLASSES)[number];
export const D1K_0_EXTERNAL_SOURCE_IS_NATIVE_PACK_OUTPUT = false as const;

export const D1K_0_INTERFACE_SEMANTIC_REGISTRY_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_SEMANTIC_REGISTRY_CONTRACT =
  "The registry separates relation, engineering semantic, schema identity, schema version compatibility, source authority, and evidence identity. Additional semantics enter only through a governed allowlist revision. Caller JSON is not governed engineering semantics. No generic payload engine is authorized." as const;
export const D1K_0_GENERIC_PAYLOAD_ENGINE_AUTHORIZED = false as const;

export const D1K_0_EXACT_SOURCE_REFERENCE_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_SOURCE_REFERENCE_CONTRACT =
  "A governed source pins source object identity, document or model or data identity, revision, evidence, authority, fingerprintCanonical of that source, provenance, and a timestamp where the source carries one. The token latest is not an exact reference. The interface stores a reference, not an uncontrolled copy of the source body." as const;
export const D1K_0_FLOATING_LATEST_SOURCE_ALLOWED = false as const;
export const D1K_0_UNCONTROLLED_SOURCE_BODY_COPY_AUTHORIZED = false as const;

export const D1K_AUTHORITY_CLASSES = [
  "SOURCE_AUTHORITY",
  "INTERFACE_RECORD_AUTHORITY",
  "REVIEWER_AUTHORITY",
  "RECEIVING_STRUCTURAL_AUTHORITY",
  "ENGINEERING_APPROVAL_AUTHORITY",
  "CERTIFICATION_AUTHORITY",
] as const;
export const D1K_0_SOURCE_AUTHORITY_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_AUTHORITY_CONTRACT =
  "Source authority stays with the originating discipline or external source. Interface-record authority may record and trace the exchange only. Reviewer authority may review. Receiving Structural authority may rely on the interface for a Structural decision and does not become the author of the source value. Engineering approval stays in the engineering-review decision workflow. Certification authority stays with a future D1L assessment. The interface record does not elevate itself above the source." as const;
export const D1K_0_INTERFACE_REGISTRATION_PROMOTES_SOURCE_AUTHORITY = false as const;

export const D1K_0_VALIDATION_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_APPLICABILITY_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_VALIDATION_CONTRACT =
  "Validation state records whether the pinned source, semantic, schema, units, coordinate system, and axis convention were checked. It does not approve the engineering value. Applicability is declared. Unknown applicability is not treated as not applicable." as const;

export const D1K_REQUIREDNESS_MEANINGS = [
  "REQUIRED_INPUT",
  "PROVIDED_INPUT",
  "REQUESTED_OUTPUT",
  "PROVIDED_OUTPUT",
  "ACKNOWLEDGED_HANDOFF",
  "UNRESOLVED_INTERFACE",
] as const;
export const D1K_0_REQUIREDNESS_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_D0_STATUS_VALUES = ["declared", "active", "retired"] as const;
export const D1K_0_D0_STATUS_EQUALS_ENGINEERING_APPROVAL = false as const;

export const D1K_HANDOFF_STATES = [
  "REQUESTED",
  "PROVIDED",
  "ACKNOWLEDGED",
  "UNDER_REVIEW",
  "RESPONSE_PENDING",
  "CHANGED",
  "SUPERSEDED",
  "REJECTED",
  "UNRESOLVED_MISMATCH",
  "STALE_DEPENDENCY",
] as const;
export const D1K_0_HANDOFF_REVIEW_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_INTERFACE_ACCEPTED_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1K_0_INTERFACE_CLOSED_EQUALS_DESIGN_APPROVAL = false as const;
export const D1K_0_PARALLEL_APPROVAL_ENGINE_CREATED = false as const;

export const D1K_COMPATIBILITY_DIMENSIONS = [
  "SEMANTICS",
  "SCHEMA_VERSION",
  "UNITS",
  "COORDINATES",
  "AXIS_SIGN",
  "SOURCE_FRESHNESS",
  "AUTHORITY",
  "EVIDENCE_COMPLETENESS",
] as const;
export const D1K_DIAGNOSTIC_KINDS = [
  "MISSING_INTERFACE_INFORMATION",
  "MISSING_REQUIRED_SOURCE",
  "SEMANTIC_INCOMPATIBILITY",
  "SCHEMA_VERSION_INCOMPATIBILITY",
  "UNIT_MISMATCH",
  "COORDINATE_SYSTEM_MISMATCH",
  "AXIS_MISMATCH",
  "SIGN_CONVENTION_MISMATCH",
  "STALE_SOURCE",
  "SUPERSEDED_SOURCE",
  "INSUFFICIENT_AUTHORITY",
  "MISSING_EVIDENCE",
  "INVALID_PROVENANCE",
  "PENDING_COUNTERPARTY_RESPONSE",
  "UNRESOLVED_ENGINEERING_CONFLICT",
] as const;
export const D1K_0_COMPATIBILITY_DIAGNOSTIC_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_DIAGNOSTIC_EQUALS_STRUCTURAL_FAILURE = false as const;
export const D1K_0_AUTOMATIC_CONFLICT_RESOLUTION_AUTHORIZED = false as const;

export const D1K_0_EXISTING_UNIT_SYSTEM_REUSED = true as const;
export const D1K_0_PARALLEL_UNIT_SYSTEM_CREATED = false as const;
export const D1K_0_SILENT_UNIT_CONVERSION_AUTHORIZED = false as const;
export const D1K_0_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1K_0_COORDINATE_SYSTEM_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_SILENT_COORDINATE_INFERENCE_AUTHORIZED = false as const;
export const D1K_0_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_0_AXIS_SIGN_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_SILENT_AXIS_SIGN_INFERENCE_AUTHORIZED = false as const;
export const D1K_CONVENTION_STATES = ["MATCHING", "INCOMPATIBLE", "MISSING", "UNRESOLVED"] as const;

export const D1K_0_INTERFACE_HISTORY_REQUIRED = true as const;
export const D1K_0_STALENESS_INVALIDATION_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_STALENESS_CONTRACT =
  "A source change leaves the prior interface revision traceable, marks the dependent interface stale, and does not mutate the upstream source. The record is not repointed to latest." as const;
export const D1K_0_UPSTREAM_SOURCE_MUTATION_AUTHORIZED = false as const;

export const D1K_0_DIGITAL_THREAD_REUSED = true as const;
export const D1K_0_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1K_0_DIGITAL_THREAD_CHAIN =
  "source engineering evidence, governed source reference, D1K interface identity, compatibility or review state, receiving Structural evidence, downstream Structural decision or check, and future D1L evidence where a certification claim uses the interface." as const;
export const D1K_0_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1K_0_FINGERPRINT_SUBJECTS =
  "interface definition, exact source reference, semantic and schema identity, compatibility state, and handoff or review state where one exists." as const;
export const D1K_0_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;

export const D1K_0_INTERNAL_EOS_INTERFACE_SEAM_DEFINED = true as const;
export const D1K_0_INTERNAL_SEAM_CONTRACT =
  "A future native interface may cite a D2 through D8 source only after that pack exposes a canonical source contract. Those packs are not started. This architecture does not fabricate their contracts and does not implement the seam." as const;
export const D1K_0_EXTERNAL_MANUAL_REFERENCE_SEAM_DEFINED = true as const;
export const D1K_0_EXTERNAL_SEAM_CONTRACT =
  "An external or manual reference keeps external source identity, authority, provenance, revision, evidence, semantic identity, units, and coordinate or axis convention where relevant, plus human review. It is not represented as a native D2 through D8 output. No external-reference runtime is authorized." as const;

export const D1K_0_AI_AUTHORITY_BOUNDARY_DEFINED = true as const;
export const D1K_0_AI_AUTHORITY_BOUNDARY =
  "AI may summarize interfaces, identify missing inputs, identify stale references, explain mismatches, draft queries, highlight pending responses, and organize evidence. AI may not invent engineering inputs, infer missing authoritative values, invent counterparty responses, change source authority, approve an interface, approve engineering, resolve a governing conflict, silently reconcile units, coordinates, or axis conventions, create design inputs without evidence, override review, grant conformance, or grant certification." as const;
export const D1K_0_AI_CAN_INVENT_ENGINEERING_INPUTS = false as const;
export const D1K_0_AI_CAN_INVENT_COUNTERPARTY_RESPONSES = false as const;
export const D1K_0_AI_CAN_CHANGE_SOURCE_AUTHORITY = false as const;
export const D1K_0_AI_CAN_APPROVE_INTERFACE = false as const;
export const D1K_0_AI_CAN_RESOLVE_GOVERNING_ENGINEERING_CONFLICT = false as const;

export const D1K_0_D9_HANDOFF_BOUNDARY =
  "D9 owns CROSS_DISCIPLINE_INTELLIGENCE and global cycle detection. D1K may later expose governed interface references and states. D9 may later consume them. D1K does not implement dependency-graph intelligence, multidisciplinary reasoning, cycle detection, global optimization, or automated conflict resolution." as const;
export const D1K_0_D9_RUNTIME_STARTED = false as const;
export const D1K_0_D9_CYCLE_DETECTION_IMPLEMENTED_BY_D1K = false as const;
export const D1K_0_D1L_HANDOFF_ARCHITECTURE_DEFINED = true as const;
export const D1K_0_D1L_HANDOFF_CONTRACT =
  "If a cross-discipline input materially affects a future Structural certification claim, that claim must be able to identify the exact D1K interface evidence. Interface acceptance is not the D1L certification gate. D1L is not started." as const;
export const D1K_0_D1L_STARTED = false as const;
export const D1K_0_D1M_ABSORBED = false as const;
export const D1K_0_D1N_ABSORBED = false as const;
export const D1K_0_D2_D8_RUNTIME_STARTED = false as const;

export const D1K_0_ARCHITECTURE_READY = true as const;
export const D1K_0_REFERENCE_RUNTIME_READY = false as const;
export const D1K_0_EXTERNAL_REFERENCE_READY = false as const;
export const D1K_0_INTERNAL_DISCIPLINE_INTEGRATION_READY = false as const;
export const D1K_0_CROSS_DISCIPLINE_INTELLIGENCE_READY = false as const;

export const D1K_0_DATABASE_SCHEMA_CHANGE_REQUIRED = false as const;
export const D1K_0_INTERFACE_RUNTIME_COUNT = 0 as const;
export const D1K_0_INTERFACE_COMPATIBILITY_RUNTIME_COUNT = 0 as const;
export const D1K_0_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D1K_0_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1K_0_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1K_0_D9_RUNTIME_COUNT = 0 as const;
export const D1K_0_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1K_0_NEW_DEPENDENCY_COUNT = 0 as const;
export const D1K_0_PARALLEL_CAPABILITY_MANIFEST_CREATED = false as const;
export const D1K_0_CROSS_TENANT_REFERENCE_ALLOWED = false as const;
export const D1K_0_CROSS_WORKSPACE_REFERENCE_ALLOWED = false as const;
export const D1K_0_POST_D1J_DEBT_PRESERVED = true as const;
export const D1K_0_DEBT_LEDGER =
  "Concrete C10 engineer review pending. D1F system-orchestrator human review pending. D1G live validation pending. D1G engineer validation pending. D1G conformance and certified-solver status remain unmet. D1H engineer validation pending. D1I engineer validation pending. D1I conformance validation pending. D1J engineer validation pending. D1J conformance validation pending. D1J concrete parameter semantics remain NOT_AVAILABLE. GA security debt remains." as const;
export const D1K_0_UNAUTHORIZED_VALIDATION_PROMOTION = false as const;
export const D1K_0_UNAUTHORIZED_CONFORMANCE_PROMOTION = false as const;
export const D1K_0_UNAUTHORIZED_CERTIFICATION_PROMOTION = false as const;
export const D1K_0_UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D1K_CANONICAL_PHASE_SEQUENCE =
  "EOS-D1K-0-CROSS-DISCIPLINE-STRUCTURAL-INTERFACES-ARCHITECTURE; EOS-D1K-R1-INTERFACE-IDENTITY-SOURCE-REFERENCE-FOUNDATION; EOS-D1K-R2-SEMANTIC-UNIT-COORDINATE-AXIS-COMPATIBILITY; EOS-D1K-R3-HANDOFF-RESPONSE-CHANGE-CONFLICT-GOVERNANCE; EOS-D1K-R4-INTERNAL-EXTERNAL-REFERENCE-COMPOSITION; EOS-D1K-R5-CROSS-DISCIPLINE-STRUCTURAL-INTERFACES-CLOSEOUT." as const;
export const D1K_PHASE_PREREQUISITE_MATRIX =
  "D1K-0 defines architecture and does not require D2 through D8 runtime or D9. R1 may record interface identity and an exact source reference without compatibility assessment, handoff execution, or a native counterparty pack. R2 may record semantic, unit, coordinate, and axis compatibility diagnostics and cannot convert, transform, or infer them. R3 may record handoff and conflict state and cannot approve engineering. R4 may compose internal or external references only against an exposed canonical source or a governed external reference, and cannot start D2 through D8. R5 may close the bounded track and cannot grant D9 intelligence, cycle detection, D1L certification, or engineering approval." as const;
export const D1K_R1_HANDOFF_READY = true as const;
export const D1K_R1_CANONICAL_PHASE = "EOS-D1K-R1-INTERFACE-IDENTITY-SOURCE-REFERENCE-FOUNDATION" as const;
export const D1K_R1_PHASE_TYPE = "STRUCTURAL_INTERFACE_IDENTITY_SOURCE_REFERENCE_FOUNDATION" as const;
export const D1K_R1_CANONICAL_SCOPE =
  "Record a governed structural interface identity that extends the D0 contract, pins a D1A or D1F structural target, an allowlisted counterparty discipline, a governed relation, and an exact source reference with revision, authority, evidence, and fingerprint. Do not assess compatibility, execute a handoff, start D2 through D8, start D9, convert units, infer coordinates or axes, or approve engineering." as const;
