import type { CommerceExecutionContext } from "@rtb/types";

/** Active workspace from the verified commerce context. No tenant-wide fallback. */
export function workspaceScopeId(commerce: CommerceExecutionContext): string | null {
  const id = commerce.workspaceId?.trim();
  return id ? id : null;
}

export function isRecordInWorkspace(
  recordWorkspaceId: string | null | undefined,
  commerce: CommerceExecutionContext,
): boolean {
  const scope = workspaceScopeId(commerce);
  return Boolean(scope && recordWorkspaceId === scope);
}
