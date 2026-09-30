import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { createMemoryCanonicalSource, type CanonicalEvidenceSource, type CanonicalHarvestBundle } from "../lifecycle-intelligence/harvest";
import { createSupabaseCanonicalSource } from "../lifecycle-intelligence/canonical-source";
import {
  DEFAULT_DELIVERABLE_MATURITY_PROFILE,
  DEFAULT_DELIVERABLE_MATURITY_PROFILE_ID,
  DEFAULT_DELIVERABLE_MATURITY_PROFILE_VERSION,
  deliverableDefinitionByCode,
  deliverableDefinitionById,
  EXAMPLE_FEED_DELIVERABLE_DEFINITIONS,
  maturityProfileById,
  unknownMaturityProfileRejected,
} from "./catalog";
import { applyWaiverToDimensions, buildAssessmentShell, evaluateDeliverableDimensions } from "./evaluate";
import { composeDeliverableThread, fingerprintDeliverableEvidence } from "./fingerprint";
import { factsFromCanonical } from "./harvest";
import { createMemoryDeliverableStore, type DeliverableStore } from "./memory-store";
import { SupabaseDeliverableStore } from "./supabase-store";
import type {
  ArtifactRevisionPolicy,
  DeliverableArtifactClass,
  DeliverableArtifactRole,
  DeliverableEvidenceMode,
  DeliverableExpectation,
  DeliverableLifecycleSummary,
  DeliverableRequirementState,
  DocumentStatusMapping,
  DocumentStatusSemantic,
  LifecycleScopeType,
  LifecycleStage,
  MaturityDimension,
  MaturityPurpose,
  ProjectDeliverableDefinition,
} from "./types";
import { DELIVERABLE_AI_BOUNDARY, DOCUMENT_STATUS_SEMANTICS } from "./types";
import { mapDocumentStatus } from "./status-mapping";
import { resolveArtifactRevision } from "./revision";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

export class EngineeringDeliverableService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly store: DeliverableStore = new SupabaseDeliverableStore(supabase),
    private readonly evidenceSource: CanonicalEvidenceSource = createSupabaseCanonicalSource(supabase),
  ) {}

  catalog() {
    return {
      definitions: EXAMPLE_FEED_DELIVERABLE_DEFINITIONS,
      maturityProfile: DEFAULT_DELIVERABLE_MATURITY_PROFILE,
      kgRequired: false,
      kgReadsDefault: "OFF",
      universalScore: false,
      percentCompleteAuthority: false,
      aiBoundary: DELIVERABLE_AI_BOUNDARY,
      scheduleMaturityAuthority: false,
      templatesAreAuthoritative: false,
      statusCodesHardCoded: false,
      documentStatusEqualsApproval: false,
    };
  }

  async settingsCatalog(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "settings.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    const setting = workspaceId ? await this.store.getProfileSetting(workspaceId) : null;
    const mappings = workspaceId ? await this.store.listStatusMappings(workspaceId) : [];
    return {
      ...this.catalog(),
      setting,
      mappings,
      statusSemantics: DOCUMENT_STATUS_SEMANTICS.filter((row) => row !== "UNMAPPED"),
    };
  }

  async updateSettings(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { enabledDefinitionIds?: string[] | null; maturityProfileId: string; maturityProfileVersion: string; actorId: string },
  ) {
    assertEngineeringService(commerce, "settings.update", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (unknownMaturityProfileRejected(input.maturityProfileId, input.maturityProfileVersion)) {
      throw new Error("unknown_maturity_profile");
    }
    return this.store.saveProfileSetting({
      tenantId,
      workspaceId,
      enabledDefinitionIds: input.enabledDefinitionIds ?? null,
      maturityProfileId: input.maturityProfileId,
      maturityProfileVersion: input.maturityProfileVersion,
      configuredBy: input.actorId,
      configuredAt: new Date().toISOString(),
    });
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "deliverable.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) {
      return {
        expected: [],
        templates: [],
        notApplicable: [],
        bound: 0,
        missing: 0,
        note: "10 of N is a count of configured expectations, not engineering percent complete.",
      };
    }
    const rows = await this.store.listExpectations(workspaceId, projectId);
    const withStatus = await Promise.all(
      rows.map(async (row) => {
        const bindings = await this.store.listBindings(row.id);
        const latest = await this.store.latestAssessment(row.id);
        return {
          ...row,
          boundCount: bindings.length,
          status: !bindings.length ? "MISSING" : latest?.stale ? "STALE" : latest?.readiness ?? "DEVELOPING",
          latest,
        };
      }),
    );
    const missing = withStatus.filter((row) => row.requirementState === "REQUIRED" && row.status === "MISSING").length;
    const active = withStatus.filter((row) => row.requirementState !== "NOT_APPLICABLE");
    const adoptedIds = new Set(active.map((row) => row.definitionId));
    const notApplicableIds = new Set(withStatus.filter((row) => row.requirementState === "NOT_APPLICABLE").map((row) => row.definitionId));
    return {
      expected: active,
      templates: EXAMPLE_FEED_DELIVERABLE_DEFINITIONS.map((row) => ({
        ...row,
        adopted: adoptedIds.has(row.definitionId),
        notApplicable: notApplicableIds.has(row.definitionId),
      })),
      notApplicable: withStatus.filter((row) => row.requirementState === "NOT_APPLICABLE"),
      bound: active.filter((row) => row.boundCount > 0).length,
      missing,
      note: `${active.filter((row) => row.boundCount > 0).length} of ${active.length} active deliverable expectations have bound artifacts. Unadopted templates are not counted. This is not engineering percent complete.`,
    };
  }

  async instantiate(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      projectId: string;
      code: string;
      scopeType?: LifecycleScopeType;
      scopeId?: string;
      stage?: LifecycleStage;
      purpose?: MaturityPurpose;
      requirementState?: DeliverableRequirementState;
      scheduleObjectId?: string | null;
      scheduleStatus?: DeliverableExpectation["scheduleStatus"];
      actorId: string;
    },
  ) {
    assertEngineeringService(commerce, "deliverable.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const definition = deliverableDefinitionByCode(input.code);
    if (!definition) throw new Error("unknown_deliverable_definition");
    const saved = await this.store.saveExpectation({
      id: crypto.randomUUID(),
      tenantId,
      workspaceId,
      projectId: input.projectId,
      definitionId: definition.definitionId,
      definitionVersion: definition.definitionVersion,
      definitionCode: definition.code,
      lifecycleProfileId: "EOS-DEFAULT-ENGINEERING",
      lifecycleProfileVersion: "v1",
      lifecycleStage: input.stage ?? "FEED",
      scopeType: input.scopeType ?? "PROJECT",
      scopeId: input.scopeId ?? input.projectId,
      requirementState: input.requirementState ?? "REQUIRED",
      intendedPurpose: input.purpose ?? "FOR_ENGINEERING_REVIEW",
      maturityProfileId: DEFAULT_DELIVERABLE_MATURITY_PROFILE_ID,
      maturityProfileVersion: DEFAULT_DELIVERABLE_MATURITY_PROFILE_VERSION,
      responsibleDiscipline: definition.responsibleDiscipline,
      contributingDisciplines: [...definition.contributingDisciplines],
      scheduleObjectId: input.scheduleObjectId ?? null,
      scheduleStatus: input.scheduleStatus ?? null,
      origin: "HUMAN_GOVERNED",
      adoptedFromTemplate: false,
      createdBy: input.actorId,
      createdAt: new Date().toISOString(),
    });
    await this.audit(tenantId, saved.id, "deliverable_expectation_created");
    return saved;
  }

  async previewBulkAdopt(commerce: CommerceExecutionContext, tenantId: string, input: { projectId: string; codes: string[] }) {
    assertEngineeringService(commerce, "deliverable.adopt", tenantId);
    return {
      wouldCreate: input.codes.map((code) => {
        const definition = deliverableDefinitionByCode(code);
        if (!definition) return { code, error: "unknown_deliverable_definition" };
        return { code, definitionId: definition.definitionId, name: definition.name, origin: definition.origin };
      }),
      automaticSelection: false,
    };
  }

  async adoptTemplate(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      projectId: string;
      code: string;
      scopeType?: LifecycleScopeType;
      scopeId?: string;
      stage?: LifecycleStage;
      purpose?: MaturityPurpose;
      requirementState?: DeliverableRequirementState;
      responsibleDiscipline?: string;
      contributingDisciplines?: string[];
      scheduleObjectId?: string | null;
      scheduleStatus?: DeliverableExpectation["scheduleStatus"];
      actorId: string;
    },
  ) {
    assertEngineeringService(commerce, "deliverable.adopt", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const definition = deliverableDefinitionByCode(input.code);
    if (!definition) throw new Error("unknown_deliverable_definition");
    const existing = (await this.store.listExpectations(workspaceId, input.projectId)).find(
      (row) => row.definitionId === definition.definitionId && row.requirementState !== "NOT_APPLICABLE",
    );
    if (existing) return existing;
    const saved = await this.store.saveExpectation({
      id: crypto.randomUUID(),
      tenantId,
      workspaceId,
      projectId: input.projectId,
      definitionId: definition.definitionId,
      definitionVersion: definition.definitionVersion,
      definitionCode: definition.code,
      lifecycleProfileId: "EOS-DEFAULT-ENGINEERING",
      lifecycleProfileVersion: "v1",
      lifecycleStage: input.stage ?? "FEED",
      scopeType: input.scopeType ?? "PROJECT",
      scopeId: input.scopeId ?? input.projectId,
      requirementState: input.requirementState ?? "REQUIRED",
      intendedPurpose: input.purpose ?? "FOR_ENGINEERING_REVIEW",
      maturityProfileId: DEFAULT_DELIVERABLE_MATURITY_PROFILE_ID,
      maturityProfileVersion: DEFAULT_DELIVERABLE_MATURITY_PROFILE_VERSION,
      responsibleDiscipline: input.responsibleDiscipline ?? definition.responsibleDiscipline,
      contributingDisciplines: input.contributingDisciplines ?? [...definition.contributingDisciplines],
      scheduleObjectId: input.scheduleObjectId ?? null,
      scheduleStatus: input.scheduleStatus ?? null,
      origin: "PROJECT_CONFIGURATION",
      adoptedFromTemplate: true,
      createdBy: input.actorId,
      createdAt: new Date().toISOString(),
    });
    await this.audit(tenantId, saved.id, "deliverable_template_adopted");
    return saved;
  }

  async bulkAdopt(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { projectId: string; codes: string[]; confirmed: boolean; actorId: string },
  ) {
    assertEngineeringService(commerce, "deliverable.adopt", tenantId);
    const preview = await this.previewBulkAdopt(commerce, tenantId, input);
    if (!input.confirmed) return { preview, created: [] as DeliverableExpectation[] };
    const created: DeliverableExpectation[] = [];
    for (const row of preview.wouldCreate) {
      if ("error" in row && row.error) continue;
      created.push(await this.adoptTemplate(commerce, tenantId, { projectId: input.projectId, code: row.code, actorId: input.actorId }));
    }
    return { preview, created };
  }

  async markNotApplicable(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { projectId: string; code: string; actorId: string; stage?: LifecycleStage },
  ) {
    assertEngineeringService(commerce, "deliverable.adopt", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const definition = deliverableDefinitionByCode(input.code);
    if (!definition) throw new Error("unknown_deliverable_definition");
    const saved = await this.store.saveExpectation({
      id: crypto.randomUUID(),
      tenantId,
      workspaceId,
      projectId: input.projectId,
      definitionId: definition.definitionId,
      definitionVersion: definition.definitionVersion,
      definitionCode: definition.code,
      lifecycleProfileId: "EOS-DEFAULT-ENGINEERING",
      lifecycleProfileVersion: "v1",
      lifecycleStage: input.stage ?? "FEED",
      scopeType: "PROJECT",
      scopeId: input.projectId,
      requirementState: "NOT_APPLICABLE",
      intendedPurpose: "FOR_INTERNAL_COORDINATION",
      maturityProfileId: DEFAULT_DELIVERABLE_MATURITY_PROFILE_ID,
      maturityProfileVersion: DEFAULT_DELIVERABLE_MATURITY_PROFILE_VERSION,
      responsibleDiscipline: definition.responsibleDiscipline,
      contributingDisciplines: [...definition.contributingDisciplines],
      origin: "PROJECT_CONFIGURATION",
      adoptedFromTemplate: false,
      createdBy: input.actorId,
      createdAt: new Date().toISOString(),
    });
    await this.audit(tenantId, saved.id, "deliverable_template_not_applicable");
    return saved;
  }

  async createProjectExpectation(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      projectId: string;
      definition: Omit<ProjectDeliverableDefinition, "tenantId" | "workspaceId" | "projectId" | "origin" | "createdBy" | "createdAt"> & {
        rationale?: string | null;
      };
      purpose?: MaturityPurpose;
      stage?: LifecycleStage;
      requirementState?: DeliverableRequirementState;
      actorId: string;
    },
  ) {
    assertEngineeringService(commerce, "deliverable.define", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (deliverableDefinitionByCode(input.definition.code) || deliverableDefinitionById(input.definition.definitionId, input.definition.definitionVersion)) {
      throw new Error("project_definition_must_not_mutate_catalog");
    }
    const definition = await this.store.saveProjectDefinition({
      ...input.definition,
      tenantId,
      workspaceId,
      projectId: input.projectId,
      origin: "PROJECT_CONFIGURED",
      createdBy: input.actorId,
      createdAt: new Date().toISOString(),
    });
    const saved = await this.store.saveExpectation({
      id: crypto.randomUUID(),
      tenantId,
      workspaceId,
      projectId: input.projectId,
      definitionId: definition.definitionId,
      definitionVersion: definition.definitionVersion,
      definitionCode: definition.code,
      lifecycleProfileId: "EOS-DEFAULT-ENGINEERING",
      lifecycleProfileVersion: "v1",
      lifecycleStage: input.stage ?? "FEED",
      scopeType: "PROJECT",
      scopeId: input.projectId,
      requirementState: input.requirementState ?? "REQUIRED",
      intendedPurpose: input.purpose ?? "FOR_ENGINEERING_REVIEW",
      maturityProfileId: DEFAULT_DELIVERABLE_MATURITY_PROFILE_ID,
      maturityProfileVersion: DEFAULT_DELIVERABLE_MATURITY_PROFILE_VERSION,
      responsibleDiscipline: definition.responsibleDiscipline,
      contributingDisciplines: [...definition.contributingDisciplines],
      origin: "PROJECT_CONFIGURATION",
      adoptedFromTemplate: false,
      createdBy: input.actorId,
      createdAt: new Date().toISOString(),
    });
    await this.audit(tenantId, saved.id, "deliverable_project_definition_created");
    return { definition, expectation: saved };
  }

  async listStatusMappings(commerce: CommerceExecutionContext, tenantId: string, projectId?: string | null) {
    assertEngineeringService(commerce, "deliverable.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    return this.store.listStatusMappings(workspaceId, projectId);
  }

  async getEffectiveStatusMapping(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { projectId?: string | null; rawStatusCode: string },
  ) {
    assertEngineeringService(commerce, "deliverable.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return { semantic: "UNMAPPED" as const, mapping: null };
    const mappings = await this.store.listStatusMappings(workspaceId, input.projectId);
    return mapDocumentStatus(input.rawStatusCode, mappings, input.projectId);
  }

  async configureStatusMapping(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      projectId?: string | null;
      sourceSystem: string;
      rawStatusCode: string;
      semantic: Exclude<DocumentStatusSemantic, "UNMAPPED">;
      mappingVersion: string;
      enabled?: boolean;
      description?: string | null;
      actorId: string;
    },
  ) {
    assertEngineeringService(commerce, "deliverable.mapping", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (input.semantic === ("UNMAPPED" as never)) throw new Error("cannot_configure_unmapped");
    const existing = (await this.store.listStatusMappings(workspaceId, input.projectId)).filter(
      (row) => row.rawStatusCode === input.rawStatusCode && (row.projectId ?? null) === (input.projectId ?? null),
    );
    const current = existing.find((row) => row.enabled);
    const versionChanged = Boolean(current && (current.semantic !== input.semantic || current.mappingVersion !== input.mappingVersion));
    const saved = await this.store.saveStatusMapping({
      id: current && current.mappingVersion === input.mappingVersion ? current.id : crypto.randomUUID(),
      tenantId,
      workspaceId,
      projectId: input.projectId ?? null,
      sourceSystem: input.sourceSystem,
      rawStatusCode: input.rawStatusCode,
      semantic: input.semantic,
      mappingVersion: input.mappingVersion,
      enabled: input.enabled ?? true,
      description: input.description ?? null,
      configuredBy: input.actorId,
      configuredAt: new Date().toISOString(),
    });
    if (current && versionChanged && current.id !== saved.id) {
      await this.store.saveStatusMapping({ ...current, enabled: false });
    }
    if (versionChanged || (current && current.semantic !== input.semantic)) {
      const assessments = await this.store.listAssessments(workspaceId, input.projectId ?? undefined);
      for (const row of assessments.filter((item) => !item.stale)) {
        await this.store.markAssessmentStale(row.id);
      }
    }
    await this.audit(tenantId, saved.id, "document_status_mapping_configured");
    return saved;
  }

  async bind(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      expectationId: string;
      artifactClass: DeliverableArtifactClass;
      artifactId: string;
      artifactRole: DeliverableArtifactRole;
      revisionRef?: string | null;
      revisionPolicy?: ArtifactRevisionPolicy;
      actorId: string;
    },
  ) {
    assertEngineeringService(commerce, "deliverable.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const expectation = await this.store.getExpectation(input.expectationId);
    if (!expectation || expectation.workspaceId !== workspaceId || expectation.tenantId !== tenantId) {
      throw new Error("expectation_not_found");
    }
    if (input.artifactClass === "document") {
      await this.assertDocumentInWorkspace(tenantId, workspaceId, input.artifactId);
    }
    const saved = await this.store.saveBinding({
      id: crypto.randomUUID(),
      tenantId,
      workspaceId,
      expectationId: expectation.id,
      artifactClass: input.artifactClass,
      artifactId: input.artifactId,
      artifactRole: input.artifactRole,
      revisionRef: input.revisionRef ?? null,
      revisionPolicy:
        input.revisionPolicy ??
        (input.artifactClass === "document" ? (input.revisionRef ? "EXACT_REVISION" : "CURRENT_EFFECTIVE_REVISION") : "EXACT_REVISION"),
      boundBy: input.actorId,
      boundAt: new Date().toISOString(),
    });
    await this.audit(tenantId, saved.id, "deliverable_artifact_bound");
    return saved;
  }

  async evaluate(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      expectationId: string;
      bundle?: CanonicalHarvestBundle;
      evidenceMode?: DeliverableEvidenceMode;
      requirementLinked?: boolean;
      maturityClaims?: Record<string, unknown>;
    },
  ) {
    assertEngineeringService(commerce, "deliverable.evaluate", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (input.maturityClaims && input.evidenceMode !== "TEST_FIXTURE") {
      throw new Error("caller_supplied_maturity_rejected");
    }
    const expectation = await this.store.getExpectation(input.expectationId);
    if (!expectation || expectation.workspaceId !== workspaceId || expectation.tenantId !== tenantId) {
      throw new Error("expectation_not_found");
    }
    const definition =
      deliverableDefinitionById(expectation.definitionId, expectation.definitionVersion) ??
      (await this.store.getProjectDefinition(workspaceId, expectation.definitionId, expectation.definitionVersion));
    if (!definition) throw new Error("unknown_deliverable_definition");
    const profile = maturityProfileById(expectation.maturityProfileId, expectation.maturityProfileVersion) ?? DEFAULT_DELIVERABLE_MATURITY_PROFILE;
    const bindings = await this.store.listBindings(expectation.id);
    const mappings = await this.store.listStatusMappings(workspaceId, expectation.projectId);
    let bundle: CanonicalHarvestBundle;
    let evidenceSource: DeliverableEvidenceMode;
    if (input.evidenceMode === "TEST_FIXTURE") {
      if (!input.bundle) throw new Error("test_fixture_evidence_required");
      bundle = input.bundle;
      evidenceSource = "TEST_FIXTURE";
    } else {
      bundle = await this.evidenceSource.load({
        tenantId,
        workspaceId,
        projectId: expectation.projectId,
        scopeType: expectation.scopeType,
        scopeId: expectation.scopeId,
      });
      evidenceSource = "CANONICAL";
    }
    const facts = factsFromCanonical({
      definition,
      bindings,
      bundle,
      requirementLinked: input.evidenceMode === "TEST_FIXTURE" ? input.requirementLinked : undefined,
      contributingIdentified: expectation.contributingDisciplines.length > 0,
      mappings,
      projectId: expectation.projectId,
    });
    const dimensions = evaluateDeliverableDimensions({
      definition,
      purpose: expectation.intendedPurpose,
      profile,
      facts,
    });
    const fingerprint = fingerprintDeliverableEvidence({
      expectation,
      facts,
      bindingKeys: bindings.map((row) => `${row.artifactClass}:${row.artifactId}:${row.artifactRole}:${row.revisionPolicy ?? ""}:${row.revisionRef ?? ""}`),
      purpose: expectation.intendedPurpose,
      profileId: profile.profileId,
      profileVersion: profile.profileVersion,
    });
    const previous = await this.store.latestAssessment(expectation.id);
    if (previous && previous.evidenceFingerprint !== fingerprint && !previous.stale) {
      await this.store.markAssessmentStale(previous.id);
    }
    const assessmentId = crypto.randomUUID();
    const assessment = buildAssessmentShell({
      id: assessmentId,
      expectation,
      definition,
      profile,
      purpose: expectation.intendedPurpose,
      dimensions,
      facts,
      fingerprint,
      thread: composeDeliverableThread({
        projectId: expectation.projectId,
        stage: expectation.lifecycleStage,
        expectationId: expectation.id,
        definitionCode: expectation.definitionCode,
        assessmentId,
        artifactIds: bindings.map((row) => row.artifactId),
        documentId: bindings.find((row) => row.artifactClass === "document")?.artifactId ?? null,
        revision: facts.resolvedRevision ?? null,
        statusMapping: facts.mappingVersion ? `${facts.rawStatusCode}:${facts.mappedSemantic}:${facts.mappingVersion}` : null,
        reviewId: bindings.find((row) => row.artifactClass === "review_package")?.artifactId ?? null,
        baselineId: bindings.find((row) => row.artifactClass === "configuration_baseline")?.artifactId ?? facts.artifactStates.find((row) => row.artifactClass === "configuration_baseline")?.artifactId ?? null,
      }),
      evidenceSource,
    });
    const saved = await this.store.saveAssessment(assessment);
    await this.audit(tenantId, saved.id, "deliverable_maturity_evaluated");
    return {
      assessment: saved,
      scheduleCompleteDoesNotSetMaturity: expectation.scheduleStatus === "complete",
      humanApproved: false,
      percentComplete: null,
    };
  }

  async waive(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      expectationId: string;
      assessmentId: string;
      dimension: MaturityDimension;
      rationale: string;
      actorId: string;
      supportingDecisionId?: string | null;
    },
  ) {
    assertEngineeringService(commerce, "deliverable.waive", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (!input.rationale.trim()) throw new Error("rationale_required");
    const assessment = await this.store.getAssessment(input.assessmentId);
    if (!assessment || assessment.workspaceId !== workspaceId) throw new Error("assessment_not_found");
    const dimension = assessment.dimensions.find((row) => row.dimension === input.dimension);
    if (!dimension) throw new Error("dimension_not_found");
    const waiver = await this.store.saveWaiver({
      id: crypto.randomUUID(),
      tenantId,
      workspaceId,
      expectationId: input.expectationId,
      assessmentId: assessment.id,
      dimension: input.dimension,
      rationale: input.rationale,
      actorId: input.actorId,
      supportingDecisionId: input.supportingDecisionId ?? null,
      waivedAt: new Date().toISOString(),
    });
    const nextDimensions = applyWaiverToDimensions(assessment.dimensions, [{ dimension: input.dimension, waiverId: waiver.id }]);
    const rewritten = nextDimensions.find((row) => row.dimension === input.dimension);
    if (rewritten?.state === "SATISFIED" && dimension.state !== "SATISFIED") {
      throw new Error("waiver_must_not_rewrite_evidence");
    }
    await this.store.overlayWaiver(assessment.id, nextDimensions, [...assessment.waiverIds, waiver.id]);
    await this.audit(tenantId, waiver.id, "deliverable_maturity_waived");
    return {
      waiver,
      originalState: dimension.state,
      waivedState: rewritten?.state,
      evidenceRewritten: false,
    };
  }

  async getDetail(commerce: CommerceExecutionContext, tenantId: string, expectationId: string) {
    assertEngineeringService(commerce, "deliverable.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return null;
    const expectation = await this.store.getExpectation(expectationId);
    if (!expectation || expectation.workspaceId !== workspaceId) return null;
    const definition =
      deliverableDefinitionById(expectation.definitionId, expectation.definitionVersion) ??
      (await this.store.getProjectDefinition(workspaceId, expectation.definitionId, expectation.definitionVersion));
    const bindings = await this.store.listBindings(expectation.id);
    const latest = await this.store.latestAssessment(expectation.id);
    const waivers = await this.store.listWaivers(expectation.id);
    const mappings = await this.store.listStatusMappings(workspaceId, expectation.projectId);
    return { definition, expectation, bindings, latest, waivers, mappings };
  }

  async resolveRevision(commerce: CommerceExecutionContext, tenantId: string, expectationId: string, bundle?: CanonicalHarvestBundle) {
    assertEngineeringService(commerce, "deliverable.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const expectation = await this.store.getExpectation(expectationId);
    if (!expectation || expectation.workspaceId !== workspaceId) throw new Error("expectation_not_found");
    const bindings = await this.store.listBindings(expectation.id);
    const harvest = bundle ?? (await this.evidenceSource.load({
      tenantId,
      workspaceId,
      projectId: expectation.projectId,
      scopeType: expectation.scopeType,
      scopeId: expectation.scopeId,
    }));
    return bindings.map((binding) => ({
      bindingId: binding.id,
      artifactClass: binding.artifactClass,
      artifactId: binding.artifactId,
      ...resolveArtifactRevision({ binding, records: harvest.records }),
    }));
  }

  async composedSummary(workspaceId: string, projectId: string): Promise<DeliverableLifecycleSummary> {
    const rows = await this.store.listExpectations(workspaceId, projectId);
    const required = [];
    for (const row of rows.filter((item) => item.requirementState === "REQUIRED")) {
      const bindings = await this.store.listBindings(row.id);
      const latest = await this.store.latestAssessment(row.id);
      required.push({
        expectationId: row.id,
        definitionCode: row.definitionCode,
        bound: bindings.length > 0,
        readiness: latest?.readiness ?? "INCOMPLETE",
        completeness: latest?.completeness ?? "COMPLETE",
        stale: Boolean(latest?.stale),
        waived: Boolean(latest?.waiverIds.length),
      });
    }
    return { composed: true, required };
  }

  async lifecycleSummary(commerce: CommerceExecutionContext, tenantId: string, projectId: string): Promise<DeliverableLifecycleSummary> {
    assertEngineeringService(commerce, "deliverable.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return { composed: true, required: [] };
    return this.composedSummary(workspaceId, projectId);
  }

  static memoryForTests(bundle?: CanonicalHarvestBundle) {
    const client = { from() { return {}; } } as never;
    return new EngineeringDeliverableService(
      client,
      createMemoryDeliverableStore(),
      createMemoryCanonicalSource(bundle ?? { records: [] }),
    );
  }

  private async assertDocumentInWorkspace(tenantId: string, workspaceId: string, artifactId: string) {
    const table = db(this.supabase).from("engineering_documents");
    if (typeof table?.select !== "function") return;
    const byId = await table.select("id").eq("tenant_id", tenantId).eq("workspace_id", workspaceId).eq("id", artifactId).limit(1);
    if (Array.isArray(byId?.data) && byId.data.length) return;
    const byNumber = await db(this.supabase)
      .from("engineering_documents")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("document_number", artifactId)
      .limit(1);
    if (Array.isArray(byNumber?.data) && byNumber.data.length) return;
    if (byId?.error || byNumber?.error) return;
    throw new Error("artifact_not_found");
  }

  private async audit(tenantId: string, objectId: string, action: string) {
    try {
      await db(this.supabase).from("engineering_audit_events").insert({
        tenant_id: tenantId,
        object_type: "deliverable",
        object_id: objectId,
        action,
        metadata: { domain: "deliverable-intelligence", aiApproved: false },
      });
    } catch {
      /* optional in unit tests */
    }
  }
}
