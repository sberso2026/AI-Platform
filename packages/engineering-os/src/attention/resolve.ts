import { attentionFingerprint } from "./fingerprint";
import {
  ATTENTION_SCALE,
  type AttentionActionCode,
  type AttentionActionContract,
  type AttentionCategory,
  type AttentionItem,
  type AttentionPlanSnap,
  type AttentionPriority,
  type AttentionProjectSnapshot,
  type AttentionViewerRole,
  type EngineeringDay,
  type ResolveAttentionInput,
} from "./types";

const WAITING_STATUSES = new Set(["PLANNED", "REQUESTED", "AWAITING_INFORMATION"]);
const RECEIVED_STATUSES = new Set(["RECEIVED", "UNDER_REVIEW"]);
const ACCEPTED_STATUSES = new Set(["ACCEPTED_FOR_PURPOSE"]);
const OPEN_PLAN = new Set(["DRAFT", "READY", "IN_PROGRESS", "BLOCKED"]);
const PENDING_DECISION = new Set(["draft", "pending", "in_review", ""]);
const MATERIAL_FYI = new Set(["DRAWING_ISSUED", "HANDOVER_ACCEPTED", "DECISION_RECORDED", "HANDOVER_PACKAGE_READY"]);
const INPUT_CHANGE_EVENTS = new Set(["SOURCE_PUBLISHED", "INTERFACE_INFORMATION_CHANGED", "SOURCE_REVISED", "CONFIGURATION_CHANGED"]);

function hrefFor(code: AttentionActionCode, projectId: string, objectId: string, workPlanId: string | null): string {
  if (workPlanId) {
    if (code === "OPEN_REVIEW" || code === "RUN_PRE_ISSUE_REVIEW" || code === "DISPOSITION_REVIEW") {
      return `/engineering/work/plans/${workPlanId}#review`;
    }
    if (code === "ASSESS_IMPACT") return `/engineering/work/plans/${workPlanId}#impact`;
    return `/engineering/work/plans/${workPlanId}`;
  }
  if (code === "RECORD_DECISION" || code === "CREATE_DECISION") return `/engineering/decisions?id=${encodeURIComponent(objectId)}`;
  if (code === "OPEN_INTERFACE") return `/engineering/interfaces?id=${encodeURIComponent(objectId)}`;
  if (code === "REQUEST_INFORMATION" || code === "REVIEW_INFORMATION") {
    return `/engineering/information-requirements?id=${encodeURIComponent(objectId)}`;
  }
  if (code === "PREPARE_HANDOVER") return `/engineering/work?projectId=${encodeURIComponent(projectId)}`;
  return `/engineering/work?projectId=${encodeURIComponent(projectId)}`;
}

function action(code: AttentionActionCode, label: string, projectId: string, objectId: string, workPlanId: string | null, next?: AttentionActionCode[]): AttentionActionContract {
  return { code, label, href: hrefFor(code, projectId, objectId, workPlanId), next };
}

function priorityFor(category: AttentionCategory): AttentionPriority {
  if (category === "DO_NOW") return "ACTION_REQUIRED";
  if (category === "REVIEW_REQUIRED" || category === "DECISION_REQUIRED") return "REVIEW_REQUIRED";
  if (category === "FYI") return "FYI";
  return "NORMAL";
}

function relatedPlan(project: AttentionProjectSnapshot, objectId: string | null, workType?: string | null): AttentionPlanSnap | undefined {
  return project.workPlans.find((plan) => {
    if (!OPEN_PLAN.has(plan.status)) return false;
    if (objectId && (plan.id === objectId || plan.relatedObjectId === objectId)) return true;
    if (workType && plan.workType === workType) return true;
    return false;
  }) ?? project.workPlans.find((plan) => OPEN_PLAN.has(plan.status));
}

function roleAllows(role: AttentionViewerRole | null | undefined, item: AttentionItem, viewerDiscipline: string | null | undefined): boolean {
  if (!role) return true;
  if (role === "REVIEWER") return item.category === "REVIEW_REQUIRED" || item.action?.code === "OPEN_REVIEW" || item.action?.code === "DISPOSITION_REVIEW";
  if (role === "CONSTRUCTION_ENGINEER") {
    return item.sourceDomain === "rfi" || item.sourceDomain === "impact" || item.action?.code === "PREPARE_RFI_RESPONSE" || item.action?.code === "ASSESS_IMPACT";
  }
  if (role === "COMMISSIONING_ENGINEER") {
    return item.sourceDomain === "handover" || item.action?.code === "PREPARE_HANDOVER" || item.category === "DECISION_REQUIRED" || item.category === "WAITING_ON_OTHERS";
  }
  if (role === "DISCIPLINE_LEAD") {
    if (!viewerDiscipline) return true;
    return !item.discipline || item.discipline === viewerDiscipline || item.provider === viewerDiscipline;
  }
  if (role === "PROJECT_ENGINEER") {
    return item.category === "WAITING_ON_OTHERS" || item.category === "DECISION_REQUIRED" || item.sourceDomain === "interface" || item.sourceDomain === "rfi" || item.sourceDomain === "impact" || item.sourceDomain === "requirement";
  }
  return true;
}

function cap(items: AttentionItem[]): AttentionItem[] {
  return items.slice(0, ATTENTION_SCALE.maxItemsPerSection);
}

function overdue(neededBy: string | null, now: number): boolean {
  if (!neededBy) return false;
  const due = Date.parse(neededBy);
  return Number.isFinite(due) && due < now;
}

export function resolveEngineeringAttention(input: ResolveAttentionInput): EngineeringDay {
  const started = Date.now();
  const nowIso = input.nowIso ?? new Date().toISOString();
  const now = Date.parse(nowIso);
  const lookback = now - ATTENTION_SCALE.eventLookbackDays * 24 * 60 * 60 * 1000;
  const authorized = new Set(input.viewer.authorizedProjectIds);
  const ack = new Map((input.acknowledgements ?? []).map((row) => [row.fingerprint, row]));
  const mutedFyi = Boolean(input.preferences?.mutedFyi) || input.preferences?.fyiDisplay === false;
  const collected: AttentionItem[] = [];
  let eventsInspected = 0;

  const projects = input.projects.filter((project) => authorized.has(project.projectId)).slice(0, ATTENTION_SCALE.maxProjects);

  for (const project of projects) {
    const plans = project.workPlans.slice(0, ATTENTION_SCALE.maxPlansPerProject);
    const events = project.events
      .filter((row) => Date.parse(row.occurredAt) >= lookback)
      .slice(0, ATTENTION_SCALE.maxEventsPerProject);
    eventsInspected += events.length;

    for (const req of project.requirements) {
      const plan = relatedPlan({ ...project, workPlans: plans }, req.requiredForObjectId, req.workType);
      if (WAITING_STATUSES.has(req.status) && req.blocking) {
        collected.push(item({
          project,
          category: "WAITING_ON_OTHERS",
          sourceDomain: "requirement",
          sourceObjectType: "engineering_information_requirement",
          sourceObjectId: req.id,
          workPlanId: plan?.id ?? null,
          discipline: req.consumerDiscipline,
          systemId: plan?.systemId ?? null,
          title: req.title,
          whatHappened: `${req.title} is still awaited.`,
          whyItMatters: plan ? `Blocks ${plan.workType.replaceAll("_", " ")}.` : "Blocks authorized engineering work.",
          waitingFor: req.title,
          provider: req.providerDiscipline ?? req.providerRole ?? req.providerKind,
          blocks: plan ? `${plan.workType.replaceAll("_", " ")}` : null,
          neededBy: req.neededBy,
          action: action("REQUEST_INFORMATION", "Request Information", project.projectId, req.id, plan?.id ?? null),
          explanation: `You are seeing this because project ${project.projectName} has a blocking information requirement. Provider: ${req.providerDiscipline ?? req.providerKind ?? "unassigned"}. Canonical authority remains the Information Requirement.`,
          stateKey: req.status,
          now,
        }));
      }
      if (RECEIVED_STATUSES.has(req.status)) {
        collected.push(item({
          project,
          category: "DO_NOW",
          sourceDomain: "requirement",
          sourceObjectType: "engineering_information_requirement",
          sourceObjectId: req.id,
          workPlanId: plan?.id ?? null,
          discipline: req.consumerDiscipline,
          systemId: plan?.systemId ?? null,
          title: req.title,
          whatHappened: `${req.title} has been received and requires review.`,
          whyItMatters: "Accepted-for-purpose is a human information decision, not engineering approval.",
          action: action("REVIEW_INFORMATION", "Review Information", project.projectId, req.id, plan?.id ?? null),
          explanation: `Project ${project.projectName}. Information arrived and is not yet accepted for purpose.`,
          stateKey: req.status,
          now,
        }));
      }
      if (ACCEPTED_STATUSES.has(req.status) && plan && (plan.readiness === "READY" || plan.readiness === "READY_WITH_CONDITIONS") && events.some((row) => row.eventType === "INFORMATION_ACCEPTED" && (row.sourceObjectId === req.id || row.sourceObjectType === "engineering_information_requirement"))) {
        collected.push(item({
          project,
          category: "RECENTLY_READY",
          sourceDomain: "requirement",
          sourceObjectType: "engineering_information_requirement",
          sourceObjectId: req.id,
          workPlanId: plan.id,
          discipline: plan.discipline,
          systemId: plan.systemId,
          title: `${req.title} accepted`,
          whatHappened: `${req.title} was accepted for purpose. ${plan.workType.replaceAll("_", " ")} is now ${plan.readiness.replaceAll("_", " ")}.`,
          whyItMatters: "Previously blocked work can start or continue.",
          action: action(plan.status === "IN_PROGRESS" ? "CONTINUE_WORK" : "START_ENGINEERING_WORK", plan.status === "IN_PROGRESS" ? "Continue Work" : "Start Work", project.projectId, plan.id, plan.id, ["REFRESH_CONTEXT"]),
          explanation: `Project ${project.projectName}. Canonical readiness comes from the Work Plan and Information Requirement, not this attention item.`,
          stateKey: `ACCEPTED:${plan.readiness}`,
          now,
        }));
      }
    }

    for (const plan of plans) {
      if (plan.readiness === "READY" && plan.startAllowed && plan.status !== "IN_PROGRESS" && plan.status !== "COMPLETED") {
        if (plan.workType === "RFI_TQ_RESPONSE") {
          collected.push(item({
            project,
            category: "DO_NOW",
            sourceDomain: "rfi",
            sourceObjectType: "engineering_work_plan",
            sourceObjectId: plan.id,
            workPlanId: plan.id,
            discipline: plan.discipline,
            systemId: plan.systemId,
            title: "RFI/TQ awaiting engineering response",
            whatHappened: "A construction or technical query can be prepared.",
            whyItMatters: "The engineer can prepare a governed response. Publication remains human-gated.",
            action: action("PREPARE_RFI_RESPONSE", "Prepare RFI Response", project.projectId, plan.relatedObjectId ?? plan.id, plan.id, ["RUN_PRE_ISSUE_REVIEW"]),
            explanation: `Project ${project.projectName}. Reuses the A11E/A11A RFI Work Plan ${plan.id}.`,
            stateKey: `${plan.status}:${plan.readiness}`,
            now,
          }));
        } else if (!collected.some((row) => row.workPlanId === plan.id && row.category === "RECENTLY_READY")) {
          collected.push(item({
            project,
            category: "DO_NOW",
            sourceDomain: "work_plan",
            sourceObjectType: "engineering_work_plan",
            sourceObjectId: plan.id,
            workPlanId: plan.id,
            discipline: plan.discipline,
            systemId: plan.systemId,
            title: `${plan.workType.replaceAll("_", " ")} is ready`,
            whatHappened: "The Work Plan is ready for engineering work.",
            whyItMatters: "Governing inputs are sufficient to start or continue.",
            action: action("START_ENGINEERING_WORK", "Start Work", project.projectId, plan.id, plan.id),
            explanation: `Project ${project.projectName}. Canonical readiness is the Work Plan, not this projection.`,
            stateKey: `${plan.status}:${plan.readiness}`,
            now,
          }));
        }
      }
      if (plan.status === "IN_PROGRESS") {
        collected.push(item({
          project,
          category: "DO_NOW",
          sourceDomain: "work_plan",
          sourceObjectType: "engineering_work_plan",
          sourceObjectId: plan.id,
          workPlanId: plan.id,
          discipline: plan.discipline,
          systemId: plan.systemId,
          title: `Continue ${plan.workType.replaceAll("_", " ")}`,
          whatHappened: "Active engineering work is in progress.",
          whyItMatters: "The engineer can continue the existing Work Plan.",
          action: action("CONTINUE_WORK", "Continue Work", project.projectId, plan.id, plan.id),
          explanation: `Project ${project.projectName}. Continue Work reuses A11A.`,
          stateKey: plan.status,
          now,
        }));
      }
      if (plan.workType === "HANDOVER_PREPARATION" && OPEN_PLAN.has(plan.status)) {
        collected.push(item({
          project,
          category: plan.readiness.includes("BLOCKED") ? "WAITING_ON_OTHERS" : "DO_NOW",
          sourceDomain: "handover",
          sourceObjectType: "engineering_work_plan",
          sourceObjectId: plan.id,
          workPlanId: plan.id,
          discipline: plan.discipline,
          systemId: plan.systemId,
          title: "Handover preparation",
          whatHappened: "Handover work is outstanding.",
          whyItMatters: "Missing or stale handover information remains governed by A10C.",
          action: action("PREPARE_HANDOVER", "Prepare Handover", project.projectId, plan.id, plan.id),
          explanation: `Project ${project.projectName}.`,
          stateKey: `${plan.status}:${plan.readiness}`,
          now,
        }));
      }
      for (const gap of plan.valueGaps ?? []) {
        if (gap.kind === "CARBON" && /not_applicable/i.test(gap.title)) continue;
        const category = gap.kind === "CONSTRUCTABILITY" || gap.kind === "MTO" ? "REVIEW_REQUIRED" : "DO_NOW";
        const actionLabel =
          gap.kind === "CONSTRUCTABILITY" ? "Open Constructability Review"
          : gap.kind === "COST" ? "Request Cost Basis"
          : gap.kind === "CARBON" ? "Request Carbon Evidence"
          : gap.kind === "MTO" ? "Verify MTO"
          : "Request Quantity Basis";
        collected.push(item({
          project,
          category,
          sourceDomain: "work_plan",
          sourceObjectType: "engineering_work_plan",
          sourceObjectId: plan.id,
          workPlanId: plan.id,
          discipline: plan.discipline,
          systemId: plan.systemId,
          title: gap.title,
          whatHappened: gap.title,
          whyItMatters: gap.kind === "QUANTITY" || gap.kind === "MTO"
            ? "Governed quantities require a quantity basis. EOS does not invent missing take-off values."
            : "Applicable evaluation evidence is missing. EOS does not accept cost, constructability, or carbon automatically.",
          action: gap.kind === "CONSTRUCTABILITY"
            ? action("RUN_PRE_ISSUE_REVIEW", actionLabel, project.projectId, plan.id, plan.id)
            : action("REQUEST_INFORMATION", actionLabel, project.projectId, plan.id, plan.id),
          explanation: `Project ${project.projectName}. Attention is a projection of missing ${gap.kind} evidence on Work Plan ${plan.id}.`,
          stateKey: `VALUE_GAP:${gap.kind}`,
          now,
        }));
      }
    }

    const changeEvents = new Map<string, AttentionProjectSnapshot["events"][number]>();
    for (const event of events) {
      if (event.materiality === "INFORMATIONAL") continue;
      if (!INPUT_CHANGE_EVENTS.has(event.eventType) && event.eventType !== "ARTIFACT_RETURNED") continue;
      const key = `${event.sourceObjectType}:${event.sourceObjectId}:${event.eventType === "ARTIFACT_RETURNED" ? "RETURNED" : "INPUT"}`;
      if (!changeEvents.has(key)) changeEvents.set(key, event);
    }
    for (const event of changeEvents.values()) {
      const plan = relatedPlan({ ...project, workPlans: plans }, event.sourceObjectId) ?? plans.find((row) => OPEN_PLAN.has(row.status));
      if (event.eventType === "ARTIFACT_RETURNED" && plan) {
        collected.push(item({
          project,
          category: "DO_NOW",
          sourceDomain: "artifact",
          sourceObjectType: event.sourceObjectType,
          sourceObjectId: event.sourceObjectId,
          workPlanId: plan.id,
          discipline: plan.discipline,
          systemId: plan.systemId,
          title: "Returned artifact ready for Pre-Issue Review",
          whatHappened: "An updated artifact was returned from the engineer.",
          whyItMatters: "Pre-Issue Review can run before issue.",
          action: action("RUN_PRE_ISSUE_REVIEW", "Run Pre-Issue Review", project.projectId, plan.id, plan.id),
          explanation: `Project ${project.projectName}. Material return event collapsed to one attention item.`,
          stateKey: "RETURNED",
          now,
        }));
        continue;
      }
      if (plan) {
        collected.push(item({
          project,
          category: "DO_NOW",
          sourceDomain: "information",
          sourceObjectType: event.sourceObjectType,
          sourceObjectId: event.sourceObjectId,
          workPlanId: plan.id,
          discipline: plan.discipline,
          systemId: plan.systemId,
          title: "Review changed engineering input",
          whatHappened: "Governing or interface information changed.",
          whyItMatters: "Structural or dependent work may be affected. Impact is potential until confirmed.",
          action: action("ASSESS_IMPACT", "Assess Impact", project.projectId, event.sourceObjectId, plan.id, ["REFRESH_CONTEXT", "RUN_PRE_ISSUE_REVIEW"]),
          explanation: `Project ${project.projectName}. Low-level file/metadata events for ${event.sourceObjectId} are collapsed into one item.`,
          stateKey: event.sourceObjectId,
          now,
        }));
      }
    }

    for (const review of project.reviews) {
      if (review.openConditionCount > 0 || review.resultState === "ATTENTION_REQUIRED") {
        const plan = plans.find((row) => row.id === review.workPlanId);
        collected.push(item({
          project,
          category: "REVIEW_REQUIRED",
          sourceDomain: "pre_issue_review",
          sourceObjectType: "engineering_pre_issue_review",
          sourceObjectId: review.id,
          workPlanId: review.workPlanId,
          discipline: plan?.discipline ?? null,
          systemId: plan?.systemId ?? null,
          title: review.targetTitle ?? "Pre-Issue Review",
          whatHappened: `${review.openConditionCount} Pre-Issue Review condition${review.openConditionCount === 1 ? "" : "s"} require disposition.`,
          whyItMatters: "Human review disposition is required. This is not design approval.",
          action: action("OPEN_REVIEW", "Open Review", project.projectId, review.workPlanId, review.workPlanId),
          explanation: `Project ${project.projectName}. Canonical conditions live on the Pre-Issue Review record.`,
          stateKey: `${review.resultState}:${review.openConditionCount}`,
          now,
        }));
      }
    }

    for (const impact of project.impacts) {
      if (impact.status === "REVIEW_REQUIRED" || impact.status === "IN_REVIEW" || impact.status === "DRAFT" || impact.status === "ANALYSING") {
        collected.push(item({
          project,
          category: "DO_NOW",
          sourceDomain: "impact",
          sourceObjectType: "engineering_impact_assessment",
          sourceObjectId: impact.id,
          workPlanId: impact.workPlanId,
          discipline: null,
          systemId: null,
          title: impact.constructionQuery?.summary ?? "Impact assessment requires attention",
          whatHappened: impact.constructionQuery ? `${impact.constructionQuery.queryType} ${impact.constructionQuery.queryId} needs an engineering response.` : "An impact assessment requires confirmation.",
          whyItMatters: "Confirmed impact and option selection remain human decisions.",
          action: impact.constructionQuery
            ? action("PREPARE_RFI_RESPONSE", "Prepare RFI Response", project.projectId, impact.constructionQuery.queryId, impact.workPlanId, ["RUN_PRE_ISSUE_REVIEW"])
            : action("ASSESS_IMPACT", "Assess Impact", project.projectId, impact.sourceObjectId, impact.workPlanId),
          explanation: `Project ${project.projectName}. Canonical impact state remains the A11E assessment.`,
          stateKey: impact.status,
          now,
        }));
      }
      if (impact.optionStudyNeedsDecision) {
        collected.push(item({
          project,
          category: "DECISION_REQUIRED",
          sourceDomain: "option_study",
          sourceObjectType: "engineering_impact_assessment",
          sourceObjectId: impact.id,
          workPlanId: impact.workPlanId,
          discipline: null,
          systemId: null,
          title: "Option study needs a human Decision",
          whatHappened: "Alternatives and criteria are prepared. No option has been selected.",
          whyItMatters: "EOS does not choose a winner.",
          action: action("RECORD_DECISION", "Record Decision", project.projectId, impact.id, impact.workPlanId),
          explanation: `Project ${project.projectName}. Decision Intelligence remains authoritative.`,
          stateKey: "OPTION_DECISION",
          now,
        }));
      }
    }

    for (const decision of project.decisions) {
      if (PENDING_DECISION.has(decision.approvalStatus)) {
        collected.push(item({
          project,
          category: "DECISION_REQUIRED",
          sourceDomain: "decision",
          sourceObjectType: "engineering_decision",
          sourceObjectId: decision.id,
          workPlanId: null,
          discipline: null,
          systemId: null,
          title: decision.title,
          whatHappened: "A governed decision is outstanding.",
          whyItMatters: "Human Decision is required. AI cannot decide.",
          action: action("RECORD_DECISION", "Record Decision", project.projectId, decision.id, null),
          explanation: `Project ${project.projectName}.`,
          stateKey: decision.approvalStatus || "pending",
          now,
        }));
      }
    }

    for (const iface of project.interfaces) {
      if (iface.awaitingConsumerConfirmation || /open|pending|changed/i.test(iface.status)) {
        collected.push(item({
          project,
          category: iface.awaitingConsumerConfirmation ? "WAITING_ON_OTHERS" : "DO_NOW",
          sourceDomain: "interface",
          sourceObjectType: "engineering_interface",
          sourceObjectId: iface.id,
          workPlanId: null,
          discipline: iface.consumerDiscipline,
          systemId: null,
          title: iface.title,
          whatHappened: iface.awaitingConsumerConfirmation
            ? `${iface.providerDiscipline ?? "Provider"} is awaiting consumer confirmation.`
            : "Interface information changed and requires review.",
          whyItMatters: "Interface workflow is reused, not duplicated.",
          waitingFor: iface.awaitingConsumerConfirmation ? "Consumer confirmation" : null,
          provider: iface.providerDiscipline,
          blocks: iface.consumerDiscipline,
          action: action("OPEN_INTERFACE", "Open Interface", project.projectId, iface.id, null),
          explanation: `Project ${project.projectName}. Canonical interface state remains Interface Intelligence.`,
          stateKey: `${iface.status}:${iface.awaitingConsumerConfirmation ? "WAIT" : "REVIEW"}`,
          now,
        }));
      }
    }

    const fyiKeys = new Map<string, AttentionProjectSnapshot["events"][number]>();
    for (const event of events) {
      if (event.materiality !== "MATERIAL") continue;
      if (!MATERIAL_FYI.has(event.eventType)) continue;
      const key = `${event.eventType}:${event.sourceObjectId}`;
      if (!fyiKeys.has(key)) fyiKeys.set(key, event);
    }
    if (!mutedFyi) {
      for (const event of fyiKeys.values()) {
        collected.push(item({
          project,
          category: "FYI",
          sourceDomain: "work_event",
          sourceObjectType: event.sourceObjectType,
          sourceObjectId: event.sourceObjectId,
          workPlanId: null,
          discipline: null,
          systemId: null,
          title: event.eventType.replaceAll("_", " "),
          whatHappened: `${event.eventType.replaceAll("_", " ")} for ${event.sourceObjectType}.`,
          whyItMatters: "Meaningful engineering state with no immediate assigned action.",
          action: null,
          explanation: `Project ${project.projectName}. Informational only.`,
          stateKey: event.eventType,
          now,
        }));
      }
    }
  }

  const unique = new Map<string, AttentionItem>();
  for (const row of collected) {
    if (!unique.has(row.fingerprint)) unique.set(row.fingerprint, row);
  }

  let items = [...unique.values()].map((row) => {
    const stored = ack.get(row.fingerprint);
    const snoozedUntil = stored?.snoozedUntil ?? null;
    const snoozed = Boolean(snoozedUntil && Date.parse(snoozedUntil) > now);
    return {
      ...row,
      acknowledged: Boolean(stored) && !snoozed,
      snoozedUntil,
    };
  }).filter((row) => !(row.snoozedUntil && Date.parse(row.snoozedUntil) > now));

  items = items.filter((row) => roleAllows(input.viewer.role, row, input.viewer.discipline));

  const filter = input.filter ?? {};
  if (filter.projectId) items = items.filter((row) => row.projectId === filter.projectId);
  if (filter.category && filter.category !== "ALL") items = items.filter((row) => row.category === filter.category);
  if (filter.discipline) items = items.filter((row) => row.discipline === filter.discipline || row.provider === filter.discipline);
  if (filter.lifecycle) items = items.filter((row) => row.lifecycleStage === filter.lifecycle);

  const sections = {
    DO_NOW: cap(items.filter((row) => row.category === "DO_NOW")),
    REVIEW_REQUIRED: cap(items.filter((row) => row.category === "REVIEW_REQUIRED")),
    DECISION_REQUIRED: cap(items.filter((row) => row.category === "DECISION_REQUIRED")),
    WAITING_ON_OTHERS: cap(items.filter((row) => row.category === "WAITING_ON_OTHERS")),
    RECENTLY_READY: cap(items.filter((row) => row.category === "RECENTLY_READY")),
    FYI: cap(items.filter((row) => row.category === "FYI")),
  };
  const bounded = Object.values(sections).flat();
  const counts = {
    DO_NOW: sections.DO_NOW.length,
    REVIEW_REQUIRED: sections.REVIEW_REQUIRED.length,
    DECISION_REQUIRED: sections.DECISION_REQUIRED.length,
    WAITING_ON_OTHERS: sections.WAITING_ON_OTHERS.length,
    RECENTLY_READY: sections.RECENTLY_READY.length,
    FYI: sections.FYI.length,
    actionRequired: sections.DO_NOW.length + sections.REVIEW_REQUIRED.length + sections.DECISION_REQUIRED.length,
  };

  return {
    generatedAt: nowIso,
    projection: "DERIVED",
    sourceOfTruth: "CANONICAL_DOMAIN",
    projectsConsidered: projects.length,
    eventsInspected,
    durationMs: Date.now() - started,
    counts,
    sections,
    items: bounded,
    askEosSummary: summarizeEngineeringDay(counts, bounded),
    filters: {
      projectId: filter.projectId ?? null,
      category: filter.category ?? "ALL",
      discipline: filter.discipline ?? null,
      lifecycle: filter.lifecycle ?? null,
    },
    inAppNotification: { reused: true, channel: "IN_APP", external: "DEFERRED" },
    productivityScore: null,
    employeeRanking: null,
  };
}

export function summarizeEngineeringDay(
  counts: EngineeringDay["counts"],
  items: AttentionItem[],
): string {
  const lines = [
    `${counts.actionRequired} item${counts.actionRequired === 1 ? "" : "s"} need action.`,
    counts.DO_NOW ? `${counts.DO_NOW} can be done now.` : null,
    counts.REVIEW_REQUIRED ? `${counts.REVIEW_REQUIRED} review item${counts.REVIEW_REQUIRED === 1 ? "" : "s"} need disposition.` : null,
    counts.DECISION_REQUIRED ? `${counts.DECISION_REQUIRED} decision${counts.DECISION_REQUIRED === 1 ? "" : "s"} require a human.` : null,
    counts.WAITING_ON_OTHERS ? `${counts.WAITING_ON_OTHERS} waiting on other disciplines or providers.` : null,
    counts.RECENTLY_READY ? `${counts.RECENTLY_READY} recently became ready.` : null,
  ].filter(Boolean);
  const sample = items.slice(0, 5).map((row) => `${row.projectName}: ${row.title} — ${row.action?.label ?? "FYI"}`);
  return [...lines, ...sample].join(" ");
}

function item(input: {
  project: AttentionProjectSnapshot;
  category: AttentionCategory;
  sourceDomain: string;
  sourceObjectType: string;
  sourceObjectId: string;
  workPlanId: string | null;
  discipline: string | null;
  systemId: string | null;
  title: string;
  whatHappened: string;
  whyItMatters: string;
  waitingFor?: string | null;
  provider?: string | null;
  blocks?: string | null;
  neededBy?: string | null;
  action: AttentionActionContract | null;
  explanation: string;
  stateKey: string;
  now: number;
}): AttentionItem {
  return {
    fingerprint: attentionFingerprint({
      sourceDomain: input.sourceDomain,
      sourceObjectId: input.sourceObjectId,
      category: input.category,
      projectId: input.project.projectId,
      stateKey: input.stateKey,
    }),
    category: input.category,
    priority: priorityFor(input.category),
    projectId: input.project.projectId,
    projectName: input.project.projectName,
    lifecycleStage: input.project.lifecycleStage,
    discipline: input.discipline,
    systemId: input.systemId,
    sourceDomain: input.sourceDomain,
    sourceObjectType: input.sourceObjectType,
    sourceObjectId: input.sourceObjectId,
    sourceRevision: null,
    workPlanId: input.workPlanId,
    title: input.title,
    whatHappened: input.whatHappened,
    whyItMatters: input.whyItMatters,
    waitingFor: input.waitingFor ?? null,
    provider: input.provider ?? null,
    blocks: input.blocks ?? null,
    neededBy: input.neededBy ?? null,
    overdue: overdue(input.neededBy ?? null, input.now),
    action: input.action,
    explanation: input.explanation,
    acknowledged: false,
    snoozedUntil: null,
    resolved: false,
    engineeringStateMutatedByAck: false,
  };
}
