import {
  BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
  type BusinessContextNodeIdentity,
  type BusinessContextNodeType,
  type BusinessContextSourceDomain,
} from "@rtb/types";

export function canonicalRef(input: {
  tenantId: string;
  workspaceId: string;
  entityType: BusinessContextNodeType;
  entityId: string;
}): string {
  if (!input.tenantId || !input.workspaceId) throw new Error("workspace_not_assigned");
  if (input.tenantId.includes(":") || input.workspaceId.includes(":") || input.entityId.includes(":")) {
    throw new Error("invalid_graph_identity");
  }
  return [
    "bos",
    BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
    input.tenantId,
    input.workspaceId,
    input.entityType,
    input.entityId,
  ].join(":");
}

export function parseCanonicalRef(ref: string): {
  ontologyVersion: string;
  tenantId: string;
  workspaceId: string;
  entityType: BusinessContextNodeType;
  entityId: string;
} | null {
  const parts = ref.split(":");
  if (parts.length !== 6 || parts[0] !== "bos") return null;
  return {
    ontologyVersion: parts[1],
    tenantId: parts[2],
    workspaceId: parts[3],
    entityType: parts[4] as BusinessContextNodeType,
    entityId: parts[5],
  };
}

export function assertSameTenant(scopeTenantId: string, identityTenantId: string): void {
  if (scopeTenantId !== identityTenantId) throw new Error("cross_tenant_graph_forbidden");
}

export function assertSameWorkspace(scopeWorkspaceId: string, identityWorkspaceId: string): void {
  if (scopeWorkspaceId !== identityWorkspaceId) throw new Error("cross_workspace_graph_forbidden");
}

export function buildIdentity(input: {
  tenantId: string;
  workspaceId: string;
  domain: BusinessContextSourceDomain;
  entityType: BusinessContextNodeType;
  entityId: string;
  displayName: string;
  sourceType: string;
  sourceRef?: string | null;
  classification?: string | null;
  effectiveAt: string;
  suppressed?: boolean;
  deleted?: boolean;
}): BusinessContextNodeIdentity {
  return {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    domain: input.domain,
    entityType: input.entityType,
    entityId: input.entityId,
    canonicalRef: canonicalRef(input),
    displayName: input.displayName,
    sourceType: input.sourceType,
    sourceRef: input.sourceRef ?? null,
    classification: input.classification ?? null,
    ontologyVersion: BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
    effectiveAt: input.effectiveAt,
    suppressed: input.suppressed ?? false,
    deleted: input.deleted ?? false,
  };
}

export const SUPPRESSED_CONTACT_LABEL = "Contact (suppressed)";

export function isSuppressedContact(input: { suppressed?: boolean; entityType?: string }): boolean {
  return Boolean(input.suppressed) && input.entityType === "contact";
}

export function redactSuppressedContactContent(
  identity: BusinessContextNodeIdentity,
): Record<string, unknown> {
  if (!isSuppressedContact(identity)) {
    return { ...identity, personalFieldsSuppressed: false };
  }
  return {
    ...identity,
    displayName: SUPPRESSED_CONTACT_LABEL,
    sourceRef: null,
    personalFieldsSuppressed: true,
  };
}

/** True when suppressed-contact content still holds a personal display name. Does not repair. */
export function suppressedContactLeaks(content: Record<string, unknown>): boolean {
  if (!isSuppressedContact({ suppressed: Boolean(content.suppressed), entityType: String(content.entityType ?? "") })) {
    return false;
  }
  const displayName = String(content.displayName ?? "");
  return displayName.length > 0 && displayName !== SUPPRESSED_CONTACT_LABEL;
}

export function identityFromContent(
  content: Record<string, unknown>,
  fallbackTitle: string,
): BusinessContextNodeIdentity | null {
  const tenantId = String(content.tenantId ?? "");
  const workspaceId = String(content.workspaceId ?? "");
  const entityType = content.entityType as BusinessContextNodeType | undefined;
  const entityId = String(content.entityId ?? "");
  if (!tenantId || !workspaceId || !entityType || !entityId) return null;
  const suppressed = Boolean(content.suppressed);
  const contactSuppressed = isSuppressedContact({ suppressed, entityType });
  return {
    tenantId,
    workspaceId,
    domain: (content.domain as BusinessContextSourceDomain) ?? "platform",
    entityType,
    entityId,
    canonicalRef: String(content.canonicalRef ?? canonicalRef({ tenantId, workspaceId, entityType, entityId })),
    displayName: contactSuppressed ? SUPPRESSED_CONTACT_LABEL : String(content.displayName ?? fallbackTitle),
    sourceType: String(content.sourceType ?? "unknown"),
    sourceRef: contactSuppressed ? null : ((content.sourceRef as string | null | undefined) ?? null),
    classification: (content.classification as string | null | undefined) ?? null,
    ontologyVersion: BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
    effectiveAt: String(content.effectiveAt ?? content.freshness ?? new Date(0).toISOString()),
    suppressed,
    deleted: Boolean(content.deleted),
  };
}
