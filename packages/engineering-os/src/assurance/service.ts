import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import type { EngineeringDigitalThreadService } from "../digital-thread/service";
import type { ThreadGraphInput } from "../digital-thread/types";
import { ASSURANCE_RULE_CATALOG } from "./catalog";
import { evaluateAssurance } from "./evaluate";
import type { AssuranceListFilter, AssuranceConditionStore } from "./memory-store";
import { reconcileAssuranceConditions } from "./reconcile";
import { summarizeAssuranceConditions } from "./summary";
import { SupabaseAssuranceStore } from "./supabase-store";
import type {
  AssuranceDisposition,
  AssuranceEvaluationInput,
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

  async evaluateWorkspace(
    commerce: CommerceExecutionContext,
    tenantId: string,
    options?: { ruleId?: string; objectType?: string; objectId?: string },
  ) {
    assertEngineeringService(commerce, "assurance.evaluate", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) {
      return { conditions: [], created: 0, updated: 0, resolved: 0, reopened: 0, unchanged: 0, durationMs: 0, objectsEvaluated: 0 };
    }
    return this.evaluateInternal(tenantId, workspaceId, options);
  }

  async evaluateInternal(
    tenantId: string,
    workspaceId: string,
    options?: { ruleId?: string; objectType?: string; objectId?: string },
  ) {
    const started = Date.now();
    const graph = await this.digitalThread.loadAuthorizedWorkspaceGraph(tenantId, workspaceId);
    const interfaceInformation = await this.loadInterfaceInformation(tenantId, workspaceId);
    const input: AssuranceEvaluationInput = {
      tenantId,
      workspaceId,
      graph,
      interfaceInformation,
      now: new Date().toISOString(),
      ruleFilter: options?.ruleId,
      objectFilter: options?.objectType && options?.objectId ? { objectType: options.objectType, objectId: options.objectId } : undefined,
    };
    const detections = evaluateAssurance(input);
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
      now: input.now!,
    });
    await this.store.upsertMany(reconciled.conditions);
    return {
      ...reconciled,
      durationMs: Date.now() - started,
      objectsEvaluated: graph.nodes.filter((node) => node.workspaceId === workspaceId).length,
      rulesEvaluated: ASSURANCE_RULE_CATALOG.length,
      conditionsDetected: detections.length,
      kgUsed: false,
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
        else if (input.disposition === "CREATE_REVIEW") {
          next.status = "UNDER_REVIEW";
          next.reviewPackageId = input.reviewPackageId ?? row.reviewPackageId ?? null;
        } else if (input.disposition === "CREATE_ISSUE") {
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

  async linkReview(commerce: CommerceExecutionContext, tenantId: string, id: string, reviewPackageId: string, actorId: string) {
    assertEngineeringService(commerce, "assurance.disposition", tenantId);
    return this.patchCondition(
      commerce,
      tenantId,
      id,
      (row) => ({ ...row, reviewPackageId, status: row.status === "OPEN" || row.status === "ACKNOWLEDGED" ? "UNDER_REVIEW" : row.status }),
      actorId,
      "linked_review",
    );
  }

  async linkIssue(commerce: CommerceExecutionContext, tenantId: string, id: string, issueId: string, actorId: string) {
    assertEngineeringService(commerce, "assurance.disposition", tenantId);
    return this.patchCondition(commerce, tenantId, id, (row) => ({ ...row, issueId }), actorId, "linked_issue");
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
    await db(this.supabase).from("engineering_audit_links").insert({
      tenant_id: tenantId,
      entity_type: "assurance_condition",
      entity_id: id,
      action,
    });
    return next;
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

export type { ThreadGraphInput };
