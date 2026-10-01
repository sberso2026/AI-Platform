import type { LifecycleStage } from "../lifecycle-intelligence/types";
import type { EngineeringWorkPlan } from "../work-generator/types";
import type { InheritedAssumption } from "./inherit";

export const LIFECYCLE_ASK_QUESTIONS = [
  "What assumptions from Concept are still open?",
  "What changed since FEED?",
  "Which Detailed Design work inherited this requirement?",
  "Why did construction drawing change?",
  "What handover information is missing?",
] as const;

export type LifecycleAskContext = {
  plans: EngineeringWorkPlan[];
  openAssumptions?: InheritedAssumption[];
  outstandingInformation?: string[];
  feedFingerprint?: string | null;
  currentFingerprint?: string | null;
  constructionChangeReason?: string | null;
  requirementId?: string | null;
};

export function answerLifecycleQuestion(question: string, ctx: LifecycleAskContext): string {
  const plans = ctx.plans;
  if (question.includes("assumptions from Concept")) {
    const concept = plans.filter((row) => row.lifecycleStage === "CONCEPT");
    const open = ctx.openAssumptions?.filter((row) => row.disposition === "VALIDATE" || row.disposition === "CONTINUE") ??
      concept.flatMap((row) => row.context.assumptions);
    if (!open.length) return "No open Concept assumptions are visible in the current authorized context.";
    return `Open Concept assumptions requiring validation or continuation: ${open.map((row) => row.title).join("; ")}.`;
  }
  if (question.includes("changed since FEED")) {
    const feed = plans.find((row) => row.lifecycleStage === "FEED");
    const later = plans.filter((row) => row.lifecycleStage !== "FEED" && row.lifecycleStage !== "CONCEPT" && row.lifecycleStage !== "PREFEASIBILITY" && row.lifecycleStage !== "FEASIBILITY");
    if (!feed) return "No FEED Work Plan is present to compare.";
    if (ctx.feedFingerprint && ctx.currentFingerprint && ctx.feedFingerprint !== ctx.currentFingerprint) {
      return `Context changed after FEED. FEED fingerprint ${ctx.feedFingerprint.slice(0, 12)} differs from later work. Later plans: ${later.map((row) => row.lifecycleStage).join(", ") || "none"}.`;
    }
    const newDecisions = later.flatMap((row) => row.context.decisions.map((d) => d.title));
    return newDecisions.length
      ? `Decisions recorded after FEED: ${newDecisions.join("; ")}.`
      : "No additional governed decisions are visible after FEED in this context.";
  }
  if (question.includes("Detailed Design work inherited")) {
    const req = ctx.requirementId;
    const dd = plans.filter((row) => row.lifecycleStage === "DETAILED_DESIGN");
    const hits = dd.filter((row) => row.context.requirements.some((r) => !req || r.objectId === req || r.title.toLowerCase().includes("requirement")));
    if (!hits.length) return "No Detailed Design Work Plan currently references that requirement.";
    return `Detailed Design Work Plans inheriting the requirement: ${hits.map((row) => row.id).join(", ")}.`;
  }
  if (question.includes("construction drawing change")) {
    return ctx.constructionChangeReason
      ?? "Construction drawing change is explained by the related Change, Decision, and Digital Thread path. Related is not affected until a human confirms impact.";
  }
  if (question.includes("handover information is missing")) {
    const missing = ctx.outstandingInformation ?? plans.find((row) => row.workType === "HANDOVER_PREPARATION")?.context.gaps.map((row) => row.title) ?? [];
    return missing.length
      ? `Handover information still outstanding: ${missing.join("; ")}. Human acceptance remains required.`
      : "No missing handover information is listed in the current package context. Human acceptance is still required.";
  }
  return "Structured lifecycle context is available from Work Plans, information requirements, and Digital Thread relations. AI cannot advance lifecycle or approve gates.";
}

export function lifecycleAskPrompts(stage: LifecycleStage | "UNKNOWN"): string[] {
  if (stage === "CONCEPT" || stage === "PREFEASIBILITY") return [LIFECYCLE_ASK_QUESTIONS[0]];
  if (stage === "FEED" || stage === "DETAILED_DESIGN") return [LIFECYCLE_ASK_QUESTIONS[1], LIFECYCLE_ASK_QUESTIONS[2]];
  if (stage === "CONSTRUCTION") return [LIFECYCLE_ASK_QUESTIONS[3]];
  if (stage === "COMMISSIONING" || stage === "OPERATIONS") return [LIFECYCLE_ASK_QUESTIONS[4]];
  return [...LIFECYCLE_ASK_QUESTIONS];
}
