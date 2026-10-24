/**
 * Bridge: Ask → EngineeringContextResolver → enriched EngineeringSearchQuery.
 * Context failure degrades safely to the original E2 query.
 */

import { createEmptyEngineeringContext } from "../phase-e1/contracts";
import type { EngineeringSearchQuery } from "../phase-e2/contracts";
import {
  EngineeringContextResolver,
  contextBundleToRetrievalHints,
  type AuthorisationGate,
  type ContextDomainProvider,
} from "./canonical-context-resolver";
import type { EngineeringContextBundle } from "./contracts";

export type AskContextEnrichment = {
  query: EngineeringSearchQuery;
  bundle: EngineeringContextBundle | null;
  contextApplied: boolean;
  degradedToE2: boolean;
  reason?: string;
};

/**
 * Prefer explicit HAS_* relationships when the user asks for related objects.
 * Never fabricates edges — only filters existing authorised relationships.
 */
export function preferRelationshipEvidence(
  bundle: EngineeringContextBundle | null,
  queryText: string,
): string[] {
  if (!bundle) return [];
  const q = queryText.toLowerCase();
  const wanted: string[] = [];
  if (/\bactions(s)?\b/.test(q)) wanted.push("HAS_ACTION", "RESULTED_IN");
  if (/\bdecision(s)?\b/.test(q)) wanted.push("HAS_DECISION");
  if (/\brisk(s)?\b/.test(q)) wanted.push("HAS_RISK");
  if (/\bissue(s)?\b/.test(q)) wanted.push("HAS_ISSUE");
  if (/\b(tq|technical query)/.test(q)) wanted.push("HAS_TECHNICAL_QUERY");
  if (/\bdocument(s)?\b/.test(q)) wanted.push("HAS_DOCUMENT", "REFERENCES");
  if (/\basset(s)?\b/.test(q)) wanted.push("HAS_ASSET");
  if (wanted.length === 0) {
    return contextBundleToRetrievalHints(bundle).relatedObjectIds;
  }
  const ids = new Set<string>();
  for (const rel of bundle.relationships) {
    if (rel.status === "INFERRED") continue; // never treat inferred as confirmed expansion authority alone
    if (!wanted.includes(String(rel.relationshipType))) continue;
    ids.add(rel.fromObject.objectId);
    ids.add(rel.toObject.objectId);
  }
  // Always include primary objects
  for (const p of bundle.primaryObjects) ids.add(p.objectId);
  return [...ids];
}

export async function enrichAskQueryWithContext(input: {
  query: EngineeringSearchQuery;
  provider?: ContextDomainProvider | null;
  auth?: AuthorisationGate | null;
}): Promise<AskContextEnrichment> {
  if (!input.provider || !input.auth) {
    return {
      query: input.query,
      bundle: null,
      contextApplied: false,
      degradedToE2: true,
      reason: "context_provider_unavailable",
    };
  }

  try {
    const resolver = new EngineeringContextResolver(input.provider, input.auth);
    const experience = createEmptyEngineeringContext({
      tenantId: input.query.tenantId,
      workspaceId: input.query.workspaceId ?? null,
      userId: input.query.userId,
      roleSlug: input.query.roleSlug ?? null,
      projectId: input.query.projectId ?? null,
      objectType: (input.query.objectType as never) ?? null,
      objectId: input.query.objectId ?? null,
      route: "/engineering/ask",
      activeCapability: "ai_assistant",
    });

    const bundle = await resolver.resolve({
      experience,
      query: input.query.query,
      explicitObject:
        input.query.objectType && input.query.objectId
          ? {
              objectType: input.query.objectType,
              objectId: input.query.objectId,
            }
          : null,
      scope: {
        projectId: input.query.projectId,
        maxDepth: 2,
        maxRelatedObjects: 40,
        maxRelationships: 80,
      },
    });

    const hints = contextBundleToRetrievalHints(bundle);
    const relatedObjectIds = preferRelationshipEvidence(bundle, input.query.query);

    const enriched: EngineeringSearchQuery = {
      ...input.query,
      projectId: input.query.projectId ?? hints.projectId ?? null,
      relatedObjectIds:
        relatedObjectIds.length > 0 ? relatedObjectIds : hints.relatedObjectIds,
      preferredRelationshipTypes: hints.preferredRelationshipTypes,
      contextState: hints.contextState,
    };

    return {
      query: enriched,
      bundle,
      contextApplied: true,
      degradedToE2: false,
    };
  } catch (err) {
    return {
      query: input.query,
      bundle: null,
      contextApplied: false,
      degradedToE2: true,
      reason: err instanceof Error ? err.message : "context_resolve_failed",
    };
  }
}

/**
 * Re-rank E2 evidence to prefer authorised context-related object IDs.
 * Does not invent evidence rows.
 */
export function boostEvidenceByContextRelatedIds<
  T extends { canonicalObjectId: string; retrievalScore?: number },
>(evidence: T[], relatedObjectIds: string[] | undefined): T[] {
  if (!relatedObjectIds?.length) return evidence;
  const boost = new Set(relatedObjectIds);
  return [...evidence].sort((a, b) => {
    const aHit = boost.has(a.canonicalObjectId) ? 1 : 0;
    const bHit = boost.has(b.canonicalObjectId) ? 1 : 0;
    if (aHit !== bHit) return bHit - aHit;
    return (b.retrievalScore ?? 0) - (a.retrievalScore ?? 0);
  });
}
