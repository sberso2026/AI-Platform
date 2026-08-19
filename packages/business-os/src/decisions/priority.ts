import type {
  BusinessDecisionPriorityComponent,
  BusinessDecisionPriorityLevel,
  BusinessDecisionPriorityResult,
  BusinessDecisionReversibility,
  BusinessEvidenceRef,
  BusinessSignalSeverity,
} from "@rtb/types";
import { BUSINESS_DECISION_DEFAULT_THRESHOLDS, DECISION_PRIORITY_VERSION } from "@rtb/types";
import { parseMinor } from "../finance/money";

const RANK: Record<BusinessDecisionPriorityLevel, number> = {
  unknown: -1,
  low: 0,
  normal: 1,
  high: 2,
  urgent: 3,
  critical: 4,
};

const LEVELS: BusinessDecisionPriorityLevel[] = ["low", "normal", "high", "urgent", "critical"];

function maxLevel(a: BusinessDecisionPriorityLevel, b: BusinessDecisionPriorityLevel): BusinessDecisionPriorityLevel {
  if (a === "unknown") return b;
  if (b === "unknown") return a;
  return RANK[a] >= RANK[b] ? a : b;
}

function bump(level: BusinessDecisionPriorityLevel, steps = 1): BusinessDecisionPriorityLevel {
  if (level === "unknown") return LEVELS[Math.min(steps, LEVELS.length - 1)] ?? "normal";
  const idx = LEVELS.indexOf(level);
  return LEVELS[Math.min(idx + steps, LEVELS.length - 1)] ?? "critical";
}

export interface DecisionPriorityInput {
  pending: boolean;
  dueAt?: string | null;
  asOf?: string;
  originatingSignalSeverity?: BusinessSignalSeverity | null;
  financialImpactMinor?: string | number | null;
  customerImpact?: "low" | "medium" | "high" | "critical" | "unknown" | null;
  operationalImpact?: "low" | "medium" | "high" | "critical" | "unknown" | null;
  reversibility?: BusinessDecisionReversibility | null;
  strategicImportance?: BusinessDecisionPriorityLevel | null;
  thresholds?: Partial<typeof BUSINESS_DECISION_DEFAULT_THRESHOLDS>;
  evidence?: BusinessEvidenceRef[];
}

export function computeDecisionPriority(input: DecisionPriorityInput): BusinessDecisionPriorityResult {
  const thresholds = { ...BUSINESS_DECISION_DEFAULT_THRESHOLDS, ...input.thresholds };
  const asOf = input.asOf ?? new Date().toISOString();
  const missingInputs: string[] = [];
  const components: BusinessDecisionPriorityComponent[] = [];
  let priority: BusinessDecisionPriorityLevel = "normal";

  const signal = input.originatingSignalSeverity ?? null;
  if (!signal) missingInputs.push("originating_signal_severity");
  const signalContribution: BusinessDecisionPriorityLevel | "none" =
    signal === "critical" ? "urgent" : signal === "warning" ? "high" : signal === "watch" ? "normal" : signal === "info" ? "low" : "none";
  if (signalContribution !== "none") priority = maxLevel(priority, signalContribution);
  components.push({
    id: "originating_signal",
    label: "Originating signal severity",
    value: signal,
    contribution: signalContribution,
    known: Boolean(signal),
  });

  const dueAt = input.dueAt ?? null;
  let deadlineContribution: BusinessDecisionPriorityLevel | "none" = "none";
  if (!dueAt) {
    missingInputs.push("due_at");
  } else if (input.pending) {
    const due = new Date(dueAt).getTime();
    const now = new Date(asOf).getTime();
    const overdueMs = now - due;
    const grace = thresholds.overdueGraceDays * 86_400_000;
    if (Number.isFinite(due) && overdueMs > grace) {
      deadlineContribution = overdueMs > 7 * 86_400_000 ? "critical" : "urgent";
      priority = maxLevel(priority, deadlineContribution);
    } else if (Number.isFinite(due) && due - now <= 2 * 86_400_000) {
      deadlineContribution = "high";
      priority = maxLevel(priority, "high");
    }
  }
  components.push({
    id: "deadline",
    label: "Deadline",
    value: dueAt,
    contribution: deadlineContribution,
    known: Boolean(dueAt),
  });

  const financial = parseMinor(input.financialImpactMinor ?? null);
  let financialContribution: BusinessDecisionPriorityLevel | "none" = "none";
  if (financial === null) {
    missingInputs.push("financial_impact");
  } else {
    const abs = financial < 0n ? -financial : financial;
    if (abs >= BigInt(thresholds.criticalFinancialImpactMinor)) financialContribution = "urgent";
    else if (abs >= BigInt(thresholds.highFinancialImpactMinor)) financialContribution = "high";
    else financialContribution = "normal";
    priority = maxLevel(priority, financialContribution);
  }
  components.push({
    id: "financial_impact",
    label: "Financial impact",
    value: financial === null ? null : financial.toString(),
    contribution: financialContribution,
    known: financial !== null,
  });

  const customer = input.customerImpact ?? null;
  if (!customer || customer === "unknown") missingInputs.push("customer_impact");
  const customerContribution: BusinessDecisionPriorityLevel | "none" =
    customer === "critical" ? "urgent" : customer === "high" ? "high" : customer === "medium" ? "normal" : customer === "low" ? "low" : "none";
  if (customerContribution !== "none") priority = maxLevel(priority, customerContribution);
  components.push({
    id: "customer_impact",
    label: "Customer impact",
    value: customer,
    contribution: customerContribution,
    known: Boolean(customer && customer !== "unknown"),
  });

  const operational = input.operationalImpact ?? null;
  if (!operational || operational === "unknown") missingInputs.push("operational_impact");
  const operationalContribution: BusinessDecisionPriorityLevel | "none" =
    operational === "critical" ? "urgent" : operational === "high" ? "high" : operational === "medium" ? "normal" : operational === "low" ? "low" : "none";
  if (operationalContribution !== "none") priority = maxLevel(priority, operationalContribution);
  components.push({
    id: "operational_impact",
    label: "Operational impact",
    value: operational,
    contribution: operationalContribution,
    known: Boolean(operational && operational !== "unknown"),
  });

  const reversibility = input.reversibility ?? null;
  if (!reversibility || reversibility === "unknown") missingInputs.push("reversibility");
  let reversibilityContribution: BusinessDecisionPriorityLevel | "none" = "none";
  if (reversibility === "irreversible" && (RANK[priority] >= RANK.high)) {
    reversibilityContribution = bump(priority);
    priority = maxLevel(priority, reversibilityContribution);
  }
  components.push({
    id: "reversibility",
    label: "Reversibility",
    value: reversibility,
    contribution: reversibilityContribution,
    known: Boolean(reversibility && reversibility !== "unknown"),
  });

  const strategic = input.strategicImportance ?? null;
  if (!strategic || strategic === "unknown") missingInputs.push("strategic_importance");
  else {
    priority = maxLevel(priority, strategic);
  }
  components.push({
    id: "strategic_importance",
    label: "Strategic importance",
    value: strategic,
    contribution: strategic && strategic !== "unknown" ? strategic : "none",
    known: Boolean(strategic && strategic !== "unknown"),
  });

  const knownCount = components.filter((c) => c.known).length;
  if (knownCount === 0) priority = "unknown";

  return {
    priority,
    components,
    evidence: input.evidence ?? [],
    missingInputs,
    version: DECISION_PRIORITY_VERSION,
    inspectable: true,
    authoritativeAi: false,
  };
}
