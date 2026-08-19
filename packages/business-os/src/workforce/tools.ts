import {
  BUSINESS_WORKFORCE_FORBIDDEN_TOOLS,
  BUSINESS_WORKFORCE_READ_TOOLS,
} from "@rtb/types";

export const WRITE_SIDE_EFFECT_TOOLS = BUSINESS_WORKFORCE_FORBIDDEN_TOOLS;

export function isReadTool(toolId: string): boolean {
  return (BUSINESS_WORKFORCE_READ_TOOLS as readonly string[]).includes(toolId);
}

export function isForbiddenTool(toolId: string): boolean {
  return (BUSINESS_WORKFORCE_FORBIDDEN_TOOLS as readonly string[]).includes(toolId) ||
    toolId.startsWith("direct.") ||
    (toolId.includes("provider") && toolId.includes("model"));
}

export function assertToolAllowlisted(toolId: string, allowlist: readonly string[]): void {
  if (isForbiddenTool(toolId)) throw new Error("forbidden_tool");
  if (!allowlist.includes(toolId)) throw new Error("tool_not_allowlisted");
  if (!isReadTool(toolId)) throw new Error("canonical_domain_mutation_forbidden");
}

export function trimToolAllowlist(
  from: readonly string[],
  to: readonly string[],
): string[] {
  return from.filter((tool) => to.includes(tool) && isReadTool(tool) && !isForbiddenTool(tool));
}
