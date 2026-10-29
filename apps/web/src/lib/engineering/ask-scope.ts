export const ASK_SCOPE_ALL = "all_engineering";
export const ASK_SCOPE_PROJECT = "project";
export const ASK_SCOPE_ASSET = "asset";
export const ASK_SCOPE_DOCUMENT = "document";

export type AskScopeId =
  | typeof ASK_SCOPE_ALL
  | typeof ASK_SCOPE_PROJECT
  | typeof ASK_SCOPE_ASSET
  | typeof ASK_SCOPE_DOCUMENT;

export function normalizeAskScope(scope: string | null | undefined): AskScopeId | null {
  if (scope === ASK_SCOPE_ALL || scope === "workspace") return ASK_SCOPE_ALL;
  if (scope === ASK_SCOPE_PROJECT || scope === ASK_SCOPE_ASSET || scope === ASK_SCOPE_DOCUMENT) return scope;
  return null;
}

/**
 * The project filter may hydrate an empty Ask page into Current Project.
 * It must not overwrite an explicit All Engineering selection.
 */
export function projectFilterScopeDecision(input: {
  scope: string;
  userChoseScope: boolean;
  projectFromFilter: string | null;
  contextProjectId: string | null;
}): { restoreProjectId: string | null; forceProjectScope: boolean } {
  const selected = normalizeAskScope(input.scope);
  if (input.userChoseScope && selected === ASK_SCOPE_ALL) {
    return { restoreProjectId: null, forceProjectScope: false };
  }
  if (input.projectFromFilter && !input.contextProjectId && selected !== ASK_SCOPE_ASSET && selected !== ASK_SCOPE_DOCUMENT) {
    return {
      restoreProjectId: input.projectFromFilter,
      forceProjectScope: selected === ASK_SCOPE_ALL || selected === null,
    };
  }
  return { restoreProjectId: null, forceProjectScope: false };
}

export function askRequestBody(input: {
  scope: AskScopeId;
  message: string;
  projectId?: string | null;
  assetId?: string | null;
  documentId?: string | null;
}): {
  message: string;
  scope: AskScopeId;
  projectId?: string;
  assetId?: string;
  documentId?: string;
  objectType?: string;
  objectId?: string;
} {
  if (input.scope === ASK_SCOPE_ALL) {
    return { message: input.message, scope: ASK_SCOPE_ALL };
  }
  if (input.scope === ASK_SCOPE_PROJECT) {
    return {
      message: input.message,
      scope: ASK_SCOPE_PROJECT,
      projectId: input.projectId || undefined,
      objectType: input.projectId ? "project" : undefined,
      objectId: input.projectId || undefined,
    };
  }
  if (input.scope === ASK_SCOPE_ASSET) {
    return {
      message: input.message,
      scope: ASK_SCOPE_ASSET,
      assetId: input.assetId || undefined,
      objectType: input.assetId ? "asset" : undefined,
      objectId: input.assetId || undefined,
    };
  }
  return {
    message: input.message,
    scope: ASK_SCOPE_DOCUMENT,
    documentId: input.documentId || undefined,
    objectType: input.documentId ? "document" : undefined,
    objectId: input.documentId || undefined,
  };
}
