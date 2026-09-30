import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import type { EngineeringDigitalThreadService } from "../digital-thread/service";
import type { ThreadGraphInput } from "../digital-thread/types";
import { ASSURANCE_RULE_CATALOG, enabledAssuranceRules } from "./catalog";
import { completenessFromScan, conclusiveZeroConditionsAllowed } from "./completeness";
import { evaluateAssurance } from "./evaluate";
import { fingerprintAssuranceRuleset } from "./fingerprint";
import type { AssuranceListFilter, AssuranceConditionStore } from "./memory-store";
import { reconcileAssuranceConditions } from "./reconcile";
import { composeConditionReviewThread } from "./review-composition";
import {
  assertSameScopeCitation,
  citationRecord,
  SupabaseReviewGateway,
  type AssuranceReviewGateway,
} from "./review-gateway";
import { effectiveRuleCatalog, enabledIdsFromSettings, unknownRuleRejected } from "./settings";
import { summarizeAssuranceConditions } from "./summary";
import { SupabaseAssuranceStore } from "./supabase-store";
import type {
  AssuranceDisposition,
  AssuranceEvaluationInput,
  AssuranceEvaluationRun,
  EngineeringAssuranceCondition,
  InterfaceInformationFact,
} from "./types";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

export class EngineeringAssuranceService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly digitalThread: EngineeringDigitalThreadService,
    private readonly store: AssuranceConditionStore = new SupabaseAssuranceStore(supabase),
    private readonly reviews: AssuranceReviewGateway = new SupabaseReviewGateway(db(supabase)),
  ) {}

  catalog() {
    return {
      rules: ASSURANCE_RULE_CATALOG,
      kgRequired: false,
      kgReadsDefault: "OFF",
      universalScore: false,
      aiBoundary: {
        mayCreateAuthoritativeConditions: false,
        mayResolveConditions: false,
        mayApproveEngineering: false,
      },
    };
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, filter?: AssuranceListFilter) {
    assertEngineeringService(commerce, "assurance.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    return this.store.list(tenantId, workspaceId, filter);
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "assurance.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return null;
    return this.store.get(tenantId, workspaceId, id);
  }

  async summary(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "assurance.list", tenantId);
    const rows = await this.list(commerce, tenantId);
    return summarizeAssuranceConditions(rows);
  }

  async effectiveRules(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "assurance.list", tenantId);
    return this.loadEffectiveRules(commerce, tenantId);
  }

  async settingsCatalog(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "settings.get", tenantId);
    return this.loadEffectiveRules(commerce, tenantId);
  }

  private async loadEffectiveRules(commerce: CommerceExecutionContext, tenantId: string) {
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    const settings = await this.store.listSettings(tenantId, workspaceId);
    return effectiveRuleCatalog(settings);
  }

  async latestEvaluation(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "assurance.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return null;
    return this.store.latestEvaluationRun(tenantId, workspaceId);
  }

  async updateRuleSetting(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { ruleId: string; ruleVersion: string; enabled: boolean | null; actorId: string },
  ) {
    assertEngineeringService(commerce, "settings.update", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (unknownRuleRejected(input.ruleId, input.ruleVersion)) throw new Error("unknown_assurance_rule");
    const now = new Date().toISOString();
    if (input.enabled === null) {
      const removed = await this.store.deleteSetting(tenantId, workspaceId, input.ruleId, input.ruleVersion);
      await this.audit(tenantId, removed?.id ?? crypto.randomUUID(), "rule_restored_default");
      return { restoredDefault: true, ruleId: input.ruleId, ruleVersion: input.ruleVersion };
    }
    const saved = await this.store.upsertSetting({
      tenantId,
      workspaceId,
      ruleId: input.ruleId,
      ruleVersion: input.ruleVersion,
      enabled: input.enabled,
      configuredBy: input.actorId,
      configuredAt: now,
    });
    await this.audit(tenantId, saved.id ?? crypto.randomUUID(), input.enabled ? "rule_enabled" : "rule_disabled");
    return saved;
  }

  async evaluateWorkspace(
    commerce: CommerceExecutionContext,
    tenantId: string,
    options?: { ruleId?: string; objectType?: string; objectId?: string; triggeredBy?: string },
  ) {
    assertEngineeringService(commerce, "assurance.evaluate", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) {
      return {
        conditions: [],
        created: 0,
        updated: 0,
        resolved: 0,
        reopened: 0,
        unchanged: 0,
        durationMs: 0,
        objectsEvaluated: 0,
        completeness: "FAILED" as const,
        truncated: false,
        conclusiveZeroConditions: false,
      };
    }
    return this.evaluateInternal(tenantId, workspaceId, options);
  }

  async evaluateInternal(
    tenantId: string,
    workspaceId: string,
    options?: { ruleId?: string; objectType?: string; objectId?: string; triggeredBy?: string },
  ) {
    const started = Date.now();
    const startedAt = new Date().toISOString();
    const settings = await this.store.listSettings(tenantId, workspaceId);
    const effective = enabledIdsFromSettings(settings);
    const enabledRuleIds = options?.ruleId
      ? effective.enabledRuleIds.filter((id) => id === options.ruleId)
      : effective.enabledRuleIds;
    const rulesetFingerprint = fingerprintAssuranceRuleset(enabledRuleIds);
    let graph: ThreadGraphInput = { nodes: [], links: [] };
    let truncated = false;
    let linkCount = 0;
    let linkLimit = 2000;
    let remainingScopeUnknown = false;
    let failed = false;
    let failureReason: string | null = null;
    try {
      const scan = await this.digitalThread.loadAuthorizedWorkspaceGraphMeta(tenantId, workspaceId);
      graph = scan.graph;
      truncated = scan.truncated;
      linkCount = scan.linkCount;
      linkLimit = scan.linkLimit;
      remainingScopeUnknown = scan.remainingScopeUnknown;
    } catch (error) {
      failed = true;
      failureReason = error instanceof Error ? error.message : "evaluation_failed";
    }
    const completeness = completenessFromScan({ truncated, failed, failureReason });
    const interfaceInformation = failed ? [] : await this.loadInterfaceInformation(tenantId, workspaceId);
    const now = new Date().toISOString();
    const input: AssuranceEvaluationInput = {
      tenantId,
      workspaceId,
      graph,
      interfaceInformation,
      now,
      enabledRuleIds,
      ruleFilter: options?.ruleId,
      objectFilter:
        options?.objectType && options?.objectId
          ? { objectType: options.objectType, objectId: options.objectId }
          : undefined,
      graphTruncated: truncated,
      linkCount,
      linkLimit,
    };
    const detections = failed ? [] : evaluateAssurance(input);
    const existing = await this.store.list(tenantId, workspaceId, {
      rootObjectType: options?.objectType,
      rootObjectId: options?.objectId,
    });
    const scopedExisting =
      options?.objectType && options?.objectId
        ? existing.filter(
            (row) =>
              (row.rootObjectType === options.objectType && row.rootObjectId === options.objectId) ||
              detections.some((detection) => detection.fingerprint === row.fingerprint),
          )
        : await this.store.list(tenantId, workspaceId);
    const reconciled = reconcileAssuranceConditions({
      existing: scopedExisting,
      detections,
      now,
      autoResolve: completeness.completeness === "COMPLETE",
      skipResolveRuleIds: effective.disabledRuleIds,
    });
    await this.store.upsertMany(reconciled.conditions);
    const run = await this.store.insertEvaluationRun({
      tenantId,
      workspaceId,
      startedAt,
      completedAt: now,
      triggeredBy: options?.triggeredBy ?? null,
      completeness: completeness.completeness,
      truncated,
      linkCount,
      linkLimit,
      objectsEvaluated: graph.nodes.filter((node) => node.workspaceId === workspaceId).length,
      rulesEvaluated: enabledAssuranceRules(enabledRuleIds).length,
      conditionsDetected: detections.length,
      conditionsResolved: reconciled.resolved,
      conditionsCreated: reconciled.created,
      remainingScopeUnknown: completeness.remainingScopeUnknown || remainingScopeUnknown,
      rulesetFingerprint,
      failureReason,
      reason: completeness.reason,
    });
    return {
      ...reconciled,
      durationMs: Date.now() - started,
      objectsEvaluated: run.objectsEvaluated,
      rulesEvaluated: run.rulesEvaluated,
      conditionsDetected: detections.length,
      kgUsed: false,
      completeness: run.completeness,
      truncated: run.truncated,
      linkCount: run.linkCount,
      linkLimit: run.linkLimit,
      remainingScopeUnknown: run.remainingScopeUnknown,
      conclusiveZeroConditions: conclusiveZeroConditionsAllowed(run.completeness) && detections.length === 0,
      rulesetFingerprint,
      evaluationRun: run,
      disabledRuleIds: effective.disabledRuleIds,
    };
  }

  async evaluateFromInput(
    input: AssuranceEvaluationInput,
    options?: { autoResolve?: boolean; skipResolveRuleIds?: readonly string[]; triggeredBy?: string },
  ) {
    const started = Date.now();
    const settings = await this.store.listSettings(input.tenantId, input.workspaceId);
    const effective = enabledIdsFromSettings(settings);
    const enabledRuleIds = input.enabledRuleIds ?? effective.enabledRuleIds;
    const completeness = completenessFromScan({
      truncated: input.graphTruncated === true,
      failed: false,
    });
    const detections = evaluateAssurance({ ...input, enabledRuleIds });
    const existing = await this.store.list(input.tenantId, input.workspaceId);
    const reconciled = reconcileAssuranceConditions({
      existing,
      detections,
      now: input.now ?? new Date().toISOString(),
      autoResolve: options?.autoResolve ?? completeness.completeness === "COMPLETE",
      skipResolveRuleIds: options?.skipResolveRuleIds ?? effective.disabledRuleIds,
    });
    await this.store.upsertMany(reconciled.conditions);
    const run = await this.store.insertEvaluationRun({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      startedAt: input.now ?? new Date().toISOString(),
      completedAt: input.now ?? new Date().toISOString(),
      triggeredBy: options?.triggeredBy ?? null,
      completeness: completeness.completeness,
      truncated: completeness.completeness === "PARTIAL",
      linkCount: input.linkCount ?? input.graph.links.length,
      linkLimit: input.linkLimit ?? input.graph.links.length,
      objectsEvaluated: input.graph.nodes.length,
      rulesEvaluated: enabledAssuranceRules(enabledRuleIds).length,
      conditionsDetected: detections.length,
      conditionsResolved: reconciled.resolved,
      conditionsCreated: reconciled.created,
      remainingScopeUnknown: completeness.remainingScopeUnknown,
      rulesetFingerprint: fingerprintAssuranceRuleset(enabledRuleIds),
      reason: completeness.reason,
    });
    return {
      ...reconciled,
      durationMs: Date.now() - started,
      detections,
      evaluationRun: run,
      completeness: run.completeness,
      truncated: run.truncated,
      conclusiveZeroConditions: conclusiveZeroConditionsAllowed(run.completeness) && detections.length === 0,
    };
  }

  async acknowledge(commerce: CommerceExecutionContext, tenantId: string, id: string, actorId: string) {
    assertEngineeringService(commerce, "assurance.disposition", tenantId);
    return this.patchCondition(commerce, tenantId, id, (row) => {
      if (row.status !== "OPEN") return row;
      return { ...row, status: "ACKNOWLEDGED" };
    }, actorId, "acknowledged");
  }

  async assign(commerce: CommerceExecutionContext, tenantId: string, id: string, ownerId: string, actorId: string) {
    assertEngineeringService(commerce, "assurance.disposition", tenantId);
    return this.patchCondition(commerce, tenantId, id, (row) => ({ ...row, ownerId }), actorId, "assigned");
  }

  async disposition(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    input: {
      disposition: AssuranceDisposition;
      rationale: string;
      actorId: string;
      reviewPackageId?: string | null;
      issueId?: string | null;
    },
  ) {
    assertEngineeringService(commerce, "assurance.disposition", tenantId);
    if (!input.rationale?.trim()) throw new Error("disposition_rationale_required");
    if (input.disposition === "CREATE_REVIEW" && input.reviewPackageId) {
      return this.linkReview(commerce, tenantId, id, input.reviewPackageId, input.actorId);
    }
    return this.patchCondition(
      commerce,
      tenantId,
      id,
      (row) => {
        const now = new Date().toISOString();
        const next: EngineeringAssuranceCondition = {
          ...row,
          disposition: input.disposition,
          dispositionBy: input.actorId,
          dispositionAt: now,
          dispositionRationale: input.rationale,
        };
        if (input.disposition === "ACCEPT") next.status = "ACCEPTED_WITH_JUSTIFICATION";
        else if (input.disposition === "NOT_APPLICABLE") next.status = "NOT_APPLICABLE";
        else if (input.disposition === "DEFER") next.status = "ACKNOWLEDGED";
        else if (input.disposition === "CREATE_ISSUE") {
          next.issueId = input.issueId ?? row.issueId ?? null;
        } else if (input.disposition === "RESOLVED_BY_ENGINEERING_CHANGE") {
          next.status = "RESOLVED";
          next.resolvedAt = now;
          next.resolutionSource = "HUMAN_DISPOSITION";
        }
        return next;
      },
      input.actorId,
      "dispositioned",
    );
  }

  async createReviewFromCondition(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    input: { projectId: string; name: string; documentIds: readonly string[]; actorId: string },
  ) {
    assertEngineeringService(commerce, "assurance.disposition", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const condition = await this.store.get(tenantId, workspaceId, id);
    if (!condition) return null;
    if (!this.reviews.createPackage) throw new Error("review_create_not_available");
    const pkg = await this.reviews.createPackage({
      tenantId,
      workspaceId,
      projectId: input.projectId,
      name: input.name,
      documentIds: input.documentIds,
      actorId: input.actorId,
    });
    const linked = await this.linkValidatedPackage(commerce, tenantId, condition, pkg, input.actorId, "review_created_from_condition");
    const findings = await this.reviews.listFindings(pkg.id, tenantId, workspaceId);
    return { condition: linked, reviewPackage: pkg, findings, automaticFinding: false as const };
  }

  async linkReview(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    reviewPackageId: string,
    actorId: string,
  ) {
    assertEngineeringService(commerce, "assurance.disposition", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const condition = await this.store.get(tenantId, workspaceId, id);
    if (!condition) return null;
    const pkg = assertSameScopeCitation(condition, await this.reviews.getPackage(tenantId, workspaceId, reviewPackageId));
    return this.linkValidatedPackage(commerce, tenantId, condition, pkg, actorId, "existing_review_linked");
  }

  async linkedReviews(commerce: CommerceExecutionContext, tenantId: string, conditionId: string) {
    assertEngineeringService(commerce, "assurance.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return { citations: [], packages: [], findings: [], thread: null };
    const condition = await this.store.get(tenantId, workspaceId, conditionId);
    if (!condition) return { citations: [], packages: [], findings: [], thread: null };
    const citations = await this.store.listCitations(tenantId, workspaceId, { conditionId });
    const packages = [];
    const findings = [];
    for (const citation of citations) {
      const pkg = await this.reviews.getPackage(tenantId, workspaceId, citation.reviewPackageId);
      if (pkg) packages.push(pkg);
      findings.push(...(await this.reviews.listFindings(citation.reviewPackageId, tenantId, workspaceId)));
    }
    return {
      citations,
      packages,
      findings,
      thread: composeConditionReviewThread({ condition, citations, findings }),
    };
  }

  async citedConditions(commerce: CommerceExecutionContext, tenantId: string, reviewPackageId: string) {
    assertEngineeringService(commerce, "assurance.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    const pkg = await this.reviews.getPackage(tenantId, workspaceId, reviewPackageId);
    if (!pkg) return [];
    const citations = await this.store.listCitations(tenantId, workspaceId, { reviewPackageId });
    const conditions: EngineeringAssuranceCondition[] = [];
    for (const citation of citations) {
      const row = await this.store.get(tenantId, workspaceId, citation.conditionId);
      if (row) conditions.push(row);
    }
    return conditions.map((condition) => ({
      id: condition.id,
      conditionCode: condition.conditionCode,
      conditionType: condition.conditionType,
      status: condition.status,
      ruleId: condition.ruleId,
      ruleVersion: condition.ruleVersion,
      explanation: condition.explanation,
      digitalThreadPath: condition.digitalThreadPath,
      materiality: condition.materiality,
    }));
  }

  async linkIssue(commerce: CommerceExecutionContext, tenantId: string, id: string, issueId: string, actorId: string) {
    assertEngineeringService(commerce, "assurance.disposition", tenantId);
    return this.patchCondition(commerce, tenantId, id, (row) => ({ ...row, issueId }), actorId, "linked_issue");
  }

  private async linkValidatedPackage(
    commerce: CommerceExecutionContext,
    tenantId: string,
    condition: EngineeringAssuranceCondition,
    pkg: { id: string; tenantId: string; workspaceId: string },
    actorId: string,
    action: string,
  ) {
    const now = new Date().toISOString();
    const citation = await this.store.insertCitation(citationRecord(condition, pkg, actorId, now));
    const findingsBefore = await this.reviews.listFindings(pkg.id, tenantId, pkg.workspaceId);
    const next = await this.patchCondition(
      commerce,
      tenantId,
      condition.id,
      (row) => ({
        ...row,
        reviewPackageId: pkg.id,
        status: row.status === "OPEN" || row.status === "ACKNOWLEDGED" ? "UNDER_REVIEW" : row.status,
      }),
      actorId,
      action,
    );
    const findingsAfter = await this.reviews.listFindings(pkg.id, tenantId, pkg.workspaceId);
    if (findingsAfter.length !== findingsBefore.length) {
      throw new Error("automatic_finding_forbidden");
    }
    void citation;
    return next;
  }

  private async patchCondition(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    mutate: (row: EngineeringAssuranceCondition) => EngineeringAssuranceCondition,
    actorId: string,
    action: string,
  ) {
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const current = await this.store.get(tenantId, workspaceId, id);
    if (!current) return null;
    const next = mutate(current);
    void actorId;
    await this.store.upsertMany([next]);
    await this.audit(tenantId, id, action);
    return next;
  }

  private async audit(tenantId: string, entityId: string, action: string) {
    await db(this.supabase).from("engineering_audit_links").insert({
      tenant_id: tenantId,
      entity_type: action.startsWith("rule_") ? "assurance_rule_setting" : "assurance_condition",
      entity_id: entityId,
      action,
    });
  }

  private async loadInterfaceInformation(tenantId: string, workspaceId: string): Promise<InterfaceInformationFact[]> {
    const { data, error } = await db(this.supabase)
      .from("engineering_interface_information_requirements")
      .select("interface_id,information_key,status,source_discipline_code,receiving_discipline_code,description")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .limit(500);
    if (error) return [];
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      interfaceId: String(row.interface_id),
      informationKey: String(row.information_key),
      status: String(row.status),
      sourceDiscipline: (row.source_discipline_code as string | null) ?? null,
      receivingDiscipline: (row.receiving_discipline_code as string | null) ?? null,
      description: (row.description as string | null) ?? null,
    }));
  }
}

export type { ThreadGraphInput, AssuranceEvaluationRun };
