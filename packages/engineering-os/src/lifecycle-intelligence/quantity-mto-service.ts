import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { assertCanonicalWorkPlanOwnership } from "../change-workbench/work-plan-scope";
import type { EngineeringWorkPlan } from "../work-generator/types";
import {
  CRUSHER_APPROVED_STEEL_RATE,
  CRUSHER_STEEL_FACTOR,
  crusherMtoDemonstrator,
  crusherMtoRevAItems,
  crusherMtoRevBItems,
} from "./quantity-mto-demonstrator";
import { exportMtoWorkbook } from "./quantity-mto-export";
import {
  A15A_V3_FEATURE_FREEZE,
  acceptGovernedQuantity,
  compareMtoSnapshots,
  composeMtoAttentionGaps,
  composeMtoChangeImpacts,
  composeMtoThread,
  constructabilityEvidenceFromMto,
  deriveCarbon,
  deriveCost,
  evaluateMtoSourceFreshness,
  exportDoesNotImplyApproval,
  fingerprintItems,
  reviewMtoProvenance,
  workPlanExpectsMto,
  type MtoItemWorkflowStatus,
  type QuantityItem,
  type QuantityScope,
} from "./quantity-mto";
import { valuePolicyForProject } from "./cross-lifecycle-value";
import {
  CALLER_SUPPLIED_MTO_KEYS,
  paginateItems,
  snapshotFromPersisted,
  toPersistItemVerification,
  toPersistSnapshotStatus,
  type MtoItemListQuery,
  type PersistedMtoSnapshot,
} from "./quantity-mto-persist";
import { createMemoryQuantityMtoStore, SupabaseQuantityMtoStore, type QuantityMtoStore } from "./quantity-mto-store";

export const MTO_WORKBENCH_RECON = {
  quantityBasis: "REUSE_V2_EMBEDDED",
  mtoIntelligenceDomain: "NO",
  costIntelligenceDomain: "NO",
  carbonIntelligenceDomain: "NO",
  constructabilityIntelligenceDomain: "NO",
  graphStore: "REUSE",
  eventBus: "REUSE",
  dms: "NO",
  scanner: "DEFERRED_EXTERNAL_DEPENDENCY",
} as const;

type PlanLoader = (id: string) => Promise<EngineeringWorkPlan | null>;

type EventRecorder = (
  commerce: CommerceExecutionContext,
  tenantId: string,
  input: {
    eventType:
      | "MTO_SNAPSHOT_CREATED"
      | "MTO_SNAPSHOT_VERIFIED"
      | "MTO_ITEM_VERIFIED"
      | "MTO_ITEM_REJECTED"
      | "MTO_REVISION_CREATED"
      | "MTO_SNAPSHOT_SUPERSEDED"
      | "MTO_EXPORT_PRODUCED";
    projectId: string;
    sourceObjectId: string;
    actorId?: string | null;
  },
) => Promise<void>;

function remapItems(items: QuantityItem[], scope: QuantityScope, lifecycleStage: QuantityItem["lifecycleStage"]): QuantityItem[] {
  return items.map((row) => ({
    ...row,
    ...scope,
    id: randomUUID(),
    lifecycleStage,
    basis: { ...row.basis, id: randomUUID() },
  }));
}

function missingBasisItem(scope: QuantityScope, lifecycleStage: QuantityItem["lifecycleStage"]): QuantityItem {
  return {
    ...scope,
    id: randomUUID(),
    itemCode: "ST-UNKNOWN-PLATE",
    description: "Unmeasured stiffener plate — quantity basis missing",
    discipline: "STRUCTURAL",
    category: "plate",
    material: "Steel",
    grade: null,
    specification: null,
    quantity: null,
    unit: null,
    quantityOrigin: "MISSING",
    quantityMaturity: "FEED_MTO",
    verificationStatus: "UNVERIFIED",
    lifecycleStage,
    status: "MISSING",
    semantics: "bulk_mto",
    basis: {
      id: randomUUID(),
      sourceType: "MISSING",
      sourceRef: null,
      sourceRevision: null,
      measurementMethod: null,
      derivationMethod: null,
      formula: null,
      assumptions: [],
      exclusions: ["No governed geometry or take-off for this plate"],
      createdAt: new Date().toISOString(),
      createdBy: "system",
    },
  };
}

export class EngineeringQuantityMtoService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly store: QuantityMtoStore = new SupabaseQuantityMtoStore(supabase),
    private readonly loadPlan: PlanLoader = async () => null,
    private readonly recordEvent?: EventRecorder,
  ) {}

  catalog() {
    return {
      recon: MTO_WORKBENCH_RECON,
      freeze: A15A_V3_FEATURE_FREEZE,
      newTopLevelDomain: false,
      quantityBasisIndependentTable: false,
      verificationMeans: "quantity/basis verification, not design approval",
      aiCannotVerifyOwnExtraction: true,
      autoVerifyAllProhibited: true,
      exportImpliesApproval: false,
    };
  }

  rejectCallerClaims(body: Record<string, unknown>) {
    for (const key of CALLER_SUPPLIED_MTO_KEYS) {
      if (key in body && body[key] != null && body[key] !== "") return "caller_supplied_authority_rejected";
    }
    if (body.verifyAll === true || body.autoVerify === true || body.verifyAllAi === true) {
      return "caller_supplied_authority_rejected";
    }
    return null;
  }

  async listSnapshots(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { projectId: string; workPlanId?: string | null; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = this.workspace(commerce);
    this.assertProject(input.projectId, input.selectedProjectId);
    const rows = (await this.store.listSnapshots(workspaceId, input.projectId, input.workPlanId))
      .filter((row) => row.tenantId === tenantId && row.workspaceId === workspaceId && row.projectId === input.projectId);
    return rows.map((row) => this.present(row));
  }

  async getSnapshot(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { snapshotId: string; selectedProjectId?: string | null; query?: MtoItemListQuery },
  ) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const row = await this.requireOwned(commerce, tenantId, input.snapshotId, input.selectedProjectId);
    const page = paginateItems(row.items, input.query);
    return { ...this.present(row), page };
  }

  async createSnapshot(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      workPlanId: string;
      selectedProjectId?: string | null;
      revision?: string;
      items?: QuantityItem[];
      disciplineScope?: PersistedMtoSnapshot["disciplineScope"];
    },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = this.workspace(commerce);
    const plan = await this.requirePlan(tenantId, workspaceId, input.workPlanId, input.selectedProjectId);
    if (!workPlanExpectsMto(plan.context.expectedOutputs)) throw new Error("mto_not_expected_on_work_plan");
    const existing = await this.store.listSnapshots(workspaceId, plan.projectId, plan.id);
    if (existing.some((row) => row.status !== "SUPERSEDED")) {
      throw new Error("snapshot_exists_use_revision");
    }
    const actor = this.actor(commerce);
    const items = (input.items ?? []).map((item) => this.scopedItem(item, {
      tenantId,
      workspaceId,
      projectId: plan.projectId,
      systemId: plan.systemId,
    }, plan.lifecycleStage as QuantityItem["lifecycleStage"]));
    const persisted = await this.persistNew(commerce, tenantId, {
      plan,
      revision: input.revision ?? "A",
      items,
      disciplineScope: input.disciplineScope ?? "MULTIDISCIPLINARY",
      actor,
      supersedes: null,
      eventType: "MTO_SNAPSHOT_CREATED",
    });
    return this.present(persisted);
  }

  async seedDemonstrator(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { workPlanId: string; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = this.workspace(commerce);
    const plan = await this.requirePlan(tenantId, workspaceId, input.workPlanId, input.selectedProjectId);
    const scope: QuantityScope = {
      tenantId,
      workspaceId,
      projectId: plan.projectId,
      systemId: plan.systemId,
      assetId: plan.assetId,
    };
    const stage = plan.lifecycleStage as QuantityItem["lifecycleStage"];
    const revAItems = [...remapItems(crusherMtoRevAItems(), scope, stage), missingBasisItem(scope, stage)];
    const revA = await this.persistNew(commerce, tenantId, {
      plan,
      revision: "A",
      items: revAItems,
      disciplineScope: "MULTIDISCIPLINARY",
      actor: this.actor(commerce),
      supersedes: null,
      eventType: "MTO_SNAPSHOT_CREATED",
    });
    const revBItems = [...remapItems(crusherMtoRevBItems(), scope, stage), missingBasisItem(scope, stage)];
    const revB = await this.persistNew(commerce, tenantId, {
      plan,
      revision: "B",
      items: revBItems,
      disciplineScope: "MULTIDISCIPLINARY",
      actor: this.actor(commerce),
      supersedes: revA,
      eventType: "MTO_REVISION_CREATED",
    });
    return { revA: this.present(revA), revB: this.present(revB), demonstrator: crusherMtoDemonstrator() };
  }

  async verifyItem(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      snapshotId: string;
      itemId: string;
      status: MtoItemWorkflowStatus;
      selectedProjectId?: string | null;
      confirmBulk?: boolean;
      itemIds?: string[];
    },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const actor = this.actor(commerce);
    if (!actor) throw new Error("user_required");
    const row = await this.requireOwned(commerce, tenantId, input.snapshotId, input.selectedProjectId);
    if (row.status === "VERIFIED" || row.status === "SUPERSEDED") throw new Error("verified_mto_immutable");
    const ids = input.itemIds?.length ? input.itemIds : [input.itemId];
    if (ids.length > 1 && input.confirmBulk !== true) throw new Error("bulk_verification_confirmation_required");
    const at = new Date().toISOString();
    for (const id of ids) {
      const item = row.items.find((candidate) => candidate.id === id || candidate.itemCode === id);
      if (!item) throw new Error("item_not_found");
      if (item.quantityOrigin === "SOURCE_EXTRACTED" && input.status === "VERIFIED" && actor.startsWith("ai:")) {
        throw new Error("ai_cannot_verify_extracted_quantity");
      }
      item.verificationStatus = input.status === "VERIFIED" ? "ENGINEER_ACCEPTED" : input.status;
      item.verifiedAt = at;
      item.verifiedBy = actor;
      if (input.status === "REJECTED") item.status = "REJECTED";
      await this.store.updateItem(row.id, item);
      await this.recordEvent?.(commerce, tenantId, {
        eventType: input.status === "REJECTED" ? "MTO_ITEM_REJECTED" : "MTO_ITEM_VERIFIED",
        projectId: row.projectId,
        sourceObjectId: item.id,
        actorId: actor,
      });
    }
    const refreshed = await this.requireOwned(commerce, tenantId, row.id, input.selectedProjectId);
    return this.present(refreshed);
  }

  async verifySnapshot(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { snapshotId: string; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const actor = this.actor(commerce);
    if (!actor) throw new Error("user_required");
    const row = await this.requireOwned(commerce, tenantId, input.snapshotId, input.selectedProjectId);
    if (row.status === "VERIFIED" || row.status === "SUPERSEDED") throw new Error("verified_mto_immutable");
    const blocking = row.items.filter((item) => {
      const workflow = toPersistItemVerification(item.verificationStatus);
      if (workflow === "REJECTED" || workflow === "NEEDS_INFORMATION") return true;
      if (item.quantityOrigin === "SOURCE_EXTRACTED" && workflow !== "VERIFIED") return true;
      return false;
    });
    if (blocking.length) throw new Error("snapshot_verification_blocked");
    row.status = "VERIFIED";
    row.verificationState = "VERIFIED";
    row.verifiedAt = new Date().toISOString();
    row.verifiedBy = actor;
    row.exportDisclaimer = exportDoesNotImplyApproval("VERIFIED");
    const saved = await this.store.updateSnapshotHeader(row);
    await this.recordEvent?.(commerce, tenantId, {
      eventType: "MTO_SNAPSHOT_VERIFIED",
      projectId: row.projectId,
      sourceObjectId: row.id,
      actorId: actor,
    });
    return this.present(saved);
  }

  async createRevision(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { snapshotId: string; revision?: string; items?: QuantityItem[]; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const prior = await this.requireOwned(commerce, tenantId, input.snapshotId, input.selectedProjectId);
    const plan = prior.workPlanId ? await this.requirePlan(tenantId, prior.workspaceId, prior.workPlanId, input.selectedProjectId) : null;
    if (!plan) throw new Error("work_plan_required");
    const revision = input.revision ?? this.nextRevision(prior.revision);
    const items = (input.items ?? prior.items).map((item) => this.scopedItem({
      ...item,
      id: randomUUID(),
      verificationStatus: item.quantityOrigin === "SOURCE_EXTRACTED" ? "UNVERIFIED" : item.verificationStatus,
      verifiedAt: item.quantityOrigin === "SOURCE_EXTRACTED" ? null : item.verifiedAt,
      verifiedBy: item.quantityOrigin === "SOURCE_EXTRACTED" ? null : item.verifiedBy,
    }, {
      tenantId,
      workspaceId: prior.workspaceId,
      projectId: prior.projectId,
      systemId: prior.systemId,
    }, prior.lifecycleStage));
    const created = await this.persistNew(commerce, tenantId, {
      plan,
      revision,
      items,
      disciplineScope: prior.disciplineScope,
      actor: this.actor(commerce),
      supersedes: prior,
      eventType: "MTO_REVISION_CREATED",
    });
    return this.present(created);
  }

  async compare(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { fromSnapshotId: string; toSnapshotId: string; selectedProjectId?: string | null; discipline?: string | null; category?: string | null },
  ) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const prior = await this.requireOwned(commerce, tenantId, input.fromSnapshotId, input.selectedProjectId);
    const current = await this.requireOwned(commerce, tenantId, input.toSnapshotId, input.selectedProjectId);
    if (prior.projectId !== current.projectId) throw new Error("CROSS_PROJECT_MISMATCH");
    let deltas = compareMtoSnapshots(snapshotFromPersisted(prior), snapshotFromPersisted(current));
    if (input.discipline && input.discipline !== "ALL") deltas = deltas.filter((row) => row.discipline === input.discipline);
    if (input.category && input.category !== "ALL") deltas = deltas.filter((row) => row.category === input.category);
    return {
      fromRevision: prior.revision,
      toRevision: current.revision,
      deltas,
      dollarImpact: null,
      carbonImpact: null,
    };
  }

  async refreshFreshness(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { snapshotId: string; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const row = await this.requireOwned(commerce, tenantId, input.snapshotId, input.selectedProjectId);
    const plan = row.workPlanId ? await this.loadPlan(row.workPlanId) : null;
    const governing = plan?.context.information ?? [];
    const freshness = evaluateMtoSourceFreshness(snapshotFromPersisted(row), governing);
    if (freshness.staleness === "CURRENT") return this.present(row);
    if (row.status === "VERIFIED") {
      row.staleness = "MTO_REVIEW_REQUIRED";
    } else {
      row.staleness = freshness.staleness;
    }
    const saved = await this.store.updateSnapshotHeader(row);
    return { ...this.present(saved), changed: freshness.changed };
  }

  async attentionGapsForPlan(
    commerce: CommerceExecutionContext,
    tenantId: string,
    plan: Pick<EngineeringWorkPlan, "id" | "projectId" | "tenantId">,
  ) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = this.workspace(commerce);
    const rows = (await this.store.listSnapshots(workspaceId, plan.projectId, plan.id))
      .filter((row) => row.tenantId === tenantId);
    if (!rows.length) return [];
    const current = rows.find((row) => row.status !== "SUPERSEDED") ?? rows[0];
    const prior = rows.find((row) => row.id === current.supersedesSnapshotId);
    return composeMtoAttentionGaps({
      sourceRevisionChanged: current.staleness === "SOURCE_CHANGED" || current.staleness === "MTO_REVIEW_REQUIRED",
      staleAgainstSource: current.staleness === "MTO_REVIEW_REQUIRED",
      requiresVerification: current.items.some((item) => toPersistItemVerification(item.verificationStatus) === "UNVERIFIED"),
      quantityBasisMissing: current.items.some((item) => !acceptGovernedQuantity(item).ok),
      itemRejected: current.items.some((item) => item.verificationStatus === "REJECTED"),
      revisionComparisonAvailable: Boolean(prior),
      carbonApplicable: valuePolicyForProject(plan.projectId).carbon !== "NOT_APPLICABLE",
    });
  }

  async loadForPlan(planId: string) {
    const plan = await this.loadPlan(planId);
    if (!plan) return null;
    const rows = await this.store.listSnapshots(plan.workspaceId, plan.projectId, plan.id);
    const current = rows.find((row) => row.status !== "SUPERSEDED") ?? rows[0] ?? null;
    if (!current) return null;
    return { items: current.items, staleness: current.staleness, snapshotId: current.id, projectId: current.projectId };
  }

  async reviewPlan(
    commerce: CommerceExecutionContext,
    tenantId: string,
    planId: string,
  ) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const workspaceId = this.workspace(commerce);
    const plan = await this.requirePlan(tenantId, workspaceId, planId);
    const rows = await this.store.listSnapshots(workspaceId, plan.projectId, plan.id);
    const current = rows.find((row) => row.status !== "SUPERSEDED");
    if (!current) return [];
    return reviewMtoProvenance(current.items, {
      governingRevisions: plan.context.information,
    });
  }

  async exportWorkbook(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { snapshotId: string; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const row = await this.requireOwned(commerce, tenantId, input.snapshotId, input.selectedProjectId);
    const policy = valuePolicyForProject(row.projectId);
    const rates: Record<string, typeof CRUSHER_APPROVED_STEEL_RATE | null> = {
      "ST-STEEL-UB": CRUSHER_APPROVED_STEEL_RATE,
      "EL-CABLE-PWR": null,
    };
    const factors: Record<string, typeof CRUSHER_STEEL_FACTOR | null> = {
      "ST-STEEL-UB": policy.carbon === "NOT_APPLICABLE" ? null : CRUSHER_STEEL_FACTOR,
      "EL-CABLE-PWR": null,
    };
    const prior = row.supersedesSnapshotId ? await this.store.getSnapshot(row.supersedesSnapshotId) : null;
    const deltas = prior ? compareMtoSnapshots(snapshotFromPersisted(prior), snapshotFromPersisted(row)) : [];
    const exported = await exportMtoWorkbook({
      snapshot: snapshotFromPersisted(row),
      policy,
      deltas,
      ratesByItemCode: rates,
      factorsByItemCode: factors,
      provenance: {
        projectId: row.projectId,
        revision: row.revision,
        fingerprint: row.snapshotFingerprint,
        lifecycle: row.lifecycleStage,
        generatedAt: new Date().toISOString(),
        verificationState: row.verificationState,
        disclaimer: exportDoesNotImplyApproval(row.status),
      },
    });
    await this.recordEvent?.(commerce, tenantId, {
      eventType: "MTO_EXPORT_PRODUCED",
      projectId: row.projectId,
      sourceObjectId: row.id,
      actorId: this.actor(commerce),
    });
    return {
      ...exported,
      fileName: `MTO-${row.revision}-${row.snapshotFingerprint.slice(0, 8)}.xlsx`,
      disclaimer: exportDoesNotImplyApproval(row.status),
    };
  }

  async changeImpacts(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { fromSnapshotId: string; toSnapshotId: string; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const prior = await this.requireOwned(commerce, tenantId, input.fromSnapshotId, input.selectedProjectId);
    const current = await this.requireOwned(commerce, tenantId, input.toSnapshotId, input.selectedProjectId);
    if (prior.projectId !== current.projectId) throw new Error("CROSS_PROJECT_MISMATCH");
    const deltas = compareMtoSnapshots(snapshotFromPersisted(prior), snapshotFromPersisted(current));
    return composeMtoChangeImpacts({
      deltas,
      objectType: "mto_snapshot",
      objectId: current.id,
      policy: valuePolicyForProject(current.projectId),
    });
  }

  present(row: PersistedMtoSnapshot) {
    const snapshot = snapshotFromPersisted(row);
    const policy = valuePolicyForProject(row.projectId);
    const costs = Object.fromEntries(row.items.map((item) => {
      const rate = item.itemCode === "ST-STEEL-UB" ? CRUSHER_APPROVED_STEEL_RATE : null;
      return [item.itemCode, deriveCost(acceptGovernedQuantity(item), rate)];
    }));
    const carbons = Object.fromEntries(row.items.map((item) => {
      const factor = item.itemCode === "ST-STEEL-UB" && policy.carbon !== "NOT_APPLICABLE" ? CRUSHER_STEEL_FACTOR : null;
      return [item.itemCode, deriveCarbon({ policy, quantity: acceptGovernedQuantity(item), factor })];
    }));
    const sampleForCarbon = row.items.find((item) => item.itemCode === "EL-CABLE-PWR") ?? row.items[0];
    const requiredWithoutFactor = sampleForCarbon
      ? deriveCarbon({
        policy: { ...policy, carbon: "REQUIRED" },
        quantity: acceptGovernedQuantity(sampleForCarbon),
        factor: null,
      })
      : { state: "CARBON_NOT_CALCULATED" as const, reason: "No MTO items." };
    return {
      ...row,
      snapshot,
      page: paginateItems(row.items),
      costs,
      carbons,
      policy,
      constructability: constructabilityEvidenceFromMto(row.items),
      carbonRequiredWithoutFactorExample: requiredWithoutFactor,
      progress: {
        total: row.items.length,
        verified: row.items.filter((item) => toPersistItemVerification(item.verificationStatus) === "VERIFIED").length,
        unverified: row.items.filter((item) => toPersistItemVerification(item.verificationStatus) === "UNVERIFIED").length,
        rejected: row.items.filter((item) => item.verificationStatus === "REJECTED").length,
        needsInformation: row.items.filter((item) => item.verificationStatus === "NEEDS_INFORMATION").length,
      },
    };
  }

  private async persistNew(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      plan: EngineeringWorkPlan;
      revision: string;
      items: QuantityItem[];
      disciplineScope: PersistedMtoSnapshot["disciplineScope"];
      actor: string | null;
      supersedes: PersistedMtoSnapshot | null;
      eventType: "MTO_SNAPSHOT_CREATED" | "MTO_REVISION_CREATED";
    },
  ) {
    const id = randomUUID();
    const fingerprint = fingerprintItems(input.items);
    const thread = input.items.flatMap((item) => composeMtoThread({
      source: { type: "engineering_information", id: item.basis.sourceRef ?? item.id },
      basis: { id: item.basis.id },
      item: { id: item.id },
      snapshot: { id },
      priorSnapshotId: input.supersedes?.id ?? null,
      evidenced: { type: "engineering_work_plan", id: input.plan.id },
    }));
    const persisted: PersistedMtoSnapshot = {
      id,
      tenantId,
      workspaceId: input.plan.workspaceId,
      projectId: input.plan.projectId,
      workPlanId: input.plan.id,
      systemId: input.plan.systemId,
      discipline: input.plan.discipline,
      disciplineScope: input.disciplineScope,
      lifecycleStage: input.plan.lifecycleStage as PersistedMtoSnapshot["lifecycleStage"],
      revision: input.revision,
      status: "DRAFT",
      verificationState: "UNVERIFIED",
      sourceRevisionSet: [...new Set(input.items.map((row) => row.basis.sourceRevision).filter((row): row is string => Boolean(row)))],
      itemCount: input.items.length,
      snapshotFingerprint: fingerprint,
      staleness: "CURRENT",
      createdAt: new Date().toISOString(),
      createdBy: input.actor,
      verifiedAt: null,
      verifiedBy: null,
      supersedesSnapshotId: input.supersedes?.id ?? null,
      exportDisclaimer: exportDoesNotImplyApproval("DRAFT"),
      items: input.items,
      thread,
    };
    const saved = await this.store.saveSnapshot(persisted);
    if (input.supersedes) {
      input.supersedes.status = "SUPERSEDED";
      await this.store.updateSnapshotHeader(input.supersedes);
      await this.recordEvent?.(commerce, tenantId, {
        eventType: "MTO_SNAPSHOT_SUPERSEDED",
        projectId: input.plan.projectId,
        sourceObjectId: input.supersedes.id,
        actorId: input.actor,
      });
    }
    await this.recordEvent?.(commerce, tenantId, {
      eventType: input.eventType,
      projectId: input.plan.projectId,
      sourceObjectId: saved.id,
      actorId: input.actor,
    });
    return saved;
  }

  private scopedItem(item: QuantityItem, scope: QuantityScope, lifecycleStage: QuantityItem["lifecycleStage"]): QuantityItem {
    if (item.tenantId && item.tenantId !== scope.tenantId) throw new Error("CROSS_TENANT");
    if (item.workspaceId && item.workspaceId !== scope.workspaceId) throw new Error("CROSS_WORKSPACE");
    if (item.projectId && item.projectId !== scope.projectId) throw new Error("CROSS_PROJECT_MISMATCH");
    return { ...item, ...scope, lifecycleStage };
  }

  private async requirePlan(tenantId: string, workspaceId: string, workPlanId: string, selectedProjectId?: string | null) {
    const plan = await this.loadPlan(workPlanId);
    if (!plan || plan.tenantId !== tenantId || plan.workspaceId !== workspaceId) throw new Error("not_found");
    assertCanonicalWorkPlanOwnership(plan.projectId, selectedProjectId);
    return plan;
  }

  private async requireOwned(
    commerce: CommerceExecutionContext,
    tenantId: string,
    snapshotId: string,
    selectedProjectId?: string | null,
  ) {
    const workspaceId = this.workspace(commerce);
    const row = await this.store.getSnapshot(snapshotId);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) throw new Error("not_found");
    if (selectedProjectId && selectedProjectId !== row.projectId) throw new Error("CROSS_PROJECT_MISMATCH");
    return row;
  }

  private workspace(commerce: CommerceExecutionContext) {
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    return workspaceId;
  }

  private assertProject(projectId: string, selectedProjectId?: string | null) {
    if (!projectId) throw new Error("project_required");
    if (selectedProjectId && selectedProjectId !== projectId) throw new Error("CROSS_PROJECT_MISMATCH");
  }

  private actor(commerce: CommerceExecutionContext) {
    return commerce.actorUserId ?? null;
  }

  private nextRevision(current: string) {
    if (/^[A-Y]$/i.test(current)) return String.fromCharCode(current.toUpperCase().charCodeAt(0) + 1);
    const n = Number(current);
    if (Number.isFinite(n)) return String(n + 1);
    return `${current}-2`;
  }
}

export function createTestQuantityMtoService(store = createMemoryQuantityMtoStore(), loadPlan: PlanLoader = async () => null, recorder?: EventRecorder) {
  return new EngineeringQuantityMtoService({ from() { return this; } } as never, store, loadPlan, recorder);
}
