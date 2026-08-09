/**
 * Phase 13B — EngineeringModelFederationService.
 *
 * Federates IFC models into references/elements/mappings without claiming
 * source-model ownership or enabling solver execution / mutation.
 */

import { randomUUID } from "node:crypto";
import {
  ANALYSIS_MODEL_GENERATION_IMPLEMENTED,
  FULL_BIM_VIEWER_IMPLEMENTED,
  MAPPING_REVIEW_SLUG,
  MODEL_MUTATION_IMPLEMENTED,
  SOLVER_EXECUTION_IMPLEMENTED,
  SOURCE_MODEL_OWNERSHIP_PRESERVED,
} from "../version";
import type { EngineeringModelChangeImpact } from "./change-impact";
import {
  createEngineeringModelOutboxEvent,
  type EngineeringModelOutboxEvent,
} from "./events";
import { createIFCModelAdapter, parseIfcFederationContent } from "./ifc-model-adapter";
import type { EngineeringModelElementReference } from "./engineering-model-element-reference";
import type {
  EngineeringModelReference,
  EngineeringModelVersion,
} from "./engineering-model-reference";
import type {
  EngineeringModelMapping,
  EngineeringModelMappingReview,
} from "./mappings";
import { assertNoAiSelfApproval } from "./mappings";
import type { EngineeringModelRepositoryPort } from "./persistence";
import {
  assertIfcImportNotRtbCertified,
  trustForIfcImportedResult,
  type EngineeringAnalysisResultReference,
} from "./result-reference";

function nowIso() {
  return new Date().toISOString();
}

export type FederateIfcInput = {
  tenantId: string;
  workspaceId: string;
  locator: string;
  content: string;
  platformFileRef?: string;
  projectId?: string;
  assetId?: string;
  spatialReferenceId?: string;
  twinId?: string;
  displayName?: string;
};

export type FederateIfcResult = {
  model: EngineeringModelReference;
  version: EngineeringModelVersion;
  elements: EngineeringModelElementReference[];
  unsupportedEntityCount: number;
  events: EngineeringModelOutboxEvent[];
};

export class EngineeringModelFederationService {
  constructor(private readonly repo: EngineeringModelRepositoryPort) {}

  async federateIfc(input: FederateIfcInput): Promise<FederateIfcResult> {
    if (SOLVER_EXECUTION_IMPLEMENTED) {
      throw new Error("solver_execution_must_remain_false");
    }
    if (MODEL_MUTATION_IMPLEMENTED) {
      throw new Error("model_mutation_must_remain_false");
    }
    if (ANALYSIS_MODEL_GENERATION_IMPLEMENTED) {
      throw new Error("analysis_model_generation_must_remain_false");
    }
    if (FULL_BIM_VIEWER_IMPLEMENTED) {
      throw new Error("full_bim_viewer_must_remain_false");
    }
    if (!SOURCE_MODEL_OWNERSHIP_PRESERVED) {
      throw new Error("source_model_ownership_must_be_preserved");
    }

    const parsed = parseIfcFederationContent(input.content);
    if (!parsed.ok) {
      throw new Error(`${parsed.code}:${parsed.detail}`);
    }

    const adapter = createIFCModelAdapter({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    });
    const model = await adapter.identifyModel({
      locator: input.locator,
      content: input.content,
    });
    model.displayName = input.displayName ?? model.displayName;
    model.platformFileRef =
      input.platformFileRef ?? model.platformFileRef ?? input.locator;
    model.projectId = input.projectId;
    model.assetId = input.assetId;
    model.spatialReferenceId = input.spatialReferenceId;
    model.twinId = input.twinId;
    model.status = "federated";

    const ts = nowIso();
    const version: EngineeringModelVersion = {
      kind: "engineering_model_version",
      owner: "source_client_engineering_application",
      federationOwner: "engineering_model_interoperability",
      modelVersionId: this.repo.newId("emi_ver"),
      modelRefId: model.modelRefId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      versionLabel: parsed.schemaId,
      platformFileRef: model.platformFileRef,
      schemaId: parsed.schemaId,
      parserVersion: parsed.parser.version,
      contentSha256: parsed.contentSha256,
      elementCount: parsed.elements.length,
      ingestedAt: ts,
      createdAt: ts,
      updatedAt: ts,
    };

    const elements = (await adapter.listElements({ modelRef: model, content: input.content })).map(
      (el) => ({
        ...el,
        modelVersionId: version.modelVersionId,
      }),
    );

    await this.repo.saveModel(model);
    await this.repo.saveVersion(version);
    for (const el of elements) {
      await this.repo.saveElement(el);
    }

    const events = [
      createEngineeringModelOutboxEvent({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        eventType: "engineering.model.reference.created",
        payload: { modelRefId: model.modelRefId },
      }),
      createEngineeringModelOutboxEvent({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        eventType: "engineering.model.version.ingested",
        payload: {
          modelRefId: model.modelRefId,
          modelVersionId: version.modelVersionId,
        },
      }),
    ];
    for (const ev of events) {
      await this.repo.enqueueOutbox(ev);
    }

    return {
      model,
      version,
      elements,
      unsupportedEntityCount: parsed.unsupportedEntities.reduce(
        (n, u) => n + u.count,
        0,
      ),
      events,
    };
  }

  async proposeMapping(input: {
    tenantId: string;
    workspaceId: string;
    modelRefId: string;
    elementRefId?: string;
    targetKind: EngineeringModelMapping["targetKind"];
    candidateTargetId: string;
    notes?: string;
  }): Promise<EngineeringModelMapping> {
    const ts = nowIso();
    const mapping: EngineeringModelMapping = {
      kind: "engineering_model_mapping",
      owner: "engineering_model_interoperability",
      mappingId: this.repo.newId("emi_map"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      modelRefId: input.modelRefId,
      elementRefId: input.elementRefId,
      targetKind: input.targetKind,
      state: "candidate",
      candidateTargetId: input.candidateTargetId,
      notes: input.notes,
      aiSelfApproval: false,
      createdAt: ts,
      updatedAt: ts,
    };
    await this.repo.saveMapping(mapping);
    await this.repo.enqueueOutbox(
      createEngineeringModelOutboxEvent({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        eventType: "engineering.model.mapping.candidate",
        payload: { mappingId: mapping.mappingId, modelRefId: input.modelRefId },
      }),
    );
    return mapping;
  }

  async recordMappingReview(input: {
    tenantId: string;
    workspaceId: string;
    mappingId: string;
    decision: EngineeringModelMappingReview["decision"];
    reviewerId?: string;
    rationale?: string;
    aiSelfApproval?: boolean;
  }): Promise<{
    review: EngineeringModelMappingReview;
    mapping: EngineeringModelMapping;
  }> {
    assertNoAiSelfApproval(Boolean(input.aiSelfApproval));
    const existing = await this.repo.getMapping(
      input.tenantId,
      input.workspaceId,
      input.mappingId,
    );
    if (!existing) throw new Error("mapping_not_found");

    const ts = nowIso();
    const review: EngineeringModelMappingReview = {
      kind: "engineering_model_mapping_review",
      owner: "engineering_model_interoperability",
      reviewId: this.repo.newId("emi_rev"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      mappingId: input.mappingId,
      decision: input.decision,
      reviewerId: input.reviewerId,
      rationale: input.rationale,
      aiSelfApproval: false,
      workflowSlug: MAPPING_REVIEW_SLUG,
      createdAt: ts,
    };

    let mapping = { ...existing, updatedAt: ts };
    if (input.decision === "confirm" && existing.candidateTargetId) {
      mapping = {
        ...mapping,
        state: "confirmed",
        confirmedTargetId: existing.candidateTargetId,
        targetId: existing.candidateTargetId,
      };
    } else if (input.decision === "reject") {
      mapping = { ...mapping, state: "conflicting" };
    }

    await this.repo.saveReview(review);
    await this.repo.saveMapping(mapping);
    await this.repo.enqueueOutbox(
      createEngineeringModelOutboxEvent({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        eventType: "engineering.model.mapping.review.recorded",
        payload: {
          mappingId: mapping.mappingId,
          reviewId: review.reviewId,
          modelRefId: mapping.modelRefId,
        },
      }),
    );
    if (mapping.state === "confirmed") {
      await this.repo.enqueueOutbox(
        createEngineeringModelOutboxEvent({
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          eventType: "engineering.model.mapping.confirmed",
          payload: {
            mappingId: mapping.mappingId,
            modelRefId: mapping.modelRefId,
          },
        }),
      );
    }
    return { review, mapping };
  }

  async recordChangeImpact(
    impact: Omit<EngineeringModelChangeImpact, "kind" | "owner" | "createdAt" | "updatedAt"> & {
      changeImpactId?: string;
    },
  ): Promise<EngineeringModelChangeImpact> {
    const ts = nowIso();
    const record: EngineeringModelChangeImpact = {
      kind: "engineering_model_change_impact",
      owner: "engineering_model_interoperability",
      changeImpactId: impact.changeImpactId ?? this.repo.newId("emi_ci"),
      tenantId: impact.tenantId,
      workspaceId: impact.workspaceId,
      modelRefId: impact.modelRefId,
      fromModelVersionId: impact.fromModelVersionId,
      toModelVersionId: impact.toModelVersionId,
      summary: impact.summary,
      severity: impact.severity,
      affectedElementCount: impact.affectedElementCount,
      affectedMappingCount: impact.affectedMappingCount,
      notes: impact.notes,
      createdAt: ts,
      updatedAt: ts,
    };
    await this.repo.saveChangeImpact(record);
    await this.repo.enqueueOutbox(
      createEngineeringModelOutboxEvent({
        tenantId: record.tenantId,
        workspaceId: record.workspaceId,
        eventType: "engineering.model.change_impact.recorded",
        payload: {
          changeImpactId: record.changeImpactId,
          modelRefId: record.modelRefId,
        },
      }),
    );
    return record;
  }

  async referenceExternalResult(input: {
    tenantId: string;
    workspaceId: string;
    modelRefId: string;
    externalResultId: string;
    resultKind?: string;
    platformFileRef?: string;
  }): Promise<EngineeringAnalysisResultReference> {
    const trust = trustForIfcImportedResult();
    assertIfcImportNotRtbCertified(trust);
    const ts = nowIso();
    const result: EngineeringAnalysisResultReference = {
      kind: "engineering_analysis_result_reference",
      owner: "source_client_engineering_application",
      federationOwner: "engineering_model_interoperability",
      resultRefId: this.repo.newId("emi_res"),
      modelRefId: input.modelRefId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      externalResultId: input.externalResultId,
      resultKind: input.resultKind,
      provenance: "external_existing",
      rtbGenerated: false,
      trustClassification: trust,
      platformFileRef: input.platformFileRef,
      createdAt: ts,
      updatedAt: ts,
    };
    await this.repo.saveResult(result);
    return result;
  }
}

export function createEngineeringModelFederationService(
  repo: EngineeringModelRepositoryPort,
): EngineeringModelFederationService {
  return new EngineeringModelFederationService(repo);
}

/** Stable id helper for callers that do not hold a repo. */
export function newFederationId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}
