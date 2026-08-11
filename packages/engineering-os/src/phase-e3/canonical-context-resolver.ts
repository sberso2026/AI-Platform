/**
 * EngineeringContextResolver — bounded, authorised context assembly.
 * Failure must degrade safely to E2 retrieval (caller responsibility).
 */

import type { EngineeringExperienceContext } from "../phase-e1/contracts";
import {
  deriveFromObjectLinks,
  deriveRecordRelationships,
  toObjectReference,
  type DomainLinkHint,
  type DomainRecordHint,
} from "./canonical-context-assembler";
import type {
  EngineeringContextAmbiguity,
  EngineeringContextBundle,
  EngineeringContextConflict,
  EngineeringContextState,
  EngineeringObjectReference,
  EngineeringRelationship,
  ExternalIdentityMapping,
} from "./contracts";

export type AuthorisationGate = {
  tenantId: string;
  workspaceId?: string | null;
  /** Returns true if the subject may see this object. */
  canAccessObject: (ref: {
    objectType: string;
    objectId: string;
    tenantId: string;
    workspaceId?: string | null;
    projectId?: string | null;
  }) => boolean;
};

export type ContextResolverInput = {
  experience: EngineeringExperienceContext;
  query?: string;
  explicitObject?: { objectType: string; objectId: string } | null;
  scope?: {
    projectId?: string | null;
    maxRelatedObjects?: number;
    maxRelationships?: number;
    maxDepth?: number;
  };
};

export type ContextDomainProvider = {
  getRecord: (
    objectType: string,
    objectId: string,
  ) => DomainRecordHint | null | Promise<DomainRecordHint | null>;
  listProjectMembers?: (
    projectId: string,
  ) => DomainRecordHint[] | Promise<DomainRecordHint[]>;
  listObjectLinks?: (
    objectType: string,
    objectId: string,
  ) => DomainLinkHint[] | Promise<DomainLinkHint[]>;
  listMappingsForObject?: (
    objectType: string,
    objectId: string,
  ) => ExternalIdentityMapping[] | Promise<ExternalIdentityMapping[]>;
};

const DEFAULT_LIMITS: {
  maxRelatedObjects: number;
  maxRelationships: number;
  maxDepth: number;
} = {
  maxRelatedObjects: 40,
  maxRelationships: 80,
  maxDepth: 2,
};

function endpointKey(t: string, id: string) {
  return `${t.toUpperCase()}:${id}`;
}

export class EngineeringContextResolver {
  constructor(
    private readonly provider: ContextDomainProvider,
    private readonly auth: AuthorisationGate,
  ) {}

  async resolve(input: ContextResolverInput): Promise<EngineeringContextBundle> {
    const started = Date.now();
    const limits = {
      maxRelatedObjects:
        input.scope?.maxRelatedObjects ?? DEFAULT_LIMITS.maxRelatedObjects,
      maxRelationships:
        input.scope?.maxRelationships ?? DEFAULT_LIMITS.maxRelationships,
      maxDepth: input.scope?.maxDepth ?? DEFAULT_LIMITS.maxDepth,
    };

    const ambiguities: EngineeringContextAmbiguity[] = [];
    const conflicts: EngineeringContextConflict[] = [];
    const primaryObjects: EngineeringObjectReference[] = [];
    const relatedObjects: EngineeringObjectReference[] = [];
    const relationships: EngineeringRelationship[] = [];
    const evidenceReferences: string[] = [];
    const externalMappings: ExternalIdentityMapping[] = [];
    const seenObjects = new Set<string>();
    let relationshipsTraversed = 0;
    let objectsLoaded = 0;

    const experience = input.experience;
    if (
      !experience.tenantId ||
      experience.tenantId !== this.auth.tenantId
    ) {
      return this.emptyBundle("INSUFFICIENT", limits, started, {
        ambiguities: [
          {
            code: "tenant_mismatch",
            message: "Experience tenant does not match authorised tenant",
          },
        ],
      });
    }

    const explicit =
      input.explicitObject ??
      (experience.objectType && experience.objectId
        ? { objectType: experience.objectType, objectId: experience.objectId }
        : null);
    const projectId =
      input.scope?.projectId ?? experience.projectId ?? null;

    // 2. Resolve explicit object
    if (explicit?.objectType && explicit?.objectId) {
      const rec = await this.provider.getRecord(
        explicit.objectType,
        explicit.objectId,
      );
      if (!rec) {
        ambiguities.push({
          code: "explicit_object_missing",
          message: `No authorised record for ${explicit.objectType}:${explicit.objectId}`,
          objectIds: [explicit.objectId],
        });
      } else if (
        !this.auth.canAccessObject({
          objectType: rec.objectType,
          objectId: rec.objectId,
          tenantId: rec.tenantId,
          workspaceId: rec.workspaceId,
          projectId: rec.projectId,
        })
      ) {
        // Do not disclose existence.
        ambiguities.push({
          code: "explicit_object_unavailable",
          message: "Requested object is not available in this context",
        });
      } else if (rec.tenantId !== this.auth.tenantId) {
        ambiguities.push({
          code: "cross_tenant_blocked",
          message: "Cross-tenant object access blocked",
        });
      } else {
        const ref = toObjectReference(rec);
        primaryObjects.push(ref);
        seenObjects.add(endpointKey(ref.objectType, ref.objectId));
        objectsLoaded += 1;
        await this.ingestRecord(
          rec,
          {
            relatedObjects,
            relationships,
            externalMappings,
            conflicts,
            seenObjects,
            evidenceReferences,
            limits,
            depth: 0,
          },
        );
        relationshipsTraversed = relationships.length;
        objectsLoaded = seenObjects.size;
      }
    }

    // 3. Active project context
    let project: EngineeringObjectReference | null = null;
    if (projectId) {
      const proj = await this.provider.getRecord("PROJECT", projectId);
      if (
        proj &&
        proj.tenantId === this.auth.tenantId &&
        this.auth.canAccessObject({
          objectType: proj.objectType,
          objectId: proj.objectId,
          tenantId: proj.tenantId,
          workspaceId: proj.workspaceId,
          projectId: proj.objectId,
        })
      ) {
        project = toObjectReference(proj);
        if (!seenObjects.has(endpointKey("PROJECT", projectId))) {
          if (primaryObjects.length === 0) {
            primaryObjects.push(project);
          }
          seenObjects.add(endpointKey("PROJECT", projectId));
          objectsLoaded += 1;
        }

        // Bounded project membership — never whole-project dump beyond limits.
        if (this.provider.listProjectMembers) {
          const members = await this.provider.listProjectMembers(projectId);
          for (const member of members) {
            if (relatedObjects.length >= limits.maxRelatedObjects) break;
            if (relationships.length >= limits.maxRelationships) break;
            if (
              !this.auth.canAccessObject({
                objectType: member.objectType,
                objectId: member.objectId,
                tenantId: member.tenantId,
                workspaceId: member.workspaceId,
                projectId: member.projectId,
              })
            ) {
              // Silent filter — no "N hidden" disclosure.
              continue;
            }
            if (member.tenantId !== this.auth.tenantId) continue;
            await this.ingestRecord(member, {
              relatedObjects,
              relationships,
              externalMappings,
              conflicts,
              seenObjects,
              evidenceReferences,
              limits,
              depth: 1,
              asRelated: true,
            });
          }
        }
      } else if (projectId && !proj) {
        ambiguities.push({
          code: "project_unavailable",
          message: "Active project could not be resolved",
        });
      }
    }

    if (
      primaryObjects.length === 0 &&
      relatedObjects.length === 0 &&
      !project
    ) {
      return this.emptyBundle(
        ambiguities.length ? "AMBIGUOUS" : "INSUFFICIENT",
        limits,
        started,
        { ambiguities, conflicts },
      );
    }

    // Deduplicate related vs primary
    const primaryKeys = new Set(
      primaryObjects.map((o) => endpointKey(o.objectType, o.objectId)),
    );
    const filteredRelated = relatedObjects.filter(
      (o) => !primaryKeys.has(endpointKey(o.objectType, o.objectId)),
    );

    // Filter relationships that would reveal unauthorised endpoints
    const authorisedKeys = new Set([
      ...primaryKeys,
      ...filteredRelated.map((o) => endpointKey(o.objectType, o.objectId)),
      ...(project
        ? [endpointKey(project.objectType, project.objectId)]
        : []),
    ]);
    const safeRelationships = relationships
      .filter(
        (r) =>
          authorisedKeys.has(
            endpointKey(r.fromObject.objectType, r.fromObject.objectId),
          ) &&
          authorisedKeys.has(
            endpointKey(r.toObject.objectType, r.toObject.objectId),
          ),
      )
      .slice(0, limits.maxRelationships);

    relationshipsTraversed = safeRelationships.length;
    objectsLoaded = authorisedKeys.size;

    const contextState = this.computeState({
      primaryObjects,
      relatedObjects: filteredRelated,
      relationships: safeRelationships,
      ambiguities,
      conflicts,
      mappings: externalMappings,
    });

    return {
      primaryObjects,
      project,
      relatedObjects: filteredRelated.slice(0, limits.maxRelatedObjects),
      relationships: safeRelationships,
      evidenceReferences: [...new Set(evidenceReferences)],
      externalMappings: externalMappings.filter(
        (m) =>
          m.tenantId === this.auth.tenantId &&
          authorisedKeys.has(
            endpointKey(m.canonicalObjectType, m.canonicalObjectId),
          ),
      ),
      ambiguities,
      conflicts,
      contextState,
      generatedAt: new Date().toISOString(),
      limits,
      timingMs: {
        resolveMs: Date.now() - started,
        objectsLoaded,
        relationshipsTraversed,
      },
    };
  }

  private async ingestRecord(
    rec: DomainRecordHint,
    bag: {
      relatedObjects: EngineeringObjectReference[];
      relationships: EngineeringRelationship[];
      externalMappings: ExternalIdentityMapping[];
      conflicts: EngineeringContextConflict[];
      seenObjects: Set<string>;
      evidenceReferences: string[];
      limits: typeof DEFAULT_LIMITS;
      depth: number;
      asRelated?: boolean;
    },
  ): Promise<void> {
    const ref = toObjectReference(rec);
    const key = endpointKey(ref.objectType, ref.objectId);
    if (!bag.seenObjects.has(key)) {
      bag.seenObjects.add(key);
      if (bag.asRelated) {
        if (bag.relatedObjects.length < bag.limits.maxRelatedObjects) {
          bag.relatedObjects.push(ref);
        }
      }
    }

    for (const rel of deriveRecordRelationships(rec)) {
      if (bag.relationships.length >= bag.limits.maxRelationships) break;
      bag.relationships.push(rel);
      bag.evidenceReferences.push(rel.relationshipId);
    }

    if (this.provider.listObjectLinks && bag.depth < bag.limits.maxDepth) {
      const links = await this.provider.listObjectLinks(
        rec.objectType,
        rec.objectId,
      );
      for (const edge of deriveFromObjectLinks(
        rec.tenantId,
        rec.workspaceId,
        links,
      )) {
        if (bag.relationships.length >= bag.limits.maxRelationships) break;
        bag.relationships.push(edge);
        bag.evidenceReferences.push(edge.relationshipId);

        // Bounded one-hop load of the other endpoint
        if (bag.depth + 1 <= bag.limits.maxDepth) {
          const other =
            edge.fromObject.objectId === rec.objectId
              ? edge.toObject
              : edge.fromObject;
          const otherKey = endpointKey(other.objectType, other.objectId);
          if (!bag.seenObjects.has(otherKey)) {
            const otherRec = await this.provider.getRecord(
              other.objectType,
              other.objectId,
            );
            if (
              otherRec &&
              otherRec.tenantId === this.auth.tenantId &&
              this.auth.canAccessObject({
                objectType: otherRec.objectType,
                objectId: otherRec.objectId,
                tenantId: otherRec.tenantId,
                workspaceId: otherRec.workspaceId,
                projectId: otherRec.projectId,
              })
            ) {
              await this.ingestRecord(otherRec, {
                ...bag,
                depth: bag.depth + 1,
                asRelated: true,
              });
            }
            // Unauthorized: omit silently
          }
        }
      }
    }

    if (this.provider.listMappingsForObject) {
      const maps = await this.provider.listMappingsForObject(
        rec.objectType,
        rec.objectId,
      );
      for (const m of maps) {
        if (m.tenantId !== this.auth.tenantId) continue;
        bag.externalMappings.push(m);
        if (m.mappingStatus === "CONFLICTING") {
          bag.conflicts.push({
            code: "identity_conflict",
            message: `Conflicting external mapping ${m.mappingId}`,
            mappingIds: [m.mappingId],
          });
        }
        if (m.mappingStatus === "UNRESOLVED" || m.mappingStatus === "PROBABLE_MATCH") {
          // Surface as ambiguity, not silent merge
        }
      }
    }
  }

  private computeState(input: {
    primaryObjects: EngineeringObjectReference[];
    relatedObjects: EngineeringObjectReference[];
    relationships: EngineeringRelationship[];
    ambiguities: EngineeringContextAmbiguity[];
    conflicts: EngineeringContextConflict[];
    mappings: ExternalIdentityMapping[];
  }): EngineeringContextState {
    if (input.conflicts.length > 0) return "CONFLICTING";
    if (
      input.ambiguities.some((a) => a.code === "explicit_object_missing") &&
      input.primaryObjects.length === 0
    ) {
      return "AMBIGUOUS";
    }
    if (input.ambiguities.length > 0 && input.primaryObjects.length === 0) {
      return "AMBIGUOUS";
    }
    if (
      input.mappings.some(
        (m) =>
          m.mappingStatus === "UNRESOLVED" ||
          m.mappingStatus === "PROBABLE_MATCH",
      )
    ) {
      return input.relationships.length > 0 ? "PARTIAL" : "AMBIGUOUS";
    }
    if (input.primaryObjects.length === 0) return "INSUFFICIENT";
    if (input.relationships.length === 0 && input.relatedObjects.length === 0) {
      return "PARTIAL";
    }
    return "RESOLVED";
  }

  private emptyBundle(
    state: EngineeringContextState,
    limits: typeof DEFAULT_LIMITS,
    started: number,
    extra?: {
      ambiguities?: EngineeringContextAmbiguity[];
      conflicts?: EngineeringContextConflict[];
    },
  ): EngineeringContextBundle {
    return {
      primaryObjects: [],
      project: null,
      relatedObjects: [],
      relationships: [],
      evidenceReferences: [],
      externalMappings: [],
      ambiguities: extra?.ambiguities ?? [],
      conflicts: extra?.conflicts ?? [],
      contextState: state,
      generatedAt: new Date().toISOString(),
      limits,
      timingMs: {
        resolveMs: Date.now() - started,
        objectsLoaded: 0,
        relationshipsTraversed: 0,
      },
    };
  }
}

/**
 * Expand E2 retrieval scope from a context bundle — authorised object IDs only.
 * Never fabricates relationships; empty/failed context → no expansion.
 */
export function contextBundleToRetrievalHints(
  bundle: EngineeringContextBundle | null | undefined,
): {
  relatedObjectIds: string[];
  projectId?: string | null;
  preferredRelationshipTypes: string[];
  contextState: EngineeringContextState;
} {
  if (!bundle) {
    return {
      relatedObjectIds: [],
      preferredRelationshipTypes: [],
      contextState: "UNKNOWN",
    };
  }
  const relatedObjectIds = [
    ...bundle.primaryObjects.map((o) => o.objectId),
    ...bundle.relatedObjects.map((o) => o.objectId),
  ];
  const preferredRelationshipTypes = [
    ...new Set(bundle.relationships.map((r) => r.relationshipType)),
  ];
  return {
    relatedObjectIds,
    projectId: bundle.project?.objectId ?? null,
    preferredRelationshipTypes,
    contextState: bundle.contextState,
  };
}
