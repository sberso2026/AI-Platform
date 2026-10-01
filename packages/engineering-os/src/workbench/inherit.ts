import type { LifecycleStage } from "../lifecycle-intelligence/types";
import type { WorkPlanContextSnapshot, WorkReference } from "../work-generator/types";
import { emptySnapshot } from "../work-generator/compose";
import { composeLifecycleHandoff, type LifecycleHandoffSummary } from "./handoff";

export const ASSUMPTION_DISPOSITIONS = ["CONTINUE", "VALIDATE", "RETIRE", "REPLACE"] as const;
export type AssumptionDisposition = (typeof ASSUMPTION_DISPOSITIONS)[number];

export type InheritedAssumption = WorkReference & { disposition: AssumptionDisposition };

const EARLY: ReadonlySet<LifecycleStage> = new Set(["CONCEPT", "PREFEASIBILITY", "FEASIBILITY"]);
const DESIGN: ReadonlySet<LifecycleStage> = new Set(["FEED", "DETAILED_DESIGN"]);

function assumptionDisposition(fromStage: LifecycleStage, toStage: LifecycleStage, row: WorkReference): AssumptionDisposition {
  if (row.stale) return "RETIRE";
  if (fromStage === "CONCEPT" && toStage !== "CONCEPT") return "VALIDATE";
  if (fromStage === "PREFEASIBILITY" && (toStage === "FEASIBILITY" || DESIGN.has(toStage))) return "VALIDATE";
  if (fromStage === "FEASIBILITY" && DESIGN.has(toStage)) return "VALIDATE";
  if (EARLY.has(fromStage) && (toStage === "CONSTRUCTION" || toStage === "COMMISSIONING" || toStage === "OPERATIONS")) return "RETIRE";
  return "CONTINUE";
}

function inheritAssumptions(
  rows: WorkReference[],
  fromStage: LifecycleStage,
  toStage: LifecycleStage,
): InheritedAssumption[] {
  return rows.map((row) => {
    const disposition = assumptionDisposition(fromStage, toStage, row);
    const why =
      disposition === "VALIDATE"
        ? `${row.whyIncluded} Inherited from ${fromStage}; requires validation before use as ${toStage} fact.`
        : disposition === "RETIRE"
          ? `${row.whyIncluded} Inherited from ${fromStage}; retire or replace rather than treating as current fact.`
          : `${row.whyIncluded} Inherited from ${fromStage}; still applicable unless superseded.`;
    return { ...row, disposition, whyIncluded: why };
  });
}

function inheritInformation(
  rows: WorkPlanContextSnapshot["information"],
  fromStage: LifecycleStage,
  toStage: LifecycleStage,
): { information: WorkPlanContextSnapshot["information"]; gaps: WorkPlanContextSnapshot["gaps"] } {
  const information: WorkPlanContextSnapshot["information"] = [];
  const gaps: WorkPlanContextSnapshot["gaps"] = [];
  for (const row of rows) {
    const preliminary = row.purpose === "FOR_COORDINATION" || row.authorityOutcome !== "AUTHORITATIVE_FOR_PURPOSE";
    if (EARLY.has(fromStage) && DESIGN.has(toStage) && preliminary) {
      gaps.push({
        kind: "unaccepted",
        title: row.title,
        explanation: `${row.title} is inherited from ${fromStage} as preliminary information. A10A/A10C authority still governs use; it is not automatically suitable for ${toStage}.`,
      });
      information.push({
        ...row,
        whyIncluded: `${row.whyIncluded} Inherited; not automatically marked suitable for ${toStage}.`,
      });
      continue;
    }
    information.push({
      ...row,
      whyIncluded: `${row.whyIncluded} Inherited from ${fromStage} without rewriting history.`,
    });
  }
  return { information, gaps };
}

function asInherited(rows: WorkReference[], fromStage: LifecycleStage): WorkReference[] {
  return rows.map((row) => ({
    ...row,
    whyIncluded: `${row.whyIncluded} Inherited from ${fromStage}. Object remains source-owned.`,
  }));
}

export function inheritWorkPlanContext(input: {
  from: WorkPlanContextSnapshot;
  fromStage: LifecycleStage;
  toStage: LifecycleStage;
  fromPlanId: string;
  systemId?: string | null;
}): { snapshot: WorkPlanContextSnapshot; assumptions: InheritedAssumption[]; handoff: LifecycleHandoffSummary } {
  const assumptions = inheritAssumptions(input.from.assumptions, input.fromStage, input.toStage);
  const info = inheritInformation(input.from.information, input.fromStage, input.toStage);
  const gaps = [
    ...input.from.gaps.map((row) => ({
      ...row,
      explanation: `${row.explanation} Outstanding from ${input.fromStage}; still visible in ${input.toStage}.`,
    })),
    ...info.gaps,
  ];
  const snapshot: WorkPlanContextSnapshot = {
    ...emptySnapshot(),
    requirements: asInherited(input.from.requirements, input.fromStage),
    assumptions: assumptions.map(({ disposition: _d, ...row }) => row),
    interfaces: asInherited(input.from.interfaces, input.fromStage),
    decisions: asInherited(input.from.decisions, input.fromStage),
    analyses: asInherited(input.from.analyses, input.fromStage),
    information: info.information,
    gaps,
    deliverable: input.from.deliverable
      ? { ...input.from.deliverable, whyIncluded: `${input.from.deliverable.whyIncluded} Inherited deliverable context. Maturity is not reset or percentage-completed.` }
      : null,
    handoverPackage: input.from.handoverPackage,
    threadRelationshipCount: (input.from.threadRelationshipCount ?? 0) + 1,
  };
  const handoff = composeLifecycleHandoff({
    fromStage: input.fromStage,
    toStage: input.toStage,
    fromPlanId: input.fromPlanId,
    systemId: input.systemId ?? null,
    snapshot,
    assumptions,
  });
  return { snapshot, assumptions, handoff };
}

export function mergeInheritedWithLive(inherited: WorkPlanContextSnapshot, live: WorkPlanContextSnapshot): WorkPlanContextSnapshot {
  const key = (row: WorkReference) => `${row.objectType}:${row.objectId}`;
  const mergeRefs = (base: WorkReference[], extra: WorkReference[]) => {
    const seen = new Set(base.map(key));
    return [...base, ...extra.filter((row) => !seen.has(key(row)))].slice(0, 20);
  };
  const seenInfo = new Set(inherited.information.map((row) => row.title));
  return {
    requirements: mergeRefs(inherited.requirements, live.requirements),
    assumptions: mergeRefs(inherited.assumptions, live.assumptions),
    interfaces: mergeRefs(inherited.interfaces, live.interfaces),
    decisions: mergeRefs(inherited.decisions, live.decisions),
    analyses: mergeRefs(inherited.analyses, live.analyses),
    information: [...inherited.information, ...live.information.filter((row) => !seenInfo.has(row.title))].slice(0, 20),
    gaps: [...inherited.gaps, ...live.gaps.filter((row) => !inherited.gaps.some((g) => g.title === row.title))].slice(0, 20),
    deliverable: live.deliverable ?? inherited.deliverable ?? null,
    handoverPackage: live.handoverPackage ?? inherited.handoverPackage ?? null,
    threadRelationshipCount: Math.max(inherited.threadRelationshipCount ?? 0, live.threadRelationshipCount ?? 0) + 1,
  };
}
