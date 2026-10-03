import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../../commerce/service-guard";
import { workspaceScopeId } from "../../commerce/workspace-scope";
import type { EngineeringWorkPlan } from "../types";
import { deriveSteelMassTonnes, type QuantityItem } from "../../lifecycle-intelligence/quantity-mto";
import type { EngineeringQuantityMtoService } from "../../lifecycle-intelligence/quantity-mto-service";
import {
  AUST300_SECTION_PROPERTY_REVISION,
  resolveVerifiedSection,
} from "../../optimization-intelligence/spacegass-aust300-sections";
import {
  A15A_V5_FEATURE_FREEZE,
  A15A_V5_GENERATOR_VERSION,
  HOSTED_MALWARE_SCANNER,
  RETURNED_ARTIFACT_ROUND_TRIP,
  STRUCTURAL_AI_BOUNDARY,
  STRUCTURAL_CALLER_SUPPLIED_KEYS,
  STRUCTURAL_SOLVER_BOUNDARY,
} from "./freeze";
import {
  buildManifest,
  buildResult,
  composeStructuralAttention,
  composeStructuralThread,
  fingerprintGovernedInputs,
  fingerprintMismatch,
  isVerifiedImmutable,
} from "./compose";
import { crusherStructuralDesignBasis } from "./fixture";
import { STRUCTURAL_WORK_KINDS, type CalculationReviewAction, type PersistedStructuralCalculation, type StructuralWorkKind } from "./types";
import { createMemoryStructuralStore, type StructuralCalculationStore } from "./store";
import { exportStructuralCalculationWorkbook } from "./xlsx";

type PlanLoader = (id: string) => Promise<EngineeringWorkPlan | null>;

export class EngineeringStructuralWorkService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly store: StructuralCalculationStore = createMemoryStructuralStore(),
    private readonly loadPlan: PlanLoader = async () => null,
    private readonly quantityMto?: EngineeringQuantityMtoService,
  ) {}

  catalog() {
    return {
      generatorVersion: A15A_V5_GENERATOR_VERSION,
      freeze: A15A_V5_FEATURE_FREEZE,
      workKinds: STRUCTURAL_WORK_KINDS,
      aiBoundary: STRUCTURAL_AI_BOUNDARY,
      solverBoundary: STRUCTURAL_SOLVER_BOUNDARY,
      newTopLevelDomain: false,
      malwareScanner: HOSTED_MALWARE_SCANNER,
      returnedArtifactRoundTrip: RETURNED_ARTIFACT_ROUND_TRIP,
      designApprovedBecauseCalculated: false,
    };
  }

  rejectCallerClaims(body: Record<string, unknown>) {
    for (const key of STRUCTURAL_CALLER_SUPPLIED_KEYS) {
      if (key in body && body[key] != null && body[key] !== "") return "caller_supplied_authority_rejected";
    }
    return null;
  }

  async list(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { projectId: string; workPlanId?: string | null; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.list", tenantId);
    this.assertProject(input.projectId, input.selectedProjectId);
    const workspaceId = this.workspace(commerce);
    return (await this.store.list(workspaceId, input.projectId, input.workPlanId))
      .filter((row) => row.tenantId === tenantId && row.workspaceId === workspaceId && row.projectId === input.projectId);
  }

  async get(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { id: string; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.get", tenantId);
    return this.requireOwned(commerce, tenantId, input.id, input.selectedProjectId);
  }

  async workbench(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { workPlanId: string; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const plan = await this.requirePlan(tenantId, this.workspace(commerce), input.workPlanId, input.selectedProjectId);
    const rows = [...await this.store.list(plan.workspaceId, plan.projectId, plan.id)]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const current = rows[0] ?? null;
    const basis = current?.designBasis ?? crusherStructuralDesignBasis({ workKind: "STRUCTURAL_MEMBER_CHECK", projectId: plan.projectId, omitMaterialGrade: true });
    return {
      catalog: this.catalog(),
      planId: plan.id,
      discipline: plan.discipline,
      workKinds: STRUCTURAL_WORK_KINDS,
      designBasis: basis,
      current,
      history: rows,
      attention: composeStructuralAttention(current, basis),
      missingInputs: basis.inputs.filter((row) => row.status !== "GOVERNED").map((row) => ({
        key: row.key,
        code: row.missingCode,
        label: row.label,
        required: row.required,
      })),
      solverBoundary: STRUCTURAL_SOLVER_BOUNDARY,
      spaceGass: {
        apiAvailable: false,
        realSolverExecution: "NOT_CERTIFIED",
        productionUsePermitted: false,
      },
    };
  }

  async seedFixture(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      workPlanId: string;
      selectedProjectId?: string | null;
      omitMaterialGrade?: boolean;
      workKind?: StructuralWorkKind;
    },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const plan = await this.requirePlan(tenantId, this.workspace(commerce), input.workPlanId, input.selectedProjectId);
    const basis = crusherStructuralDesignBasis({
      workKind: input.workKind ?? "STRUCTURAL_MEMBER_CHECK",
      omitMaterialGrade: input.omitMaterialGrade,
      projectId: plan.projectId,
    });
    const actor = this.actor(commerce);
    const id = randomUUID();
    const manifest = buildManifest({ id, workPlanId: plan.id, createdBy: actor, basis });
    const row: PersistedStructuralCalculation = {
      id,
      tenantId,
      workspaceId: plan.workspaceId,
      projectId: plan.projectId,
      workPlanId: plan.id,
      workKind: basis.workKind,
      revision: "A",
      status: basis.complete ? "CALCULATION_INCOMPLETE" : "INPUT_REQUIRED",
      reviewStatus: "UNVERIFIED",
      inputFingerprint: manifest.inputFingerprint,
      engineId: STRUCTURAL_SOLVER_BOUNDARY.engineId,
      engineVersion: STRUCTURAL_SOLVER_BOUNDARY.engineVersion,
      manifest,
      result: null,
      designBasis: basis,
      missingCodes: basis.missing,
      supersedesId: null,
      createdAt: new Date().toISOString(),
      createdBy: actor,
      executedAt: null,
      reviewedAt: null,
      reviewedBy: null,
      thread: [],
    };
    row.thread = composeStructuralThread(row);
    return this.store.save(row);
  }

  async runCheck(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { calculationId?: string; workPlanId?: string; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const current = input.calculationId
      ? await this.requireOwned(commerce, tenantId, input.calculationId, input.selectedProjectId)
      : (await this.latestForPlan(commerce, tenantId, input.workPlanId ?? "", input.selectedProjectId));
    if (!current) throw new Error("structural_calculation_required");
    if (input.workPlanId && current.workPlanId !== input.workPlanId) {
      throw new Error("CROSS_WORK_PLAN_CALCULATION_EXECUTION_PROHIBITED");
    }
    if (isVerifiedImmutable(current)) throw new Error("verified_calculation_immutable");
    const manifest = buildManifest({
      id: current.manifest.id,
      workPlanId: current.workPlanId,
      createdBy: current.createdBy,
      basis: current.designBasis,
    });
    const result = buildResult({ id: randomUUID(), manifest, basis: current.designBasis });
    current.manifest = manifest;
    current.result = result;
    current.inputFingerprint = manifest.inputFingerprint;
    current.status = result.status;
    current.missingCodes = current.designBasis.missing;
    current.executedAt = result.executedAt;
    current.thread = composeStructuralThread(current);
    return this.store.save(current);
  }

  async review(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { calculationId: string; action: CalculationReviewAction; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const row = await this.requireOwned(commerce, tenantId, input.calculationId, input.selectedProjectId);
    if (!row.result) throw new Error("calculation_result_required");
    if (isVerifiedImmutable(row) && input.action !== "ACCEPT_FOR_USE") throw new Error("verified_calculation_immutable");
    const actor = this.actor(commerce);
    const now = new Date().toISOString();
    if (input.action === "ACCEPT_FOR_USE") {
      if (row.status === "INPUT_REQUIRED" || row.status === "CALCULATION_INCOMPLETE") throw new Error("cannot_verify_incomplete_calculation");
      row.status = "VERIFIED_BY_ENGINEER";
      row.reviewStatus = "VERIFIED_BY_ENGINEER";
    } else if (input.action === "REJECT") {
      row.reviewStatus = "REJECTED";
      row.status = "REVIEW_REQUIRED";
    } else if (input.action === "NEEDS_INFORMATION") {
      row.reviewStatus = "NEEDS_INFORMATION";
      row.status = "INPUT_REQUIRED";
    } else {
      row.reviewStatus = "UNVERIFIED";
      row.status = "REVIEW_REQUIRED";
    }
    row.result.reviewAction = input.action;
    row.result.reviewedAt = now;
    row.result.reviewedBy = actor;
    row.result.reviewStatus = row.reviewStatus;
    row.result.engineeringApproved = false;
    row.reviewedAt = now;
    row.reviewedBy = actor;
    return this.store.save(row);
  }

  async changeGovernedInput(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { calculationId: string; key: string; value: number | string | null; selectedProjectId?: string | null; workPlanId?: string },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const prior = await this.requireOwned(commerce, tenantId, input.calculationId, input.selectedProjectId);
    this.assertCalculationPlan(prior, input.workPlanId);
    if (isVerifiedImmutable(prior)) {
      const next = this.cloneAsRevision(prior, this.actor(commerce));
      this.applyInput(next, input.key, input.value);
      next.status = "STALE";
      next.missingCodes = next.designBasis.missing;
      next.thread = composeStructuralThread(next);
      await this.store.save(next);
      return next;
    }
    this.applyInput(prior, input.key, input.value);
    if (prior.result) prior.status = "STALE";
    prior.missingCodes = prior.designBasis.missing;
    prior.thread = composeStructuralThread(prior);
    return this.store.save(prior);
  }

  async rerun(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { calculationId: string; selectedProjectId?: string | null; workPlanId?: string },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const prior = await this.requireOwned(commerce, tenantId, input.calculationId, input.selectedProjectId);
    this.assertCalculationPlan(prior, input.workPlanId);
    if (isVerifiedImmutable(prior) || prior.status === "STALE") {
      const next = this.cloneAsRevision(prior, this.actor(commerce));
      const saved = await this.store.save(next);
      return this.runCheck(commerce, tenantId, { calculationId: saved.id, selectedProjectId: input.selectedProjectId });
    }
    return this.runCheck(commerce, tenantId, { calculationId: prior.id, selectedProjectId: input.selectedProjectId });
  }

  async applyToMto(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { calculationId: string; selectedProjectId?: string | null; workPlanId?: string },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    if (!this.quantityMto) throw new Error("mto_service_required");
    const row = await this.requireOwned(commerce, tenantId, input.calculationId, input.selectedProjectId);
    this.assertCalculationPlan(row, input.workPlanId);
    if (!row.result || row.status === "INPUT_REQUIRED") throw new Error("calculation_incomplete");
    const items = this.mtoItemsFrom(row);
    const loaded = await this.quantityMto.loadForPlan(row.workPlanId, { disciplineScope: "STRUCTURAL" });
    if (!loaded || loaded.disciplineScope !== "STRUCTURAL" || loaded.status === "SUPERSEDED") {
      return this.quantityMto.createSnapshot(commerce, tenantId, {
        workPlanId: row.workPlanId,
        selectedProjectId: input.selectedProjectId,
        revision: "A",
        items,
        disciplineScope: "STRUCTURAL",
      });
    }
    return this.quantityMto.createRevision(commerce, tenantId, {
      snapshotId: loaded.snapshotId,
      selectedProjectId: input.selectedProjectId,
      items,
    });
  }

  async exportWorkbook(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { calculationId: string; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const row = await this.requireOwned(commerce, tenantId, input.calculationId, input.selectedProjectId);
    return exportStructuralCalculationWorkbook(row);
  }

  async attentionGapsForPlan(
    commerce: CommerceExecutionContext,
    tenantId: string,
    plan: Pick<EngineeringWorkPlan, "id" | "projectId" | "tenantId">,
  ) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = this.workspace(commerce);
    const rows = (await this.store.list(workspaceId, plan.projectId, plan.id)).filter((row) => row.tenantId === tenantId);
    const current = rows[0] ?? null;
    return composeStructuralAttention(current, current?.designBasis ?? null);
  }

  async changeImpacts(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { calculationId: string; selectedProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const row = await this.requireOwned(commerce, tenantId, input.calculationId, input.selectedProjectId);
    const quantity = row.status === "STALE" || Boolean(row.supersedesId);
    return [
      { dimension: "TECHNICAL", status: "POTENTIAL", quantified: false, autoConfirmed: false, reason: "Structural design input or result changed. Related is not confirmed impact." },
      { dimension: "QUANTITY", status: quantity ? "POTENTIAL" : "NOT_ASSESSED", quantified: false, autoConfirmed: false, reason: "Quantity may be deterministic from member length/section. Human confirmation required." },
      { dimension: "COST", status: "POTENTIAL", quantified: false, autoConfirmed: false, reason: "COST_NOT_CALCULATED without approved rates." },
      { dimension: "CARBON", status: "NOT_APPLICABLE", quantified: false, autoConfirmed: false, reason: "Crusher carbon policy is NOT_APPLICABLE. No carbon gap." },
      { dimension: "CONSTRUCTABILITY", status: "POTENTIAL", quantified: false, autoConfirmed: false, reason: "Constructability remains evidence-based. Human confirmation required." },
      { dimension: "SCHEDULE", status: "POTENTIAL", quantified: false, autoConfirmed: false, reason: "Schedule impact is potential only." },
    ];
  }

  preIssueSignals(row: PersistedStructuralCalculation | null) {
    if (!row) return { stale: false, fingerprintMismatch: false, unverified: false, missingBasis: true, missingStandard: true };
    return {
      stale: row.status === "STALE",
      fingerprintMismatch: fingerprintMismatch(row, row.designBasis),
      unverified: row.reviewStatus !== "VERIFIED_BY_ENGINEER",
      missingBasis: row.missingCodes.includes("DESIGN_BASIS_INCOMPLETE") || row.status === "INPUT_REQUIRED",
      missingStandard: row.missingCodes.includes("GOVERNING_STANDARD_REQUIRED"),
      missingSource: row.designBasis.inputs.some((item) => item.status === "GOVERNED" && !item.provenance.sourceId),
      openAssumption: row.designBasis.inputs.some((item) => item.inputClass === "ASSUMPTION" && item.status !== "GOVERNED"),
    };
  }

  private applyInput(row: PersistedStructuralCalculation, key: string, value: number | string | null) {
    row.designBasis.inputs = row.designBasis.inputs.map((item) => {
      if (item.key !== key) return item;
      const missing = value == null || value === "";
      return {
        ...item,
        value: missing ? null : value,
        status: missing ? "MISSING" : "GOVERNED",
        provenance: { ...item.provenance, status: missing ? "MISSING" : "GOVERNED", revision: "B" },
      };
    });
    if (key === "geometry.section") this.syncCatalogSectionProperties(row);
    const fingerprint = fingerprintGovernedInputs(row.designBasis.inputs);
    row.inputFingerprint = fingerprint;
    row.manifest = { ...row.manifest, inputFingerprint: fingerprint };
    if (row.result) row.result.inputFingerprint = fingerprint;
  }

  private syncCatalogSectionProperties(row: PersistedStructuralCalculation) {
    const section = row.designBasis.inputs.find((item) => item.key === "geometry.section");
    const catalog = resolveVerifiedSection(section?.value != null ? String(section.value) : null);
    row.designBasis.inputs = row.designBasis.inputs.map((item) => {
      if (item.key !== "geometry.unitMass") return item;
      if (!catalog) {
        return {
          ...item,
          value: null,
          status: "MISSING",
          provenance: {
            ...item.provenance,
            sourceId: "section-catalog-unresolved",
            title: "Governed section catalog has no unit mass for this designation",
            revision: null,
            status: "MISSING",
          },
        };
      }
      return {
        ...item,
        value: catalog.massKgPerM,
        unit: "kg/m",
        status: "GOVERNED",
        provenance: {
          ...item.provenance,
          sourceType: "GOVERNED_SECTION_CATALOG",
          sourceId: catalog.libraryName,
          title: catalog.source,
          revision: AUST300_SECTION_PROPERTY_REVISION,
          status: "GOVERNED",
        },
      };
    });
  }

  private cloneAsRevision(prior: PersistedStructuralCalculation, actor: string | null): PersistedStructuralCalculation {
    const id = randomUUID();
    const next: PersistedStructuralCalculation = {
      ...structuredClone(prior),
      id,
      revision: String.fromCharCode(prior.revision.charCodeAt(0) + 1),
      status: "STALE",
      reviewStatus: "UNVERIFIED",
      supersedesId: prior.id,
      createdAt: new Date().toISOString(),
      createdBy: actor,
      executedAt: null,
      reviewedAt: null,
      reviewedBy: null,
      result: prior.result ? { ...structuredClone(prior.result), id: randomUUID(), manifestId: id, reviewStatus: "UNVERIFIED", reviewAction: null, reviewedAt: null, reviewedBy: null, engineeringApproved: false } : null,
    };
    next.manifest = { ...next.manifest, id, createdAt: next.createdAt, createdBy: actor, verificationStatus: "UNVERIFIED" };
    return next;
  }

  private mtoItemsFrom(row: PersistedStructuralCalculation): QuantityItem[] {
    const span = row.designBasis.inputs.find((item) => item.key === "geometry.span");
    const section = row.designBasis.inputs.find((item) => item.key === "geometry.section");
    const catalog = resolveVerifiedSection(section?.value != null ? String(section.value) : null);
    const grade = row.designBasis.inputs.find((item) => item.key === "material.grade");
    const length = typeof span?.value === "number" ? span.value : null;
    const unitMass = catalog?.massKgPerM ?? null;
    const derived = length != null && catalog
      ? deriveSteelMassTonnes({
        lengthM: length,
        unitMassKgPerM: catalog.massKgPerM,
        unitMassSourceRef: catalog.libraryName,
      })
      : { ok: false as const, quantity: null as number | null };
    return [
      {
        tenantId: row.tenantId,
        workspaceId: row.workspaceId,
        projectId: row.projectId,
        systemId: row.designBasis.systemId,
        id: randomUUID(),
        itemCode: "ST-STEEL-UB",
        description: `Structural member ${section?.value ?? ""}`,
        discipline: "STRUCTURAL",
        category: "structural steel members",
        material: "Steel",
        grade: grade?.value ? String(grade.value) : null,
        specification: null,
        quantity: derived.ok ? derived.quantity : null,
        unit: "t",
        quantityOrigin: derived.ok ? "DETERMINISTICALLY_DERIVED" : "MISSING",
        quantityMaturity: "FEED_MTO",
        verificationStatus: "UNVERIFIED",
        lifecycleStage: "FEED",
        status: "ACTIVE",
        semantics: "bulk_mto",
        section: section?.value ? String(section.value) : null,
        length,
        unitMass,
        totalMass: derived.ok ? derived.quantity : null,
        basis: {
          id: randomUUID(),
          sourceType: derived.ok ? "DETERMINISTICALLY_DERIVED" : "MISSING",
          sourceRef: row.id,
          sourceRevision: row.revision,
          measurementMethod: null,
          derivationMethod: "member length × published section mass",
          formula: "length_m * unit_mass_kg_per_m / 1000",
          assumptions: [],
          exclusions: [],
          inputRefs: [row.inputFingerprint],
          createdAt: new Date().toISOString(),
          createdBy: row.createdBy ?? "eos-structural-deterministic-v1",
        },
      },
    ];
  }

  private assertCalculationPlan(row: PersistedStructuralCalculation, workPlanId?: string | null) {
    if (workPlanId && row.workPlanId !== workPlanId) {
      throw new Error("CROSS_WORK_PLAN_CALCULATION_EXECUTION_PROHIBITED");
    }
  }

  private async latestForPlan(
    commerce: CommerceExecutionContext,
    tenantId: string,
    workPlanId: string,
    selectedProjectId?: string | null,
  ) {
    const plan = await this.requirePlan(tenantId, this.workspace(commerce), workPlanId, selectedProjectId);
    const rows = await this.store.list(plan.workspaceId, plan.projectId, plan.id);
    return rows[0] ?? null;
  }

  private workspace(commerce: CommerceExecutionContext) {
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    return workspaceId;
  }

  private actor(commerce: CommerceExecutionContext) {
    return commerce.actorUserId ?? null;
  }

  private assertProject(projectId: string, selectedProjectId?: string | null) {
    if (!projectId) throw new Error("project_required");
    if (selectedProjectId && selectedProjectId !== projectId) throw new Error("CROSS_PROJECT_MISMATCH");
  }

  private async requirePlan(tenantId: string, workspaceId: string, workPlanId: string, selectedProjectId?: string | null) {
    const plan = await this.loadPlan(workPlanId);
    if (!plan || plan.tenantId !== tenantId || plan.workspaceId !== workspaceId) throw new Error("not_found");
    this.assertProject(plan.projectId, selectedProjectId);
    return plan;
  }

  private async requireOwned(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    selectedProjectId?: string | null,
  ) {
    const workspaceId = this.workspace(commerce);
    const row = await this.store.get(id);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) throw new Error("not_found");
    this.assertProject(row.projectId, selectedProjectId);
    return row;
  }
}

export function createTestStructuralWorkService(
  store = createMemoryStructuralStore(),
  loadPlan: PlanLoader = async () => null,
  quantityMto?: EngineeringQuantityMtoService,
) {
  return new EngineeringStructuralWorkService({ from() { return this; } } as never, store, loadPlan, quantityMto);
}
