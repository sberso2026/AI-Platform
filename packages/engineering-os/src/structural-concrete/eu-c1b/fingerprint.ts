export type FormulaFingerprintInput = {
  ruleId: string;
  operations: readonly string[];
  parameterIds: readonly string[];
};

export function formulaFingerprint(input: FormulaFingerprintInput): string {
  const canonical = JSON.stringify({
    ruleId: input.ruleId,
    operations: [...input.operations],
    parameterIds: [...input.parameterIds],
  });
  let hash = 2166136261;
  for (let i = 0; i < canonical.length; i += 1) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fp:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
