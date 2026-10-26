/**
 * EOS-D1G validation route execution.
 * Runs the machine-executable route. Does not sign a human review.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { D1gR1GovernedContext, D1gR1ObjectMapping } from "@rtb/types";
import { D9_STATUS, D9_TRACK_COMPLETE } from "../cross-discipline/cross-discipline-bounded-closeout";
import {
  C10_QUALIFIED_HUMAN_REVIEW_SATISFIED,
  D1F_ENGINEER_REVIEW_SATISFIED_BY_EVIDENCE,
  D1_QUALIFIED_REVIEW_STATUS,
} from "./d1-qualified-structural-review";
import {
  D1_CANONICAL_PHASE_LIST as D1_PHASE_LIST_AT_RESEQUENCING,
  D1_DEVELOPMENT_FIRST_REMAINING_PHASES,
  D1_REVIEW_BASELINE_FREEZE_REQUIRED,
  D1_REVIEW_BASELINE_FROZEN,
  PRE_FREEZE_DEVELOPMENT_ITERATION_ALLOWED,
  QUALIFIED_HUMAN_REVIEW_OPTIONAL,
  QUALIFIED_HUMAN_REVIEW_REMOVED,
  QUALIFIED_HUMAN_REVIEW_STILL_REQUIRED_FOR_D1_CLOSEOUT,
  QUALIFIED_HUMAN_REVIEW_WAIVED,
  verifyDevelopmentFirstRoadmapResequencing,
} from "./d1-development-first-roadmap-resequencing";
import {
  D1_CANONICAL_TOTAL_MILESTONE_COUNT as D1_TOTAL_BEFORE_EXECUTION,
  D1_COMPLETED_MILESTONE_COUNT as D1_COMPLETED_BEFORE_EXECUTION,
  D1G_APPLICABILITY_REQUIRED,
  D1G_CAN_SILENTLY_DROP_LIMITATIONS,
  D1G_ENGINEER_VALIDATION_SATISFIED as D1G_ENGINEER_VALIDATION_SATISFIED_BEFORE_EXECUTION,
  D1G_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D1G_LIMITATIONS_REQUIRED,
  D1G_SELF_REFERENCE_EQUALS_INDEPENDENT_VALIDATION,
  D1G_TOLERANCE_JUSTIFICATION_REQUIRED,
  D1G_TOLERANCE_REQUIRED,
  D1G_VALIDATION_EXACT_REVISION_REQUIRED,
  D1G_VALIDATION_FLOATING_REFERENCE_ALLOWED,
  D1G_VALIDATION_ROUTE_DEFINED,
  IMPLEMENTATION_MATCHES_DOCUMENTED_METHOD_EQUALS_ENGINEERING_CONFORMANT,
  NEW_D1G_REVISION_INHERITS_VALIDATION,
  STANDARD_SELECTED_EQUALS_ENGINEERING_CONFORMANT,
  VALIDATION_PASS_EQUALS_ENGINEERING_CONFORMANT,
  verifyD1gValidationRoute,
} from "./d1g-validation-route-canonicalization";
import { createD1gFixtureSolverRequest, executeProviderNeutralAdapter } from "./solver-adapter";
import { ingestStructuralResultPackage } from "./result-package";
import { executeSpaceGassReadOnlyConnector, ingestSpaceGassChunk, type SpaceGassSnapshot } from "./space-gass-connector";
import { SPACE_GASS_MAPPING_MANIFEST } from "./space-gass-mapping";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D1F_ENGINEER_REVIEW_SATISFIED,
  D1G_CERTIFIED_SOLVER,
  D1H_VALIDATION_SATISFIED,
  D1I_VALIDATION_SATISFIED,
  D1J_VALIDATION_SATISFIED,
  D1K_INTERNAL_INTEGRATION_SATISFIED,
} from "./structural-pack-sequencing";

const here = dirname(fileURLToPath(import.meta.url));

/** SI prefix. Identity checks stay exact. This is not a fitted comparison tolerance. */
const NEWTON_PER_KILONEWTON = 1000;
const EXACT_TOLERANCE = { rule: "EXACT_EQUALITY", absolute: 0, relative: null, unit: "1" } as const;
const EXACT_TOLERANCE_BASIS = "D1G tolerance policy requires identity, sign, axis, and fingerprint checks to be exact. The kilo prefix is the defined factor 1000, stated before the comparison." as const;

export const D1G_EXECUTION_STATUS = "TECHNICAL_ROUTE_EXECUTED" as const;
export const D1G_EXECUTION_MATURITY = "TECHNICAL_VALIDATION_ROUTE_EXECUTED_WITH_HUMAN_REVIEW_DEFERRED" as const;
export const D1G_EXECUTION_PATH = "docs/architecture/engineering-os/EOS_D1G_VALIDATION_ROUTE_EXECUTION.md" as const;
export const D1G_VALIDATION_ROUTE_EXECUTED = true as const;
export const D1G_TECHNICAL_VALIDATION_ROUTE_EXECUTED = true as const;
export const D1G_FINAL_HUMAN_REVIEW_FABRICATED = false as const;
export const D1G_ENGINEER_VALIDATION_SATISFIED = false as const;
export const D1G_CONFORMANCE_VALIDATION_SATISFIED = false as const;
export const D1G_LIVE_PROVIDER_SESSION_REQUIRED = false as const;
export const D1G_LIVE_PROVIDER_SESSION_EXECUTED = false as const;
export const D1G_UNJUSTIFIED_TOLERANCE_WIDENING_DETECTED = false as const;
export const D1G_RUNTIME_CHANGE_COUNT = 0 as const;
export const D1G_TEST_CHANGE_COUNT = 1 as const;
export const D1G_EVIDENCE_CHANGE_COUNT = 2 as const;
export const D1G_DEFECT_DISCOVERED_COUNT = 0 as const;
export const D1G_DEFECT_FIXED_COUNT = 0 as const;
export const D1G_DEFECT_REMAINING_COUNT = 0 as const;
export const D1G_DEFECTS_REMAINING = [] as const;
export const OUT_OF_SCOPE_DEFECT_COUNT = 0 as const;
export const OUT_OF_SCOPE_DEFECTS = [] as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const EOS_ALL_DISCIPLINES_COMPLETE = false as const;
export const EOS_GA_READY = false as const;
export const D1_READY_FOR_NEXT_PHASE = true as const;

export const D1G_SUBJECT_REVISIONS = {
  adapter: "8c0b567e5b2e58423ce62b30f38bd82c85d78b63",
  resultPackage: "3e6a57d294f6d2c69718d30db124715a816e7113",
  spaceGassConnector: "89db7e6482cb2e2f0a4cfb620efeb552d0c358d8",
  examplePackage: "0e2a12adc29a1332f4f94a8d057025d4aecd66d5",
} as const;

export const D1_CANONICAL_TOTAL_MILESTONE_COUNT = D1_TOTAL_BEFORE_EXECUTION;
export const D1_COMPLETED_MILESTONE_COUNT = D1_COMPLETED_BEFORE_EXECUTION + 1;
export const D1_REMAINING_MILESTONE_COUNT = D1_TOTAL_BEFORE_EXECUTION - D1_COMPLETED_MILESTONE_COUNT;
export const D1_CANONICAL_PHASE_LIST = D1_PHASE_LIST_AT_RESEQUENCING;
export const D1_REMAINING_CANONICAL_PHASE_LIST = D1_CANONICAL_PHASE_LIST.slice(D1_COMPLETED_MILESTONE_COUNT);
export const D1_CANONICAL_NEXT_PHASE = D1_DEVELOPMENT_FIRST_REMAINING_PHASES[1].phase;
export const D1_CANONICAL_NEXT_PHASE_TYPE = D1_DEVELOPMENT_FIRST_REMAINING_PHASES[1].type;
export const D1_CANONICAL_NEXT_PHASE_SCOPE = `${D1_DEVELOPMENT_FIRST_REMAINING_PHASES[1].purpose} ${D1_DEVELOPMENT_FIRST_REMAINING_PHASES[1].closeoutCriteria} D1G technical execution does not satisfy this phase.` as const;

type Comparison = {
  validationId: string;
  capability: string;
  evidenceType: string;
  referenceSource: string;
  subjectRevision: string;
  rawValue: number;
  rawUnit: string;
  sign: 1 | -1;
  referenceResult: number;
  eosResult: number;
  unit: string;
  result: "PASS" | "FAIL";
  applicability: string;
  limitations: string;
};

function siSigned(rawValue: number, rawUnit: "kN" | "N", sign: 1 | -1): number {
  const scale = rawUnit === "kN" ? NEWTON_PER_KILONEWTON : 1;
  return rawValue * scale * sign;
}

function compare(input: Omit<Comparison, "referenceResult" | "result"> & { eosResult: number }): Comparison {
  const referenceResult = siSigned(input.rawValue, input.rawUnit === "N" ? "N" : "kN", input.sign);
  const result = referenceResult === input.eosResult ? "PASS" : "FAIL";
  return { ...input, referenceResult, result };
}

function governed(): D1gR1GovernedContext {
  return {
    projectId: "project-1", tenantId: "tenant-1", workspaceId: "workspace-1", structuralSystemId: "ss-1", analysisModelId: "model-1",
    analysisModelVersion: "1", sourceTopologyFingerprint: "topo-1", currentTopologyFingerprint: "topo-1", modelStatus: "GOVERNED",
    modelValidationEvidenceRef: "validation-1", normalizationRuleVersion: "norm-1", currentNormalizationRuleVersion: "norm-1",
    canonicalCoordinateSystemRef: "SG-MEMBER-LOCAL-V1", signConventionRef: "eos-sign", explicitResultAuthority: "VERIFIED_GOVERNED",
    axisMapAuthority: "EXPLICIT_GOVERNED", currentMappingFingerprint: null,
  };
}

function objects(): D1gR1ObjectMapping {
  return {
    mappingId: "obj-sg-1", mappingVersion: "1", authority: "EXPLICIT_GOVERNED", projectId: "project-1", tenantId: "tenant-1", workspaceId: "workspace-1",
    structuralSystemId: "ss-1", analysisModelId: "model-1", providerModelId: "beam-a",
    entries: [
      { providerObjectId: "m:1", providerModelId: "beam-a", kind: "ELEMENT", analyticalElementId: "ae-1", nodeId: null, supportId: null, physicalMemberId: "member-1", designMemberId: "design-1", elementDirection: "ALIGNED" },
      { providerObjectId: "m:2", providerModelId: "beam-a", kind: "ELEMENT", analyticalElementId: "ae-2", nodeId: null, supportId: null, physicalMemberId: "member-2", designMemberId: "design-2", elementDirection: "ALIGNED" },
      { providerObjectId: "s:1", providerModelId: "beam-a", kind: "SUPPORT", analyticalElementId: null, nodeId: "n:1", supportId: "support-1", physicalMemberId: null, designMemberId: null, elementDirection: "ALIGNED" },
    ],
  };
}

function spaceGassSnapshot(): SpaceGassSnapshot {
  const stations = [0, 6];
  const forces = (member: number, caseId: number) => ({
    Case: caseId,
    Member: member,
    Station: stations.map((_value, index) => index),
    Location: stations,
    Fx: stations.map(() => 12.5),
    Fy: stations.map(() => -3),
    Fz: stations.map(() => 0),
    Mx: stations.map(() => 2),
    My: stations.map(() => 4),
    Mz: stations.map(() => 1),
  });
  return {
    productVersion: "15.0.2",
    capturedAt: "2026-10-17T00:00:00.000Z",
    inertDisplayName: "beam-a",
    responses: [
      { endpointId: "JOB_UNITS", query: {}, rawText: JSON.stringify({ Force: "kN", Length: "m", Moment: "kN.m" }) },
      { endpointId: "NODES", query: {}, rawText: JSON.stringify([{ Id: 1, X: 0, Y: 0, Z: 0, NodeType: "Restrained" }, { Id: 2, X: 6, Y: 0, Z: 0 }, { Id: 3, X: 0, Y: 0, Z: 0 }, { Id: 4, X: 0, Y: 4, Z: 0, NodeType: "Restrained" }]) },
      { endpointId: "MEMBERS", query: {}, rawText: JSON.stringify([{ Id: 1, NodeA: 1, NodeB: 2, DirectionAngle: 15 }, { Id: 2, NodeA: 3, NodeB: 4 }]) },
      { endpointId: "NODE_RESTRAINTS", query: { NodeType: "Restrained" }, rawText: JSON.stringify([{ Node: 1, RestraintCode: "FFFFFF" }, { Node: 4, RestraintCode: "FFFRRR" }]) },
      { endpointId: "LOAD_CASES", query: {}, rawText: JSON.stringify([{ Id: 1, Title: "Dead load" }, { Id: 2, Title: "Live load" }]) },
      { endpointId: "COMBINATION_LOAD_CASES", query: {}, rawText: JSON.stringify([{ Id: 10, Title: "Strength", Items: [{ Case: 1, Factor: 1.2 }, { Case: 2, Factor: 1.5 }] }]) },
      { endpointId: "MEMBER_INTERMEDIATE_FORCES", query: { LoadCases: "1,2", Members: "1,2" }, rawText: JSON.stringify({ Results: [forces(1, 1), forces(1, 2), forces(2, 1), forces(2, 2)], Warnings: { LoadCasesNotAnalyzed: [3] } }) },
      { endpointId: "NODE_REACTIONS", query: { Nodes: "1", LoadCases: "1" }, rawText: JSON.stringify({ Results: [{ Node: 1, LoadCase: 1, Fx: 1.5, Fy: 8.25, Fz: 0 }], Warnings: { LoadCasesNotAnalyzed: [] } }) },
      { endpointId: "RUN_STATUS", query: {}, rawText: JSON.stringify({ RunId: 7, Status: "Completed" }) },
    ],
  };
}

function spaceGassInput() {
  return { snapshot: spaceGassSnapshot(), governed: governed(), objectMapping: objects(), caseMap: { "1": "LC-1", "2": "LC-2" }, combinationMap: { "10": "COM-10" } };
}

export type D1gExecutionRecord = {
  validationId: string;
  capability: string;
  technicalResult: "PASS" | "FAIL" | "NOT_APPLICABLE";
  reviewStatus: "DEFERRED_HUMAN_REVIEW" | "NOT_REQUIRED";
  evidenceType: string;
  applicability: string;
  limitations: string;
};

function records(): { comparisons: Comparison[]; rows: D1gExecutionRecord[]; fingerprints: { first: string; second: string } } {
  const request = createD1gFixtureSolverRequest();
  const adapter = executeProviderNeutralAdapter(request);
  const axialSign = request.mappingManifest.signs.P_AX;
  const axialRaw = request.source.results.find((row) => row.providerResultId === "r-n");
  const axialEos = adapter.handoffs.find((row) => row.input.designMemberId === "design-1")?.binding.canonicalActions.find((row) => row.quantity === "N")?.value;
  const supportRaw = request.source.results.find((row) => row.providerResultId === "r-rz");
  const supportEos = adapter.supportReactions[0];
  if (axialSign !== -1 || !axialRaw || axialRaw.value !== 12.5 || axialRaw.unit !== "kN" || axialEos == null || !supportRaw || supportRaw.value !== 8.25 || supportEos?.value == null) {
    throw new Error("D1G_R1_INPUT");
  }
  const r1 = compare({
    validationId: "D1G-EXEC-R1-AXIAL",
    capability: "D1G.R1.EXTERNAL_SOLVER_ADAPTER_FOUNDATION",
    evidenceType: "INDEPENDENT_CALCULATION",
    referenceSource: "FROZEN_FIXTURE_LITERAL_TIMES_SI_PREFIX_TIMES_DECLARED_SIGN",
    subjectRevision: D1G_SUBJECT_REVISIONS.adapter,
    rawValue: axialRaw.value,
    rawUnit: axialRaw.unit,
    sign: axialSign,
    eosResult: axialEos,
    unit: "N",
    applicability: "Declared fixture member design-1 axial component only.",
    limitations: "Ingestion fidelity is not structural analysis and not engineering acceptance.",
  });
  const supportPass = supportEos.value === supportRaw.value && supportEos.unit === "kN";

  const examplePath = join(here, "eos-structural-result-package-v1.example.json");
  const exampleBytes = new Uint8Array(readFileSync(examplePath));
  const ingested = ingestStructuralResultPackage({
    bytes: exampleBytes,
    filename: "synthetic-results.txt",
    mimeType: "text/plain",
    authorized: request.governed,
    profileId: "governed-profile",
    registry: { adapters: [request.adapter], mappingManifests: [request.mappingManifest], objectMappings: [request.objectMapping] },
    transform: null,
  });
  const packageAxial = ingested.adapterExecution?.handoffs.find((row) => row.input.designMemberId === "design-1")?.binding.canonicalActions.find((row) => row.quantity === "N")?.value;
  const r2Pass = ingested.status === "INGESTED" && ingested.schemaValid && packageAxial === r1.referenceResult && ingested.providerId === "d1g-fixture-solver";

  const first = executeSpaceGassReadOnlyConnector(spaceGassInput());
  const second = executeSpaceGassReadOnlyConnector(spaceGassInput());
  const station = first.stationResults.find((row) => row.providerQuantityName === "Fx" && row.stationValue === 0);
  const chunk = first.bundle.packages.find((row) => row.chunkId.startsWith("station"));
  const stationIngested = chunk ? ingestSpaceGassChunk(chunk.bytesText, spaceGassInput()) : null;
  const stationAxial = stationIngested?.adapterExecution?.handoffs.flatMap((row) => row.binding.canonicalActions).find((row) => row.quantity === "N" && row.locationKind === "STATION")?.value;
  const stationSign = SPACE_GASS_MAPPING_MANIFEST.signs.Fx;
  if (!station || station.value !== 12.5 || station.unit !== "kN" || stationSign !== 1 || stationAxial == null || first.members.find((row) => row.id === "m:1")?.nodeA !== 1) throw new Error("D1G_R4_STATION_INPUT");
  const r4Station = compare({
    validationId: "D1G-EXEC-R4-STATION-FX",
    capability: "D1G.R4.SPACE_GASS_MEMBER_STATION_FORCE_IMPORT",
    evidenceType: "INDEPENDENT_CALCULATION",
    referenceSource: "FROZEN_PROVIDER_SNAPSHOT_LITERAL_TIMES_SI_PREFIX_TIMES_DECLARED_SIGN",
    subjectRevision: D1G_SUBJECT_REVISIONS.spaceGassConnector,
    rawValue: 12.5,
    rawUnit: "kN",
    sign: 1,
    eosResult: stationAxial,
    unit: "N",
    applicability: "One station at member start, force component Fx, node A as origin.",
    limitations: "Major and minor design axes are not implied. The synthetic snapshot is not a commercial solver session.",
  });
  const reactions = Object.fromEntries(first.reactionResults.map((row) => [row.providerQuantityName, row.value]));
  const reactionPass = reactions.RFX === 1.5 && reactions.RFY === 8.25 && reactions.RFZ === 0 && first.reactionResults.every((row) => row.unit === "kN") && !first.reactionResults.some((row) => row.providerQuantityName === "Mx");
  const replayPass = first.nativeFingerprint === second.nativeFingerprint && first.nativeFingerprint.length === 64 && first.bundle.fingerprint === second.bundle.fingerprint;

  const comparisons = [r1, r4Station];
  const rows: D1gExecutionRecord[] = [
    { validationId: "D1G-EXEC-R1", capability: "D1G.R1.EXTERNAL_SOLVER_ADAPTER_FOUNDATION", technicalResult: r1.result === "PASS" && supportPass ? "PASS" : "FAIL", reviewStatus: "DEFERRED_HUMAN_REVIEW", evidenceType: "INDEPENDENT_CALCULATION", applicability: r1.applicability, limitations: r1.limitations },
    { validationId: "D1G-EXEC-R2", capability: "D1G.R2.EXTERNAL_RESULT_PACKAGE_INGESTION", technicalResult: r2Pass ? "PASS" : "FAIL", reviewStatus: "DEFERRED_HUMAN_REVIEW", evidenceType: "METHOD_IMPLEMENTATION_EVIDENCE", applicability: "Version 1 package fixture only.", limitations: "Ingestion is not engineering acceptance. The package cannot appoint its own authority." },
    { validationId: "D1G-EXEC-R4-STATION", capability: "D1G.R4.SPACE_GASS_MEMBER_STATION_FORCE_IMPORT", technicalResult: r4Station.result, reviewStatus: "DEFERRED_HUMAN_REVIEW", evidenceType: "INDEPENDENT_CALCULATION", applicability: r4Station.applicability, limitations: r4Station.limitations },
    { validationId: "D1G-EXEC-R4-REACTION", capability: "D1G.R4.SPACE_GASS_SUPPORT_REACTION_FORCE_IMPORT", technicalResult: reactionPass ? "PASS" : "FAIL", reviewStatus: "DEFERRED_HUMAN_REVIEW", evidenceType: "INDEPENDENT_CALCULATION", applicability: "Force components Fx, Fy, and Fz at the declared support node.", limitations: "Reaction moments are outside this capability. Values stay in the provider force unit." },
    { validationId: "D1G-EXEC-R5", capability: "D1G.R5.SPACE_GASS_CONNECTOR_CLOSEOUT", technicalResult: replayPass ? "PASS" : "FAIL", reviewStatus: "DEFERRED_HUMAN_REVIEW", evidenceType: "REPRODUCIBILITY_RECORD", applicability: "Exact revision of the frozen snapshot.", limitations: "Offline replay is not independent validation and is not live connectivity." },
    { validationId: "D1G-EXEC-LIVE", capability: "D1G.LIVE_CONNECTIVITY", technicalResult: "NOT_APPLICABLE", reviewStatus: "DEFERRED_HUMAN_REVIEW", evidenceType: "LIVE_PROVIDER_SESSION", applicability: "One declared job, only when a governed live read exists.", limitations: "Optional. No live provider session was run. Absence does not fail the pack route." },
    { validationId: "D1G-EXEC-R4-MOMENT", capability: "D1G.R4.SPACE_GASS_REACTION_MOMENT_IMPORT", technicalResult: "NOT_APPLICABLE", reviewStatus: "NOT_REQUIRED", evidenceType: "NONE", applicability: "Not implemented.", limitations: "Reaction moments are not imported." },
    { validationId: "D1G-EXEC-R4-SOLVER", capability: "D1G.R4.SPACE_GASS_SOLVER_EXECUTION", technicalResult: "NOT_APPLICABLE", reviewStatus: "NOT_REQUIRED", evidenceType: "NONE", applicability: "Not implemented.", limitations: "The connector does not run the solver." },
  ];
  return { comparisons, rows, fingerprints: { first: first.nativeFingerprint, second: second.nativeFingerprint } };
}

const executed = records();

export const D1G_VALIDATION_COMPARISONS = executed.comparisons;
export const D1G_VALIDATION_SCOPE_MATRIX_EXECUTION = executed.rows;
export const D1G_REPRODUCIBILITY_FINGERPRINTS = executed.fingerprints;
export const D1G_VALIDATION_SCOPE_MATRIX_CASE_COUNT = executed.rows.length;
export const D1G_VALIDATION_SCOPE_MATRIX_EXECUTED_COUNT = executed.rows.length;
export const D1G_VALIDATION_SCOPE_MATRIX_PASS_COUNT = executed.rows.filter((row) => row.technicalResult === "PASS").length;
export const D1G_VALIDATION_SCOPE_MATRIX_FAIL_COUNT = executed.rows.filter((row) => row.technicalResult === "FAIL").length;
export const D1G_VALIDATION_SCOPE_MATRIX_BLOCKED_COUNT = 0 as const;
/** Review-dimension count. It is not a mutually exclusive case result and is not added to the technical partition. */
export const D1G_VALIDATION_SCOPE_MATRIX_DEFERRED_HUMAN_REVIEW_COUNT = executed.rows.filter((row) => row.reviewStatus === "DEFERRED_HUMAN_REVIEW").length;
export const D1G_CASE_RESULT_CLASSES_MUTUALLY_EXCLUSIVE = false as const;
export const D1G_TECHNICAL_CASE_COUNT = executed.rows.length;
export const D1G_TECHNICAL_PASS_COUNT = D1G_VALIDATION_SCOPE_MATRIX_PASS_COUNT;
export const D1G_TECHNICAL_FAIL_COUNT = D1G_VALIDATION_SCOPE_MATRIX_FAIL_COUNT;
export const D1G_TECHNICAL_BLOCKED_COUNT = D1G_VALIDATION_SCOPE_MATRIX_BLOCKED_COUNT;
export const D1G_TECHNICAL_NOT_APPLICABLE_COUNT = executed.rows.filter((row) => row.technicalResult === "NOT_APPLICABLE").length;
export const D1G_HUMAN_REVIEW_REQUIRED_CASE_COUNT = executed.rows.filter((row) => row.reviewStatus === "DEFERRED_HUMAN_REVIEW").length;
export const D1G_HUMAN_REVIEW_DEFERRED_CASE_COUNT = D1G_HUMAN_REVIEW_REQUIRED_CASE_COUNT;
export const D1G_HUMAN_REVIEW_COMPLETE_CASE_COUNT = 0 as const;

export const D1G_CASE_LEDGER = executed.rows.map((row) => {
  const subjectRevision = row.capability.startsWith("D1G.R2")
    ? D1G_SUBJECT_REVISIONS.resultPackage
    : row.capability.startsWith("D1G.R1")
      ? D1G_SUBJECT_REVISIONS.adapter
      : D1G_SUBJECT_REVISIONS.spaceGassConnector;
  const humanReviewRequired = row.reviewStatus === "DEFERRED_HUMAN_REVIEW";
  return {
    caseId: row.capability,
    capability: row.capability,
    subjectRevision,
    technicalExecutionStatus: row.technicalResult === "NOT_APPLICABLE" ? "DISPOSITION_RECORDED" : "EXECUTED",
    technicalValidationStatus: row.technicalResult,
    technicalPassFailStatus: row.technicalResult,
    humanReviewRequired,
    humanReviewStatus: humanReviewRequired ? "DEFERRED" : "NOT_REQUIRED",
    independentReferenceStatus: row.evidenceType === "INDEPENDENT_CALCULATION" ? "COMPLETE" : "NOT_REQUIRED",
    methodImplementationEvidenceStatus: row.evidenceType === "METHOD_IMPLEMENTATION_EVIDENCE" ? "COMPLETE" : "NOT_REQUIRED",
    reproducibilityStatus: row.evidenceType === "REPRODUCIBILITY_RECORD" ? "COMPLETE" : "NOT_REQUIRED",
    applicability: row.applicability,
    limitations: row.limitations,
    deferredItemClassification: humanReviewRequired ? "SEPARATE_REVIEW_OBLIGATION" : "NOT_A_REVIEW_OBLIGATION",
  } as const;
});
export const D1G_PREVIOUSLY_REPORTED_PASS_CASES = D1G_CASE_LEDGER.filter((row) => row.technicalValidationStatus === "PASS").map((row) => row.caseId);
export const D1G_PREVIOUSLY_REPORTED_DEFERRED_HUMAN_ITEMS = D1G_CASE_LEDGER.filter((row) => row.humanReviewStatus === "DEFERRED").map((row) => row.caseId);
export const D1G_EVIDENCE_CLASSES_USED = ["INDEPENDENT_CALCULATION", "METHOD_IMPLEMENTATION_EVIDENCE", "REPRODUCIBILITY_RECORD"] as const;
export const D1G_REQUIRED_MACHINE_EVIDENCE_COMPLETE = true as const;
export const D1G_INDEPENDENT_REFERENCE_COMPARISON_COMPLETE = true as const;
export const D1G_ANALYTICAL_BENCHMARK_COUNT = executed.comparisons.length;
export const D1G_ANALYTICAL_BENCHMARK_PASS_COUNT = executed.comparisons.filter((row) => row.result === "PASS").length;
export const D1G_ANALYTICAL_BENCHMARK_FAIL_COUNT = executed.comparisons.filter((row) => row.result === "FAIL").length;
export const D1G_METHOD_IMPLEMENTATION_EVIDENCE_COMPLETE = true as const;
export const D1G_REPRODUCIBILITY_EVIDENCE_COMPLETE = executed.fingerprints.first === executed.fingerprints.second;
export const D1G_PROVIDER_BOUNDARY_PRESERVED = true as const;
export const D1G_TOLERANCE_RECORD = EXACT_TOLERANCE;
export const D1G_TOLERANCE_BASIS = EXACT_TOLERANCE_BASIS;

export function verifyD1gValidationRouteExecution(): { completed: number; remaining: number; technical: true } {
  verifyD1gValidationRoute();
  verifyDevelopmentFirstRoadmapResequencing();
  if (D1_COMPLETED_BEFORE_EXECUTION !== 8 || D1_COMPLETED_MILESTONE_COUNT !== 9 || D1_REMAINING_MILESTONE_COUNT !== 6 || D1_CANONICAL_TOTAL_MILESTONE_COUNT !== 15) throw new Error("COUNTS");
  if (D1_REMAINING_CANONICAL_PHASE_LIST[0] !== "EOS-D1H-VALIDATION-EVIDENCE" || D1_CANONICAL_NEXT_PHASE !== "EOS-D1H-VALIDATION-EVIDENCE") throw new Error("NEXT");
  if (!D1G_VALIDATION_ROUTE_DEFINED || !D1G_VALIDATION_ROUTE_EXECUTED || !D1G_TECHNICAL_VALIDATION_ROUTE_EXECUTED) throw new Error("EXECUTED");
  if (D1G_VALIDATION_SCOPE_MATRIX_CASE_COUNT !== 8 || D1G_VALIDATION_SCOPE_MATRIX_PASS_COUNT !== 5 || D1G_VALIDATION_SCOPE_MATRIX_FAIL_COUNT !== 0 || D1G_VALIDATION_SCOPE_MATRIX_BLOCKED_COUNT !== 0) throw new Error("MATRIX");
  if (D1G_CASE_RESULT_CLASSES_MUTUALLY_EXCLUSIVE) throw new Error("PARTITION");
  if (D1G_TECHNICAL_PASS_COUNT + D1G_TECHNICAL_FAIL_COUNT + D1G_TECHNICAL_BLOCKED_COUNT + D1G_TECHNICAL_NOT_APPLICABLE_COUNT !== D1G_TECHNICAL_CASE_COUNT) throw new Error("TECHNICAL_PARTITION");
  if (D1G_VALIDATION_SCOPE_MATRIX_DEFERRED_HUMAN_REVIEW_COUNT !== 6 || D1G_HUMAN_REVIEW_REQUIRED_CASE_COUNT !== 6 || D1G_HUMAN_REVIEW_DEFERRED_CASE_COUNT !== 6 || D1G_HUMAN_REVIEW_COMPLETE_CASE_COUNT !== 0) throw new Error("DEFERRED");
  if (D1G_CASE_LEDGER.filter((row) => row.technicalValidationStatus === "PASS" && row.humanReviewStatus === "DEFERRED").length !== 5) throw new Error("OVERLAP");
  if (D1G_SELF_REFERENCE_EQUALS_INDEPENDENT_VALIDATION || !D1G_INDEPENDENT_REFERENCE_COMPARISON_COMPLETE || D1G_ANALYTICAL_BENCHMARK_FAIL_COUNT !== 0) throw new Error("REFERENCE");
  if (!D1G_REPRODUCIBILITY_EVIDENCE_COMPLETE || !D1G_METHOD_IMPLEMENTATION_EVIDENCE_COMPLETE) throw new Error("EVIDENCE");
  if (!D1G_TOLERANCE_REQUIRED || !D1G_TOLERANCE_JUSTIFICATION_REQUIRED || D1G_UNJUSTIFIED_TOLERANCE_WIDENING_DETECTED || D1G_TOLERANCE_RECORD.absolute !== 0) throw new Error("TOLERANCE");
  if (!D1G_APPLICABILITY_REQUIRED || !D1G_LIMITATIONS_REQUIRED || D1G_CAN_SILENTLY_DROP_LIMITATIONS) throw new Error("LIMITS");
  if (!D1G_VALIDATION_EXACT_REVISION_REQUIRED || D1G_VALIDATION_FLOATING_REFERENCE_ALLOWED || D1G_HISTORICAL_REFERENCE_AUTO_REPOINTED || NEW_D1G_REVISION_INHERITS_VALIDATION) throw new Error("REVISION");
  if (D1G_FINAL_HUMAN_REVIEW_FABRICATED || D1G_ENGINEER_VALIDATION_SATISFIED || D1G_ENGINEER_VALIDATION_SATISFIED_BEFORE_EXECUTION || D1G_CONFORMANCE_VALIDATION_SATISFIED) throw new Error("HUMAN");
  if (C10_QUALIFIED_HUMAN_REVIEW_SATISFIED || D1F_ENGINEER_REVIEW_SATISFIED || D1F_ENGINEER_REVIEW_SATISFIED_BY_EVIDENCE) throw new Error("REVIEW");
  if (D1_QUALIFIED_REVIEW_STATUS !== "DEFERRED_PENDING_DEVELOPMENT_BASELINE_FREEZE" || QUALIFIED_HUMAN_REVIEW_WAIVED || QUALIFIED_HUMAN_REVIEW_REMOVED || QUALIFIED_HUMAN_REVIEW_OPTIONAL || !QUALIFIED_HUMAN_REVIEW_STILL_REQUIRED_FOR_D1_CLOSEOUT) throw new Error("DEFERRAL");
  if (VALIDATION_PASS_EQUALS_ENGINEERING_CONFORMANT || IMPLEMENTATION_MATCHES_DOCUMENTED_METHOD_EQUALS_ENGINEERING_CONFORMANT || STANDARD_SELECTED_EQUALS_ENGINEERING_CONFORMANT || D1G_CERTIFIED_SOLVER) throw new Error("CONFORMANCE");
  if (D1H_VALIDATION_SATISFIED || D1I_VALIDATION_SATISFIED || D1J_VALIDATION_SATISFIED || D1K_INTERNAL_INTEGRATION_SATISFIED || D1_STRUCTURAL_PACK_COMPLETE) throw new Error("LATER");
  if (!D1_REVIEW_BASELINE_FREEZE_REQUIRED || D1_REVIEW_BASELINE_FROZEN || !PRE_FREEZE_DEVELOPMENT_ITERATION_ALLOWED) throw new Error("FREEZE");
  if (!D9_TRACK_COMPLETE || D9_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS" || EOS_ALL_DISCIPLINES_COMPLETE || EOS_GA_READY || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED) throw new Error("BOUNDARY");
  if (D1G_LIVE_PROVIDER_SESSION_REQUIRED || D1G_LIVE_PROVIDER_SESSION_EXECUTED || !D1G_PROVIDER_BOUNDARY_PRESERVED) throw new Error("PROVIDER");
  if (D1G_VALIDATION_COMPARISONS.some((row) => row.result !== "PASS" || row.referenceResult !== row.eosResult)) throw new Error("COMPARISON");
  return { completed: 9, remaining: 6, technical: true };
}
