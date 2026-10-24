import type { AttentionCategory } from "./types";

export function attentionFingerprint(input: {
  sourceDomain: string;
  sourceObjectId: string;
  category: AttentionCategory;
  projectId: string;
  stateKey: string;
}): string {
  return [input.sourceDomain, input.sourceObjectId, input.category, input.projectId, input.stateKey].join("|");
}
