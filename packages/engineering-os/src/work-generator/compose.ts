import type { ThreadCatalogNode, ThreadGraphInput, ThreadRelation } from "../digital-thread/types";
import type { EngineeringWorkPlan, WorkPlanContextSnapshot, WorkReference } from "./types";

export const WORK_GENERATOR_RECON = {
  kernelWorkflow: "REUSE",
  jobService: "REUSE",
  eventBus: "REUSE",
  workContext: "EXTEND",
  informationRequirements: "COMPOSE",
  informationIntelligence: "COMPOSE",
  requirements: "COMPOSE",
  assumptions: "COMPOSE",
  interfaces: "COMPOSE",
  decisions: "COMPOSE",
  analysis: "COMPOSE",
  deliverables: "COMPOSE",
  digitalThread: "COMPOSE",
  lifecycle: "COMPOSE",
  reviewPackage: "COMPOSE",
  wbsWorkPackage: "LEGACY",
  engineeringWorkTemplate: "MISSING",
  engineeringWorkPlan: "MISSING",
} as const;

export function candidateWorkPlanAssurance(plan: EngineeringWorkPlan) {
  const conditions: string[] = [];
  if (plan.context.gaps.some((row) => row.kind === "missing")) conditions.push("WORK_PLAN_REQUIRED_INFORMATION_MISSING");
  if (plan.context.gaps.some((row) => row.kind === "stale") || plan.staleness === "STALE") conditions.push("WORK_PLAN_GOVERNING_INFORMATION_STALE");
  if (plan.staleness === "REGENERATE_REQUIRED" || plan.staleness === "POTENTIALLY_STALE") conditions.push("WORK_PLAN_CONTEXT_CHANGED");
  return { conditions, automaticFinding: false, automaticIssue: false, automaticDefect: false };
}

export function composeDeliverableFromWorkPlan(bound: boolean) {
  return { bound, maturityChanged: false, reviewComplete: false, approved: false };
}

export function workPlanThreadGraph(plan: EngineeringWorkPlan): ThreadGraphInput {
  const node = (objectType: string, objectId: string, extra: Partial<ThreadCatalogNode> = {}): ThreadCatalogNode => ({
    tenantId: plan.tenantId,
    workspaceId: plan.workspaceId,
    projectId: plan.projectId,
    objectType,
    objectId,
    ...extra,
  });
  const link = (relationship: string, fromType: string, fromId: string, toType: string, toId: string): ThreadRelation => ({
    relationship,
    fromType,
    fromId,
    toType,
    toId,
    governed: true,
  });
  const nodes = [
    node("engineering_work_plan", plan.id, { objectCode: plan.templateCode, status: plan.status }),
  ];
  const links: ThreadRelation[] = [];
  const add = (relationship: string, rows: WorkReference[], toTypeFallback: string) => {
    for (const row of rows) {
      nodes.push(node(row.objectType || toTypeFallback, row.objectId, { title: row.title, stale: row.stale }));
      links.push(link(relationship, "engineering_work_plan", plan.id, row.objectType || toTypeFallback, row.objectId));
    }
  };
  add("USES", plan.context.information.map((row) => ({
    objectType: "engineering_information",
    objectId: row.sourceObjectId ?? row.title,
    title: row.title,
    whyIncluded: row.whyIncluded,
  })), "engineering_information");
  add("DEPENDS_ON", plan.context.requirements, "requirement");
  add("DEPENDS_ON", plan.context.interfaces, "interface");
  add("USES", plan.context.decisions, "decision");
  add("USES", plan.context.assumptions, "assumption");
  add("USES", plan.context.analyses, "analysis_request");
  if (plan.context.deliverable) add("USES", [plan.context.deliverable], "deliverable_expectation");
  if (plan.context.handoverPackage) add("USES", [plan.context.handoverPackage], "engineering_handover_package");
  return { nodes, links };
}

export function snapshotFromPlan(plan: EngineeringWorkPlan): WorkPlanContextSnapshot {
  return {
    requirements: plan.context.requirements,
    assumptions: plan.context.assumptions,
    interfaces: plan.context.interfaces,
    decisions: plan.context.decisions,
    analyses: plan.context.analyses,
    information: plan.context.information,
    gaps: plan.context.gaps,
    deliverable: plan.context.deliverable,
    handoverPackage: plan.context.handoverPackage,
    threadRelationshipCount: plan.metrics.threadRelationshipsTraversed,
  };
}

export function emptySnapshot(): WorkPlanContextSnapshot {
  return {
    requirements: [],
    assumptions: [],
    interfaces: [],
    decisions: [],
    analyses: [],
    information: [],
    gaps: [],
    deliverable: null,
    handoverPackage: null,
    threadRelationshipCount: 0,
  };
}

function asId(row: Record<string, unknown>) {
  return String(row.id ?? "");
}

function asTitle(row: Record<string, unknown>, fallback: string) {
  return String(row.title ?? row.name ?? row.display_name ?? row.requirement_code ?? row.interface_code ?? fallback);
}

export function assembleSnapshotFromRecords(input: {
  requirements?: Record<string, unknown>[];
  assumptions?: Record<string, unknown>[];
  interfaces?: Record<string, unknown>[];
  decisions?: Record<string, unknown>[];
  analyses?: Record<string, unknown>[];
  information?: Array<{
    requirementId?: string | null;
    informationType: string;
    title: string;
    sourceObjectId?: string | null;
    purpose?: string | null;
    revision?: string | null;
    freshness?: string | null;
    authorityOutcome?: string | null;
    whyIncluded: string;
  }>;
  gaps?: WorkPlanContextSnapshot["gaps"];
  deliverable?: WorkReference | null;
  handoverPackage?: WorkReference | null;
}): WorkPlanContextSnapshot {
  return {
    requirements: (input.requirements ?? []).slice(0, 20).map((row) =>
      ref("requirement", asId(row), asTitle(row, "Requirement"), "Applicable governed Engineering Requirement for this work type and lifecycle. Referenced, not copied."),
    ),
    assumptions: (input.assumptions ?? []).slice(0, 20).map((row) =>
      ref("assumption", asId(row), asTitle(row, "Assumption"), "Existing governed Assumption relevant to this work. EOS does not invent assumptions."),
    ),
    interfaces: (input.interfaces ?? []).slice(0, 20).map((row) =>
      ref("interface", asId(row), asTitle(row, "Interface"), "Interface Intelligence relation. Provider/consumer remain Interface-owned."),
    ),
    decisions: (input.decisions ?? []).slice(0, 20).map((row) =>
      ref("decision", asId(row), asTitle(row, "Decision"), "Governed Decision referenced for context. Previous decisions are not inferred to remain technically valid."),
    ),
    analyses: (input.analyses ?? []).slice(0, 20).map((row) =>
      ref("analysis_request", asId(row), asTitle(row, "Analysis"), "Analysis Request/result referenced for context. Real solver execution remains deferred."),
    ),
    information: input.information ?? [],
    gaps: input.gaps ?? [],
    deliverable: input.deliverable ?? null,
    handoverPackage: input.handoverPackage ?? null,
    threadRelationshipCount:
      (input.requirements?.length ?? 0) +
      (input.assumptions?.length ?? 0) +
      (input.interfaces?.length ?? 0) +
      (input.decisions?.length ?? 0) +
      (input.analyses?.length ?? 0),
  };
}

export function ref(
  objectType: string,
  objectId: string,
  title: string,
  whyIncluded: string,
  extra?: Partial<WorkReference>,
): WorkReference {
  return { objectType, objectId, title, whyIncluded, ...extra };
}
