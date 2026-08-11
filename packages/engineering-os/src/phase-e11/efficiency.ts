/**
 * Workflow efficiency metrics — labelled BENCHMARK_METRIC only.
 */

import type { EngineeringBenchmarkTaskId } from "./benchmark-tasks";

export type ManualWorkflowFixture = {
  taskId: EngineeringBenchmarkTaskId;
  completionTimeMs: number;
  interactions: number;
  searches: number;
  contextSwitches: number;
  duplicateFieldsEntered: number;
  evidenceSourcesManuallyOpened: number;
};

export type EosWorkflowFixture = ManualWorkflowFixture & {
  successfulCompletion: boolean;
  abstentionWhenAppropriate: boolean;
};

/** Deterministic manual vs EOS fixtures for applicable tasks. */
export const E11_MANUAL_BASELINES: ManualWorkflowFixture[] = [
  {
    taskId: "A",
    completionTimeMs: 180000,
    interactions: 14,
    searches: 3,
    contextSwitches: 4,
    duplicateFieldsEntered: 2,
    evidenceSourcesManuallyOpened: 5,
  },
  {
    taskId: "J",
    completionTimeMs: 240000,
    interactions: 20,
    searches: 2,
    contextSwitches: 5,
    duplicateFieldsEntered: 6,
    evidenceSourcesManuallyOpened: 4,
  },
  {
    taskId: "N",
    completionTimeMs: 300000,
    interactions: 18,
    searches: 4,
    contextSwitches: 6,
    duplicateFieldsEntered: 3,
    evidenceSourcesManuallyOpened: 7,
  },
];

export const E11_EOS_BENCHMARK_WORKFLOWS: EosWorkflowFixture[] = [
  {
    taskId: "A",
    completionTimeMs: 45000,
    interactions: 4,
    searches: 1,
    contextSwitches: 1,
    duplicateFieldsEntered: 0,
    evidenceSourcesManuallyOpened: 1,
    successfulCompletion: true,
    abstentionWhenAppropriate: true,
  },
  {
    taskId: "J",
    completionTimeMs: 60000,
    interactions: 6,
    searches: 1,
    contextSwitches: 1,
    duplicateFieldsEntered: 1,
    evidenceSourcesManuallyOpened: 1,
    successfulCompletion: true,
    abstentionWhenAppropriate: true,
  },
  {
    taskId: "N",
    completionTimeMs: 55000,
    interactions: 5,
    searches: 1,
    contextSwitches: 1,
    duplicateFieldsEntered: 0,
    evidenceSourcesManuallyOpened: 2,
    successfulCompletion: true,
    abstentionWhenAppropriate: true,
  },
];

export type EfficiencyDelta = {
  taskId: EngineeringBenchmarkTaskId;
  metricKind: "BENCHMARK_METRIC";
  disclaimer: "Benchmark efficiency — not real client productivity evidence.";
  timeSavedMs: number;
  timeSavedRatio: number;
  interactionReduction: number;
  interactionReductionRatio: number;
  duplicateEntryReduction: number;
  duplicateEntryReductionRatio: number;
  successfulCompletion: boolean;
  abstentionWhenAppropriate: boolean;
};

export function calculateEfficiencyDeltas(): EfficiencyDelta[] {
  return E11_EOS_BENCHMARK_WORKFLOWS.map((eos) => {
    const manual = E11_MANUAL_BASELINES.find((m) => m.taskId === eos.taskId)!;
    const timeSavedMs = manual.completionTimeMs - eos.completionTimeMs;
    const interactionReduction = manual.interactions - eos.interactions;
    const duplicateEntryReduction =
      manual.duplicateFieldsEntered - eos.duplicateFieldsEntered;
    return {
      taskId: eos.taskId,
      metricKind: "BENCHMARK_METRIC" as const,
      disclaimer: "Benchmark efficiency — not real client productivity evidence.",
      timeSavedMs,
      timeSavedRatio: timeSavedMs / manual.completionTimeMs,
      interactionReduction,
      interactionReductionRatio: interactionReduction / manual.interactions,
      duplicateEntryReduction,
      duplicateEntryReductionRatio:
        manual.duplicateFieldsEntered === 0
          ? 0
          : duplicateEntryReduction / manual.duplicateFieldsEntered,
      successfulCompletion: eos.successfulCompletion,
      abstentionWhenAppropriate: eos.abstentionWhenAppropriate,
    };
  });
}
