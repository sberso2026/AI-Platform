export type BinaryCounts = {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  trueNegatives: number;
};

export type ReviewEvalMetrics = {
  precision: number;
  recall: number;
  falsePositiveRate: number;
  evidenceGroundingRate: number;
  duplicateFindingRate: number;
  counts: BinaryCounts;
};

function ratio(numerator: number, denominator: number): number {
  if (denominator === 0) return 1;
  return numerator / denominator;
}

export function evaluateDetections(input: {
  predictedKeys: readonly string[];
  expectedKeys: readonly string[];
  absentKeys?: readonly string[];
  evidenceGroundedCount: number;
  predictedFindingCount: number;
}): ReviewEvalMetrics {
  const predicted = new Set(input.predictedKeys);
  const expected = new Set(input.expectedKeys);
  const universe = new Set([...predicted, ...expected, ...(input.absentKeys ?? [])]);

  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let trueNegatives = 0;

  for (const key of universe) {
    const isExpected = expected.has(key);
    const isPredicted = predicted.has(key);
    if (isExpected && isPredicted) truePositives += 1;
    else if (!isExpected && isPredicted) falsePositives += 1;
    else if (isExpected && !isPredicted) falseNegatives += 1;
    else trueNegatives += 1;
  }

  const uniquePredicted = predicted.size;
  const duplicateFindingRate =
    input.predictedFindingCount === 0
      ? 0
      : (input.predictedFindingCount - uniquePredicted) / input.predictedFindingCount;

  return {
    precision: ratio(truePositives, truePositives + falsePositives),
    recall: ratio(truePositives, truePositives + falseNegatives),
    falsePositiveRate: ratio(falsePositives, falsePositives + trueNegatives),
    evidenceGroundingRate: ratio(input.evidenceGroundedCount, input.predictedFindingCount),
    duplicateFindingRate,
    counts: { truePositives, falsePositives, falseNegatives, trueNegatives },
  };
}
