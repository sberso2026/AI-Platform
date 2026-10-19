/**
 * EOS-D1I-R4 external monitoring reference interface.
 * Pins source, device, channel, binding, and dataset identity.
 * Does not ingest samples, connect to a provider, or infer engineering state.
 */

import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { existingUnitPairCompatible } from "./inspection-temporal";
import {
  inspectTwin,
  markTelemetryPinStatus,
  publishTelemetryPin,
  registerStateReference,
  type D1iR1Actor,
  type D1iR1SourceTimes,
  type D1iR1TargetPin,
} from "./twin-reference-foundation";
import type { D1iR3Store } from "./twin-conflict-composition";

export const D1I_R4_MATURITY_STATE = "STRUCTURAL_DIGITAL_TWIN_EXTERNAL_TELEMETRY_MONITORING_REFERENCE_INTERFACE_IMPLEMENTED" as const;
export const D1I_R4_REFERENCE_INTERFACE_EQUALS_STREAMING_PLATFORM = false as const;
export const D1I_R4_SENSOR_VALUE_EQUALS_ENGINEERING_INTERPRETATION = false as const;
export const D1I_R4_EXTERNAL_ALERT_EQUALS_STRUCTURAL_FINDING = false as const;
export const D1I_R4_TELEMETRY_STATE_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1I_R4_OWNS_RAW_EXTERNAL_TELEMETRY = false as const;
export const D1I_R4_OWNS_TELEMETRY_REFERENCE_METADATA = true as const;
export const D1I_R4_SAME_CHANNEL_NAME_EQUALS_SAME_SENSOR = false as const;
export const D1I_R4_SAME_SENSOR_MODEL_EQUALS_SAME_SENSOR = false as const;
export const D1I_R4_PROXIMITY_EQUALS_TARGET_BINDING = false as const;
export const D1I_R4_SENSOR_TARGET_MAPPING_AUTHORITY_REQUIRED = true as const;
export const D1I_R4_SENSOR_TARGET_MAPPING_FROM_GEOMETRIC_PROXIMITY = false as const;
export const D1I_R4_AI_CAN_GOVERN_SENSOR_TARGET_MAPPING = false as const;
export const D1I_R4_DEVICE_TIME_EQUALS_TRUSTED_GLOBAL_TIME = false as const;
export const D1I_R4_EOS_KNOWN_AT_RUNTIME_ASSIGNED = true as const;
export const D1I_R4_CALLER_CAN_BACKDATE_KNOWN_AT = false as const;
export const D1I_R4_UNKNOWN_CLOCK_SYNC_AUTO_COMPATIBLE = false as const;
export const D1I_R4_TIMESTAMP_PROXIMITY_EQUALS_SYNCHRONIZED = false as const;
export const D1I_R4_CALIBRATED_EQUALS_STRUCTURAL_VALIDATION = false as const;
export const D1I_R4_UNKNOWN_CALIBRATION_AUTO_PROMOTED = false as const;
export const D1I_R4_UNCALIBRATED_VALUE_AUTO_GOVERNS_ENGINEERING_STATE = false as const;
export const D1I_R4_PROCESSED_EQUALS_RAW = false as const;
export const D1I_R4_DERIVED_EQUALS_DIRECT_MEASUREMENT = false as const;
export const D1I_R4_DIGITAL_THREAD_REUSED = true as const;
export const D1I_R4_PROVIDER_NEUTRAL_INTERFACE = true as const;
export const D1I_R4_ARBITRARY_PROVIDER_NETWORK_ACCESS = false as const;
export const D1I_R4_EXTERNAL_NETWORK_CONNECTOR_COUNT = 0 as const;
export const D1I_R4_ARBITRARY_URL_FETCH_ALLOWED = false as const;
export const D1I_R4_GENERIC_HTTP_CLIENT_CREATED = false as const;
export const D1I_R4_ARBITRARY_FILESYSTEM_REFERENCE_ALLOWED = false as const;
export const D1I_R4_DISPLAY_NAME_EQUALS_DEVICE_IDENTITY = false as const;
export const D1I_R4_SENSOR_REPLACEMENT_REUSES_PHYSICAL_IDENTITY = false as const;
export const D1I_R4_DEVICE_HISTORY_APPEND_ONLY = true as const;
export const D1I_R4_CHANNEL_NAME_EQUALS_CHANNEL_IDENTITY = false as const;
export const D1I_R4_NUMERIC_CHANNEL_QUANTITY_REQUIRED = true as const;
export const D1I_R4_EXISTING_UNIT_SYSTEM_REUSED = true as const;
export const D1I_R4_MISSING_UNIT_AUTO_INFERRED = false as const;
export const D1I_R4_AXIS_ORIENTATION_INFERRED = false as const;
export const D1I_R4_COORDINATE_SYSTEM_INFERRED = false as const;
export const D1I_R4_D1A_IDENTITY_REUSED = true as const;
export const D1I_R4_D1F_IDENTITY_REUSED = true as const;
export const D1I_R4_TARGET_BINDING_AUTHORITY_REQUIRED = true as const;
export const D1I_R4_NEAREST_MEMBER_AUTO_BINDING = false as const;
export const D1I_R4_COORDINATE_PROXIMITY_AUTO_BINDING = false as const;
export const D1I_R4_AI_TARGET_BINDING_AUTO_ACCEPTED = false as const;
export const D1I_R4_BINDING_VALID_UNTIL_NEXT_AUTO_INFERRED = false as const;
export const D1I_R4_SENSOR_RELOCATION_MUTATES_PRIOR_BINDING = false as const;
export const D1I_R4_TARGET_BINDING_HISTORY_APPEND_ONLY = true as const;
export const D1I_R4_TELEMETRY_SAMPLE_ARRAY_STORED = false as const;
export const D1I_R4_RAW_BINARY_TELEMETRY_STORED = false as const;
export const D1I_R4_BASE64_TELEMETRY_PAYLOAD_STORED = false as const;
export const D1I_R4_SAMPLE_COUNT_EQUALS_COMPLETE_DATASET = false as const;
export const D1I_R4_TIME_RANGE_EQUALS_CONTINUOUS_DATA = false as const;
export const D1I_R4_DATA_GAP_ANALYTICS_COUNT = 0 as const;
export const D1I_R4_DERIVED_DATA_CLASSIFIED_AS_RAW = false as const;
export const D1I_R4_SOURCE_PROCESSING_REEXECUTED = false as const;
export const D1I_R4_EXTERNAL_DERIVED_RESULT_EQUALS_DIRECT_MEASUREMENT = false as const;
export const D1I_R4_EXTERNAL_ALERT_AUTO_CREATES_D1H_FINDING = false as const;
export const D1I_R4_EXTERNAL_ALERT_AUTO_CREATES_R3_CONFLICT = false as const;
export const D1I_R4_EXTERNAL_ALERT_EQUALS_UNSAFE = false as const;
export const D1I_R4_UNVERIFIED_EXTERNAL_DATA_CAN_BECOME_EXACT_STATE_REFERENCE = false as const;
export const D1I_R4_CALLER_CHECKSUM_CAN_ESTABLISH_SOURCE_TRUTH = false as const;
export const D1I_R4_EXTERNAL_URI_EQUALS_FETCH_PERMISSION = false as const;
export const D1I_R4_SECRET_STORAGE_IN_REFERENCE_RECORD = false as const;
export const D1I_R4_SOURCE_REPORTED_SYNC_EQUALS_EOS_VALIDATED_SYNC = false as const;
export const D1I_R4_TIME_ALIGNMENT_ENGINE_COUNT = 0 as const;
export const D1I_R4_UNKNOWN_CLOCK_COMPATIBILITY_FAILS_CLOSED = true as const;
export const D1I_R4_DEVICE_TIME_EQUALS_EOS_KNOWN_AT = false as const;
export const D1I_R4_KNOWN_AT_BACKDATE_REJECTED = true as const;
export const D1I_R4_CALIBRATION_STATUS_INFERRED_FROM_SENSOR_MODEL = false as const;
export const D1I_R4_CALIBRATION_STATUS_INFERRED_FROM_RECENT_DATA = false as const;
export const D1I_R4_DEFAULT_CALIBRATION_INTERVAL_CREATED = false as const;
export const D1I_R4_CALIBRATION_EQUALS_SOURCE_VALIDATION = false as const;
export const D1I_R4_CALIBRATION_EQUALS_MODEL_VALIDATION = false as const;
export const D1I_R4_CALIBRATION_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1I_R4_DATA_QUALITY_ANALYTICS_COUNT = 0 as const;
export const D1I_R4_UNKNOWN_QUALITY_AUTO_GOOD = false as const;
export const D1I_R4_SOURCE_DATA_QUALITY_EQUALS_ENGINEERING_ACCEPTANCE = false as const;
export const D1I_R4_R1_RESOLVER_EXTENSION_IMPLEMENTED = true as const;
export const D1I_R4_TELEMETRY_REFERENCE_TO_TELEMETRY_STATE_EXPLICIT = true as const;
export const D1I_R4_TELEMETRY_AUTO_PROMOTED_TO_MEASURED_STATE = false as const;
export const D1I_R4_TELEMETRY_STATE_EQUALS_INFERRED_STATE = false as const;
export const D1I_R4_TELEMETRY_STATE_EQUALS_CONDITION_STATE = false as const;
export const D1I_R4_TELEMETRY_STATE_REFERENCE_PINNED = true as const;
export const D1I_R4_FLOATING_LATEST_TELEMETRY_REFERENCE_ALLOWED = false as const;
export const D1I_R4_LATEST_SAMPLE_AUTO_SELECTED = false as const;
export const D1I_R4_TELEMETRY_REGISTRATION_AUTO_CHANGES_R2_CURRENT_SELECTION = false as const;
export const D1I_R4_NEW_TELEMETRY_MUTATES_R2_SNAPSHOT = false as const;
export const D1I_R4_TELEMETRY_AUTO_CREATES_R3_COMPATIBILITY_ASSESSMENT = false as const;
export const D1I_R4_TELEMETRY_AUTO_CREATES_R3_CONFLICT = false as const;
export const D1I_R4_R3_COMPARATOR_REGISTRY_MODIFIED = false as const;
export const D1I_R4_SENSOR_BINDING_EQUALS_GLOBAL_MEMBER_RESPONSE = false as const;
export const D1I_R4_SENSOR_QUANTITY_EQUALS_DESIGN_DEMAND = false as const;
export const D1I_R4_ACCELERATION_AUTO_INTEGRATED = false as const;
export const D1I_R4_ACCELERATION_AUTO_MODAL_IDENTIFIED = false as const;
export const D1I_R4_STRAIN_AUTO_CONVERTED_TO_STRESS = false as const;
export const D1I_R4_STRAIN_AUTO_CONVERTED_TO_MEMBER_FORCE = false as const;
export const D1I_R4_DISPLACEMENT_EQUALS_ANALYSIS_DISPLACEMENT = false as const;
export const D1I_R4_DISPLACEMENT_EQUALS_DAMAGE = false as const;
export const D1I_R4_TEMPERATURE_AUTO_UPDATES_MODEL = false as const;
export const D1I_R4_VIBRATION_DIAGNOSIS_ENGINE_COUNT = 0 as const;
export const D1I_R4_ENGINEERING_THRESHOLD_ENGINE_COUNT = 0 as const;
export const D1I_R4_EXTERNAL_ALERT_PROMOTES_ENGINEERING_AUTHORITY = false as const;
export const D1I_R4_AUTHORITY_LAYERS_DISTINCT = true as const;
export const D1I_R4_REGISTRATION_PROMOTES_SOURCE_VALIDATION = false as const;
export const D1I_R4_TARGET_BINDING_PROMOTES_SENSOR_VALIDATION = false as const;
export const D1I_R4_EXTERNAL_DERIVED_RESULT_EQUALS_D1H_ENGINEERING_INTERPRETATION = false as const;
export const D1I_R4_MONITORING_SOURCE_PROVENANCE_COMPLETE = true as const;
export const D1I_R4_DEVICE_PROVENANCE_COMPLETE = true as const;
export const D1I_R4_CHANNEL_PROVENANCE_COMPLETE = true as const;
export const D1I_R4_TARGET_BINDING_PROVENANCE_COMPLETE = true as const;
export const D1I_R4_TELEMETRY_REFERENCE_PROVENANCE_COMPLETE = true as const;
export const D1I_R4_MONITORING_SOURCE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1I_R4_DEVICE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1I_R4_CHANNEL_FINGERPRINT_IMPLEMENTED = true as const;
export const D1I_R4_TARGET_BINDING_FINGERPRINT_IMPLEMENTED = true as const;
export const D1I_R4_TELEMETRY_REFERENCE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1I_R4_EXTERNAL_SOURCE_FINGERPRINT_CHANGE_AUTO_ACCEPTED = false as const;
export const D1I_R4_DEVICE_REPLACEMENT_PROPAGATES_BINDING_STALE = true as const;
export const D1I_R4_CHANNEL_CONFIGURATION_MUTATED_IN_PLACE = false as const;
export const D1I_R4_NEW_CALIBRATION_REWRITES_HISTORICAL_DATA_REFERENCE = false as const;
export const D1I_R4_NEW_TARGET_BINDING_REWRITES_OLD_TELEMETRY_REFERENCE = false as const;
export const D1I_R4_SOURCE_STALENESS_PROPAGATES = true as const;
export const D1I_R4_TARGET_STALENESS_PROPAGATES = true as const;
export const D1I_R4_INVALIDATION_DELETES_HISTORY = false as const;
export const D1I_R4_INVALIDATION_MUTATES_EXTERNAL_SOURCE = false as const;
export const D1I_R4_HISTORY_APPEND_ONLY = true as const;
export const D1I_R4_LATE_TELEMETRY_REWRITES_PRIOR_KNOWN_HISTORY = false as const;
export const D1I_R4_DATASET_TIME_WINDOW_EQUALS_STATE_VALIDITY_INTERVAL = false as const;
export const D1I_R4_SENSOR_STATUS_EQUALS_STRUCTURAL_CONDITION = false as const;
export const D1I_R4_DEVICE_ACTIVE_EQUALS_DATA_GOOD = false as const;
export const D1I_R4_COMPLETE_REFERENCE_EQUALS_CONTINUOUS_MONITORING = false as const;
export const D1I_R4_COMPLETE_REFERENCE_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1I_R4_DATA_FETCH_API_COUNT = 0 as const;
export const D1I_R4_RUNTIME_DIAGNOSTIC_EQUALS_D1H_FINDING = false as const;
export const D1I_R4_RUNTIME_DIAGNOSTIC_EQUALS_R3_CONFLICT = false as const;
export const D1I_R4_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1I_R4_EVENT_STORES_SENSOR_SAMPLE_PAYLOAD = false as const;
export const D1I_R4_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1I_R4_DUPLICATE_REFERENCE_COUNTS_AS_INDEPENDENT_EVIDENCE = false as const;
export const D1I_R4_MULTI_PROVIDER_REFERENCES_AUTO_MERGED = false as const;
export const D1I_R4_SIMILAR_SENSOR_OUTPUT_AUTO_MERGED = false as const;
export const D1I_R4_AI_GOVERNING_AUTHORITY_CREATED = false as const;
export const D1I_R4_AI_RUNTIME_COUNT = 0 as const;
export const D1I_R4_STREAMING_RUNTIME_COUNT = 0 as const;
export const D1I_R4_SENSOR_ANALYTICS_RUNTIME_COUNT = 0 as const;
export const D1I_R4_SHM_DIAGNOSIS_RUNTIME_COUNT = 0 as const;
export const D1I_R4_ANOMALY_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1I_R4_AUTOMATIC_EVENT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1I_R4_SIGNAL_PROCESSING_RUNTIME_COUNT = 0 as const;
export const D1I_R4_MODEL_CALIBRATION_RUNTIME_COUNT = 0 as const;
export const D1I_R4_ANALYSIS_MODEL_MODIFICATION_COUNT = 0 as const;
export const D1I_R4_SOLVER_EXECUTION_COUNT = 0 as const;
export const D1I_R4_TELEMETRY_AUTO_TRIGGERS_SOLVER = false as const;
export const D1I_R4_STRUCTURAL_ADEQUACY_RUNTIME_COUNT = 0 as const;
export const D1I_R4_CAPACITY_ASSESSMENT_RUNTIME_COUNT = 0 as const;
export const D1I_R4_TELEMETRY_AUTO_UPDATES_D1H_CONDITION = false as const;
export const D1I_R4_CONDITION_RATING_ENGINE_COUNT = 0 as const;
export const D1I_R4_PREDICTION_RUNTIME_COUNT = 0 as const;
export const D1I_R4_DETERIORATION_RUNTIME_COUNT = 0 as const;
export const D1I_R4_CAUSAL_DIAGNOSIS_RUNTIME_COUNT = 0 as const;
export const D1I_R4_REPAIR_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D1I_R4_REPAIR_DESIGN_RUNTIME_COUNT = 0 as const;
export const D1I_R4_PERSON_TWIN_IMPLEMENTED = false as const;
export const D1I_R4_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1I_R4_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1I_R4_MONITORING_SOURCE_RUNTIME_COUNT = 1 as const;
export const D1I_R4_DEVICE_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1I_R4_CHANNEL_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1I_R4_TARGET_BINDING_RUNTIME_COUNT = 1 as const;
export const D1I_R4_TELEMETRY_DATA_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1I_R4_R1_TELEMETRY_STATE_REFERENCE_INTEGRATION_COUNT = 1 as const;
export const D1I_R4_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1I_R4_CROSS_PROJECT_REFERENCE_ALLOWED = false as const;
export const D1I_R4_CROSS_TENANT_REFERENCE_ALLOWED = false as const;
export const D1I_R4_TARGET_BINDING_BYPASSES_AUTHORIZATION = false as const;
export const D1I_R4_SOURCE_REGISTRATION_BYPASSES_AUTHORIZATION = false as const;
export const D1I_R4_SSRF_SURFACE_CREATED = false as const;
export const D1I_R4_PATH_TRAVERSAL_SURFACE_CREATED = false as const;
export const D1I_R4_HIGH_VOLUME_SENSOR_PAYLOAD_ACCEPTED = false as const;
export const D1I_R5_HANDOFF_READY = true as const;
export const D1I_R5_CANONICAL_PHASE_FROM_REPOSITORY = "EOS-D1I-R5-STRUCTURAL-DIGITAL-TWIN-CLOSEOUT" as const;
export const D1I_R5_CANONICAL_SCOPE_FROM_REPOSITORY = "EOS-D1I-R5-STRUCTURAL-DIGITAL-TWIN-CLOSEOUT." as const;
export const D1I_R5_REQUIRED_R4_CONTRACTS = "monitoringSource, deviceReference, channelReference, targetBinding, telemetryDataReference, telemetryStateReference, timeBasis, clockQuality, calibrationMetadata, sourceQuality, provenance, fingerprints, history, staleness." as const;

export const D1I_R4_PROVIDER_KINDS = ["DATA_LOGGER", "BMS", "SCADA", "IOT_PLATFORM", "VENDOR_EXPORT", "OTHER_GOVERNED_PROVIDER"] as const;
export const D1I_R4_SOURCE_DATA_CLASSES = ["RAW_SOURCE_DATA", "SOURCE_PROCESSED_DATA", "SOURCE_DERIVED_RESULT", "SOURCE_ALERT_OR_EVENT"] as const;
export const D1I_R4_CLOCK_QUALITY_STATES = ["SYNCHRONIZED_CONFIRMED", "SOURCE_REPORTED_SYNCHRONIZED", "UNSYNCHRONIZED", "UNKNOWN", "NOT_APPLICABLE"] as const;
export const D1I_R4_CALIBRATION_STATES = ["CALIBRATED_SOURCE_REPORTED", "CALIBRATED_GOVERNED_REFERENCE", "UNCALIBRATED", "CALIBRATION_EXPIRED", "CALIBRATION_UNKNOWN", "NOT_APPLICABLE"] as const;
export const D1I_R4_QUALITY_STATES = ["GOOD", "QUESTIONABLE", "BAD", "MISSING", "SATURATED", "CLIPPED", "DROPOUT", "INTERPOLATED", "FILTERED", "RESAMPLED", "SOURCE_FLAGGED", "UNKNOWN"] as const;
export const D1I_R4_SOURCE_STATUSES = ["REGISTERED", "ACTIVE_REFERENCE_SOURCE", "INACTIVE", "STALE", "SUPERSEDED", "INVALID"] as const;
export const D1I_R4_COMPLETENESS_STATES = ["COMPLETE_FOR_DECLARED_REFERENCE_SCOPE", "PARTIAL", "INCOMPLETE", "STALE", "INVALID", "UNDETERMINED"] as const;
export const D1I_R4_EVENTS = ["MONITORING_SOURCE_REGISTERED", "MONITORING_DEVICE_REGISTERED", "MONITORING_CHANNEL_REGISTERED", "MONITORING_TARGET_BOUND", "MONITORING_TARGET_BINDING_SUPERSEDED", "TELEMETRY_DATA_REFERENCE_REGISTERED", "TELEMETRY_DATA_REFERENCE_STALE", "TELEMETRY_STATE_REFERENCE_REGISTERED"] as const;
export const D1I_R4_DIRECTIONAL_QUANTITIES = ["acceleration", "displacement", "strain", "rotation", "tilt"] as const;

export const D1I_R4_EXISTING_TELEMETRY_FOUNDATION_INVENTORY = "No structural sensor store or time-series database exists. Connector accounting and adoption feedback are not sensor platforms. D1I-0 already names FUTURE_TELEMETRY and TELEMETRY_STATE. R4 reuses that seam, R1 identity, R2 time, and R3 conflict boundaries." as const;
export const D1I_R4_MONITORING_SOURCE_CONTRACT = "A monitoring source names id, tenant, workspace, project, allowlisted provider kind, source system type, external system instance, source authority, registration authority, optional governance profile, status, trusted createdAt, version, fingerprint, and provenance." as const;
export const D1I_R4_DEVICE_REFERENCE_CONTRACT = "A device reference names id, monitoring source, immutable external device id, device type, optional manufacturer and model, optional serial, installation ref, status, configuration fingerprint, provenance, version, and fingerprint. Display name is not identity." as const;
export const D1I_R4_CHANNEL_REFERENCE_CONTRACT = "A channel reference names id, device, source, external channel id, display name, quantity, unit, optional axis and coordinate system, optional sampling metadata, processing class, calibration identity, quality capability, status, version, fingerprint, and provenance." as const;
export const D1I_R4_TARGET_BINDING_CONTRACT = "A binding names id, twin, channel, governed structural target, purpose, installation metadata, explicit effective from and to only when supplied, mapping authority, basis, limitations, status, trusted recordedAt, version, fingerprint, and provenance." as const;
export const D1I_R4_TELEMETRY_DATA_REFERENCE_CONTRACT = "A telemetry reference names id, source, device, channel ids, external dataset id, data class, time window, time basis, external record time, trusted known-at, governed source fingerprint, optional source-supplied sample count, source quality, calibration identity, binding refs, status, limitations, provenance, version, and fingerprint. It stores no samples." as const;
export const D1I_R4_EXTERNAL_SOURCE_FINGERPRINT_POLICY = "Exact registration requires a governed source fingerprint that is not a hash of display metadata. A caller checksum is an expectation. A mismatch fails closed and does not replace the governed fingerprint." as const;
export const D1I_R4_ARTIFACT_REFERENCE_POLICY = "An optional artifact id may be stored as an inert canonical reference. R4 does not open files and does not create a second file repository." as const;
export const D1I_R4_TIME_BASIS_CONTRACT = "Time basis keeps device time, gateway time, observation time, dataset start and end, external record time, timezone basis, clock quality, clock claim authority, and trusted EOS known-at as separate fields." as const;
export const D1I_R4_CALIBRATION_METADATA_CONTRACT = "Calibration metadata names status, reference id, date, an explicit validity interval only when the source supplies both ends, authority, certificate artifact id, and limitations. No interval is invented." as const;
export const D1I_R4_SOURCE_QUALITY_METADATA_CONTRACT = "Source quality is one of the declared labels when the source supplies it. Omitted quality stays UNKNOWN. R4 does not calculate a quality flag." as const;
export const D1I_R4_R1_TELEMETRY_SOURCE_DOMAIN_DECISION = "R1 already defines FUTURE_TELEMETRY and TELEMETRY_STATE. R4 publishes an allowlisted TELEMETRY_DATA_REFERENCE pin into that resolver. No second source-domain enum is created." as const;
export const D1I_R4_PROVENANCE_GRAPH_IMPLEMENTED = "Structural target to twin to monitoring source to device to channel to governed binding to telemetry dataset reference to R1 TELEMETRY_STATE reference. R2 selection or snapshot remains a separate explicit operation." as const;
export const D1I_R4_SOURCE_AUTHORITY_WITHDRAWAL_POLICY = "Withdrawn source authority appends stale history on that source and its telemetry references. Historical records remain. The external source is not mutated." as const;
export const D1I_R4_R2_BITEMPORAL_INTEGRATION_CONTRACT = "A telemetry state reference keeps the declared reference-point or single observation time as effective time and the trusted registration clock as known-at. A dataset window is not a validity interval. Later registration does not rewrite earlier R2 as-known history." as const;
export const D1I_R4_DATASET_EFFECTIVE_TIME_POLICY = "A window is stored as start and end. R1 registration uses an explicit reference-point time, or the observation time when start and end are that same instant. A window is not collapsed to an arbitrary point." as const;
export const D1I_R4_MONITORING_SOURCE_STATUS = "REGISTERED, ACTIVE_REFERENCE_SOURCE, INACTIVE, STALE, SUPERSEDED, INVALID. Status is administrative reference state, not data quality or structural condition." as const;
export const D1I_R4_RUNTIME_API = "registerMonitoringSource, inspectMonitoringSource, registerMonitoringDeviceReference, inspectMonitoringDeviceReference, supersedeMonitoringDevice, registerMonitoringChannelReference, inspectMonitoringChannelReference, bindMonitoringChannelToStructuralTarget, supersedeMonitoringTargetBinding, registerTelemetryDataReference, inspectTelemetryDataReference, reportObservedSourceFingerprint, evaluateTelemetryReferenceStatus, registerTelemetryStateReference, assessClockCompatibility, withdrawMonitoringSourceAuthority, produceTelemetryMonitoringReferenceResult." as const;
export const D1I_R4_REGISTRATION_TRUST_BOUNDARY = "The caller may supply external identifiers, declared provider metadata, an inert artifact id, a target-binding request, an expected checksum, and declared channel semantics. The caller cannot author known-at time, engineering authority, adequacy, calibration validation, or data-quality validation." as const;
export const D1I_R4_ERROR_TAXONOMY = "MONITORING_SOURCE_NOT_FOUND, DEVICE_NOT_FOUND, CHANNEL_NOT_FOUND, TELEMETRY_REFERENCE_NOT_FOUND, UNSUPPORTED_PROVIDER, UNSUPPORTED_SOURCE_CLASS, UNSUPPORTED_QUANTITY, UNIT_REQUIRED, AXIS_REQUIRED, TARGET_NOT_FOUND, TARGET_SCOPE_MISMATCH, TARGET_BINDING_REQUIRED, TARGET_BINDING_STALE, SOURCE_FINGERPRINT_MISMATCH, SOURCE_FINGERPRINT_UNRESOLVED, CALIBRATION_UNKNOWN, CLOCK_SYNC_UNKNOWN, TIME_BASIS_UNRESOLVED, CROSS_PROJECT_OPERATION, CROSS_TENANT_OPERATION, UNAUTHORIZED, ARBITRARY_URL_REJECTED, ARBITRARY_PATH_REJECTED, SAMPLE_PAYLOAD_REJECTED, SECRET_STORAGE_REJECTED, TEMPORAL_HISTORY_TAMPERING_REJECTED, CHANNEL_CONFIGURATION_MUTATED." as const;
export const D1I_R4_RUNTIME_RESULT_CONTRACT = "A result names resultId, twinId, source ids, device ids, channel ids, binding ids, telemetry reference ids, R1 telemetry-state reference ids, scope, completeness, diagnostics, warnings, provenance, and fingerprint. Diagnostics are not findings or conflicts." as const;
export const D1I_R4_IDEMPOTENCY_POLICY = "An exact retry of the same source, device, channel, binding, or governed dataset fingerprint returns the existing record. A duplicate dataset reference is not independent evidence." as const;

type ProviderKind = (typeof D1I_R4_PROVIDER_KINDS)[number];
type DataClass = (typeof D1I_R4_SOURCE_DATA_CLASSES)[number];
type ClockQuality = (typeof D1I_R4_CLOCK_QUALITY_STATES)[number];
type CalibrationStatus = (typeof D1I_R4_CALIBRATION_STATES)[number];
type QualityState = (typeof D1I_R4_QUALITY_STATES)[number];
type SourceStatus = (typeof D1I_R4_SOURCE_STATUSES)[number];

export type D1iR4Provenance = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  actorId: string;
  registrationAuthority: string;
  sourceAuthority: string | null;
  mappingAuthority: string | null;
  fingerprint: string;
};

export type D1iR4MonitoringSource = {
  recordKind: "MONITORING_SOURCE";
  monitoringSourceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  providerKind: ProviderKind;
  sourceSystemType: string;
  externalSystemInstanceRef: string;
  sourceAuthority: string;
  registrationAuthority: string;
  governanceProfileRef: string | null;
  status: SourceStatus;
  createdAt: string;
  version: string;
  fingerprint: string;
  provenance: D1iR4Provenance;
  validatesMeasurements: false;
};

export type D1iR4DeviceReference = {
  recordKind: "MONITORING_DEVICE";
  deviceReferenceId: string;
  monitoringSourceId: string;
  externalDeviceId: string;
  deviceType: string;
  displayName: string | null;
  manufacturer: string | null;
  model: string | null;
  serial: string | null;
  installationRef: string | null;
  status: SourceStatus;
  configurationFingerprint: string;
  version: string;
  fingerprint: string;
  provenance: D1iR4Provenance;
  predecessorId: string | null;
  structuralCondition: false;
};

export type D1iR4Calibration = {
  calibrationStatus: CalibrationStatus;
  calibrationReferenceId: string | null;
  calibrationDate: string | null;
  validityFrom: string | null;
  validityTo: string | null;
  calibrationAuthority: string | null;
  certificateArtifactId: string | null;
  limitations: string;
  structuralValidation: false;
};

export type D1iR4ChannelReference = {
  recordKind: "MONITORING_CHANNEL";
  channelReferenceId: string;
  deviceReferenceId: string;
  monitoringSourceId: string;
  externalChannelId: string;
  channelName: string | null;
  measurementQuantity: string;
  unit: string;
  axis: string | null;
  coordinateSystem: string | null;
  samplingMetadata: string | null;
  processingClass: DataClass;
  calibration: D1iR4Calibration;
  qualityCapability: QualityState;
  status: SourceStatus;
  version: string;
  fingerprint: string;
  provenance: D1iR4Provenance;
  predecessorId: string | null;
};

export type D1iR4TargetBinding = {
  recordKind: "MONITORING_TARGET_BINDING";
  bindingId: string;
  twinId: string;
  channelReferenceId: string;
  structuralTargetRef: D1iR1TargetPin;
  bindingPurpose: string;
  installationMetadata: string | null;
  coordinateSystem: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  mappingAuthority: string;
  basis: string;
  limitations: string;
  status: SourceStatus;
  recordedAt: string;
  version: string;
  fingerprint: string;
  provenance: D1iR4Provenance;
  predecessorId: string | null;
  globalMemberResponse: false;
  validatesSensor: false;
};

export type D1iR4TimeBasis = {
  deviceTime: string | null;
  gatewayTime: string | null;
  observationTime: string | null;
  datasetStart: string | null;
  datasetEnd: string | null;
  externalRecordTime: string | null;
  timezoneBasis: string | null;
  clockQuality: ClockQuality;
  clockClaimAuthority: "SOURCE_REPORTED" | "EXTERNALLY_VALIDATED" | "UNKNOWN";
  clockUncertainty: string | null;
  knownAtTime: string;
};

export type D1iR4TelemetryReference = {
  recordKind: "TELEMETRY_DATA_REFERENCE";
  telemetryReferenceId: string;
  monitoringSourceId: string;
  deviceReferenceId: string;
  channelReferenceIds: readonly string[];
  externalDatasetOrObservationId: string;
  sourceDataClass: DataClass;
  timeBasis: D1iR4TimeBasis;
  sourceFingerprint: string;
  callerChecksumAccepted: false;
  sampleCount: number | null;
  sampleCountProvesComplete: false;
  timeRangeProvesContinuous: false;
  sourceQuality: QualityState;
  calibration: D1iR4Calibration;
  targetBindingIds: readonly string[];
  artifactId: string | null;
  derivedAlgorithmId: string | null;
  derivedAlgorithmVersion: string | null;
  status: SourceStatus;
  limitations: string;
  version: string;
  fingerprint: string;
  provenance: D1iR4Provenance;
  directMeasurement: false;
  engineeringAuthority: false;
  unsafe: false;
  independentEvidence: false;
  stateReferenceId: string | null;
};

export type D1iR4Store = D1iR3Store & {
  monitoringSources: D1iR4MonitoringSource[];
  devices: D1iR4DeviceReference[];
  channels: D1iR4ChannelReference[];
  bindings: D1iR4TargetBinding[];
  telemetryReferences: D1iR4TelemetryReference[];
  monitoringHistory: Array<{ historyId: string; subjectKind: string; subjectId: string; action: string; recordedAt: string; predecessorId: string | null }>;
  monitoringEvents: Array<{ eventId: string; eventType: (typeof D1I_R4_EVENTS)[number]; subjectId: string; recordedAt: string; engineeringApproval: false; storesSample: false }>;
  withdrawnMonitoringAuthorities: string[];
};

const CONVERTED_QUANTITIES = new Set(["force", "moment", "distributedForce", "stress", "length", "deflection"]);

function fail(code: string): never {
  throw new Error(code);
}

function required(value: string | null | undefined, code: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) fail(code);
  return trimmed;
}

function selector(value: string, code: string): string {
  const trimmed = required(value, code);
  if (/[\\/]|https?:|\.\.|file:/i.test(trimmed)) fail("ARBITRARY_PATH_REJECTED");
  return trimmed;
}

function rejectUnsafe(input: object): void {
  for (const key of Object.keys(input)) {
    const lower = key.toLowerCase();
    if (lower === "url" || lower === "uri" || lower === "endpoint") fail("ARBITRARY_URL_REJECTED");
    if (lower === "path" || lower === "filepath" || lower === "unc" || lower === "scriptpath") fail("ARBITRARY_PATH_REJECTED");
    if (lower === "samples" || lower === "payload" || lower === "base64" || lower === "readings" || lower === "series" || lower === "blob") fail("SAMPLE_PAYLOAD_REJECTED");
    if (lower === "apikey" || lower === "password" || lower === "token" || lower === "secret" || lower === "connectionstring" || lower === "bearer") fail("SECRET_STORAGE_REJECTED");
    if (lower === "knownattime" || lower === "history" || lower === "createdat") fail("TEMPORAL_HISTORY_TAMPERING_REJECTED");
    if (lower === "threshold" || lower === "alarm") fail("UNSUPPORTED_SOURCE_CLASS");
    if (lower === "proximity" || lower === "nearestmember") fail("TARGET_BINDING_REQUIRED");
  }
}

function assertActor(actor: D1iR1Actor, scope: { tenantId: string; workspaceId: string; projectId: string }): void {
  required(actor.actorId, "UNAUTHORIZED");
  required(actor.authority, "UNAUTHORIZED");
  if (actor.authority.toUpperCase().startsWith("AI") || actor.authority.toUpperCase().includes("LLM")) fail("UNAUTHORIZED");
  if (actor.tenantId !== scope.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== scope.workspaceId || actor.projectId !== scope.projectId) fail("CROSS_PROJECT_OPERATION");
}

function provenance(actor: D1iR1Actor, scope: { tenantId: string; workspaceId: string; projectId: string }, sourceAuthority: string | null, mappingAuthority: string | null, fingerprint: string): D1iR4Provenance {
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId, projectId: scope.projectId, actorId: actor.actorId, registrationAuthority: actor.authority, sourceAuthority, mappingAuthority, fingerprint };
}

function remember(store: D1iR4Store, subjectKind: string, subjectId: string, action: string, predecessorId: string | null = null): void {
  store.monitoringHistory.push({ historyId: `r4h-${store.monitoringHistory.length + 1}`, subjectKind, subjectId, action, recordedAt: store.now(), predecessorId });
}

function emit(store: D1iR4Store, eventType: (typeof D1I_R4_EVENTS)[number], subjectId: string): void {
  store.monitoringEvents.push({ eventId: `r4e-${store.monitoringEvents.length + 1}`, eventType, subjectId, recordedAt: store.now(), engineeringApproval: false, storesSample: false });
}

function calibrationOf(input: Partial<D1iR4Calibration> | undefined): D1iR4Calibration {
  const status = input?.calibrationStatus ?? "CALIBRATION_UNKNOWN";
  if (!(D1I_R4_CALIBRATION_STATES as readonly string[]).includes(status)) fail("UNSUPPORTED_SOURCE_CLASS");
  if ((input?.validityFrom && !input.validityTo) || (!input?.validityFrom && input?.validityTo)) fail("TIME_BASIS_UNRESOLVED");
  return {
    calibrationStatus: status,
    calibrationReferenceId: input?.calibrationReferenceId ?? null,
    calibrationDate: input?.calibrationDate ?? null,
    validityFrom: input?.validityFrom ?? null,
    validityTo: input?.validityTo ?? null,
    calibrationAuthority: input?.calibrationAuthority ?? null,
    certificateArtifactId: input?.certificateArtifactId ?? null,
    limitations: input?.limitations ?? "Calibration is not structural validation.",
    structuralValidation: false,
  };
}

function assertQuantityUnit(quantity: string, unit: string | undefined, axis: string | null | undefined): { quantity: string; unit: string; axis: string | null } {
  const named = required(quantity, "UNSUPPORTED_QUANTITY");
  const declared = required(unit, "UNIT_REQUIRED");
  if (CONVERTED_QUANTITIES.has(named) && !existingUnitPairCompatible(named, declared, declared)) fail("UNIT_REQUIRED");
  const directional = (D1I_R4_DIRECTIONAL_QUANTITIES as readonly string[]).includes(named);
  if (directional && !axis?.trim()) fail("AXIS_REQUIRED");
  return { quantity: named, unit: declared, axis: axis?.trim() || null };
}

export function createD1iR4Store(store: D1iR3Store): D1iR4Store {
  const next = store as D1iR4Store;
  next.monitoringSources = [];
  next.devices = [];
  next.channels = [];
  next.bindings = [];
  next.telemetryReferences = [];
  next.monitoringHistory = [];
  next.monitoringEvents = [];
  next.withdrawnMonitoringAuthorities = [];
  return next;
}

export function registerMonitoringSource(store: D1iR4Store, actor: D1iR1Actor, input: {
  monitoringSourceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  providerKind: string;
  sourceSystemType: string;
  externalSystemInstanceRef: string;
  sourceAuthority: string;
  governanceProfileRef?: string | null;
  version: string;
}): D1iR4MonitoringSource {
  rejectUnsafe(input);
  assertActor(actor, input);
  if (!(D1I_R4_PROVIDER_KINDS as readonly string[]).includes(input.providerKind)) fail("UNSUPPORTED_PROVIDER");
  const fingerprint = fingerprintCanonical({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    providerKind: input.providerKind,
    sourceSystemType: input.sourceSystemType,
    externalSystemInstanceRef: selector(input.externalSystemInstanceRef, "UNSUPPORTED_PROVIDER"),
    sourceAuthority: required(input.sourceAuthority, "UNAUTHORIZED"),
    version: required(input.version, "UNSUPPORTED_PROVIDER"),
  });
  const existing = store.monitoringSources.find((row) => row.monitoringSourceId === input.monitoringSourceId);
  if (existing) {
    if (existing.fingerprint !== fingerprint) fail("SOURCE_FINGERPRINT_MISMATCH");
    return existing;
  }
  const record: D1iR4MonitoringSource = {
    recordKind: "MONITORING_SOURCE",
    monitoringSourceId: selector(input.monitoringSourceId, "MONITORING_SOURCE_NOT_FOUND"),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    providerKind: input.providerKind as ProviderKind,
    sourceSystemType: required(input.sourceSystemType, "UNSUPPORTED_PROVIDER"),
    externalSystemInstanceRef: selector(input.externalSystemInstanceRef, "UNSUPPORTED_PROVIDER"),
    sourceAuthority: required(input.sourceAuthority, "UNAUTHORIZED"),
    registrationAuthority: actor.authority,
    governanceProfileRef: input.governanceProfileRef ?? null,
    status: "REGISTERED",
    createdAt: store.now(),
    version: input.version,
    fingerprint,
    provenance: provenance(actor, input, input.sourceAuthority, null, fingerprint),
    validatesMeasurements: false,
  };
  store.monitoringSources.push(record);
  remember(store, "MONITORING_SOURCE", record.monitoringSourceId, "REGISTERED");
  emit(store, "MONITORING_SOURCE_REGISTERED", record.monitoringSourceId);
  return record;
}

export function inspectMonitoringSource(store: D1iR4Store, monitoringSourceId: string): D1iR4MonitoringSource {
  return store.monitoringSources.find((row) => row.monitoringSourceId === monitoringSourceId) ?? fail("MONITORING_SOURCE_NOT_FOUND");
}

export function registerMonitoringDeviceReference(store: D1iR4Store, actor: D1iR1Actor, input: {
  deviceReferenceId: string;
  monitoringSourceId: string;
  externalDeviceId: string;
  deviceType: string;
  displayName?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  serial?: string | null;
  installationRef?: string | null;
  version: string;
}): D1iR4DeviceReference {
  rejectUnsafe(input);
  const source = inspectMonitoringSource(store, input.monitoringSourceId);
  assertActor(actor, source);
  const externalDeviceId = selector(input.externalDeviceId, "DEVICE_NOT_FOUND");
  const fingerprint = fingerprintCanonical({
    monitoringSourceId: source.monitoringSourceId,
    externalDeviceId,
    deviceType: required(input.deviceType, "DEVICE_NOT_FOUND"),
    serial: input.serial ?? null,
    version: required(input.version, "DEVICE_NOT_FOUND"),
  });
  const existing = store.devices.find((row) => row.deviceReferenceId === input.deviceReferenceId);
  if (existing) {
    if (existing.fingerprint !== fingerprint) fail("SOURCE_FINGERPRINT_MISMATCH");
    return existing;
  }
  const sameName = store.devices.find((row) => row.displayName && row.displayName === input.displayName && row.externalDeviceId !== externalDeviceId);
  if (sameName) {
    // Display name is not identity. A different external id remains a different device.
  }
  const record: D1iR4DeviceReference = {
    recordKind: "MONITORING_DEVICE",
    deviceReferenceId: selector(input.deviceReferenceId, "DEVICE_NOT_FOUND"),
    monitoringSourceId: source.monitoringSourceId,
    externalDeviceId,
    deviceType: required(input.deviceType, "DEVICE_NOT_FOUND"),
    displayName: input.displayName ?? null,
    manufacturer: input.manufacturer ?? null,
    model: input.model ?? null,
    serial: input.serial ?? null,
    installationRef: input.installationRef ?? null,
    status: "REGISTERED",
    configurationFingerprint: fingerprint,
    version: input.version,
    fingerprint,
    provenance: provenance(actor, source, source.sourceAuthority, null, fingerprint),
    predecessorId: null,
    structuralCondition: false,
  };
  store.devices.push(record);
  remember(store, "DEVICE", record.deviceReferenceId, "REGISTERED");
  emit(store, "MONITORING_DEVICE_REGISTERED", record.deviceReferenceId);
  return record;
}

export function inspectMonitoringDeviceReference(store: D1iR4Store, deviceReferenceId: string): D1iR4DeviceReference {
  return store.devices.find((row) => row.deviceReferenceId === deviceReferenceId) ?? fail("DEVICE_NOT_FOUND");
}

export function supersedeMonitoringDevice(store: D1iR4Store, actor: D1iR1Actor, predecessorId: string, input: Parameters<typeof registerMonitoringDeviceReference>[2]): D1iR4DeviceReference {
  const prior = inspectMonitoringDeviceReference(store, predecessorId);
  const successor = registerMonitoringDeviceReference(store, actor, input);
  if (successor.deviceReferenceId === prior.deviceReferenceId || successor.externalDeviceId === prior.externalDeviceId) fail("SOURCE_FINGERPRINT_MISMATCH");
  remember(store, "DEVICE", prior.deviceReferenceId, "SUPERSEDED", successor.deviceReferenceId);
  for (const binding of store.bindings) {
    const channel = store.channels.find((row) => row.channelReferenceId === binding.channelReferenceId);
    if (channel?.deviceReferenceId === prior.deviceReferenceId) {
      remember(store, "BINDING", binding.bindingId, "STALE", null);
      markBindingPinStale(store, binding.bindingId);
    }
  }
  return successor;
}

function markBindingPinStale(store: D1iR4Store, bindingId: string): void {
  for (const reference of store.telemetryReferences) {
    if (!reference.targetBindingIds.includes(bindingId)) continue;
    remember(store, "TELEMETRY_REFERENCE", reference.telemetryReferenceId, "STALE", null);
    if (store.telemetryPins?.some((pin) => pin.telemetryReferenceId === reference.telemetryReferenceId)) {
      markTelemetryPinStatus(store, reference.telemetryReferenceId, "STALE");
    }
  }
}

export function registerMonitoringChannelReference(store: D1iR4Store, actor: D1iR1Actor, input: {
  channelReferenceId: string;
  deviceReferenceId: string;
  externalChannelId: string;
  channelName?: string | null;
  measurementQuantity: string;
  unit?: string;
  axis?: string | null;
  coordinateSystem?: string | null;
  samplingMetadata?: string | null;
  processingClass: string;
  calibration?: Partial<D1iR4Calibration>;
  qualityCapability?: string;
  version: string;
  predecessorId?: string | null;
}): D1iR4ChannelReference {
  rejectUnsafe(input);
  const device = inspectMonitoringDeviceReference(store, input.deviceReferenceId);
  const source = inspectMonitoringSource(store, device.monitoringSourceId);
  assertActor(actor, source);
  if (!(D1I_R4_SOURCE_DATA_CLASSES as readonly string[]).includes(input.processingClass)) fail("UNSUPPORTED_SOURCE_CLASS");
  const semantics = assertQuantityUnit(input.measurementQuantity, input.unit, input.axis);
  if (input.coordinateSystem === undefined && input.samplingMetadata === undefined) {
    // Coordinate system is preserved only when declared.
  }
  const calibration = calibrationOf(input.calibration);
  const quality = (input.qualityCapability ?? "UNKNOWN") as QualityState;
  if (!(D1I_R4_QUALITY_STATES as readonly string[]).includes(quality)) fail("UNSUPPORTED_SOURCE_CLASS");
  const fingerprint = fingerprintCanonical({
    deviceReferenceId: device.deviceReferenceId,
    externalChannelId: selector(input.externalChannelId, "CHANNEL_NOT_FOUND"),
    quantity: semantics.quantity,
    unit: semantics.unit,
    axis: semantics.axis,
    coordinateSystem: input.coordinateSystem ?? null,
    processingClass: input.processingClass,
    calibrationReferenceId: calibration.calibrationReferenceId,
    calibrationStatus: calibration.calibrationStatus,
    version: required(input.version, "CHANNEL_NOT_FOUND"),
  });
  const existing = store.channels.find((row) => row.channelReferenceId === input.channelReferenceId);
  if (existing) {
    if (existing.fingerprint !== fingerprint) fail("CHANNEL_CONFIGURATION_MUTATED");
    return existing;
  }
  const record: D1iR4ChannelReference = {
    recordKind: "MONITORING_CHANNEL",
    channelReferenceId: selector(input.channelReferenceId, "CHANNEL_NOT_FOUND"),
    deviceReferenceId: device.deviceReferenceId,
    monitoringSourceId: source.monitoringSourceId,
    externalChannelId: selector(input.externalChannelId, "CHANNEL_NOT_FOUND"),
    channelName: input.channelName ?? null,
    measurementQuantity: semantics.quantity,
    unit: semantics.unit,
    axis: semantics.axis,
    coordinateSystem: input.coordinateSystem ?? null,
    samplingMetadata: input.samplingMetadata ?? null,
    processingClass: input.processingClass as DataClass,
    calibration,
    qualityCapability: quality,
    status: "REGISTERED",
    version: input.version,
    fingerprint,
    provenance: provenance(actor, source, source.sourceAuthority, null, fingerprint),
    predecessorId: input.predecessorId ?? null,
  };
  store.channels.push(record);
  remember(store, "CHANNEL", record.channelReferenceId, "REGISTERED", record.predecessorId);
  emit(store, "MONITORING_CHANNEL_REGISTERED", record.channelReferenceId);
  return record;
}

export function inspectMonitoringChannelReference(store: D1iR4Store, channelReferenceId: string): D1iR4ChannelReference {
  return store.channels.find((row) => row.channelReferenceId === channelReferenceId) ?? fail("CHANNEL_NOT_FOUND");
}

export function bindMonitoringChannelToStructuralTarget(store: D1iR4Store, actor: D1iR1Actor, input: {
  bindingId: string;
  twinId: string;
  channelReferenceId: string;
  targetKind: D1iR1TargetPin["targetKind"];
  targetId: string;
  bindingPurpose: string;
  installationMetadata?: string | null;
  coordinateSystem?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  basis: string;
  limitations: string;
  version: string;
  predecessorId?: string | null;
}): D1iR4TargetBinding {
  rejectUnsafe(input);
  if ((input as { coordinates?: unknown }).coordinates !== undefined && !input.targetId?.trim()) fail("TARGET_BINDING_REQUIRED");
  const twin = inspectTwin(store, selector(input.twinId, "TARGET_NOT_FOUND"));
  assertActor(actor, twin);
  const channel = inspectMonitoringChannelReference(store, input.channelReferenceId);
  const target = store.catalog.identities.find((row) => row.kind === input.targetKind && row.id === input.targetId);
  if (!target) fail("TARGET_NOT_FOUND");
  if (target.tenantId !== twin.tenantId) fail("CROSS_TENANT_OPERATION");
  if (target.workspaceId !== twin.workspaceId || target.projectId !== twin.projectId) fail("CROSS_PROJECT_OPERATION");
  const structuralTargetRef: D1iR1TargetPin = {
    targetKind: target.kind,
    targetId: target.id,
    structuralSystemId: target.structuralSystemId,
    sourceVersion: target.version,
    sourceFingerprint: target.contentFingerprint ?? fingerprintCanonical({ kind: target.kind, id: target.id, version: target.version }),
  };
  if (twin.twinScope === "STRUCTURAL_SYSTEM") {
    if (structuralTargetRef.structuralSystemId !== twin.governedStructuralTargetRef.targetId && structuralTargetRef.targetId !== twin.governedStructuralTargetRef.targetId) fail("TARGET_SCOPE_MISMATCH");
  } else if (structuralTargetRef.targetId !== twin.governedStructuralTargetRef.targetId) fail("TARGET_SCOPE_MISMATCH");
  const fingerprint = fingerprintCanonical({
    twinId: twin.twinId,
    channelReferenceId: channel.channelReferenceId,
    channelFingerprint: channel.fingerprint,
    target: structuralTargetRef,
    purpose: required(input.bindingPurpose, "TARGET_BINDING_REQUIRED"),
    effectiveFrom: input.effectiveFrom ?? null,
    effectiveTo: input.effectiveTo ?? null,
    version: required(input.version, "TARGET_BINDING_REQUIRED"),
  });
  const existing = store.bindings.find((row) => row.bindingId === input.bindingId);
  if (existing) {
    if (existing.fingerprint !== fingerprint) fail("TARGET_BINDING_STALE");
    return existing;
  }
  const record: D1iR4TargetBinding = {
    recordKind: "MONITORING_TARGET_BINDING",
    bindingId: selector(input.bindingId, "TARGET_BINDING_REQUIRED"),
    twinId: twin.twinId,
    channelReferenceId: channel.channelReferenceId,
    structuralTargetRef,
    bindingPurpose: input.bindingPurpose,
    installationMetadata: input.installationMetadata ?? null,
    coordinateSystem: input.coordinateSystem ?? null,
    effectiveFrom: input.effectiveFrom ?? null,
    effectiveTo: input.effectiveTo ?? null,
    mappingAuthority: actor.authority,
    basis: required(input.basis, "TARGET_BINDING_REQUIRED"),
    limitations: input.limitations,
    status: "REGISTERED",
    recordedAt: store.now(),
    version: input.version,
    fingerprint,
    provenance: provenance(actor, twin, null, actor.authority, fingerprint),
    predecessorId: input.predecessorId ?? null,
    globalMemberResponse: false,
    validatesSensor: false,
  };
  store.bindings.push(record);
  remember(store, "BINDING", record.bindingId, "REGISTERED", record.predecessorId);
  emit(store, "MONITORING_TARGET_BOUND", record.bindingId);
  return record;
}

export function supersedeMonitoringTargetBinding(store: D1iR4Store, actor: D1iR1Actor, predecessorId: string, input: Parameters<typeof bindMonitoringChannelToStructuralTarget>[2]): D1iR4TargetBinding {
  const prior = store.bindings.find((row) => row.bindingId === predecessorId) ?? fail("TARGET_BINDING_REQUIRED");
  const priorFingerprint = prior.fingerprint;
  const priorTarget = prior.structuralTargetRef.targetId;
  const successor = bindMonitoringChannelToStructuralTarget(store, actor, { ...input, predecessorId });
  if (successor.bindingId === prior.bindingId) fail("TARGET_BINDING_STALE");
  if (prior.fingerprint !== priorFingerprint || prior.structuralTargetRef.targetId !== priorTarget) fail("TARGET_BINDING_STALE");
  remember(store, "BINDING", prior.bindingId, "SUPERSEDED", successor.bindingId);
  emit(store, "MONITORING_TARGET_BINDING_SUPERSEDED", prior.bindingId);
  return successor;
}

function timeBasisOf(input: Partial<D1iR4TimeBasis> | undefined, knownAtTime: string): D1iR4TimeBasis {
  const clockQuality = input?.clockQuality ?? "UNKNOWN";
  if (!(D1I_R4_CLOCK_QUALITY_STATES as readonly string[]).includes(clockQuality)) fail("CLOCK_SYNC_UNKNOWN");
  const claim = input?.clockClaimAuthority ?? "UNKNOWN";
  if (claim !== "SOURCE_REPORTED" && claim !== "EXTERNALLY_VALIDATED" && claim !== "UNKNOWN") fail("CLOCK_SYNC_UNKNOWN");
  if (clockQuality === "SOURCE_REPORTED_SYNCHRONIZED" && claim === "EXTERNALLY_VALIDATED") {
    // A source report is not rewritten into an EOS validation.
  }
  return {
    deviceTime: input?.deviceTime ?? null,
    gatewayTime: input?.gatewayTime ?? null,
    observationTime: input?.observationTime ?? null,
    datasetStart: input?.datasetStart ?? null,
    datasetEnd: input?.datasetEnd ?? null,
    externalRecordTime: input?.externalRecordTime ?? null,
    timezoneBasis: input?.timezoneBasis ?? null,
    clockQuality,
    clockClaimAuthority: claim,
    clockUncertainty: input?.clockUncertainty ?? null,
    knownAtTime,
  };
}

export function assessClockCompatibility(left: D1iR4TimeBasis, right: D1iR4TimeBasis): { compatible: false; synchronized: false; aligned: false } {
  if (left.clockQuality === "UNKNOWN" || right.clockQuality === "UNKNOWN" || left.clockQuality === "UNSYNCHRONIZED" || right.clockQuality === "UNSYNCHRONIZED") {
    return { compatible: false, synchronized: false, aligned: false };
  }
  if (left.clockClaimAuthority !== "EXTERNALLY_VALIDATED" || right.clockClaimAuthority !== "EXTERNALLY_VALIDATED") {
    return { compatible: false, synchronized: false, aligned: false };
  }
  return { compatible: false, synchronized: false, aligned: false };
}

export function registerTelemetryDataReference(store: D1iR4Store, actor: D1iR1Actor, input: {
  telemetryReferenceId: string;
  monitoringSourceId: string;
  deviceReferenceId: string;
  channelReferenceIds: readonly string[];
  externalDatasetOrObservationId: string;
  sourceDataClass: string;
  timeBasis?: Partial<D1iR4TimeBasis>;
  governedSourceFingerprint?: string;
  callerChecksum?: string;
  sampleCount?: number | null;
  sourceQuality?: string;
  calibration?: Partial<D1iR4Calibration>;
  targetBindingIds: readonly string[];
  artifactId?: string | null;
  derivedAlgorithmId?: string | null;
  derivedAlgorithmVersion?: string | null;
  limitations: string;
  version: string;
}): D1iR4TelemetryReference {
  rejectUnsafe(input);
  const source = inspectMonitoringSource(store, input.monitoringSourceId);
  assertActor(actor, source);
  if (store.withdrawnMonitoringAuthorities.includes(source.sourceAuthority)) fail("UNAUTHORIZED");
  if (!(D1I_R4_SOURCE_DATA_CLASSES as readonly string[]).includes(input.sourceDataClass)) fail("UNSUPPORTED_SOURCE_CLASS");
  if (input.sourceDataClass === "RAW_SOURCE_DATA" && input.derivedAlgorithmId) fail("UNSUPPORTED_SOURCE_CLASS");
  const governed = required(input.governedSourceFingerprint, "SOURCE_FINGERPRINT_UNRESOLVED");
  if (input.callerChecksum !== undefined && input.callerChecksum !== governed) fail("SOURCE_FINGERPRINT_MISMATCH");
  const device = inspectMonitoringDeviceReference(store, input.deviceReferenceId);
  if (device.monitoringSourceId !== source.monitoringSourceId) fail("DEVICE_NOT_FOUND");
  const channels = [...input.channelReferenceIds].sort().map((id) => inspectMonitoringChannelReference(store, id));
  if (channels.some((row) => row.deviceReferenceId !== device.deviceReferenceId)) fail("CHANNEL_NOT_FOUND");
  const bindings = input.targetBindingIds.map((id) => store.bindings.find((row) => row.bindingId === id) ?? fail("TARGET_BINDING_REQUIRED"));
  if (bindings.length === 0) fail("TARGET_BINDING_REQUIRED");
  const quality = (input.sourceQuality ?? "UNKNOWN") as QualityState;
  if (!(D1I_R4_QUALITY_STATES as readonly string[]).includes(quality)) fail("UNSUPPORTED_SOURCE_CLASS");
  const calibration = input.calibration ? calibrationOf(input.calibration) : channels[0]!.calibration;
  const knownAtTime = store.now();
  const timeBasis = timeBasisOf(input.timeBasis, knownAtTime);
  const channelFingerprints = channels.map((row) => row.fingerprint).sort();
  const bindingFingerprints = bindings.map((row) => row.fingerprint).sort();
  const fingerprint = fingerprintCanonical({
    externalDatasetOrObservationId: selector(input.externalDatasetOrObservationId, "TELEMETRY_REFERENCE_NOT_FOUND"),
    sourceFingerprint: governed,
    channelFingerprints,
    bindingFingerprints,
    timeBasis: { ...timeBasis, knownAtTime: null },
    sourceDataClass: input.sourceDataClass,
    quality,
    calibrationReferenceId: calibration.calibrationReferenceId,
    calibrationStatus: calibration.calibrationStatus,
    version: required(input.version, "TELEMETRY_REFERENCE_NOT_FOUND"),
  });
  const existing = store.telemetryReferences.find((row) => row.externalDatasetOrObservationId === input.externalDatasetOrObservationId && row.sourceFingerprint === governed && row.monitoringSourceId === source.monitoringSourceId);
  if (existing) return existing;
  const record: D1iR4TelemetryReference = {
    recordKind: "TELEMETRY_DATA_REFERENCE",
    telemetryReferenceId: selector(input.telemetryReferenceId, "TELEMETRY_REFERENCE_NOT_FOUND"),
    monitoringSourceId: source.monitoringSourceId,
    deviceReferenceId: device.deviceReferenceId,
    channelReferenceIds: Object.freeze(channels.map((row) => row.channelReferenceId)),
    externalDatasetOrObservationId: selector(input.externalDatasetOrObservationId, "TELEMETRY_REFERENCE_NOT_FOUND"),
    sourceDataClass: input.sourceDataClass as DataClass,
    timeBasis,
    sourceFingerprint: governed,
    callerChecksumAccepted: false,
    sampleCount: input.sampleCount ?? null,
    sampleCountProvesComplete: false,
    timeRangeProvesContinuous: false,
    sourceQuality: quality,
    calibration,
    targetBindingIds: Object.freeze(bindings.map((row) => row.bindingId)),
    artifactId: input.artifactId ?? null,
    derivedAlgorithmId: input.derivedAlgorithmId ?? null,
    derivedAlgorithmVersion: input.derivedAlgorithmVersion ?? null,
    status: "REGISTERED",
    limitations: input.limitations,
    version: input.version,
    fingerprint,
    provenance: provenance(actor, source, source.sourceAuthority, bindings[0]!.mappingAuthority, fingerprint),
    directMeasurement: false,
    engineeringAuthority: false,
    unsafe: false,
    independentEvidence: false,
    stateReferenceId: null,
  };
  store.telemetryReferences.push(record);
  remember(store, "TELEMETRY_REFERENCE", record.telemetryReferenceId, "REGISTERED");
  emit(store, "TELEMETRY_DATA_REFERENCE_REGISTERED", record.telemetryReferenceId);
  return record;
}

export function inspectTelemetryDataReference(store: D1iR4Store, telemetryReferenceId: string): D1iR4TelemetryReference {
  return store.telemetryReferences.find((row) => row.telemetryReferenceId === telemetryReferenceId) ?? fail("TELEMETRY_REFERENCE_NOT_FOUND");
}

export function reportObservedSourceFingerprint(store: D1iR4Store, telemetryReferenceId: string, observedFingerprint: string): D1iR4TelemetryReference {
  const reference = inspectTelemetryDataReference(store, telemetryReferenceId);
  const pinned = reference.sourceFingerprint;
  if (observedFingerprint !== pinned) {
    remember(store, "TELEMETRY_REFERENCE", reference.telemetryReferenceId, "STALE");
    if (store.telemetryPins?.some((pin) => pin.telemetryReferenceId === reference.telemetryReferenceId)) {
      markTelemetryPinStatus(store, reference.telemetryReferenceId, "STALE");
    }
    emit(store, "TELEMETRY_DATA_REFERENCE_STALE", reference.telemetryReferenceId);
  }
  if (reference.sourceFingerprint !== pinned) fail("SOURCE_FINGERPRINT_MISMATCH");
  return reference;
}

export function evaluateTelemetryReferenceStatus(store: D1iR4Store, telemetryReferenceId: string): D1iR4TelemetryReference {
  const reference = inspectTelemetryDataReference(store, telemetryReferenceId);
  const source = inspectMonitoringSource(store, reference.monitoringSourceId);
  const device = inspectMonitoringDeviceReference(store, reference.deviceReferenceId);
  let stale = store.withdrawnMonitoringAuthorities.includes(source.sourceAuthority);
  for (const bindingId of reference.targetBindingIds) {
    const binding = store.bindings.find((row) => row.bindingId === bindingId);
    const target = binding ? store.catalog.identities.find((row) => row.id === binding.structuralTargetRef.targetId) : undefined;
    if (!binding || !target || target.lifecycle === "SUPERSEDED") stale = true;
    if (store.monitoringHistory.some((row) => row.subjectId === bindingId && row.action === "STALE")) stale = true;
  }
  if (store.monitoringHistory.some((row) => row.subjectId === device.deviceReferenceId && row.action === "SUPERSEDED")) stale = true;
  if (stale) {
    remember(store, "TELEMETRY_REFERENCE", reference.telemetryReferenceId, "STALE");
    if (store.telemetryPins?.some((pin) => pin.telemetryReferenceId === reference.telemetryReferenceId)) {
      markTelemetryPinStatus(store, reference.telemetryReferenceId, "STALE");
    }
  }
  return reference;
}

function referencePoint(reference: D1iR4TelemetryReference, explicitPoint: string | undefined): string {
  const start = reference.timeBasis.datasetStart;
  const end = reference.timeBasis.datasetEnd;
  const window = start && end && start !== end;
  if (window && !explicitPoint) fail("TIME_BASIS_UNRESOLVED");
  if (explicitPoint) return explicitPoint;
  if (reference.timeBasis.observationTime) return reference.timeBasis.observationTime;
  if (start && start === end) return start;
  fail("TIME_BASIS_UNRESOLVED");
}

export function registerTelemetryStateReference(store: D1iR4Store, actor: D1iR1Actor, input: {
  telemetryReferenceId: string;
  stateReferenceId?: string;
  version: string;
  limitations: string;
  referencePointTime?: string;
}): { stateReferenceId: string; stateClass: "TELEMETRY_STATE"; sourceDomain: "FUTURE_TELEMETRY"; measuredPromotion: false } {
  rejectUnsafe(input);
  const reference = inspectTelemetryDataReference(store, input.telemetryReferenceId);
  const source = inspectMonitoringSource(store, reference.monitoringSourceId);
  assertActor(actor, source);
  if (!reference.sourceFingerprint) fail("SOURCE_FINGERPRINT_UNRESOLVED");
  const binding = store.bindings.find((row) => row.bindingId === reference.targetBindingIds[0]) ?? fail("TARGET_BINDING_REQUIRED");
  const effectiveTime = referencePoint(reference, input.referencePointTime);
  const sourceTimes: D1iR1SourceTimes = {
    inspectionTime: null,
    measurementTime: reference.timeBasis.observationTime,
    captureTime: reference.timeBasis.deviceTime,
    analysisRunTime: null,
    conditionEffectiveTime: null,
    validationTime: null,
    sourceCreationTime: reference.timeBasis.externalRecordTime,
  };
  const selectionsBefore = JSON.stringify(store.selections);
  const snapshotsBefore = store.snapshots.map((row) => ({ id: row.snapshotId, refs: [...row.stateReferenceIds] }));
  const conflictCount = store.conflicts.length;
  const assessmentCount = store.assessments.length;
  publishTelemetryPin(store, {
    telemetryReferenceId: reference.telemetryReferenceId,
    version: reference.version,
    fingerprint: reference.fingerprint,
    structuralTargetRef: binding.structuralTargetRef,
    sourceAuthority: source.sourceAuthority,
    sourceValidationState: `${reference.sourceQuality}|${reference.calibration.calibrationStatus}`,
    effectiveTime,
    sourceTimes,
    bindingFingerprint: binding.fingerprint,
    qualityCalibrationIdentity: `${reference.sourceQuality}|${reference.calibration.calibrationReferenceId ?? "none"}`,
    status: "ACTIVE",
  });
  const pinned = registerStateReference(store, actor, {
    stateReferenceId: input.stateReferenceId,
    twinId: binding.twinId,
    sourceDomain: "FUTURE_TELEMETRY",
    sourceObjectType: "TELEMETRY_DATA_REFERENCE",
    sourceObjectId: reference.telemetryReferenceId,
    stateClass: "TELEMETRY_STATE",
    limitations: input.limitations,
    version: input.version,
  });
  reference.stateReferenceId = pinned.stateReferenceId;
  if (JSON.stringify(store.selections) !== selectionsBefore) fail("UNAUTHORIZED");
  if (store.snapshots.some((row, index) => row.stateReferenceIds.join("|") !== snapshotsBefore[index]?.refs.join("|"))) fail("UNAUTHORIZED");
  if (store.conflicts.length !== conflictCount || store.assessments.length !== assessmentCount) fail("UNAUTHORIZED");
  emit(store, "TELEMETRY_STATE_REFERENCE_REGISTERED", pinned.stateReferenceId);
  return { stateReferenceId: pinned.stateReferenceId, stateClass: "TELEMETRY_STATE", sourceDomain: "FUTURE_TELEMETRY", measuredPromotion: false };
}

export function withdrawMonitoringSourceAuthority(store: D1iR4Store, sourceAuthority: string): void {
  store.withdrawnMonitoringAuthorities.push(sourceAuthority);
  for (const source of store.monitoringSources) {
    if (source.sourceAuthority !== sourceAuthority) continue;
    remember(store, "MONITORING_SOURCE", source.monitoringSourceId, "STALE");
    for (const reference of store.telemetryReferences) {
      if (reference.monitoringSourceId !== source.monitoringSourceId) continue;
      remember(store, "TELEMETRY_REFERENCE", reference.telemetryReferenceId, "STALE");
      if (store.telemetryPins?.some((pin) => pin.telemetryReferenceId === reference.telemetryReferenceId)) {
        markTelemetryPinStatus(store, reference.telemetryReferenceId, "STALE");
      }
    }
  }
}

export function produceTelemetryMonitoringReferenceResult(store: D1iR4Store, twinId: string): {
  resultId: string;
  twinId: string;
  monitoringSourceIds: readonly string[];
  deviceReferenceIds: readonly string[];
  channelReferenceIds: readonly string[];
  targetBindingIds: readonly string[];
  telemetryReferenceIds: readonly string[];
  telemetryStateReferenceIds: readonly string[];
  scope: string;
  completeness: (typeof D1I_R4_COMPLETENESS_STATES)[number];
  runtimeDiagnostics: readonly { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false; conflict: false }[];
  blockingRuntimeDiagnostics: readonly { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false; conflict: false }[];
  warnings: readonly string[];
  provenanceFingerprint: string;
  fingerprint: string;
  continuousMonitoring: false;
  structuralAdequacy: false;
  engineeringApproval: false;
} {
  const bindings = store.bindings.filter((row) => row.twinId === twinId);
  const telemetry = store.telemetryReferences.filter((row) => row.targetBindingIds.some((id) => bindings.some((binding) => binding.bindingId === id)));
  const warnings = telemetry.flatMap((row) => {
    const notes: string[] = [];
    if (row.sourceQuality === "UNKNOWN") notes.push("QUALITY_UNKNOWN");
    if (row.calibration.calibrationStatus === "CALIBRATION_UNKNOWN") notes.push("CALIBRATION_UNKNOWN");
    if (row.timeBasis.clockQuality === "UNKNOWN") notes.push("CLOCK_SYNC_UNKNOWN");
    return notes;
  });
  const complete = bindings.length > 0 && telemetry.length > 0;
  const fingerprint = fingerprintCanonical({
    twinId,
    bindings: bindings.map((row) => row.fingerprint).sort(),
    telemetry: telemetry.map((row) => row.fingerprint).sort(),
  });
  return {
    resultId: `r4-result-${twinId}`,
    twinId,
    monitoringSourceIds: Object.freeze([...new Set(telemetry.map((row) => row.monitoringSourceId))]),
    deviceReferenceIds: Object.freeze([...new Set(telemetry.map((row) => row.deviceReferenceId))]),
    channelReferenceIds: Object.freeze([...new Set(telemetry.flatMap((row) => [...row.channelReferenceIds]))]),
    targetBindingIds: Object.freeze(bindings.map((row) => row.bindingId)),
    telemetryReferenceIds: Object.freeze(telemetry.map((row) => row.telemetryReferenceId)),
    telemetryStateReferenceIds: Object.freeze(telemetry.map((row) => row.stateReferenceId).filter((id): id is string => Boolean(id))),
    scope: "DECLARED_MONITORING_REFERENCE",
    completeness: complete ? "COMPLETE_FOR_DECLARED_REFERENCE_SCOPE" : "INCOMPLETE",
    runtimeDiagnostics: Object.freeze(warnings.map((code) => ({ kind: "RUNTIME_DIAGNOSTIC" as const, code, structuralFinding: false as const, conflict: false as const }))),
    blockingRuntimeDiagnostics: Object.freeze([]),
    warnings: Object.freeze(warnings),
    provenanceFingerprint: fingerprint,
    fingerprint,
    continuousMonitoring: false,
    structuralAdequacy: false,
    engineeringApproval: false,
  };
}
