/**
 * EOS D1 structural debt inspection and remaining-roadmap canonicalization.
 * Records repository evidence. Adds no structural runtime.
 */
import { D6_REOPENED, D7_REOPENED, D8_REOPENED } from "@rtb/types";
import { D9_STATUS, D9_TRACK_COMPLETE } from "../cross-discipline/cross-discipline-bounded-closeout";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D2_TRACK_COMPLETE,
  D3_TRACK_COMPLETE,
  D4_TRACK_COMPLETE,
  D5_TRACK_COMPLETE,
  D6_TRACK_COMPLETE,
  D7_TRACK_COMPLETE,
  D8_TRACK_COMPLETE,
} from "../instrumentation-control/instrumentation-control-bounded-closeout";
import { D1N_REOPENED, D2_REOPENED, D3_REOPENED, D4_REOPENED, D5_REOPENED } from "../process/process-bounded-closeout";
import { D1M_R9_CANONICAL_PHASE } from "./cad-bim-evidence-handoff";
import { D1L_R6_CANONICAL_PHASE } from "./certification-lifecycle";
import { D1L_R6_CERTIFICATION_ELIGIBILITY_SATISFIED, D1L_R6_TRACK_COMPLETE, D1L_R6_TRACK_STATUS } from "./certification-gate-closeout";
import { D1J_R5_CANONICAL_PHASE } from "./certification-readiness-gate";
import { D1N_R9_CANONICAL_PHASE } from "./handoff-integration";
import { D1H_METHOD_CONFORMANCE_VALIDATION_COUNT, D1H_SOFTWARE_ENGINEER_VALIDATION_COUNT, D1H_TRACK_STATUS } from "./inspection-closeout";
import { D1K_R5_CANONICAL_PHASE } from "./interface-reference-composition";
import { D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY, D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY, D1K_R5_TRACK_COMPLETE, D1K_R5_TRACK_STATUS } from "./interface-closeout";
import { D1J_CONFORMANCE_VALIDATION_STATUS, D1J_ENGINEER_VALIDATION_STATUS } from "./optimization-closeout";
import {
  C10_QUALIFIED_REVIEW_SATISFIED,
  D1_PACK_COMPLETION_REQUIRES_GA_SECURITY_DEBT_RESOLUTION,
  D1_STRUCTURAL_PACK_SEQUENCING_PHASE,
  D1F_ENGINEER_REVIEW_SATISFIED,
  D1G_VALIDATION_ROUTE_COMPLETED,
  D1G_VALIDATION_ROUTE_REMAINS_UNDEFINED,
  D1H_VALIDATION_SATISFIED,
  D1I_VALIDATION_SATISFIED,
  D1J_VALIDATION_SATISFIED,
  D1K_INTERNAL_INTEGRATION_SATISFIED,
  D1L_PROJECT_CERTIFICATION_ELIGIBILITY_SATISFIED,
  GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  PROJECT_CERTIFICATION_ELIGIBILITY_REQUIRED_FOR_D1_PACK_COMPLETION,
} from "./structural-pack-sequencing";
import { D1G_CERTIFIED_SOLVER_STATUS, D1G_CONFORMANCE_VALIDATED, D1G_ENGINEER_VALIDATED, D1G_LIVE_VALIDATED, D1G_VALIDATION_ROUTE_PHASE, D1M_CURRENT_STATUS, D1N_CURRENT_STATUS } from "./roadmap-after-twin-closeout";
import { D1I_METHOD_CONFORMANCE_VALIDATION_COUNT, D1I_SOFTWARE_ENGINEER_VALIDATION_COUNT, D1I_TRACK_STATUS } from "./twin-closeout";
import { D1I_R5_CANONICAL_PHASE_FROM_REPOSITORY } from "./twin-monitoring-reference";
import { C10_VALIDATION_LANE_STATUS, D1F_R3_ENGINEER_REVIEW_PENDING } from "@rtb/types";
import { D1J_TRACK_STATUS } from "./post-d1j-roadmap";
import { D1M_R9_TRACK_COMPLETE, D1M_R9_TRACK_STATUS } from "./cad-bim-intelligence-closeout";
import { D1N_TRACK_COMPLETE, D1N_TRACK_STATUS } from "./orchestration-closeout";

export const D1_DEBT_CANONICALIZATION_STATUS = "D1_REMAINING_ROADMAP_CANONICALIZED" as const;
export const D1_DEBT_CANONICALIZATION_PATH = "docs/architecture/engineering-os/EOS_D1_STRUCTURAL_DEBT_CANONICALIZATION.md" as const;
export const D1_CURRENT_MATURITY = "STRUCTURAL_PACK_INCOMPLETE" as const;
export const NEW_SUBSTANTIVE_RUNTIME_COUNT = 0 as const;
export const D1_CLOSEOUT_TARGET = "COMPLETE_BOUNDED_WITH_LIMITATIONS" as const;
export const D1_TRACK_COMPLETE_EQUALS_UNIVERSALLY_ENGINEERING_VALIDATED = false as const;
export const D1_TRACK_COMPLETE_EQUALS_UNIVERSALLY_CONFORMANT = false as const;
export const D1_TRACK_COMPLETE_EQUALS_CERTIFIED = false as const;
export const D1_TRACK_COMPLETE_EQUALS_REGULATORY_APPROVED = false as const;
export const IMPLEMENTATION_MATCHES_DOCUMENTED_METHOD_EQUALS_ENGINEERING_CONFORMANT = false as const;
export const STANDARD_SELECTED_EQUALS_CONFORMANT = false as const;
export const STANDARD_REFERENCE_EQUALS_REGULATORY_APPROVAL = false as const;
export const D9_REOPENED = false as const;
export const D1K_REOPEN_REQUIRED = false as const;
export const D1K_REOPEN_REASON = "D1K-R5 is complete with limitations. Internal integration remains unsatisfied as pack evidence and does not reopen the closed track." as const;
export const D1L_REOPEN_REQUIRED = false as const;
export const D1L_REOPEN_REASON = "D1L-R6 certification governance is complete with limitations. Project certification eligibility is unsatisfied and is not required for structural pack completion." as const;
export const D1N_REOPEN_REQUIRED = false as const;
export const D1N_REOPEN_REASON = "D1N closeout is complete with limitations. The historical NOT_ABSORBED status stays on the earlier roadmap and is not a live reopen." as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const EOS_ALL_DISCIPLINES_COMPLETE = false as const;
export const EOS_GA_READY = false as const;

export const D1_HISTORICAL_PHASE_LIST = [
  D1I_R5_CANONICAL_PHASE_FROM_REPOSITORY,
  D1J_R5_CANONICAL_PHASE,
  D1K_R5_CANONICAL_PHASE,
  D1L_R6_CANONICAL_PHASE,
  D1M_R9_CANONICAL_PHASE,
  D1N_R9_CANONICAL_PHASE,
  D1_STRUCTURAL_PACK_SEQUENCING_PHASE,
] as const;
export const D1_HISTORICAL_PHASE_COUNT = D1_HISTORICAL_PHASE_LIST.length;

export const D1_REMAINING_PHASES = [
  {
    phase: "EOS-D1G-VALIDATION-ROUTE-CANONICALIZATION",
    type: "D1G_VALIDATION_ROUTE_CANONICALIZATION",
    purpose: "Authorize the D1G validation route that is currently NOT_DEFINED.",
    dependencies: [] as readonly string[],
    inputEvidence: "D1G_VALIDATION_ROUTE_PHASE is NOT_DEFINED and D1G_VALIDATION_ROUTE_COMPLETED is false.",
    expectedOutput: "A named route, its evidence, and its non-claims. The route is not executed.",
    blockingConditions: "NONE",
    closeoutCriteria: "The route phase is no longer NOT_DEFINED, and execution remains unauthorized until a later phase.",
  },
  {
    phase: "EOS-D1-QUALIFIED-STRUCTURAL-REVIEW",
    type: "QUALIFIED_STRUCTURAL_REVIEW",
    purpose: "Record C10 and D1F qualified human review against exact revisions.",
    dependencies: [] as readonly string[],
    inputEvidence: "C10_VALIDATION_LANE_STATUS is PENDING_QUALIFIED_HUMAN_REVIEW and D1F_R3_ENGINEER_REVIEW_PENDING is true.",
    expectedOutput: "Traceable reviewer identity, authority, findings, and exact revision binding, or a fail-closed record that the human evidence is absent.",
    blockingConditions: "HUMAN_AUTHORITY_BLOCKER",
    closeoutCriteria: "C10 qualified review and D1F engineer review are both satisfied by traceable human evidence. Review completion is not engineering validation.",
  },
  {
    phase: "EOS-D1G-VALIDATION-ROUTE-EXECUTION",
    type: "D1G_VALIDATION_ROUTE_EXECUTION",
    purpose: "Execute only the route named by the canonicalization phase.",
    dependencies: ["EOS-D1G-VALIDATION-ROUTE-CANONICALIZATION"],
    inputEvidence: "Live, engineer, and conformance validation flags are false. The solver status is NOT_CERTIFIED.",
    expectedOutput: "The evidence the authorized route requires. Solver certification is not claimed.",
    blockingConditions: "ENGINEERING_EVIDENCE_BLOCKER",
    closeoutCriteria: "D1G_VALIDATION_ROUTE_COMPLETED is true and the route is no longer undefined. Certified-solver status is not required by the pack formula.",
  },
  {
    phase: "EOS-D1H-VALIDATION-EVIDENCE",
    type: "D1H_VALIDATION_EVIDENCE",
    purpose: "Record D1H software engineer validation and method-conformance evidence without reopening the inspection track.",
    dependencies: ["EOS-D1-QUALIFIED-STRUCTURAL-REVIEW"],
    inputEvidence: "D1H engineer and method-conformance counts are 0. The D1H track is already complete with limitations.",
    expectedOutput: "Both validation counts are greater than zero, or the phase fails closed.",
    blockingConditions: "HUMAN_AUTHORITY_BLOCKER",
    closeoutCriteria: "D1H_VALIDATION_SATISFIED is true. A method match is not engineering conformance.",
  },
  {
    phase: "EOS-D1I-VALIDATION-EVIDENCE",
    type: "D1I_VALIDATION_EVIDENCE",
    purpose: "Record D1I software engineer validation and method-conformance evidence without reopening the twin track.",
    dependencies: ["EOS-D1-QUALIFIED-STRUCTURAL-REVIEW"],
    inputEvidence: "D1I engineer and method-conformance counts are 0. The D1I track is already complete with limitations.",
    expectedOutput: "Both validation counts are greater than zero, or the phase fails closed.",
    blockingConditions: "HUMAN_AUTHORITY_BLOCKER",
    closeoutCriteria: "D1I_VALIDATION_SATISFIED is true.",
  },
  {
    phase: "EOS-D1J-VALIDATION-EVIDENCE",
    type: "D1J_VALIDATION_EVIDENCE",
    purpose: "Record D1J engineer validation and conformance evidence without reopening the optimization track.",
    dependencies: ["EOS-D1-QUALIFIED-STRUCTURAL-REVIEW"],
    inputEvidence: "D1J engineer and conformance statuses are NOT_VALIDATED. Concrete parameter semantics stay NOT_AVAILABLE and are not an extra pack gate.",
    expectedOutput: "Both statuses leave NOT_VALIDATED, or the phase fails closed.",
    blockingConditions: "HUMAN_AUTHORITY_BLOCKER",
    closeoutCriteria: "D1J_VALIDATION_SATISFIED is true. Parameter semantics remain a disclosed limitation.",
  },
  {
    phase: "EOS-D1K-INTERNAL-INTEGRATION-EVIDENCE",
    type: "D1K_INTERNAL_INTEGRATION_EVIDENCE",
    purpose: "Satisfy the D1K structural-internal integration criterion without reopening D1K or taking over D9.",
    dependencies: [] as readonly string[],
    inputEvidence: "D1K_R4 and D1K_R5 internal integration ready flags are false. Cross-discipline intelligence is a completed D9 concern.",
    expectedOutput: "Internal integration satisfied, with D9 left closed.",
    blockingConditions: "SOFTWARE_IMPLEMENTATION_BLOCKER",
    closeoutCriteria: "D1K_INTERNAL_INTEGRATION_SATISFIED is true and D9_REOPENED stays false.",
  },
  {
    phase: "EOS-D1-STRUCTURAL-PACK-BOUNDED-CLOSEOUT",
    type: "STRUCTURAL_PACK_BOUNDED_CLOSEOUT",
    purpose: "Close the structural pack only after the pack formula is true.",
    dependencies: [
      "EOS-D1-QUALIFIED-STRUCTURAL-REVIEW",
      "EOS-D1G-VALIDATION-ROUTE-EXECUTION",
      "EOS-D1H-VALIDATION-EVIDENCE",
      "EOS-D1I-VALIDATION-EVIDENCE",
      "EOS-D1J-VALIDATION-EVIDENCE",
      "EOS-D1K-INTERNAL-INTEGRATION-EVIDENCE",
    ],
    inputEvidence: "D1_STRUCTURAL_PACK_COMPLETE is false. D2 through D9 are already closed.",
    expectedOutput: "Pack status COMPLETE_BOUNDED_WITH_LIMITATIONS. Not universal validation, conformance, certification, or general availability.",
    blockingConditions: "NONE",
    closeoutCriteria: "The structural-pack sequencing formula is true and the security regression gate passes. GA security debt may still block general availability.",
  },
] as const;

export const D1_REMAINING_PHASE_LIST = D1_REMAINING_PHASES.map((row) => row.phase);
export const D1_CANONICAL_PHASE_LIST = [...D1_HISTORICAL_PHASE_LIST, ...D1_REMAINING_PHASE_LIST] as const;
export const D1_COMPLETED_MILESTONE_COUNT = D1_HISTORICAL_PHASE_COUNT;
export const D1_REMAINING_MILESTONE_COUNT = D1_REMAINING_PHASE_LIST.length;
export const D1_CANONICAL_TOTAL_MILESTONE_COUNT = D1_CANONICAL_PHASE_LIST.length;
export const D1_CANONICAL_NEXT_PHASE = D1_REMAINING_PHASES[0].phase;
export const D1_CANONICAL_NEXT_PHASE_TYPE = D1_REMAINING_PHASES[0].type;
export const D1_CANONICAL_NEXT_PHASE_SCOPE = "Authorize the D1G validation route that structural-pack sequencing records as NOT_DEFINED. Name the evidence, tolerances, applicability, and provider boundary the route will accept. Do not execute the route, certify the solver, satisfy C10 or D1F review, reopen D1K, D1L, D1N, or D2 through D9, or mark the structural pack complete." as const;
export const D1_READY_FOR_NEXT_PHASE = true as const;
export const D1_DEBT_CANONICALIZATION_BLOCKER = "NONE" as const;

export const D1_CLOSEOUT_CRITERIA = "The structural pack becomes COMPLETE_BOUNDED_WITH_LIMITATIONS only when the existing pack formula is true: required track closeouts remain present, C10 and D1F qualified review are satisfied, the D1G route is defined and completed, D1H, D1I, and D1J validation flags are satisfied, and D1K internal integration is satisfied. Pack completion is not universal engineering validation, conformance, certification, regulatory approval, project certification eligibility, or general availability. D1L eligibility and GA security-debt resolution stay outside the formula. A method match is not conformance. A selected standard is not conformance or regulatory approval." as const;

export type D1DebtClassification = "COMPLETE" | "COMPLETE_WITH_LIMITATIONS" | "INCOMPLETE" | "BLOCKED" | "SUPERSEDED" | "NOT_REQUIRED";
export const D1_DEBT_ITEMS: readonly { readonly id: string; readonly classification: D1DebtClassification; readonly evidence: string }[] = [
  { id: "D1I_TWIN_TRACK", classification: "COMPLETE_WITH_LIMITATIONS", evidence: "D1I_TRACK_STATUS is COMPLETE_BOUNDED_WITH_LIMITATIONS and D1I-R5 closeout exists. Engineer and method counts remain 0." },
  { id: "D1J_OPTIMIZATION_TRACK", classification: "COMPLETE_WITH_LIMITATIONS", evidence: "D1J_TRACK_STATUS is COMPLETE_BOUNDED_WITH_LIMITATIONS. Engineer and conformance statuses remain NOT_VALIDATED." },
  { id: "D1J_PARAMETER_SEMANTICS", classification: "COMPLETE_WITH_LIMITATIONS", evidence: "D1J closeout discloses concrete parameter semantics as NOT_AVAILABLE and not an extra eligibility gate." },
  { id: "D1K_INTERFACE_TRACK", classification: "COMPLETE_WITH_LIMITATIONS", evidence: "D1K_R5_TRACK_STATUS is COMPLETE_BOUNDED_WITH_LIMITATIONS. Internal integration remains false." },
  { id: "D1L_CERTIFICATION_GOVERNANCE", classification: "COMPLETE_WITH_LIMITATIONS", evidence: "D1L_R6_TRACK_STATUS is COMPLETE_BOUNDED_WITH_LIMITATIONS and the certification runtime is implemented. Eligibility is false." },
  { id: "D1M_CAD_BIM_TRACK", classification: "COMPLETE_WITH_LIMITATIONS", evidence: "D1M_R9_TRACK_STATUS is COMPLETE_BOUNDED_WITH_LIMITATIONS. The earlier NOT_ABSORBED status is historical." },
  { id: "D1N_ORCHESTRATION_TRACK", classification: "COMPLETE_WITH_LIMITATIONS", evidence: "D1N_TRACK_STATUS is COMPLETE_BOUNDED_WITH_LIMITATIONS. The earlier NOT_ABSORBED status is historical." },
  { id: "D1H_INSPECTION_TRACK", classification: "COMPLETE_WITH_LIMITATIONS", evidence: "D1H_TRACK_STATUS is COMPLETE_BOUNDED_WITH_LIMITATIONS. Validation counts remain 0." },
  { id: "D1_PACK_CRITERIA", classification: "COMPLETE_WITH_LIMITATIONS", evidence: "Pack completion criteria are defined. D1_STRUCTURAL_PACK_COMPLETE remains false." },
  { id: "C10_QUALIFIED_HUMAN_REVIEW", classification: "INCOMPLETE", evidence: "C10_VALIDATION_LANE_STATUS is PENDING_QUALIFIED_HUMAN_REVIEW." },
  { id: "D1F_ENGINEER_REVIEW", classification: "INCOMPLETE", evidence: "D1F_R3_ENGINEER_REVIEW_PENDING is true." },
  { id: "D1G_VALIDATION_ROUTE", classification: "INCOMPLETE", evidence: "D1G_VALIDATION_ROUTE_PHASE is NOT_DEFINED and D1G_VALIDATION_ROUTE_COMPLETED is false." },
  { id: "D1H_ENGINEER_VALIDATION", classification: "INCOMPLETE", evidence: "D1H_SOFTWARE_ENGINEER_VALIDATION_COUNT is 0." },
  { id: "D1H_METHOD_CONFORMANCE", classification: "INCOMPLETE", evidence: "D1H_METHOD_CONFORMANCE_VALIDATION_COUNT is 0." },
  { id: "D1I_ENGINEER_VALIDATION", classification: "INCOMPLETE", evidence: "D1I_SOFTWARE_ENGINEER_VALIDATION_COUNT is 0." },
  { id: "D1I_METHOD_CONFORMANCE", classification: "INCOMPLETE", evidence: "D1I_METHOD_CONFORMANCE_VALIDATION_COUNT is 0." },
  { id: "D1J_ENGINEER_VALIDATION", classification: "INCOMPLETE", evidence: "D1J_ENGINEER_VALIDATION_STATUS is NOT_VALIDATED." },
  { id: "D1J_CONFORMANCE_VALIDATION", classification: "INCOMPLETE", evidence: "D1J_CONFORMANCE_VALIDATION_STATUS is NOT_VALIDATED." },
  { id: "D1K_INTERNAL_INTEGRATION", classification: "INCOMPLETE", evidence: "D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY is false." },
  { id: "D1G_LIVE_VALIDATION", classification: "BLOCKED", evidence: "D1G_LIVE_VALIDATED is false and the validation route is NOT_DEFINED." },
  { id: "D1G_ENGINEER_VALIDATION", classification: "BLOCKED", evidence: "D1G_ENGINEER_VALIDATED is false and the validation route is NOT_DEFINED." },
  { id: "D1G_CONFORMANCE_VALIDATION", classification: "BLOCKED", evidence: "D1G_CONFORMANCE_VALIDATED is false and the validation route is NOT_DEFINED." },
  { id: "D1K_CROSS_DISCIPLINE_INTELLIGENCE", classification: "SUPERSEDED", evidence: "D1K does not own global cross-discipline reasoning. D9_TRACK_COMPLETE is true and D9_STATUS is COMPLETE_BOUNDED_WITH_LIMITATIONS." },
  { id: "D1_SEQUENCING_NEXT_PHASE_D2", classification: "SUPERSEDED", evidence: "Sequencing named D2-0 as next. D2 through D9 tracks are now complete, so that phase is not the remaining D1 phase." },
  { id: "HISTORICAL_D1M_NOT_ABSORBED", classification: "SUPERSEDED", evidence: "roadmap-after-twin-closeout still says D1M_CURRENT_STATUS NOT_ABSORBED. D1M-R9 later closed the track." },
  { id: "HISTORICAL_D1N_NOT_ABSORBED", classification: "SUPERSEDED", evidence: "roadmap-after-twin-closeout still says D1N_CURRENT_STATUS NOT_ABSORBED. D1N later closed the track." },
  { id: "D1L_PROJECT_CERTIFICATION_ELIGIBILITY", classification: "NOT_REQUIRED", evidence: "PROJECT_CERTIFICATION_ELIGIBILITY_REQUIRED_FOR_D1_PACK_COMPLETION is false and eligibility remains unsatisfied." },
  { id: "GA_SECURITY_DEBT_FOR_D1_PACK", classification: "NOT_REQUIRED", evidence: "D1_PACK_COMPLETION_REQUIRES_GA_SECURITY_DEBT_RESOLUTION is false. The same debt still blocks general availability." },
  { id: "D1_SOURCE_CONTRACT_PACK_GATE", classification: "NOT_REQUIRED", evidence: "D9 records that no governed D1 source contract exists. The pack formula does not require one. The absence stays explicit and D9 stays closed." },
  { id: "D1G_CERTIFIED_SOLVER", classification: "NOT_REQUIRED", evidence: "D1G_CERTIFIED_SOLVER_STATUS is NOT_CERTIFIED. The pack formula does not require that status." },
];

export const D1_COMPLETE_DEBT_ITEMS = D1_DEBT_ITEMS.filter((row) => row.classification === "COMPLETE").map((row) => row.id);
export const D1_COMPLETE_WITH_LIMITATIONS_ITEMS = D1_DEBT_ITEMS.filter((row) => row.classification === "COMPLETE_WITH_LIMITATIONS").map((row) => row.id);
export const D1_INCOMPLETE_DEBT_ITEMS = D1_DEBT_ITEMS.filter((row) => row.classification === "INCOMPLETE").map((row) => row.id);
export const D1_BLOCKED_DEBT_ITEMS = D1_DEBT_ITEMS.filter((row) => row.classification === "BLOCKED").map((row) => row.id);
export const D1_SUPERSEDED_DEBT_ITEMS = D1_DEBT_ITEMS.filter((row) => row.classification === "SUPERSEDED").map((row) => row.id);
export const D1_NOT_REQUIRED_DEBT_ITEMS = D1_DEBT_ITEMS.filter((row) => row.classification === "NOT_REQUIRED").map((row) => row.id);
export const D1_DEBT_ITEM_COUNT = D1_DEBT_ITEMS.length;
export const D1_COMPLETE_DEBT_ITEM_COUNT = D1_COMPLETE_DEBT_ITEMS.length;
export const D1_COMPLETE_WITH_LIMITATIONS_COUNT = D1_COMPLETE_WITH_LIMITATIONS_ITEMS.length;
export const D1_INCOMPLETE_DEBT_ITEM_COUNT = D1_INCOMPLETE_DEBT_ITEMS.length;
export const D1_BLOCKED_DEBT_ITEM_COUNT = D1_BLOCKED_DEBT_ITEMS.length;
export const D1_SUPERSEDED_DEBT_ITEM_COUNT = D1_SUPERSEDED_DEBT_ITEMS.length;
export const D1_NOT_REQUIRED_DEBT_ITEM_COUNT = D1_NOT_REQUIRED_DEBT_ITEMS.length;

export const STRUCTURAL_ENGINEERING_DEBT_ITEMS = [...D1_INCOMPLETE_DEBT_ITEMS, ...D1_BLOCKED_DEBT_ITEMS] as const;
export const STRUCTURAL_ENGINEERING_DEBT_COUNT = STRUCTURAL_ENGINEERING_DEBT_ITEMS.length;
export const EOS_PRODUCT_SECURITY_RELEASE_DEBT_ITEMS = [
  "EOS-A16D engineering-review import boundary in packages/engineering-os/src/connectors/m365/eos-a16d-generic-binary-retrieval.test.ts",
  "GHSA-w5hq-g745-h8pq on uuid 8.3.2 through exceljs 4.4.0",
  "GA security debt blocks general availability and does not block D1 pack completion",
] as const;
export const EOS_PRODUCT_SECURITY_RELEASE_DEBT_COUNT = EOS_PRODUCT_SECURITY_RELEASE_DEBT_ITEMS.length;

export const D1_REQUIRED_MANUAL_HUMAN_ACTIONS = [
  "A qualified structural engineer reviews the C10 concrete validation packs. This blocks D1 pack completion and therefore blocks EOS general availability while D1 remains incomplete. It does not by itself replace the security gate.",
  "A qualified structural engineer reviews the D1F system orchestrator. This blocks D1 pack completion and therefore blocks EOS general availability while D1 remains incomplete.",
] as const;
export const D1_REQUIRED_MANUAL_HUMAN_ACTION_COUNT = D1_REQUIRED_MANUAL_HUMAN_ACTIONS.length;
export const D1_REQUIRED_EXTERNAL_EVIDENCE = [
  "C10 qualified-review evidence bound to the exact reviewed revisions.",
  "D1F engineer-review evidence bound to the exact reviewed revisions.",
  "D1G route evidence is not specified yet because the route phase is NOT_DEFINED. Execution cannot claim that evidence until the route names it.",
] as const;
export const D1_REQUIRED_EXTERNAL_EVIDENCE_COUNT = D1_REQUIRED_EXTERNAL_EVIDENCE.length;

export const D1_QUALIFIED_HUMAN_REVIEW_STATUS = "INCOMPLETE" as const;
export const D1_STRUCTURAL_ENGINEER_REVIEW_WORKFLOW_STATUS = "INCOMPLETE" as const;
export const D1_SOLVER_VALIDATION_STATUS = "BLOCKED" as const;
export const D1_ANALYTICAL_BENCHMARK_STATUS = "INCOMPLETE" as const;
export const D1_REFERENCE_SOLVER_COMPARISON_STATUS = "INCOMPLETE" as const;
export const D1_METHOD_CONFORMANCE_STATUS = "INCOMPLETE" as const;
export const D1_VALIDATION_EVIDENCE_MATRIX_STATUS = "INCOMPLETE" as const;
export const D1_PARAMETER_SEMANTICS_STATUS = "COMPLETE_WITH_LIMITATIONS" as const;
export const D1_STANDARDS_JURISDICTION_STATUS = "COMPLETE_WITH_LIMITATIONS" as const;
export const D1_INTERNAL_INTEGRATION_STATUS = "INCOMPLETE" as const;
export const D1_TO_D9_SOURCE_CONTRACT_STATUS = "NOT_REQUIRED" as const;
export const D1_UNSUPPORTED_CLAIM_DEBT_STATUS = "COMPLETE_WITH_LIMITATIONS" as const;
export const D1K_STATUS = D1K_R5_TRACK_STATUS;
export const D1L_STATUS = D1L_R6_TRACK_STATUS;
export const D1N_STATUS = D1N_TRACK_STATUS;
export const D1_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export function verifyD1DebtCanonicalization(): { total: number; completed: number; remaining: number; debtItems: number } {
  const ids = D1_DEBT_ITEMS.map((row) => row.id);
  if (new Set(ids).size !== ids.length) throw new Error("D1_DEBT_DUPLICATE");
  if (D1_COMPLETE_DEBT_ITEM_COUNT + D1_COMPLETE_WITH_LIMITATIONS_COUNT + D1_INCOMPLETE_DEBT_ITEM_COUNT + D1_BLOCKED_DEBT_ITEM_COUNT + D1_SUPERSEDED_DEBT_ITEM_COUNT + D1_NOT_REQUIRED_DEBT_ITEM_COUNT !== D1_DEBT_ITEM_COUNT) throw new Error("D1_DEBT_PARTITION");
  if (D1_COMPLETED_MILESTONE_COUNT + D1_REMAINING_MILESTONE_COUNT !== D1_CANONICAL_TOTAL_MILESTONE_COUNT) throw new Error("D1_DENOMINATOR");
  if (new Set(D1_CANONICAL_PHASE_LIST).size !== D1_CANONICAL_PHASE_LIST.length) throw new Error("D1_PHASE_DUPLICATE");
  if (D1_STRUCTURAL_PACK_COMPLETE || C10_QUALIFIED_REVIEW_SATISFIED || D1F_ENGINEER_REVIEW_SATISFIED || D1G_VALIDATION_ROUTE_COMPLETED || !D1G_VALIDATION_ROUTE_REMAINS_UNDEFINED) throw new Error("D1_PACK_EVIDENCE");
  if (C10_VALIDATION_LANE_STATUS !== "PENDING_QUALIFIED_HUMAN_REVIEW" || D1F_R3_ENGINEER_REVIEW_PENDING !== true || D1G_VALIDATION_ROUTE_PHASE !== "NOT_DEFINED") throw new Error("D1_REVIEW_ROUTE_EVIDENCE");
  if (D1G_LIVE_VALIDATED || D1G_ENGINEER_VALIDATED || D1G_CONFORMANCE_VALIDATED || D1G_CERTIFIED_SOLVER_STATUS !== "NOT_CERTIFIED") throw new Error("D1G_EVIDENCE");
  if (D1H_SOFTWARE_ENGINEER_VALIDATION_COUNT !== 0 || D1H_METHOD_CONFORMANCE_VALIDATION_COUNT !== 0 || D1H_VALIDATION_SATISFIED || D1H_TRACK_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS") throw new Error("D1H_EVIDENCE");
  if (D1I_SOFTWARE_ENGINEER_VALIDATION_COUNT !== 0 || D1I_METHOD_CONFORMANCE_VALIDATION_COUNT !== 0 || D1I_VALIDATION_SATISFIED || D1I_TRACK_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS") throw new Error("D1I_EVIDENCE");
  if (D1J_ENGINEER_VALIDATION_STATUS !== "NOT_VALIDATED" || D1J_CONFORMANCE_VALIDATION_STATUS !== "NOT_VALIDATED" || D1J_VALIDATION_SATISFIED || D1J_TRACK_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS") throw new Error("D1J_EVIDENCE");
  if (D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY || D1K_INTERNAL_INTEGRATION_SATISFIED || D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY || !D1K_R5_TRACK_COMPLETE || D1K_R5_TRACK_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS") throw new Error("D1K_EVIDENCE");
  if (!D1L_R6_TRACK_COMPLETE || D1L_R6_TRACK_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS" || D1L_R6_CERTIFICATION_ELIGIBILITY_SATISFIED || D1L_PROJECT_CERTIFICATION_ELIGIBILITY_SATISFIED || PROJECT_CERTIFICATION_ELIGIBILITY_REQUIRED_FOR_D1_PACK_COMPLETION) throw new Error("D1L_EVIDENCE");
  if (!D1M_R9_TRACK_COMPLETE || D1M_R9_TRACK_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS" || D1M_CURRENT_STATUS !== "NOT_ABSORBED") throw new Error("D1M_EVIDENCE");
  if (!D1N_TRACK_COMPLETE || D1N_TRACK_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS" || D1N_CURRENT_STATUS !== "NOT_ABSORBED" || D1N_REOPENED) throw new Error("D1N_EVIDENCE");
  if (!D9_TRACK_COMPLETE || D9_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS" || D9_REOPENED) throw new Error("D9_EVIDENCE");
  if (!D2_TRACK_COMPLETE || D2_REOPENED || !D3_TRACK_COMPLETE || D3_REOPENED || !D4_TRACK_COMPLETE || D4_REOPENED || !D5_TRACK_COMPLETE || D5_REOPENED || !D6_TRACK_COMPLETE || D6_REOPENED || !D7_TRACK_COMPLETE || D7_REOPENED || !D8_TRACK_COMPLETE || D8_REOPENED) throw new Error("CLOSED_TRACK_EVIDENCE");
  if (D1_PACK_COMPLETION_REQUIRES_GA_SECURITY_DEBT_RESOLUTION || !GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY) throw new Error("SECURITY_CLASSIFICATION_EVIDENCE");
  if (NEW_SUBSTANTIVE_RUNTIME_COUNT !== 0 || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED || EOS_ALL_DISCIPLINES_COMPLETE || EOS_GA_READY) throw new Error("D1_INSPECTION_BOUNDARY");
  if (D1_CANONICAL_NEXT_PHASE !== "EOS-D1G-VALIDATION-ROUTE-CANONICALIZATION" || D1_REMAINING_PHASES[0].dependencies.length !== 0) throw new Error("D1_NEXT_PHASE");
  const execution = D1_REMAINING_PHASES.find((row) => row.phase === "EOS-D1G-VALIDATION-ROUTE-EXECUTION");
  const closeout = D1_REMAINING_PHASES.find((row) => row.phase === "EOS-D1-STRUCTURAL-PACK-BOUNDED-CLOSEOUT");
  if (!execution?.dependencies.includes("EOS-D1G-VALIDATION-ROUTE-CANONICALIZATION") || closeout?.dependencies.length !== 6) throw new Error("D1_DEPENDENCY_GRAPH");
  return { total: D1_CANONICAL_TOTAL_MILESTONE_COUNT, completed: D1_COMPLETED_MILESTONE_COUNT, remaining: D1_REMAINING_MILESTONE_COUNT, debtItems: D1_DEBT_ITEM_COUNT };
}
