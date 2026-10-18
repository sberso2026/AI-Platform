/**
 * EOS-D1H-R5 closeout of the bounded structural inspection and condition track.
 * This module reconciles existing R1-R4 records. It does not add a capability family.
 */
import { D1I_STRUCTURAL_DIGITAL_TWIN_IMPLEMENTED } from "@rtb/types";
import type { D1hR1Store } from "./inspection-evidence";
import type { D1hR2Store } from "./inspection-finding";
import type { D1hR3Store } from "./inspection-condition";
import type { D1hR4Store } from "./inspection-temporal";

export const D1H_R5_FINAL_MATURITY_STATE = "STRUCTURAL_INSPECTION_CONDITION_BOUNDED_RUNTIME_IMPLEMENTED" as const;
export const D1H_CLOSEOUT_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1H_CLOSEOUT_EQUALS_CAPACITY_ASSESSMENT = false as const;
export const D1H_CLOSEOUT_EQUALS_REPAIR_APPROVAL = false as const;
export const D1H_CLOSEOUT_EQUALS_DIGITAL_TWIN = false as const;
export const D1H_RECORD_LEVEL_HUMAN_VALIDATION_EQUALS_SOFTWARE_ENGINEER_VALIDATION = false as const;
export const D1H_RECORD_LEVEL_HUMAN_VALIDATION_EQUALS_METHOD_CONFORMANCE = false as const;
export const RATING_SCHEME_CONTENT_IMMUTABLE_PER_ID_VERSION = true as const;
export const D1H_R5_RATING_COMPARABILITY_SAFE_IDENTITY = "PASS" as const;
export const D1H_R5_HISTORICAL_RATING_FLOATS_TO_CURRENT_SCHEME = false as const;
export const D1H_R5_DEFAULT_CONDITION_RATING_SCHEME = "NONE" as const;
export const D1H_R5_CROSS_SCHEME_TRANSLATION_IMPLEMENTED = false as const;
export const D1H_R5_CROSS_SCHEME_AVERAGING_IMPLEMENTED = false as const;
export const D1H_R5_CROSS_SCHEME_NORMALIZATION_IMPLEMENTED = false as const;
export const D1H_RECORD_LEVEL_HUMAN_VALIDATION_RUNTIME_COUNT = 1 as const;
export const D1H_SOFTWARE_ENGINEER_VALIDATION_COUNT = 0 as const;
export const D1H_METHOD_CONFORMANCE_VALIDATION_COUNT = 0 as const;
export const D1H_R5_RECORD_VALIDATION_PROMOTES_D1H_ENGINEER_VALIDATED = false as const;
export const D1H_R5_AI_GOVERNING_AUTHORITY_COUNT = 0 as const;
export const D1H_R5_AI_CAN_DECLARE_STRUCTURE_SAFE = false as const;
export const D1H_R5_AI_CAN_DECLARE_STRUCTURE_UNSAFE = false as const;
export const D1H_STRUCTURAL_ADEQUACY_RUNTIME_COUNT = 0 as const;
export const D1H_CAPACITY_ASSESSMENT_RUNTIME_COUNT = 0 as const;
export const D1H_REPAIR_RECOMMENDATION_ENGINE_COUNT = 0 as const;
export const D1H_REPAIR_DESIGN_ENGINE_COUNT = 0 as const;
export const D1H_FITNESS_FOR_SERVICE_ENGINE_COUNT = 0 as const;
export const D1H_CORROSION_RATE_ENGINE_COUNT = 0 as const;
export const D1H_CRACK_GROWTH_ENGINE_COUNT = 0 as const;
export const D1H_FATIGUE_LIFE_ENGINE_COUNT = 0 as const;
export const D1H_REMAINING_LIFE_ENGINE_COUNT = 0 as const;
export const D1H_FUTURE_CONDITION_PREDICTION_COUNT = 0 as const;
export const D1H_CAUSAL_DIAGNOSIS_ENGINE_COUNT = 0 as const;
export const D1H_ANALYSIS_MODEL_MODIFICATION_COUNT = 0 as const;
export const D1H_AUTOMATIC_SECTION_PROPERTY_UPDATE_COUNT = 0 as const;
export const D1H_AUTOMATIC_MATERIAL_PROPERTY_UPDATE_COUNT = 0 as const;
export const D1H_DIGITAL_TWIN_RUNTIME_COUNT = 0 as const;
export const D1H_SHM_STREAMING_RUNTIME_COUNT = 0 as const;
export const D1H_COMPUTER_VISION_RUNTIME_COUNT = 0 as const;
export const D1H_EVIDENCE_FOUNDATION_RUNTIME_COUNT = 1 as const;
export const D1H_STRUCTURAL_FINDING_RUNTIME_COUNT = 1 as const;
export const D1H_MEASUREMENT_RUNTIME_COUNT = 1 as const;
export const D1H_HUMAN_VALIDATION_RUNTIME_COUNT = 1 as const;
export const D1H_ENGINEERING_INTERPRETATION_RUNTIME_COUNT = 1 as const;
export const D1H_CONDITION_RATING_RUNTIME_COUNT = 1 as const;
export const D1H_CONDITION_STATE_RUNTIME_COUNT = 1 as const;
export const D1H_FINDING_ASSOCIATION_RUNTIME_COUNT = 1 as const;
export const D1H_CONDITION_CONTINUITY_RUNTIME_COUNT = 1 as const;
export const D1H_MEASUREMENT_COMPARISON_RUNTIME_COUNT = 1 as const;
export const D1H_CHANGE_EVIDENCE_RUNTIME_COUNT = 1 as const;
export const D1H_ANALYSIS_LINK_RUNTIME_COUNT = 1 as const;
export const D1H_AUTOMATIC_RATING_ENGINE_COUNT = 0 as const;
export const D1H_AI_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1H_REPAIR_DESIGN_RUNTIME_COUNT = 0 as const;
export const D1H_DETERIORATION_PREDICTION_RUNTIME_COUNT = 0 as const;
export const D1H_CAUSAL_DIAGNOSIS_RUNTIME_COUNT = 0 as const;
export const D1H_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1H_R5_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1H_R5_AUTOMATIC_RATING_ENGINE_COUNT = 0 as const;
export const D1H_R5_REGRESSION_ENGINE_COUNT = 0 as const;
export const D1H_R5_TREND_PREDICTION_ENGINE_COUNT = 0 as const;
export const D1H_R5_FUTURE_CONDITION_PREDICTION_COUNT = 0 as const;
export const D1H_R5_CAUSAL_DIAGNOSIS_ENGINE_COUNT = 0 as const;
export const D1H_R5_FLOATING_ANALYSIS_REFERENCE_COUNT = 0 as const;
export const D1H_R5_DERIVED_DETERIORATION_RATE_LOGIC_PRESENT = false as const;
export const D1H_R5_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1H_R5_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1I_REAUTHORS_D1H_EVIDENCE = false as const;
export const D1I_REAUTHORS_D1H_FINDINGS = false as const;
export const D1I_REAUTHORS_D1H_CONDITION_STATES = false as const;
export const D1I_REAUTHORS_D1H_TEMPORAL_HISTORY = false as const;
export const D1I_CAN_MUTATE_D1H_HISTORY = false as const;
export const D1H_TRACK_STATUS = "COMPLETE_BOUNDED_WITH_LIMITATIONS" as const;
export const POST_D1H_NEXT_TRACK = "D1I_STRUCTURAL_DIGITAL_TWIN" as const;
export const CANONICAL_NEXT_IMPLEMENTATION_PHASE = "NOT_DEFINED" as const;
export const D2_STARTED_BY_D1H_CLOSEOUT = false as const;

export const D1H_R5_PHASE_INVENTORY = "D1H-0 architecture types in structural-inspection-d1h-0; R1 inspection-evidence runtime and tests; R2 inspection-finding runtime and tests; R3 inspection-condition runtime and tests; R4 inspection-temporal runtime and tests. Capability rows live on STRUCTURAL_CAPABILITY_MANIFEST. Validation state remains NOT_VALIDATED. Release classification covers the structural-systems paths. Events are record events, not engineering approval. Fingerprints use fingerprintCanonical. Limitations exclude adequacy, capacity, repair, forecasting, causal diagnosis, and digital twin. Maturity is bounded runtime, not engineer validation." as const;
export const D1H_R5_REUSE_MATRIX = "inspection-intelligence referenced and not imported; artifact identity reused; canonical units reused; review roles reused without professional-registration inference; D1A and D1F identities reused by id; D1F and D1G analysis identities referenced; provenance and fingerprintCanonical reused." as const;
export const D1H_R5_R1_CAPABILITY_RECONCILIATION = "IMPLEMENTED context, target, bounded region, coverage, negative observation, evidence identity, raw-source preservation, derived evidence, history, provenance, fingerprints, invalidation." as const;
export const D1H_R5_R2_CAPABILITY_RECONCILIATION = "IMPLEMENTED finding, evidence linkage, measurement, scoped human validation, append-only history, provenance, fingerprints, invalidation." as const;
export const D1H_R5_R3_CAPABILITY_RECONCILIATION = "IMPLEMENTED scheme identity and version, profile-bound rating, interpretation, condition rating, condition state, scoped validation, history, provenance, fingerprints, invalidation." as const;
export const D1H_R5_R4_CAPABILITY_RECONCILIATION = "IMPLEMENTED association, split and merged lineage, continuity, measurement comparison, change evidence, analysis-result linkage, temporal alignment, provenance, fingerprints, invalidation, historical reproducibility." as const;
export const D1H_R5_RATING_SCHEME_REGISTER = "D1H registers no production default. Inventory only: structural_ordinal_1_5 version 1.0.0 pack structural_condition; generic_numeric_0_100 version 1.0.0 pack generic. Test-only schemes may be registered with productionDefault false." as const;
export const D1H_R5_RATING_SCHEME_IMMUTABILITY_AUDIT = "A second registration of the same scheme id and version is rejected. The registered definition, applicability, and provenance are frozen. Ratings and condition states store the scheme fingerprint captured at assessment time. Temporal comparison rejects a fingerprint mismatch." as const;
export const D1H_R5_ANALYSIS_LINK_IDENTITY_MATRIX = "analysis model id, version, fingerprint; analysis run id and fingerprint; result, result-set, and normalized result ids; result class; authority state; run status; result category; load case; combination; location; provider id, version, provenance; model-validation evidence ref; analysis timestamp; bound identity fingerprint." as const;
export const D1H_R5_PROVENANCE_COVERAGE_MATRIX = "context, coverage, evidence, finding, measurement, human validation, interpretation, rating scheme, condition rating, condition state, association, continuity, measurement comparison, change evidence, and analysis link each carry actor, timestamp, authority, version, and fingerprint." as const;
export const D1H_R5_FINGERPRINT_COVERAGE_MATRIX = "context, coverage, evidence, finding, measurement, validation, interpretation, scheme, rating, condition state, association, continuity, comparison, change evidence, and analysis link each have a deterministic fingerprint. Scheme content fingerprint is reused by rating and condition state." as const;
export const D1H_R5_INVALIDATION_MATRIX = "target stale; source evidence correction; finding correction; measurement correction; validation withdrawal; interpretation correction; rating-scheme version or content change; condition-state supersession; association correction; comparison correction; analysis result stale or fingerprint change; authority withdrawal. Invalidation does not delete history." as const;
export const D1H_R5_HISTORY_SUPERSESSION_MATRIX = "R1 through R4 corrections append a successor and preserve the predecessor body. Supersession and staleness are state entries. History is not rewritten from insertion order or identifier order." as const;
export const D1H_R5_AUTHORITY_MATRIX = "Evidence, finding, measurement, validation, interpretation, rating, condition state, association confirmation, analysis link, and current-state selection require human authority. AI may supply a non-governing candidate only. Role is not professional registration." as const;
export const D1H_R5_CAPABILITY_MATRIX = "IMPLEMENTED bounded: context, target linkage, coverage, evidence, negative observation, finding, measurement, human validation, interpretation, profile-bound rating, condition state, association, continuity, comparison, change evidence, analysis linkage. NOT IMPLEMENTED: AI detection runtime, automatic rating, severity scoring, structural adequacy, capacity assessment, repair design, fitness-for-service, deterioration prediction, causal diagnosis, computer vision, SHM, digital twin." as const;
export const D1H_R5_MATURITY_MATRIX = "ARCHITECTURE_DEFINED yes; RUNTIME_IMPLEMENTED yes for the bounded chain; AUTOMATED_TEST_VALIDATED yes; RECORD_LEVEL_HUMAN_VALIDATION_SUPPORTED yes; SOFTWARE_ENGINEER_VALIDATED no; CONFORMANCE_VALIDATED no." as const;
export const D1H_R5_PRODUCT_CLAIM_MATRIX = "BOUNDED CLAIM: inspection context, coverage, evidence management, finding recording, measurement recording, scoped human validation, engineering interpretation, profile-bound condition rating, condition state, finding association, temporal continuity, measurement comparison, change evidence, analysis-result linkage. NOT CLAIMED: automatic structural condition assessment, structural adequacy, capacity reduction, repair design, deterioration forecasting, causal diagnosis, digital twin." as const;
export const D1H_R5_CANONICAL_DEBT_LEDGER = "D1H software engineer validation pending; method conformance pending; no structural adequacy automation; no capacity assessment from condition; no repair design; no fitness-for-service; no deterioration prediction; no causal diagnosis; no computer-vision runtime; no SHM runtime; no digital-twin runtime; no automatic cross-scheme translation; rating-scheme profile governance required; AI remains advisory; concrete C10 human review pending; D1F system-orchestrator human review pending; SPACE GASS live validation pending; GA security debt remains." as const;
export const D1H_R5_DEBT_CLASSIFICATION_MATRIX = "Software and method validation block engineer-validated and conformance claims, not D1H closeout. Adequacy, capacity, repair, fitness-for-service, deterioration, and causal diagnosis block those claims and are future capability. Computer vision, SHM, and digital twin block the digital-twin claim and are future capability. Cross-scheme translation and profile governance block automatic rating claims. C10 and D1F human review and SPACE GASS live validation block engineer-validated and conformance claims. GA security debt blocks general availability." as const;
export const D1H_R5_D1I_HANDOFF_MATRIX = "D1I may reference target, current and historical condition states, context, evidence, finding, measurement, validation, interpretation, rating, association, continuity, comparison, change evidence, analysis link, timestamps, provenance, and fingerprints. It does not copy or re-author those bodies." as const;
export const D1H_R5_POST_D1H_ROADMAP_EVIDENCE = "EOS_POST_D1G_CANONICAL_ROADMAP names D1I STRUCTURAL DIGITAL TWIN after D1H and does not define an implementation phase identifier such as D1I-0. D1J, D1K, D1L, D1M, and D1N remain unimplemented. D2 is not started." as const;

export const D1I_STATUS = "NOT_IMPLEMENTED" as const;
export const D1J_STATUS = "NOT_IMPLEMENTED" as const;
export const D1K_STATUS = "NOT_IMPLEMENTED" as const;
export const D1L_STATUS = "NOT_IMPLEMENTED" as const;
export const D1M_STATUS = "UNIMPLEMENTED_BOUNDARY" as const;
export const D1N_STATUS = "UNIMPLEMENTED_BOUNDARY" as const;

const REQUIRED_CAPABILITIES: ReadonlyArray<readonly [string, string]> = [
  ["D1H.R1.STRUCTURAL_INSPECTION_EVIDENCE_FOUNDATION", "IMPLEMENTED_RUNTIME"],
  ["D1H.STRUCTURAL_FINDING_RUNTIME", "IMPLEMENTED_BOUNDED"],
  ["D1H.STRUCTURAL_MEASUREMENT_RUNTIME", "IMPLEMENTED_BOUNDED"],
  ["D1H.STRUCTURAL_HUMAN_VALIDATION_RUNTIME", "IMPLEMENTED_BOUNDED"],
  ["D1H.STRUCTURAL_ENGINEERING_INTERPRETATION", "IMPLEMENTED_BOUNDED"],
  ["D1H.STRUCTURAL_CONDITION_RATING", "IMPLEMENTED_PROFILE_BOUND"],
  ["D1H.STRUCTURAL_CONDITION_STATE", "IMPLEMENTED_BOUNDED"],
  ["D1H.STRUCTURAL_FINDING_ASSOCIATION", "IMPLEMENTED_BOUNDED"],
  ["D1H.STRUCTURAL_CONDITION_TEMPORAL_CONTINUITY", "IMPLEMENTED_BOUNDED"],
  ["D1H.STRUCTURAL_MEASUREMENT_HISTORICAL_COMPARISON", "IMPLEMENTED_BOUNDED"],
  ["D1H.STRUCTURAL_CHANGE_EVIDENCE", "IMPLEMENTED_BOUNDED"],
  ["D1H.STRUCTURAL_ANALYSIS_RESULT_LINKAGE", "IMPLEMENTED_BOUNDED"],
  ["D1H.STRUCTURAL_CAPACITY_ASSESSMENT", "NOT_IMPLEMENTED"],
  ["D1H.STRUCTURAL_REPAIR_DESIGN", "NOT_IMPLEMENTED"],
  ["D1H.STRUCTURAL_DETERIORATION_PREDICTION", "NOT_IMPLEMENTED"],
  ["D1H.STRUCTURAL_CAUSAL_DIAGNOSIS", "NOT_IMPLEMENTED"],
  ["D1H.STRUCTURAL_DIGITAL_TWIN", "NOT_IMPLEMENTED"],
  ["D1H.STRUCTURAL_CONDITION_RUNTIME", "NOT_IMPLEMENTED"],
];

export function d1hCapabilityManifestReconciled(rows: readonly { capabilityId: string; implementationState: string; validationState: string }[]): boolean {
  return REQUIRED_CAPABILITIES.every(([id, state]) => rows.some((row) => row.capabilityId === id && row.implementationState === state && row.validationState === "NOT_VALIDATED"));
}

export function d1hValidationMatrixReconciled(rows: readonly { capabilityId: string; validationState: string; conformanceState: string }[]): boolean {
  const ids = REQUIRED_CAPABILITIES.map(([id]) => id);
  return ids.every((id) => rows.some((row) => row.capabilityId === id && row.validationState === "NOT_VALIDATED" && row.conformanceState === "INTENDED_PROFILE"));
}

export type D1hR5HandoffReference = {
  copiedBodies: false;
  reauthorsEvidence: false;
  reauthorsFindings: false;
  reauthorsConditionStates: false;
  reauthorsTemporalHistory: false;
  mutatesHistory: false;
  digitalTwinImplemented: false;
  targetIds: readonly string[];
  contextIds: readonly string[];
  coverageIds: readonly string[];
  evidence: readonly { id: string; fingerprint: string }[];
  findings: readonly { id: string; fingerprint: string }[];
  measurements: readonly { id: string; fingerprint: string }[];
  validations: readonly string[];
  interpretations: readonly { id: string; fingerprint: string }[];
  ratings: readonly { id: string; schemeFingerprint: string; fingerprint: string }[];
  conditionStates: readonly { id: string; fingerprint: string; schemeFingerprint: string | null }[];
  associations: readonly { id: string; fingerprint: string }[];
  continuities: readonly { id: string; fingerprint: string }[];
  comparisons: readonly { id: string; fingerprint: string }[];
  changeEvidence: readonly { id: string; fingerprint: string }[];
  analysisLinks: readonly { id: string; analysisResultId: string; fingerprint: string }[];
};

export function d1hCloseoutHandoff(r1: D1hR1Store, r2: D1hR2Store, r3: D1hR3Store, r4: D1hR4Store): D1hR5HandoffReference {
  return {
    copiedBodies: false,
    reauthorsEvidence: false,
    reauthorsFindings: false,
    reauthorsConditionStates: false,
    reauthorsTemporalHistory: false,
    mutatesHistory: false,
    digitalTwinImplemented: D1I_STRUCTURAL_DIGITAL_TWIN_IMPLEMENTED,
    targetIds: r1.targets.map((row) => row.targetId),
    contextIds: r1.contexts.map((row) => row.inspectionContextId),
    coverageIds: r1.coverages.map((row) => row.coverageId),
    evidence: r1.evidence.map((row) => ({ id: row.evidenceId, fingerprint: row.fingerprint })),
    findings: r2.structuralFindings.map((row) => ({ id: row.findingId, fingerprint: row.fingerprint })),
    measurements: r2.measurements.map((row) => ({ id: row.measurementId, fingerprint: row.fingerprint })),
    validations: [...r2.validations.map((row) => row.validationId), ...r3.validations.map((row) => row.validationId)],
    interpretations: r3.interpretations.map((row) => ({ id: row.interpretationId, fingerprint: row.fingerprint })),
    ratings: r3.ratings.map((row) => ({ id: row.ratingId, schemeFingerprint: row.schemeFingerprint, fingerprint: row.fingerprint })),
    conditionStates: r3.conditionStates.map((row) => ({ id: row.conditionStateId, fingerprint: row.fingerprint, schemeFingerprint: row.schemeFingerprint })),
    associations: r4.associations.map((row) => ({ id: row.associationId, fingerprint: row.fingerprint })),
    continuities: r4.continuities.map((row) => ({ id: row.continuityId, fingerprint: row.fingerprint })),
    comparisons: r4.comparisons.map((row) => ({ id: row.comparisonId, fingerprint: row.fingerprint })),
    changeEvidence: r4.changeEvidence.map((row) => ({ id: row.changeEvidenceId, fingerprint: row.fingerprint })),
    analysisLinks: r4.analysisLinks.map((row) => ({ id: row.analysisLinkId, analysisResultId: row.analysisResultId, fingerprint: row.fingerprint })),
  };
}
