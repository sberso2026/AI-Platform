/**
 * EOS-D1M-0 CAD or BIM intelligence architecture.
 * Contracts only. No parser, connector, geometry engine, or model runtime.
 */
import { D1K_AUTHORITY_CLASSES, D1K_SOURCE_CLASSES } from "./structural-interfaces-d1k-0";
import { STRUCTURAL_OBJECT_KINDS } from "./structural-domain";
import { D1M_CAD_BIM_INTELLIGENCE_IMPLEMENTED, D1N_CONCEPT_TO_DETAILED_ORCHESTRATOR_IMPLEMENTED } from "./structural-systems";

export const D1M_0_STATUS = "ARCHITECTURE_DEFINED" as const;
export const D1M_0_MATURITY = "STRUCTURAL_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE_DEFINED" as const;
export const D1M_0_PHASE = "EOS-D1M-0-CAD-OR-BIM-INTELLIGENCE-ARCHITECTURE" as const;
export const D1M_0_PHASE_TYPE = "CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE" as const;
export const D1M_0_ARCHITECTURE_PATH =
  "docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md" as const;
export const D1M_0_PARENT_ROADMAP_PATH = "docs/architecture/engineering-os/EOS_POST_D1L_CANONICAL_ROADMAP.md" as const;
export const D1M_ARCHITECTURE_READY = true as const;
export const D1M_SOURCE_REFERENCE_RUNTIME_READY = false as const;
export const D1M_MODEL_EVIDENCE_RUNTIME_READY = false as const;
export const D1M_FORMAT_ADAPTER_RUNTIME_READY = false as const;
export const D1M_STRUCTURAL_INTERPRETATION_RUNTIME_READY = false as const;
export const D1M_CHANGE_GOVERNANCE_RUNTIME_READY = false as const;
export const D1M_0_IMPLEMENTED = D1M_CAD_BIM_INTELLIGENCE_IMPLEMENTED;

export const D1M_0_CANONICAL_PURPOSE_DEFINED = true as const;
export const D1M_0_PURPOSE =
  "D1M governs what EOS knows about a CAD or BIM artifact: exact identity, revision, provenance, authority, and the evidence that can be cited from it. A model reference is not engineering validation, design approval, or certification." as const;
export const D1M_0_SCOPE_DEFINED = true as const;
export const D1M_0_SCOPE =
  "Architecture for source artifact identity, exact revision, source class, authority, provenance, D1A target linkage, source object identity, mapping, geometry evidence, semantic evidence, units, coordinates, axes, relationships, file and API boundaries, immutability, change detection, fingerprints, the digital thread, human review, and AI limits. Runtime is not authorized." as const;
export const D1M_0_NON_GOALS_DEFINED = true as const;
export const D1M_0_NON_GOALS =
  "No CAD or BIM authoring, no vendor connector, no unrestricted file ingestion, no parser, no geometry or coordinate transformation, no unit conversion, no silent model repair, no design approval, no certification, no D1N orchestration, no D9 reasoning, and no D2 through D8 runtime." as const;

export const SOURCE_ARTIFACT_EQUALS_PARSED_MODEL = false as const;
export const PARSED_MODEL_EQUALS_STRUCTURAL_INTERPRETATION = false as const;
export const STRUCTURAL_INTERPRETATION_EQUALS_ENGINEERING_VALIDATED = false as const;
export const MODEL_PARSE_SUCCESS_EQUALS_ENGINEERING_CORRECT = false as const;
export const MODEL_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_0_EVIDENCE_STAGES = ["SOURCE_REFERENCE", "FILE_INGESTION", "PARSED_REPRESENTATION", "STRUCTURAL_INTERPRETATION"] as const;

export const SOURCE_ARTIFACT_IDENTITY_ARCHITECTURE_DEFINED = true as const;
export const D1M_0_ARTIFACT_IDENTITY_FIELDS = [
  "artifactId",
  "sourceClass",
  "sourceSystem",
  "modelIdentity",
  "exactRevision",
  "tenantId",
  "workspaceId",
  "projectId",
  "sourceAuthority",
  "provenance",
  "evidenceReference",
  "contentFingerprint",
  "metadataFingerprint",
  "referencedAt",
  "predecessorArtifactId",
] as const;
export const D1M_0_FILENAME_ALONE_IS_IDENTITY = false as const;
export const EXACT_SOURCE_REVISION_ARCHITECTURE_DEFINED = true as const;
export const FLOATING_CAD_BIM_SOURCE_ALLOWED = false as const;
export const D1M_0_REVISION_CONTRACT =
  "A governed reference pins one exact source revision. Latest, current, or newest is not a reference until a deterministic resolution stores that exact revision and its content fingerprint. A later source change creates a new pin and does not rewrite the old one." as const;

export const SOURCE_CLASSIFICATION_ARCHITECTURE_DEFINED = true as const;
export const D1M_0_SOURCE_CLASSES = D1K_SOURCE_CLASSES;
export const D1M_0_NEW_SOURCE_CLASS_CREATED = false as const;
export const D1M_0_FREEFORM_SOURCE_CLASS_ALLOWED = false as const;

export const SOURCE_AUTHORITY_ARCHITECTURE_DEFINED = true as const;
export const D1M_0_AUTHORITY_CLASSES = D1K_AUTHORITY_CLASSES;
export const D1M_0_NEW_AUTHORITY_CLASS_CREATED = false as const;
export const MODEL_AUTHOR_EQUALS_ENGINEERING_APPROVER = false as const;
export const SOURCE_MODEL_APPROVED_EQUALS_EOS_ENGINEERING_APPROVED = false as const;
export const SOURCE_MODEL_PUBLISHED_EQUALS_EOS_CERTIFIED = false as const;
export const D1M_0_AUTHORITY_CONTRACT =
  "Model authorship stays source authority. Recording a reference does not become engineering approval authority. Review stays reviewer authority. Receiving Structural use stays receiving Structural authority. Engineering approval stays in the engineering-review decision workflow. Certification stays with D1L. A source workflow state such as approved, shared, published, issued, or construction is source metadata. It is not an EOS engineering approval and it is not certification. This reuses the deliverable rule that a status code is not approval." as const;

export const SOURCE_PROVENANCE_ARCHITECTURE_DEFINED = true as const;
export const D1M_0_PROVENANCE_REQUIRED = true as const;
export const D1M_0_PROVENANCE_CONTRACT =
  "Provenance cites the source system, the actor or system that recorded the reference, the evidence used, and the canonical fingerprint of the pinned revision. Missing provenance stays missing. It is not filled in." as const;

export const D1A_STRUCTURAL_IDENTITY_REUSED = true as const;
export const PARALLEL_D1M_STRUCTURAL_IDENTITY_CREATED = false as const;
export const D1M_0_STRUCTURAL_TARGET_KINDS = STRUCTURAL_OBJECT_KINDS;

export const SOURCE_MODEL_OBJECT_IDENTITY_ARCHITECTURE_DEFINED = true as const;
export const SOURCE_MODEL_OBJECT_ID_EQUALS_STRUCTURAL_OBJECT_ID = false as const;
export const D1M_0_SOURCE_OBJECT_IDENTITY_CONTRACT =
  "A source object id belongs to the source system. It may be a vendor object id, a drawing entity handle, or a source GUID. None of those is an EOS structural object id. No format is supported by naming those examples." as const;

export const STRUCTURAL_TARGET_MAPPING_ARCHITECTURE_DEFINED = true as const;
export const D1M_0_MAPPING_FIELDS = [
  "sourceObjectId",
  "sourceArtifactRevision",
  "structuralTargetId",
  "structuralTargetKind",
  "mappingBasis",
  "provenance",
  "actorAuthority",
  "fingerprint",
  "history",
] as const;
export const D1M_0_MAPPING_CONTRACT =
  "A mapping connects one source object on one exact artifact revision to one D1A structural target. The basis, actor authority, provenance, and fingerprint are required. A candidate suggestion is not a mapping. Confidence, if a later phase records it, is non-authoritative." as const;
export const AI_CAN_INVENT_MODEL_OBJECT_IDENTITY = false as const;
export const AI_CAN_INVENT_STRUCTURAL_TARGET_MAPPING = false as const;

export const GEOMETRY_EVIDENCE_ARCHITECTURE_DEFINED = true as const;
export const D1M_0_GEOMETRY_EVIDENCE_CANDIDATES = [
  "POINT",
  "LINE",
  "CURVE",
  "SURFACE",
  "SOLID",
  "MEMBER_EXTENT",
  "SECTION_GEOMETRY",
  "ORIENTATION",
  "LEVEL_OR_GRID",
  "OBJECT_PLACEMENT",
] as const;
export const D1M_0_GEOMETRY_CANDIDATES_AUTHORIZED = false as const;
export const D1M_0_GEOMETRY_CONTRACT =
  "Geometry evidence is cited from an exact source revision or from a parsed representation of that revision. Source geometry is not an engineering interpretation of that geometry. Listing a candidate shape does not authorize extraction." as const;
export const GEOMETRY_EXTRACTED_EQUALS_GEOMETRY_VALIDATED = false as const;
export const GEOMETRY_VALIDATED_EQUALS_STRUCTURAL_ADEQUACY_CONFIRMED = false as const;

export const SEMANTIC_EVIDENCE_ARCHITECTURE_DEFINED = true as const;
export const D1M_0_SEMANTIC_EVIDENCE_CANDIDATES = [
  "OBJECT_TYPE",
  "MATERIAL_LABEL",
  "SECTION_LABEL",
  "MEMBER_CATEGORY",
  "LEVEL",
  "SYSTEM_MEMBERSHIP",
  "PROPERTY_SET_VALUE",
  "SOURCE_CLASSIFICATION",
] as const;
export const D1M_0_SEMANTIC_CANDIDATES_AUTHORIZED = false as const;
export const D1M_0_SOURCE_DECLARED_SEMANTIC_EQUALS_GOVERNED_SEMANTIC = false as const;
export const UNKNOWN_MODEL_SEMANTIC_AUTO_MAPPED = false as const;
export const D1M_0_SEMANTIC_CONTRACT =
  "A source-declared label stays a source label until a governed semantic identity is recorded. Unknown or unsupported source text stays unknown. Similarity does not select a structural kind. Governed semantics reuse the D1K semantic registry where the value crosses a discipline boundary. Caller text is not governed semantics." as const;

export const UNIT_ARCHITECTURE_REUSED = true as const;
export const D1M_0_PARALLEL_UNIT_SYSTEM_CREATED = false as const;
export const SILENT_MODEL_UNIT_CONVERSION_ALLOWED = false as const;
export const D1M_0_UNIT_CONTRACT =
  "Source units, property units where a property carries a unit, the governed expected unit, and the compatibility state are explicit. Compatibility reuses existingUnitPairCompatible. This architecture does not convert units." as const;

export const COORDINATE_ARCHITECTURE_REUSED = true as const;
export const D1M_0_COORDINATE_IDENTITIES = ["LOCAL", "PROJECT", "SHARED", "GLOBAL_OR_SITE"] as const;
export const D1M_0_COORDINATE_SYSTEMS_INTERCHANGEABLE = false as const;
export const D1M_0_COORDINATE_CONTRACT =
  "Local, project, shared, and global or site coordinates are different identities. Engineering interpretation that depends on placement requires an explicit coordinate identity. Missing identity stays missing. D1K coordinate compatibility is reused. No coordinate system is created here." as const;

export const AXIS_SIGN_ARCHITECTURE_REUSED = true as const;
export const MODEL_AXIS_AUTO_INFERRED_AS_ENGINEERING_AXIS = false as const;
export const D1M_0_AXIS_CONTRACT =
  "Axis and sign conventions reuse the D1K axis and sign governance. A geometric appearance does not assign a structural local axis. A missing convention stays unresolved." as const;

export const RELATIONSHIP_ARCHITECTURE_DEFINED = true as const;
export const D1M_0_SOURCE_RELATIONSHIP_KINDS = [
  "CONTAINS",
  "CONNECTED_TO",
  "SUPPORTED_BY",
  "HOSTED_BY",
  "MEMBER_OF",
  "REFERENCES",
  "ADJACENT_TO",
] as const;
export const D1M_0_SOURCE_RELATION_EQUALS_D1K_RELATION = false as const;
export const BIM_CONNECTIVITY_EQUALS_VALIDATED_STRUCTURAL_CONNECTIVITY = false as const;
export const MODEL_RELATIONSHIP_EQUALS_ENGINEERING_LOAD_PATH = false as const;
export const D1M_0_RELATIONSHIP_CONTRACT =
  "These kinds are source-model evidence. They are not D1K cross-discipline relations and they are not a validated structural connection or load path. A later structural runtime must authorize any engineering use." as const;

export const BIM_MATERIAL_VALUE_EQUALS_VALIDATED_ENGINEERING_MATERIAL = false as const;
export const BIM_SECTION_PROPERTY_EQUALS_VALIDATED_DESIGN_PROPERTY = false as const;
export const MODEL_LOAD_EQUALS_VALIDATED_STRUCTURAL_LOAD = false as const;
export const MODEL_SUPPORT_EQUALS_VALIDATED_ANALYSIS_BOUNDARY_CONDITION = false as const;
export const MODEL_REINFORCEMENT_EQUALS_VALIDATED_DESIGN_REINFORCEMENT = false as const;
export const D1M_0_PROPERTY_BOUNDARY_CONTRACT =
  "A material name, section property, load, support, release, or reinforcement record in a model is source evidence. It is not validated engineering input, a code-compliant detail, or an analysis boundary condition." as const;

export const FILE_FORMAT_BOUNDARY_DEFINED = true as const;
export const FILE_INGESTION_BOUNDARY_DEFINED = true as const;
export const API_CONNECTOR_BOUNDARY_DEFINED = true as const;
export const SUPPORTED_FORMAT_POLICY_DEFINED = true as const;
export const D1M_0_SUPPORTED_FORMATS = [] as const;
export const D1M_0_FORMAT_SUPPORT_CLAIMED = false as const;
export const D1M_0_IFC_COMPLIANCE_CLAIMED = false as const;
export const D1M_0_EXISTING_IFC_FEDERATION_IS_D1M_RUNTIME = false as const;
export const D1M_0_FORMAT_DISPOSITIONS = [
  ["IFC", "CANDIDATE_FUTURE_ADAPTER"],
  ["RVT", "UNSUPPORTED_IN_D1M_0"],
  ["DWG", "UNSUPPORTED_IN_D1M_0"],
  ["DXF", "UNSUPPORTED_IN_D1M_0"],
  ["TEKLA_NATIVE", "UNSUPPORTED_IN_D1M_0"],
  ["NEUTRAL_EXCHANGE", "CANDIDATE_FUTURE_ADAPTER"],
  ["STRUCTURED_API", "CANDIDATE_FUTURE_ADAPTER"],
] as const;
export const D1M_0_VENDOR_ADAPTER_STRATEGIES = ["SUPPORTED_VENDOR_API", "EXPORTED_NEUTRAL_FORMAT", "GOVERNED_INTEGRATION_CONNECTOR"] as const;
export const D1M_0_VENDOR_ADAPTER_STRATEGY_SELECTED = false as const;
export const D1M_0_FORMAT_CONTRACT =
  "No format is supported. IFC is only a candidate because a separate interoperability package already has a bounded federation adapter. That adapter is not D1M runtime and it is not IFC compliance. Revit, DWG, DXF, and Tekla native files are unsupported in this architecture. A later phase may choose a vendor API, an exported neutral format, or a governed connector, and this phase chooses none. A source reference does not require file ingestion. Ingestion does not produce a structural interpretation." as const;
export const D1M_0_API_SURFACES = ["SOURCE_METADATA", "MODEL_CONTENT", "ARTIFACT_DOWNLOAD", "CHANGE_EVENT", "AUTHENTICATION"] as const;
export const ARBITRARY_CAD_BIM_PAYLOAD_BUS_AUTHORIZED = false as const;

export const SOURCE_IMMUTABILITY_ARCHITECTURE_DEFINED = true as const;
export const D1M_0_IMMUTABILITY_CONTRACT =
  "An exact revision used as evidence stays immutable. A source change preserves the old revision and the old evidence and adds a superseding pin. Prior references are not silently rewritten." as const;
export const CHANGE_DETECTION_ARCHITECTURE_DEFINED = true as const;
export const D1M_0_CHANGE_CLASSES = [
  "ARTIFACT_REVISION_CHANGED",
  "OBJECT_ADDED",
  "OBJECT_REMOVED",
  "GEOMETRY_CHANGED",
  "SEMANTIC_PROPERTY_CHANGED",
  "COORDINATE_BASIS_CHANGED",
  "UNIT_METADATA_CHANGED",
  "AXIS_CHANGED",
  "RELATIONSHIP_CHANGED",
  "SOURCE_AUTHORITY_CHANGED",
] as const;
export const MODEL_CHANGE_DETECTED_EQUALS_ENGINEERING_IMPACT_DETERMINED = false as const;
export const D1M_0_SILENT_REVISION_CONFLICT_RESOLUTION_ALLOWED = false as const;
export const D1M_0_REVISION_CONFLICT_CASES = [
  "SAME_FILENAME_DIFFERENT_CONTENT",
  "SAME_MODEL_ID_NEW_REVISION",
  "SOURCE_REVISION_DIFFERS_FROM_CONTENT_FINGERPRINT",
  "UPLOAD_METADATA_CONFLICTS_WITH_FINGERPRINT",
] as const;

export const CANONICAL_FINGERPRINT_REUSED = true as const;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1M_FINGERPRINT_ARCHITECTURE_DEFINED = true as const;
export const D1M_0_FINGERPRINT_SUBJECTS = [
  "artifactRevision",
  "parsedRepresentation",
  "objectEvidence",
  "geometryEvidence",
  "semanticEvidence",
  "mappingEvidence",
] as const;
export const D1M_0_FINGERPRINT_CONTRACT =
  "Fingerprints reuse fingerprintCanonical. Separate subjects may be fingerprinted later. No new algorithm is defined. A content fingerprint mismatch is a conflict, not a prompt to trust the filename." as const;

export const CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const PARALLEL_D1M_DIGITAL_THREAD_CREATED = false as const;
export const D1M_0_DIGITAL_THREAD_CHAIN =
  "CAD or BIM source artifact, exact source revision, parsed source evidence, source object identity, governed structural target mapping, geometry and semantic evidence, downstream structural evidence, and D1L certification evidence only where a claim uses that evidence." as const;

export const D1K_CROSS_DISCIPLINE_GOVERNANCE_REUSED = true as const;
export const PARALLEL_D1M_CROSS_DISCIPLINE_INTERFACE_CREATED = false as const;
export const D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY = false as const;
export const D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY = false as const;
export const D1M_0_D1K_CONTRACT =
  "Cross-discipline content in a model is cited through a D1K interface. D1M does not create a second interface system. D1K internal discipline integration remains not ready. D1K cross-discipline intelligence remains not ready. D2 through D8 providers are not created by this architecture." as const;

export const D1M_MODEL_EVIDENCE_EQUALS_D1L_CERTIFICATION_ELIGIBLE = false as const;
export const D1M_0_D1L_CONTRACT =
  "D1L may later cite governed D1M evidence when a certification claim depends on it. D1M does not mark that evidence eligible and does not change a recorded certification decision. D1L stays closed with limitations." as const;

export const D1M_D1N_HANDOFF_ARCHITECTURE_DEFINED = true as const;
export const D1N_ABSORBED_BY_D1M = false as const;
export const D1N_IMPLEMENTED = D1N_CONCEPT_TO_DETAILED_ORCHESTRATOR_IMPLEMENTED;
export const D1M_0_D1N_HANDOFF_CONTRACT =
  "D1N remains concept-to-detailed orchestration. A later D1N phase may read model identity, exact revision, governed objects, geometry evidence, semantic evidence, relationships, changes, provenance, and fingerprints. D1M does not orchestrate concept-to-detailed design. Generated geometry, if a later track creates it, is not source-verified CAD or BIM evidence." as const;
export const D1M_0_GENERATED_GEOMETRY_EQUALS_SOURCE_TRUTH = false as const;

export const D9_ABSORBED_BY_D1M = false as const;
export const D1M_EQUALS_MULTIDISCIPLINARY_BIM_COORDINATION_PLATFORM = false as const;
export const D1M_0_CLASH_DETECTION_IN_D1M = false as const;
export const D1M_0_CLASH_CONTRACT =
  "Structural geometric coincidence is not D1M intelligence. Cross-discipline clash detection and multidisciplinary coordination stay with D9. An engineering conflict that crosses a discipline boundary stays with D1K, and global conflict reasoning stays with D9. None of these is implemented here." as const;

export const AI_CAN_INVENT_GEOMETRY = false as const;
export const AI_CAN_INVENT_ENGINEERING_PROPERTIES = false as const;
export const AI_CAN_APPROVE_STRUCTURAL_INTERPRETATION = false as const;
export const AI_CAN_CERTIFY_MODEL = false as const;
export const D1M_0_AI_PERMITTED =
  "AI may summarize metadata, explain stated properties, identify missing metadata, suggest a candidate mapping, identify a possible inconsistency, draft a review question, compare revisions, and summarize a geometry or semantic change. Those outputs are advisory." as const;
export const D1M_0_AI_PROHIBITED =
  "AI may not invent geometry, repair geometry, fabricate an object, invent a material, section property, reinforcement, load, restraint, source revision, or authority, approve a mapping, approve an interpretation, or certify a model or its engineering adequacy." as const;
export const D1M_0_HUMAN_REVIEW_TRIGGERS = [
  "AMBIGUOUS_OBJECT_MAPPING",
  "UNSUPPORTED_SEMANTIC_MAPPING",
  "COORDINATE_UNCERTAINTY",
  "UNIT_AMBIGUITY",
  "GEOMETRY_INCONSISTENCY",
  "SOURCE_AUTHORITY_AMBIGUITY",
  "MODEL_REVISION_CONFLICT",
  "UNCERTAIN_STRUCTURAL_RELATIONSHIP",
] as const;
export const D1M_0_AI_CAN_CLEAR_HUMAN_REVIEW = false as const;

export const SECURITY_ARCHITECTURE_DEFINED = true as const;
export const UNTRUSTED_FILE_ARCHITECTURE_DEFINED = true as const;
export const TENANT_WORKSPACE_SCOPE_ARCHITECTURE_DEFINED = true as const;
export const DATA_GOVERNANCE_ARCHITECTURE_DEFINED = true as const;
export const D1M_0_CROSS_TENANT_REFERENCE_ALLOWED = false as const;
export const D1M_0_CROSS_WORKSPACE_REFERENCE_ALLOWED = false as const;
export const D1M_0_SECURITY_CONTROLS = [
  "SOURCE_AUTHENTICATION",
  "ARTIFACT_AUTHORIZATION",
  "REVISION_INTEGRITY",
  "FINGERPRINT_INTEGRITY",
  "PROVENANCE",
  "WORKSPACE_ISOLATION",
  "MAPPING_AUTHORITY",
  "AI_AUTHORITY",
  "UNTRUSTED_FILE_HANDLING",
  "PARSER_ISOLATION",
] as const;
export const D1M_0_SPOOFING_CONTROLS = [
  "FAKE_SOURCE_SYSTEM",
  "FAKE_REVISION",
  "FORGED_METADATA",
  "CROSS_WORKSPACE_SUBSTITUTION",
  "AUTHORITY_IMPERSONATION",
  "CONTENT_FINGERPRINT_MISMATCH",
] as const;
export const D1M_0_SECURITY_CONTRACT =
  "CAD and BIM bytes are untrusted input if a later phase ingests them. Future runtime must isolate parsers, bound resources, and reject malformed content, unsafe embedded content, external references, and path traversal. This phase adds no security library and no parser sandbox. Tenant, workspace, and project scope are mandatory. Least privilege, data minimization, residency extensibility, and auditability stay in force. EU-grade privacy, cybersecurity, human oversight, and AI transparency are a high-bar baseline. Deployment is not hard-coded to the EU. No legal compliance or certification is claimed." as const;
export const D1M_0_EOS_OWNS_EXTERNAL_MODEL = false as const;
export const D1M_0_RETENTION_MODES = ["REFERENCE", "GOVERNED_METADATA", "EXTRACTED_EVIDENCE", "CONTENT_SNAPSHOT"] as const;
export const D1M_0_LARGE_BINARY_STORAGE_DECIDED = false as const;
export const D1M_0_UNCONTROLLED_SOURCE_BODY_COPY_AUTHORIZED = false as const;
export const D1M_0_SOURCE_OF_TRUTH_CONTRACT =
  "For an external governed source, EOS is an evidence consumer and a governed reference holder. For a manual governed reference, EOS holds the reference and does not own the external model. Native EOS source of record exists only when an already authorized EOS authoring track created the artifact. D1M does not author that artifact and does not become the owner of an external model." as const;

export const D1M_RUNTIME_STARTED = false as const;
export const D1M_RUNTIME_COUNT = 0 as const;
export const CAD_BIM_SOURCE_REFERENCE_RUNTIME_COUNT = 0 as const;
export const CAD_BIM_ARTIFACT_RUNTIME_COUNT = 0 as const;
export const CAD_BIM_OBJECT_RUNTIME_COUNT = 0 as const;
export const CAD_BIM_GEOMETRY_RUNTIME_COUNT = 0 as const;
export const CAD_BIM_SEMANTIC_RUNTIME_COUNT = 0 as const;
export const CAD_BIM_RELATIONSHIP_RUNTIME_COUNT = 0 as const;
export const CAD_BIM_CHANGE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_CAD_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_BIM_AUTHORING_RUNTIME_COUNT = 0 as const;
export const GENERIC_ENGINEERING_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const NEW_EXTERNAL_CONNECTOR_RUNTIME_COUNT = 0 as const;
export const GEOMETRY_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const AUTOMATIC_MODEL_CORRECTION_RUNTIME_COUNT = 0 as const;
export const D2_D8_RUNTIME_STARTED = false as const;
export const D2_D8_RUNTIME_COUNT = 0 as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1N_CURRENT_STATUS = "NOT_ABSORBED" as const;
export const D1N_RUNTIME_STARTED = false as const;
export const D1N_RUNTIME_COUNT = 0 as const;
export const D1M_0_DATABASE_SCHEMA_CHANGED = false as const;
export const D1M_0_NEW_DEPENDENCY_ADDED = false as const;
export const D1M_0_STRUCTURAL_PACK_COMPLETE = false as const;
export const D1M_0_D1G_BLOCKER_PRESERVED = true as const;
export const D1M_0_POST_D1J_DEBT_PRESERVED = true as const;
export const D1M_0_D1K_LIMITATIONS_PRESERVED = true as const;
export const D1M_0_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = true as const;
export const D1M_0_UNAUTHORIZED_VALIDATION_PROMOTION = false as const;
export const D1M_0_UNAUTHORIZED_CONFORMANCE_PROMOTION = false as const;
export const D1M_0_UNAUTHORIZED_SOLVER_CERTIFICATION_PROMOTION = false as const;
export const D1M_0_UNAUTHORIZED_CERTIFICATION_PROMOTION = false as const;
export const D1M_0_UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D1M_0_PROVISIONAL_DECOMPOSITION =
  "EOS-D1M-R1-CAD-OR-BIM-ARTIFACT-SOURCE-REVISION-FOUNDATION; EOS-D1M-R2-SOURCE-OBJECT-STRUCTURAL-TARGET-MAPPING; EOS-D1M-R3-GEOMETRY-SEMANTIC-EVIDENCE; EOS-D1M-R4-UNIT-COORDINATE-AXIS-REFERENCE; EOS-D1M-R5-MODEL-RELATIONSHIP-EVIDENCE; EOS-D1M-R6-FILE-API-ADAPTER-BOUNDARY; EOS-D1M-R7-CHANGE-STALENESS-SUPERSESSION; EOS-D1M-R8-D1K-D1L-D1N-EVIDENCE-HANDOFF; EOS-D1M-R9-CAD-OR-BIM-INTELLIGENCE-CLOSEOUT" as const;
export const D1M_0_PHASE_PREREQUISITE_MATRIX =
  "R1 may record one exact artifact revision and cannot parse, ingest, map, or interpret. R2 may map a source object to a D1A target and cannot let AI approve the mapping. R3 may record geometry and semantic evidence and cannot validate adequacy or auto-map unknown labels. R4 may record unit, coordinate, and axis identity using D1K and cannot convert or infer them. R5 may record source relationships and cannot treat them as a load path. R6 may record a format and API boundary and cannot add a parser or connector. R7 may record change and supersession and cannot decide engineering impact. R8 may cite D1K, D1L, and D1N handoff evidence and cannot certify, orchestrate, or absorb those tracks. R9 may close the bounded track and cannot complete the structural pack." as const;
export const D1M_R1_CANONICAL_PHASE = "EOS-D1M-R1-CAD-OR-BIM-ARTIFACT-SOURCE-REVISION-FOUNDATION" as const;
export const D1M_R1_PHASE_TYPE = "CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION" as const;
export const D1M_R1_CANONICAL_SCOPE =
  "Record one governed reference to an exact CAD or BIM source artifact revision, including source class, authority, provenance, content fingerprint, and tenant, workspace, and project scope. Do not parse the artifact, ingest a file, map an object, extract geometry, convert units, infer axes, start a connector, or treat the reference as engineering validation." as const;
