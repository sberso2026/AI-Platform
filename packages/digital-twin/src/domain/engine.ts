/**
 * Phase 12B — Digital Twin engine facade.
 *
 * Orchestrates identity review workflow with core engine operations.
 */

import type { EngineeringWorkflowInstance } from "@rtb/engineering-os";
import { assertOwnershipLock } from "../architecture/ownership-lock";
import type { DigitalTwinRepositoryPort, TwinReviewRecord } from "./persistence";
import {
  assertIdentityPublishable,
  startIdentityReview,
  transitionIdentityReview,
  type IdentityReviewAction,
  type IdentityReviewTargetState,
} from "./review-workflow";
import {
  createDigitalTwinCoreEngine,
  type AddRelationshipInput,
  type AddThreadLinkInput,
  type AttachRepresentationInput,
  type CreateTwinIdentityInput,
  type DigitalTwinCoreEngine,
  type TwinLookupResult,
} from "./twin-engine";

export type DigitalTwinEngineDeps = {
  repository: DigitalTwinRepositoryPort;
  newId?: (prefix: string) => string;
};

export class DigitalTwinEngine {
  readonly kind = "digital_twin_engine" as const;
  private readonly core: DigitalTwinCoreEngine;
  private readonly repository: DigitalTwinRepositoryPort;
  private readonly newId: (prefix: string) => string;

  constructor(deps: DigitalTwinEngineDeps) {
    assertOwnershipLock();
    this.repository = deps.repository;
    this.newId = deps.newId ?? deps.repository.newId.bind(deps.repository);
    this.core = createDigitalTwinCoreEngine({ repository: deps.repository, newId: this.newId });
  }

  createIdentity(input: CreateTwinIdentityInput) {
    return this.core.createIdentity(input);
  }

  updateIdentity(input: Parameters<DigitalTwinCoreEngine["updateIdentity"]>[0]) {
    return this.core.updateIdentity(input);
  }

  attachRepresentation(input: AttachRepresentationInput) {
    return this.core.attachRepresentation(input);
  }

  addRelationship(input: AddRelationshipInput) {
    return this.core.addRelationship(input);
  }

  addThreadLink(input: AddThreadLinkInput) {
    return this.core.addThreadLink(input);
  }

  getLookup(tenantId: string, workspaceId: string, twinId: string): Promise<TwinLookupResult> {
    return this.core.getLookup(tenantId, workspaceId, twinId);
  }

  getByTarget(
    tenantId: string,
    workspaceId: string,
    canonicalEntityType: CreateTwinIdentityInput["canonicalEntityType"],
    canonicalEntityId: string,
  ): Promise<TwinLookupResult | null> {
    return this.core.getByTarget(tenantId, workspaceId, canonicalEntityType, canonicalEntityId);
  }

  async startReview(input: {
    tenantId: string;
    workspaceId: string;
    twinId: string;
    startedBy?: string;
  }): Promise<{ instance: EngineeringWorkflowInstance; review: TwinReviewRecord }> {
    await this.core.getLookup(input.tenantId, input.workspaceId, input.twinId);
    const { instance, review } = startIdentityReview(input);
    const record: TwinReviewRecord = {
      reviewId: this.newId("dtrev"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      workflowInstanceId: instance.instanceId,
      workflowState: instance.state,
      createdAt: new Date().toISOString(),
      selfApproved: false,
    };
    await this.repository.saveReview(record);
    return { instance, review: record };
  }

  async transitionReview(input: {
    tenantId: string;
    workspaceId: string;
    twinId: string;
    instance: EngineeringWorkflowInstance;
    action: IdentityReviewAction;
    to: IdentityReviewTargetState;
    reviewerId?: string;
    assessedBy?: string;
  }): Promise<EngineeringWorkflowInstance> {
    if (input.to === "published") {
      assertIdentityPublishable({
        workflowState: input.instance.state,
        reviewerId: input.reviewerId,
        createdBy: input.assessedBy,
      });
    }
    const transitioned = transitionIdentityReview({
      instance: input.instance,
      action: input.action,
      to: input.to,
    });
    await this.repository.saveReview({
      reviewId: this.newId("dtrev"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      workflowInstanceId: transitioned.instanceId,
      workflowState: transitioned.state,
      reviewerId: input.reviewerId,
      outcome:
        input.to === "approved" || input.to === "rejected" || input.to === "changes_requested"
          ? input.to
          : undefined,
      createdAt: new Date().toISOString(),
      selfApproved: false,
    });
    if (input.to === "published") {
      await this.core.updateIdentity({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        twinId: input.twinId,
        status: "published",
      });
    }
    return transitioned;
  }
}

export function createDigitalTwinEngine(deps: DigitalTwinEngineDeps): DigitalTwinEngine {
  return new DigitalTwinEngine(deps);
}

export type { CreateTwinIdentityInput, AttachRepresentationInput, AddRelationshipInput, AddThreadLinkInput, TwinLookupResult };
