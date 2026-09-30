import { createHash } from "node:crypto";

export function fingerprintAssuranceCondition(input: {
  ruleId: string;
  workspaceId: string;
  rootObjectType: string;
  rootObjectId: string;
  relatedObjectType?: string | null;
  relatedObjectId?: string | null;
  contextKey?: string | null;
}): string {
  const parts = [
    input.ruleId,
    input.workspaceId,
    input.rootObjectType,
    input.rootObjectId,
    input.relatedObjectType ?? "",
    input.relatedObjectId ?? "",
    input.contextKey ?? "",
  ];
  return createHash("sha256").update(parts.join("|")).digest("hex");
}
