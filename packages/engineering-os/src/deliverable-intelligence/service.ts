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
  DeliverableArtifactClass,
  DeliverableArtifactRole,
  DeliverableEvidenceMode,
  DeliverableExpectation,
  DeliverableLifecycleSummary,
  DeliverableRequirementState,
  LifecycleScopeType,
  LifecycleStage,
  MaturityDimension,
  MaturityPurpose,
} from "./types";
import { DELIVERABLE_AI_BOUNDARY } from "./types";

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
    };
  }

  async settingsCatalog(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "settings.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    const setting = workspaceId ? await this.store.getProfileSetting(workspaceId) : null;
    return { ...this.catalog(), setting };
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
    if (!workspaceId) return { expected: [], bound: 0, missing: 0, note: "10 of N is a count of configured expectations, not engineering percent complete." };
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
    const missing = withStatus.filter((row) => row.status === "MISSING").length;
    return {
      expected: withStatus,
      bound: withStatus.filter((row) => row.boundCount > 0).length,
      missing,
      note: `${withStatus.filter((row) => row.boundCount > 0).length} of ${withStatus.length} configured deliverable expectations have bound artifacts. This is not engineering percent complete.`,
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
      createdBy: input.actorId,
      createdAt: new Date().toISOString(),
    });
    await this.audit(tenantId, saved.id, "deliverable_expectation_created");
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
    const saved = await this.store.saveBinding({
      id: crypto.randomUUID(),
      tenantId,
      workspaceId,
      expectationId: expectation.id,
      artifactClass: input.artifactClass,
      artifactId: input.artifactId,
      artifactRole: input.artifactRole,
      revisionRef: input.revisionRef ?? null,
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
    const definition = deliverableDefinitionById(expectation.definitionId, expectation.definitionVersion);
    if (!definition) throw new Error("unknown_deliverable_definition");
    const profile = maturityProfileById(expectation.maturityProfileId, expectation.maturityProfileVersion) ?? DEFAULT_DELIVERABLE_MATURITY_PROFILE;
    const bindings = await this.store.listBindings(expectation.id);
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
      bindingKeys: bindings.map((row) => `${row.artifactClass}:${row.artifactId}:${row.artifactRole}`),
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
    const definition = deliverableDefinitionById(expectation.definitionId, expectation.definitionVersion);
    const bindings = await this.store.listBindings(expectation.id);
    const latest = await this.store.latestAssessment(expectation.id);
    const waivers = await this.store.listWaivers(expectation.id);
    return { definition, expectation, bindings, latest, waivers };
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
