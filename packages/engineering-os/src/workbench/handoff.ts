import type { LifecycleStage } from "../lifecycle-intelligence/types";
import type { WorkPlanContextSnapshot } from "../work-generator/types";
import type { InheritedAssumption } from "./inherit";
import { DEFAULT_WORK_TYPE_FOR_STAGE } from "./journeys";

export type LifecycleHandoffSummary = {
  fromStage: LifecycleStage;
  toStage: LifecycleStage;
  fromPlanId: string;
  systemId: string | null;
  inheritedContext: string[];
  newRequirements: string[];
  openAssumptions: Array<{ title: string; disposition: string }>;
  unresolvedInterfaces: string[];
  outstandingInformation: string[];
  decisions: string[];
  requiredEngineeringWork: string;
  advancesLifecycleGate: false;
};

export function composeLifecycleHandoff(input: {
  fromStage: LifecycleStage;
  toStage: LifecycleStage;
  fromPlanId: string;
  systemId: string | null;
  snapshot: WorkPlanContextSnapshot;
  assumptions: InheritedAssumption[];
}): LifecycleHandoffSummary {
  const inheritedContext = [
    ...input.snapshot.requirements.map((row) => row.title),
    ...input.snapshot.decisions.map((row) => row.title),
    ...input.snapshot.analyses.map((row) => row.title),
  ].slice(0, 12);
  return {
    fromStage: input.fromStage,
    toStage: input.toStage,
    fromPlanId: input.fromPlanId,
    systemId: input.systemId,
    inheritedContext,
    newRequirements: input.snapshot.gaps.filter((row) => row.kind === "missing").map((row) => row.title),
    openAssumptions: input.assumptions.map((row) => ({ title: row.title, disposition: row.disposition })),
    unresolvedInterfaces: input.snapshot.interfaces.filter((row) => row.stale || /open|requested/i.test(row.whyIncluded)).map((row) => row.title),
    outstandingInformation: input.snapshot.gaps.map((row) => row.title),
    decisions: input.snapshot.decisions.map((row) => row.title),
    requiredEngineeringWork: `${DEFAULT_WORK_TYPE_FOR_STAGE[input.toStage].replaceAll("_", " ")} using inherited ${input.fromStage} context`,
    advancesLifecycleGate: false,
  };
}
