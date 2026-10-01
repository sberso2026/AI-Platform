import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "../lifecycle-intelligence/fixture";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import type { WorkReadinessResolution } from "../information-requirements/readiness";
import { emptySnapshot, ref } from "./compose";
import type { WorkPlanContextSnapshot } from "./types";

export { CRUSHER_EXPANSION_FEED_PROJECT_ID, CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE };

export const A11A_SYSTEM_ID = "sys-primary-crushing";
export const A11A_INTERFACE_ID = "if-cr-cv-01";
export const A11A_DELIVERABLE_ID = "str-anl-feed";
export const A11A_RFI_ID = "rfi-anchor-bolt-location";
export const A11A_HANDOVER_ID = "ho-crusher-subsys";

function readiness(
  workType: WorkReadinessResolution["workType"],
  state: WorkReadinessResolution["state"],
  explanation: string,
  extras?: Partial<WorkReadinessResolution>,
): WorkReadinessResolution {
  return {
    workType,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    state,
    required: [],
    available: [],
    missing: [],
    stale: [],
    unaccepted: [],
    explanation,
    engineeringApproved: false,
    projectReadinessScore: null,
    durationMs: 1,
    ...extras,
  };
}

export function conceptSnapshot(): WorkPlanContextSnapshot {
  return {
    ...emptySnapshot(),
    requirements: [ref("requirement", "req-client-12mtpa", "12 Mtpa throughput", "Client production requirement for concept study.")],
    assumptions: [ref("assumption", "asm-site-access", "Site access available in dry season", "Documented concept assumption.")],
    information: [
      { informationType: "DESIGN_CRITERIA", title: "Client production target", purpose: "FOR_DESIGN_INPUT", revision: "A", freshness: "CURRENT", whyIncluded: "Concept studies use available client requirements." },
    ],
    gaps: [{ kind: "missing", title: "Geotechnical parameters", explanation: "Site investigation is not yet available at concept." }],
    threadRelationshipCount: 3,
  };
}

export function optionStudySnapshot(): WorkPlanContextSnapshot {
  return {
    ...emptySnapshot(),
    requirements: [ref("requirement", "req-haulage-capacity", "Haulage capacity", "Option study decision criterion.")],
    assumptions: [ref("assumption", "asm-ore-hardness", "Ore hardness band", "Prefeasibility assumption pending testwork.")],
    decisions: [ref("decision", "dec-plant-location", "Plant location selected", "Referenced; not re-validated as remaining technically correct.")],
    information: [
      { informationType: "DESIGN_CRITERIA", title: "Decision criteria", purpose: "FOR_DESIGN_INPUT", revision: "A", freshness: "CURRENT", whyIncluded: "Option studies require explicit decision criteria." },
    ],
    gaps: [{ kind: "missing", title: "Cost model class 4", explanation: "Cost estimate is not yet accepted for purpose." }],
    threadRelationshipCount: 4,
  };
}

export function feasibilitySnapshot(): WorkPlanContextSnapshot {
  return {
    ...emptySnapshot(),
    requirements: [
      ref("requirement", "req-crush-capacity", "Crusher capacity", "Process requirement allocated to primary crushing."),
      ref("requirement", "req-support-stiffness", "Support stiffness", "Structural requirement for crusher support refinement."),
    ],
    interfaces: [
      ref("interface", A11A_INTERFACE_ID, "Mechanical → Structural equipment reactions", "Provider Mechanical / consumer Structural. Interface remains Interface-owned."),
    ],
    information: [
      { informationType: "LOAD_DATA", title: "Preliminary equipment reactions", purpose: "FOR_COORDINATION", revision: "B", freshness: "CURRENT", authorityOutcome: "AUTHORITATIVE_FOR_PURPOSE", whyIncluded: "Cross-discipline interface input for feasibility refinement." },
    ],
    gaps: [{ kind: "unaccepted", title: "Civil drainage criteria", explanation: "Received but not accepted for purpose." }],
    threadRelationshipCount: 6,
  };
}

export function feedStructuralSnapshot(): WorkPlanContextSnapshot {
  return {
    ...emptySnapshot(),
    requirements: [ref("requirement", "req-foundation-capacity", "Foundation capacity", "FEED structural design basis requirement.")],
    interfaces: [ref("interface", A11A_INTERFACE_ID, "Equipment load interface", "FEED structural design depends on Mechanical loads.")],
    analyses: [ref("analysis_request", "anl-struct-feed", "FEED structural analysis", "Required analysis capability. Solver not executed.")],
    deliverable: ref("deliverable_expectation", A11A_DELIVERABLE_ID, "FEED structural analysis deliverable", "Expected FEED artifact; generating a plan does not change maturity."),
    information: [
      { informationType: "DESIGN_CRITERIA", title: "Structural design criteria", sourceObjectId: "ds-str-criteria-b", purpose: "FOR_DESIGN_INPUT", revision: "B", freshness: "CURRENT", authorityOutcome: "AUTHORITATIVE_FOR_PURPOSE", whyIncluded: "A10C FEED FOUNDATION_CALCULATION required information." },
      { informationType: "LOAD_DATA", title: "Mechanical equipment reactions", sourceObjectId: "ds-mech-load", purpose: "FOR_DESIGN_INPUT", revision: "1", freshness: "CURRENT", authorityOutcome: "AUTHORITATIVE_FOR_PURPOSE", whyIncluded: "A10A purpose-specific authority for design input." },
      { informationType: "SURVEY_DATA", title: "Survey level", sourceObjectId: "survey-level-feed", purpose: "FOR_DESIGN_INPUT", revision: "1", freshness: "CURRENT", whyIncluded: "A10C required survey level." },
    ],
    gaps: [{ kind: "missing", title: "Geotechnical bearing capacity", explanation: "Blocking FEED foundation calculation until accepted." }],
    threadRelationshipCount: 8,
  };
}

export function detailedDesignReadySnapshot(): WorkPlanContextSnapshot {
  const feed = feedStructuralSnapshot();
  return {
    ...feed,
    information: [
      ...feed.information,
      { informationType: "MATERIAL_PROPERTY", title: "Geotechnical bearing capacity", sourceObjectId: "geo-bearing-capacity", purpose: "FOR_DESIGN_INPUT", revision: "1", freshness: "CURRENT", authorityOutcome: "AUTHORITATIVE_FOR_PURPOSE", whyIncluded: "A10C required geotechnical input is now accepted." },
    ],
    gaps: [],
    decisions: [ref("decision", "dec-foundation-type", "Pad foundation selected", "Referenced decision; validity is not inferred.")],
    threadRelationshipCount: 9,
  };
}

export function constructionSnapshot(): WorkPlanContextSnapshot {
  return {
    ...emptySnapshot(),
    information: [
      { informationType: "DRAWING", title: "Anchor bolt drawing", sourceObjectId: "dwg-anchor-bolt", purpose: "FOR_CONSTRUCTION_REFERENCE", revision: "C", freshness: "CURRENT", whyIncluded: "Current issued drawing for RFI/TQ response." },
      { informationType: "CALCULATION", title: "Foundation calculation", sourceObjectId: "calc-str-feed", purpose: "FOR_DESIGN_INPUT", revision: "2", freshness: "CURRENT", whyIncluded: "Related calculation for clash assessment." },
    ],
    decisions: [ref("decision", "dec-anchor-pattern", "Anchor pattern", "Previous construction-related decision, referenced only.")],
    gaps: [],
    threadRelationshipCount: 5,
  };
}

export function commissioningSnapshot(): WorkPlanContextSnapshot {
  return {
    ...emptySnapshot(),
    requirements: [ref("requirement", "req-test-ready", "System test requirements", "Commissioning engineering query uses test requirements.")],
    information: [
      { informationType: "TEST_DATA", title: "Commissioning test procedure", purpose: "FOR_COMMISSIONING", revision: "A", freshness: "CURRENT", whyIncluded: "Commissioning information requirement." },
    ],
    gaps: [{ kind: "missing", title: "Vendor punchlist close-out", explanation: "Open engineering condition remains." }],
    threadRelationshipCount: 3,
  };
}

export function handoverSnapshot(): WorkPlanContextSnapshot {
  return {
    ...emptySnapshot(),
    handoverPackage: ref("engineering_handover_package", A11A_HANDOVER_ID, "Primary crushing subsystem handover", "A10C handover package referenced, not duplicated."),
    information: [
      { informationType: "DRAWING", title: "Final drawing", purpose: "FOR_OPERATIONS_REFERENCE", revision: "0", freshness: "CURRENT", whyIncluded: "Handover required as-built drawing." },
      { informationType: "CALCULATION", title: "Final calculation", purpose: "FOR_OPERATIONS_REFERENCE", revision: "0", freshness: "CURRENT", whyIncluded: "Handover required design calculation." },
    ],
    gaps: [{ kind: "missing", title: "Commissioning evidence", explanation: "Handover remains incomplete until commissioning evidence is accepted." }],
    threadRelationshipCount: 4,
  };
}

export const WORKFLOW_READINESS = {
  conceptUnknown: readiness("FOUNDATION_CALCULATION", "UNKNOWN", "No configured information requirements for this work type."),
  optionUnknown: readiness("FOUNDATION_CALCULATION", "UNKNOWN", "No configured information requirements for this work type."),
  feasibilityConditions: readiness("CROSS_DISCIPLINE_INTERFACE", "READY_WITH_CONDITIONS", "Ready with conditions: non-blocking information remains outstanding."),
  feedBlocked: readiness("FOUNDATION_CALCULATION", "BLOCKED_INFORMATION_MISSING", "Blocked: 1 required information item(s) missing."),
  detailedReady: readiness("FOUNDATION_CALCULATION", "READY", "Configured required information is accepted for purpose. Not engineering approval."),
  constructionReady: readiness("CONSTRUCTION_CLARIFICATION", "READY", "Configured required information is accepted for purpose. Not engineering approval."),
  commissioningConditions: readiness("SUBSYSTEM_HANDOVER", "READY_WITH_CONDITIONS", "Open commissioning conditions remain."),
  handoverBlocked: readiness("SUBSYSTEM_HANDOVER", "BLOCKED_INFORMATION_MISSING", "Blocked: handover information missing."),
};
