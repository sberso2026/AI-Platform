/**
 * Phase 12B — Digital Twin core engine.
 *
 * Create/update identity, attach representation, add relationship, add thread link,
 * get lookups. Fail closed on missing scope; forbid runtime/telemetry/sim/viewer/actuation.
 */

import { assertOwnershipLock } from "../architecture/ownership-lock";
import {
  DIGITAL_TWIN_RUNTIME_IMPLEMENTED,
  LIVE_TELEMETRY_IMPLEMENTED,
  PHYSICAL_ACTUATION_ENABLED,
  SIMULATION_EXECUTION_IMPLEMENTED,
  THREE_D_VIEWER_IMPLEMENTED,
} from "../version";
import {
  createDigitalTwinEvent,
  relationshipUpdatedEventPayload,
  representationUpdatedEventPayload,
  twinCreatedEventPayload,
  twinUpdatedEventPayload,
} from "./events";
import {
  assertNoDuplicatedIdentityFields,
  type CanonicalEntityType,
  type TwinIdentity,
  type TwinStatus,
  type TwinType,
} from "./identity";
import type { DigitalTwinRepositoryPort } from "./persistence";
import type { RepresentationType, TwinRepresentationReference } from "./representation";
import type { TwinRelationship, TwinRelationshipType } from "./relationships";
import type { DigitalThreadLink, ThreadLinkTargetType } from "./thread";
import type { FidelityLevel } from "./fidelity-model";

export type CreateTwinIdentityInput = {
  tenantId: string;
  workspaceId: string;
  canonicalEntityType: CanonicalEntityType;
  canonicalEntityId: string;
  twinType?: TwinType;
  kernelTwinId?: string;
  createdBy?: string;
  status?: TwinStatus;
};

export type AttachRepresentationInput = {
  tenantId: string;
  workspaceId: string;
  twinId: string;
  representationType: RepresentationType;
  sourceRef: string;
  version: string;
  fidelityLevel: FidelityLevel;
  coordinateSystem?: string;
  units?: string;
  createdBy?: string;
};

export type AddRelationshipInput = {
  tenantId: string;
  workspaceId: string;
  twinId: string;
  relationshipType: TwinRelationshipType;
  targetRef: string;
  targetKind: TwinRelationship["targetKind"];
  createdBy?: string;
};

export type AddThreadLinkInput = {
  tenantId: string;
  workspaceId: string;
  twinId: string;
  targetType: ThreadLinkTargetType;
  targetRef: string;
  platformTimelineRef?: DigitalThreadLink["platformTimelineRef"];
  label?: string;
  createdBy?: string;
};

export type TwinLookupResult = {
  identity: TwinIdentity;
  representations: TwinRepresentationReference[];
  relationships: TwinRelationship[];
  threadLinks: DigitalThreadLink[];
};

export type DigitalTwinEngineDeps = {
  repository: DigitalTwinRepositoryPort;
  newId?: (prefix: string) => string;
};

export class DigitalTwinCoreEngine {
  readonly kind = "digital_twin_core_engine" as const;
  private readonly repository: DigitalTwinRepositoryPort;
  private readonly newId: (prefix: string) => string;

  constructor(deps: DigitalTwinEngineDeps) {
    assertCoreForbiddenCapabilities();
    assertOwnershipLock();
    this.repository = deps.repository;
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  async createIdentity(input: CreateTwinIdentityInput): Promise<TwinIdentity> {
    assertScope(input.tenantId, input.workspaceId);
    assertNoDuplicatedIdentityFields(input as unknown as Record<string, unknown>);

    const existing = await this.repository.getIdentityByTarget(
      input.tenantId,
      input.workspaceId,
      input.canonicalEntityType,
      input.canonicalEntityId,
    );
    if (existing) {
      throw new Error("twin_identity_already_exists_for_target");
    }

    const now = new Date().toISOString();
    const twinId = this.newId("dtwin");
    const identity: TwinIdentity = {
      twinId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      target: {
        canonicalEntityType: input.canonicalEntityType,
        canonicalEntityId: input.canonicalEntityId,
      },
      twinType: input.twinType ?? "reference",
      version: { twinVersion: 1, configurationVersion: 1 },
      status: input.status ?? "draft",
      kernelTwinId: input.kernelTwinId,
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
      mutatesCanonicalIdentity: false,
      duplicatesAssetFields: false,
      liveTelemetryBound: false,
      simulationExecuted: false,
      runtimeSyncEnabled: false,
      physicalActuationEnabled: false,
    };

    await this.repository.saveIdentity(identity);
    await this.repository.enqueueOutbox({
      outboxId: this.newId("dtout"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId,
      eventType: "engineering.digital_twin.created",
      payload: twinCreatedEventPayload(identity),
      published: false,
      createdAt: now,
    });
    return identity;
  }

  async updateIdentity(input: {
    tenantId: string;
    workspaceId: string;
    twinId: string;
    status?: TwinStatus;
    twinType?: TwinType;
    configurationVersion?: number;
  }): Promise<TwinIdentity> {
    assertScope(input.tenantId, input.workspaceId);
    const existing = await this.requireIdentity(input.tenantId, input.workspaceId, input.twinId);
    const now = new Date().toISOString();
    const updated: TwinIdentity = {
      ...existing,
      status: input.status ?? existing.status,
      twinType: input.twinType ?? existing.twinType,
      version: {
        twinVersion: existing.version.twinVersion + 1,
        configurationVersion:
          input.configurationVersion ?? existing.version.configurationVersion + 1,
      },
      updatedAt: now,
    };
    await this.repository.saveIdentity(updated);
    await this.repository.enqueueOutbox({
      outboxId: this.newId("dtout"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      eventType: "engineering.digital_twin.updated",
      payload: twinUpdatedEventPayload(updated),
      published: false,
      createdAt: now,
    });
    return updated;
  }

  async attachRepresentation(input: AttachRepresentationInput): Promise<TwinRepresentationReference> {
    assertScope(input.tenantId, input.workspaceId);
    await this.requireIdentity(input.tenantId, input.workspaceId, input.twinId);
    const now = new Date().toISOString();
    const representation: TwinRepresentationReference = {
      representationId: this.newId("dtrep"),
      twinId: input.twinId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      representationType: input.representationType,
      sourceRef: input.sourceRef,
      version: input.version,
      fidelityLevel: input.fidelityLevel,
      coordinateSystem: input.coordinateSystem,
      units: input.units,
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
      storesGeometryPayload: false,
      viewerEnabled: false,
      liveTelemetryBound: false,
    };
    await this.repository.saveRepresentation(representation);
    await this.repository.enqueueOutbox({
      outboxId: this.newId("dtout"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      eventType: "engineering.digital_twin.representation.updated",
      payload: representationUpdatedEventPayload(representation),
      published: false,
      createdAt: now,
    });
    return representation;
  }

  async addRelationship(input: AddRelationshipInput): Promise<TwinRelationship> {
    assertScope(input.tenantId, input.workspaceId);
    await this.requireIdentity(input.tenantId, input.workspaceId, input.twinId);
    const now = new Date().toISOString();
    const relationship: TwinRelationship = {
      relationshipId: this.newId("dtrel"),
      twinId: input.twinId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      relationshipType: input.relationshipType,
      targetRef: input.targetRef,
      targetKind: input.targetKind,
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
      knowledgeGraphReuse: true,
      newGraphEngineIntroduced: false,
    };
    await this.repository.saveRelationship(relationship);
    await this.repository.enqueueOutbox({
      outboxId: this.newId("dtout"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      eventType: "engineering.digital_twin.relationship.updated",
      payload: relationshipUpdatedEventPayload(relationship),
      published: false,
      createdAt: now,
    });
    return relationship;
  }

  async addThreadLink(input: AddThreadLinkInput): Promise<DigitalThreadLink> {
    assertScope(input.tenantId, input.workspaceId);
    await this.requireIdentity(input.tenantId, input.workspaceId, input.twinId);
    const now = new Date().toISOString();
    const link: DigitalThreadLink = {
      linkId: this.newId("dtlnk"),
      twinId: input.twinId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      targetType: input.targetType,
      targetRef: input.targetRef,
      platformTimelineRef: input.platformTimelineRef,
      label: input.label,
      recordedAt: now,
      createdBy: input.createdBy,
      duplicatesTimelineStorage: false,
    };
    await this.repository.saveThreadLink(link);
    return link;
  }

  async getLookup(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<TwinLookupResult> {
    assertScope(tenantId, workspaceId);
    const identity = await this.requireIdentity(tenantId, workspaceId, twinId);
    const [representations, relationships, threadLinks] = await Promise.all([
      this.repository.listRepresentations(tenantId, workspaceId, twinId),
      this.repository.listRelationships(tenantId, workspaceId, twinId),
      this.repository.listThreadLinks(tenantId, workspaceId, twinId),
    ]);
    return { identity, representations, relationships, threadLinks };
  }

  async getByTarget(
    tenantId: string,
    workspaceId: string,
    canonicalEntityType: CanonicalEntityType,
    canonicalEntityId: string,
  ): Promise<TwinLookupResult | null> {
    assertScope(tenantId, workspaceId);
    const identity = await this.repository.getIdentityByTarget(
      tenantId,
      workspaceId,
      canonicalEntityType,
      canonicalEntityId,
    );
    if (!identity) return null;
    return this.getLookup(tenantId, workspaceId, identity.twinId);
  }

  private async requireIdentity(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<TwinIdentity> {
    const identity = await this.repository.getIdentityById(tenantId, workspaceId, twinId);
    if (!identity) throw new Error("twin_identity_not_found");
    return identity;
  }
}

export function createDigitalTwinCoreEngine(deps: DigitalTwinEngineDeps): DigitalTwinCoreEngine {
  return new DigitalTwinCoreEngine(deps);
}

export function assertCoreForbiddenCapabilities(): {
  ok: true;
  runtimeImplemented: false;
  liveTelemetryImplemented: false;
  simulationImplemented: false;
  threeDViewerImplemented: false;
  physicalActuationEnabled: false;
} {
  if (DIGITAL_TWIN_RUNTIME_IMPLEMENTED) {
    throw new Error("digital_twin_runtime_forbidden_in_phase_12c");
  }
  if (LIVE_TELEMETRY_IMPLEMENTED) {
    throw new Error("live_telemetry_forbidden_in_phase_12c");
  }
  if (SIMULATION_EXECUTION_IMPLEMENTED) {
    throw new Error("simulation_execution_forbidden_in_phase_12c");
  }
  if (THREE_D_VIEWER_IMPLEMENTED) {
    throw new Error("three_d_viewer_forbidden_in_phase_12c");
  }
  if (PHYSICAL_ACTUATION_ENABLED) {
    throw new Error("physical_actuation_forbidden_in_phase_12c");
  }
  return {
    ok: true,
    runtimeImplemented: false,
    liveTelemetryImplemented: false,
    simulationImplemented: false,
    threeDViewerImplemented: false,
    physicalActuationEnabled: false,
  };
}

function assertScope(tenantId: string, workspaceId: string): void {
  if (!tenantId || !workspaceId) {
    throw new Error("tenant_and_workspace_required");
  }
}
