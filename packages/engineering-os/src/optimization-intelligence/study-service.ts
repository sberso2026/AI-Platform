import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { EngineeringObjectFramework } from "../services/object-framework";
import { assertA5GovernedRelationWrite } from "../decision-intelligence/relations";
import {
  assertConstraint,
  assertDesignVariable,
  assertLifecycleStage,
  assertObjective,
  assertScenario,
  assertStudyMutable,
  ASSUMPTIONS_CONTEXT,
  INTERFACES_CONTEXT,
  REQUIREMENTS_CONTEXT,
  type AssumptionsContext,
  type InterfacesContext,
  type LifecycleStage,
  type RequirementsContext,
} from "./invariants";
import {
  assumptionContextProjection,
  decisionContextProjection,
  fingerprintStudyContext,
  interfaceContextProjection,
  isMaterialAssumption,
  requirementContextProjection,
  systemContextProjection,
} from "./context-hash";
import { fingerprintBaselineItems, type FingerprintItem } from "./fingerprint";
import { contextStaleness, preflightStudy, type PreflightFailure } from "./preflight";

async function nextStudyCode(supabase: SupabaseClient, tenantId: string, workspaceId: string): Promise<string> {
  const { count } = await supabase
    .from("engineering_optimization_studies")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId);
  return `OPT-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

type StudyRow = Record<string, unknown> & { id: string; tenant_id: string; workspace_id: string; project_id: string | null };

export class OptimizationStudyService {
  private framework: EngineeringObjectFramework;

  constructor(
    private readonly supabase: SupabaseClient,
    kernel?: PlatformKernel,
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 100) {
    assertEngineeringService(commerce, "optimization.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_optimization_studies")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(`Failed to list optimization studies: ${error.message}`);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, studyId: string) {
    assertEngineeringService(commerce, "optimization.get", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    const [children, systemScopeIds, staleness] = await Promise.all([
      this.loadChildren(study.id),
      this.getSystemScopeIds(tenantId, study),
      this.staleness(commerce, tenantId, studyId),
    ]);
    return { study, ...children, systemScopeIds, contextState: staleness };
  }

  async create(
    commerce: CommerceExecutionContext,
    input: {
      tenantId: string;
      title: string;
      description?: string;
      lifecycleStage?: LifecycleStage | string;
      studyCode?: string;
      projectId?: string;
      ownerId?: string;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "optimization.create", input.tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace required");
    const title = input.title.trim();
    if (!title) throw new Error("Study title is required.");
    if (input.lifecycleStage) assertLifecycleStage(input.lifecycleStage);
    const code = input.studyCode?.trim() || (await nextStudyCode(this.supabase, input.tenantId, workspaceId));
    const { data, error } = await this.supabase
      .from("engineering_optimization_studies")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: workspaceId,
        project_id: input.projectId ?? null,
        study_code: code,
        title,
        description: input.description ?? null,
        lifecycle_stage: input.lifecycleStage ?? "FEED",
        status: "draft",
        owner_id: input.ownerId ?? null,
        created_by: input.createdBy ?? null,
        requirements_context: "UNDECLARED",
        assumptions_context: "UNDECLARED",
        interfaces_context: "UNDECLARED",
        metadata: {} as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create optimization study: ${error?.message}`);
    await this.audit(input.tenantId, workspaceId, data.id as string, input.projectId ?? null, "optimization.study.created", `Optimization study created: ${code}`, input.createdBy ?? null);
    return data;
  }

  async update(
    commerce: CommerceExecutionContext,
    tenantId: string,
    studyId: string,
    patch: { title?: string; description?: string | null; lifecycleStage?: string; ownerId?: string | null },
  ) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    assertStudyMutable(String(study.status));
    const next: Record<string, unknown> = {};
    if (patch.title !== undefined) {
      const title = patch.title.trim();
      if (!title) throw new Error("Study title is required.");
      next.title = title;
    }
    if (patch.description !== undefined) next.description = patch.description;
    if (patch.lifecycleStage !== undefined) {
      assertLifecycleStage(patch.lifecycleStage);
      next.lifecycle_stage = patch.lifecycleStage;
    }
    if (patch.ownerId !== undefined) next.owner_id = patch.ownerId;
    const { data, error } = await this.supabase
      .from("engineering_optimization_studies")
      .update(next)
      .eq("id", study.id)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", study.workspace_id)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update optimization study: ${error?.message}`);
    await this.audit(tenantId, study.workspace_id, study.id, study.project_id as string | null, "optimization.study.context_changed", `Optimization study updated: ${String(study.study_code)}`, null);
    return data;
  }

  async setContext(
    commerce: CommerceExecutionContext,
    tenantId: string,
    studyId: string,
    input: {
      configurationBaselineId?: string | null;
      decisionId?: string | null;
      requirementsContext?: RequirementsContext | string;
      assumptionsContext?: AssumptionsContext | string;
      interfacesContext?: InterfacesContext | string;
    },
  ) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    assertStudyMutable(String(study.status));
    const next: Record<string, unknown> = {};
    if (input.configurationBaselineId !== undefined) {
      if (input.configurationBaselineId) await this.assertSameScope(study, "engineering_configuration_baselines", input.configurationBaselineId, "Configuration baseline");
      next.configuration_baseline_id = input.configurationBaselineId;
    }
    if (input.decisionId !== undefined) {
      if (input.decisionId) await this.assertSameScope(study, "engineering_decisions", input.decisionId, "Decision");
      next.decision_id = input.decisionId;
    }
    if (input.requirementsContext !== undefined) {
      if (!(REQUIREMENTS_CONTEXT as readonly string[]).includes(input.requirementsContext)) {
        throw new Error(`Invalid requirements context: ${input.requirementsContext}`);
      }
      next.requirements_context = input.requirementsContext;
    }
    if (input.assumptionsContext !== undefined) {
      if (!(ASSUMPTIONS_CONTEXT as readonly string[]).includes(input.assumptionsContext)) {
        throw new Error(`Invalid assumptions context: ${input.assumptionsContext}`);
      }
      next.assumptions_context = input.assumptionsContext;
    }
    if (input.interfacesContext !== undefined) {
      if (!(INTERFACES_CONTEXT as readonly string[]).includes(input.interfacesContext)) {
        throw new Error(`Invalid interfaces context: ${input.interfacesContext}`);
      }
      next.interfaces_context = input.interfacesContext;
    }
    const { data, error } = await this.supabase
      .from("engineering_optimization_studies")
      .update(next)
      .eq("id", study.id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to set study context: ${error?.message}`);
    await this.audit(tenantId, study.workspace_id, study.id, study.project_id as string | null, "optimization.study.context_changed", `Optimization study context declared: ${String(study.study_code)}`, null);
    return data;
  }

  async setSystemScope(commerce: CommerceExecutionContext, tenantId: string, studyId: string, systemIds: string[], actorId?: string) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    assertStudyMutable(String(study.status));
    for (const systemId of systemIds) {
      await this.assertSameScope(study, "engineering_systems", systemId, "System");
      assertA5GovernedRelationWrite({ relationship: "SCOPED_TO", fromType: "optimization_study", toType: "system" });
      await this.framework.linkObjects({
        tenantId,
        fromType: "optimization_study",
        fromId: study.id,
        toType: "system",
        toId: systemId,
        relationship: "SCOPED_TO",
        governed: true,
        createdBy: actorId,
      });
    }
    return this.getSystemScopeIds(tenantId, study);
  }

  async linkRequirement(commerce: CommerceExecutionContext, tenantId: string, studyId: string, requirementId: string, actorId?: string) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    assertStudyMutable(String(study.status));
    await this.assertSameScope(study, "engineering_requirements", requirementId, "Requirement");
    assertA5GovernedRelationWrite({ relationship: "CONSTRAINED_BY", fromType: "optimization_study", toType: "requirement" });
    await this.framework.linkObjects({
      tenantId,
      fromType: "optimization_study",
      fromId: study.id,
      toType: "requirement",
      toId: requirementId,
      relationship: "CONSTRAINED_BY",
      governed: true,
      createdBy: actorId,
    });
    return this.getLinkIds(tenantId, study.id, "CONSTRAINED_BY", "requirement");
  }

  async linkAssumption(commerce: CommerceExecutionContext, tenantId: string, studyId: string, assumptionId: string, actorId?: string) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    assertStudyMutable(String(study.status));
    await this.assertSameScope(study, "engineering_assumptions", assumptionId, "Assumption");
    assertA5GovernedRelationWrite({ relationship: "BASED_ON", fromType: "optimization_study", toType: "assumption" });
    await this.framework.linkObjects({
      tenantId,
      fromType: "optimization_study",
      fromId: study.id,
      toType: "assumption",
      toId: assumptionId,
      relationship: "BASED_ON",
      governed: true,
      createdBy: actorId,
    });
    return this.getLinkIds(tenantId, study.id, "BASED_ON", "assumption");
  }

  async linkInterface(commerce: CommerceExecutionContext, tenantId: string, studyId: string, interfaceId: string, actorId?: string) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    assertStudyMutable(String(study.status));
    await this.assertSameScope(study, "engineering_interfaces", interfaceId, "Interface");
    assertA5GovernedRelationWrite({ relationship: "CONSTRAINED_BY", fromType: "optimization_study", toType: "interface" });
    await this.framework.linkObjects({
      tenantId,
      fromType: "optimization_study",
      fromId: study.id,
      toType: "interface",
      toId: interfaceId,
      relationship: "CONSTRAINED_BY",
      governed: true,
      createdBy: actorId,
    });
    return this.getLinkIds(tenantId, study.id, "CONSTRAINED_BY", "interface");
  }

  async addObjective(
    commerce: CommerceExecutionContext,
    tenantId: string,
    studyId: string,
    input: {
      objectiveCode: string;
      name: string;
      metricKey: string;
      direction: string;
      targetValue?: number | null;
      unit?: string | null;
      priority?: number | null;
      weight?: number | null;
    },
  ) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    assertStudyMutable(String(study.status));
    const parsed = assertObjective({
      objective_code: input.objectiveCode,
      name: input.name,
      metric_key: input.metricKey,
      direction: input.direction,
      target_value: input.targetValue ?? null,
      unit: input.unit ?? null,
      priority: input.priority ?? null,
      weight: input.weight ?? null,
    });
    const { data, error } = await this.supabase
      .from("engineering_optimization_objectives")
      .insert({
        tenant_id: study.tenant_id,
        workspace_id: study.workspace_id,
        project_id: study.project_id,
        study_id: study.id,
        ...parsed,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to add objective: ${error?.message}`);
    await this.audit(tenantId, study.workspace_id, study.id, study.project_id as string | null, "optimization.objective.added", `Objective added: ${parsed.objective_code}`, null);
    return data;
  }

  async addConstraint(
    commerce: CommerceExecutionContext,
    tenantId: string,
    studyId: string,
    input: {
      constraintCode: string;
      name: string;
      constraintKind: string;
      metricKey: string;
      operator?: string | null;
      thresholdValue?: number | null;
      unit?: string | null;
      hardness?: string;
      sourceObjectType?: string | null;
      sourceObjectId?: string | null;
      actorId?: string;
    },
  ) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    assertStudyMutable(String(study.status));
    if (input.sourceObjectType && input.sourceObjectId) {
      const table =
        input.sourceObjectType === "requirement"
          ? "engineering_requirements"
          : input.sourceObjectType === "interface"
            ? "engineering_interfaces"
            : input.sourceObjectType === "assumption"
              ? "engineering_assumptions"
              : null;
      if (!table) throw new Error(`Unsupported constraint source type: ${input.sourceObjectType}`);
      await this.assertSameScope(study, table, input.sourceObjectId, "Constraint source");
    }
    const parsed = assertConstraint({
      constraint_code: input.constraintCode,
      name: input.name,
      constraint_kind: input.constraintKind,
      metric_key: input.metricKey,
      operator: input.operator ?? null,
      threshold_value: input.thresholdValue ?? null,
      unit: input.unit ?? null,
      hardness: input.hardness ?? "HARD",
      source_object_type: input.sourceObjectType ?? null,
      source_object_id: input.sourceObjectId ?? null,
    });
    const { data, error } = await this.supabase
      .from("engineering_optimization_constraints")
      .insert({
        tenant_id: study.tenant_id,
        workspace_id: study.workspace_id,
        project_id: study.project_id,
        study_id: study.id,
        ...parsed,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to add constraint: ${error?.message}`);
    if (parsed.source_object_type && parsed.source_object_id) {
      assertA5GovernedRelationWrite({
        relationship: "CONSTRAINED_BY",
        fromType: "optimization_constraint",
        toType: parsed.source_object_type,
      });
      await this.framework.linkObjects({
        tenantId,
        fromType: "optimization_constraint",
        fromId: data.id as string,
        toType: parsed.source_object_type,
        toId: parsed.source_object_id,
        relationship: "CONSTRAINED_BY",
        governed: true,
        createdBy: input.actorId,
      });
    }
    await this.audit(tenantId, study.workspace_id, study.id, study.project_id as string | null, "optimization.constraint.added", `Constraint added: ${parsed.constraint_code}`, input.actorId);
    return data;
  }

  async addDesignVariable(
    commerce: CommerceExecutionContext,
    tenantId: string,
    studyId: string,
    input: {
      variableCode: string;
      name: string;
      variableType: string;
      unit?: string | null;
      lowerBound?: number | null;
      upperBound?: number | null;
      allowedValues?: unknown[] | null;
      defaultValue?: string | null;
      description?: string | null;
    },
  ) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    assertStudyMutable(String(study.status));
    const parsed = assertDesignVariable({
      variable_code: input.variableCode,
      name: input.name,
      variable_type: input.variableType,
      unit: input.unit ?? null,
      lower_bound: input.lowerBound ?? null,
      upper_bound: input.upperBound ?? null,
      allowed_values: input.allowedValues ?? null,
      default_value: input.defaultValue ?? null,
      description: input.description ?? null,
    });
    const { data, error } = await this.supabase
      .from("engineering_optimization_design_variables")
      .insert({
        tenant_id: study.tenant_id,
        workspace_id: study.workspace_id,
        project_id: study.project_id,
        study_id: study.id,
        ...parsed,
        allowed_values: parsed.allowed_values as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to add design variable: ${error?.message}`);
    return data;
  }

  async addScenario(
    commerce: CommerceExecutionContext,
    tenantId: string,
    studyId: string,
    input: { scenarioCode: string; name: string; description?: string | null },
  ) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    assertStudyMutable(String(study.status));
    const parsed = assertScenario({
      scenario_code: input.scenarioCode,
      name: input.name,
      description: input.description ?? null,
    });
    const { data, error } = await this.supabase
      .from("engineering_optimization_scenarios")
      .insert({
        tenant_id: study.tenant_id,
        workspace_id: study.workspace_id,
        project_id: study.project_id,
        study_id: study.id,
        scenario_code: parsed.scenario_code,
        name: parsed.name,
        description: parsed.description,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to add scenario: ${error?.message}`);
    return data;
  }

  async addAlternative(
    commerce: CommerceExecutionContext,
    tenantId: string,
    studyId: string,
    input: {
      alternativeCode: string;
      name: string;
      description?: string | null;
      decisionAlternativeId?: string | null;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    assertStudyMutable(String(study.status));
    const code = input.alternativeCode.trim();
    const name = input.name.trim();
    if (!code || !name) throw new Error("Alternative code and name are required.");
    if (input.decisionAlternativeId) {
      await this.assertSameScope(study, "engineering_decision_alternatives", input.decisionAlternativeId, "Decision alternative");
    }
    const { data, error } = await this.supabase
      .from("engineering_optimization_alternatives")
      .insert({
        tenant_id: study.tenant_id,
        workspace_id: study.workspace_id,
        project_id: study.project_id,
        study_id: study.id,
        alternative_code: code,
        name,
        description: input.description ?? null,
        status: "active",
        decision_alternative_id: input.decisionAlternativeId ?? null,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to add alternative: ${error?.message}`);
    await this.audit(tenantId, study.workspace_id, study.id, study.project_id as string | null, "optimization.alternative.created", `Optimization alternative created: ${code}`, input.createdBy ?? null);
    return data;
  }

  async setAlternativeValues(
    commerce: CommerceExecutionContext,
    tenantId: string,
    studyId: string,
    alternativeId: string,
    values: Array<{ variableId: string; numericValue?: number | null; textValue?: string | null }>,
  ) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    assertStudyMutable(String(study.status));
    const { data: alt, error: altErr } = await this.supabase
      .from("engineering_optimization_alternatives")
      .select("*")
      .eq("id", alternativeId)
      .eq("study_id", study.id)
      .maybeSingle();
    if (altErr) throw new Error(altErr.message);
    if (!alt) throw new Error("Alternative not found in this study.");
    if (String(alt.status) === "withdrawn") throw new Error("Cannot set values on a withdrawn alternative.");
    await this.supabase.from("engineering_optimization_alternative_values").delete().eq("alternative_id", alternativeId).eq("study_id", study.id);
    if (values.length === 0) return [];
    const rows = values.map((value) => ({
      tenant_id: study.tenant_id,
      workspace_id: study.workspace_id,
      project_id: study.project_id,
      study_id: study.id,
      alternative_id: alternativeId,
      variable_id: value.variableId,
      numeric_value: value.numericValue ?? null,
      text_value: value.textValue ?? null,
    }));
    const { data, error } = await this.supabase.from("engineering_optimization_alternative_values").insert(rows).select();
    if (error) throw new Error(`Failed to set alternative values: ${error.message}`);
    return data ?? [];
  }

  async withdrawAlternative(commerce: CommerceExecutionContext, tenantId: string, studyId: string, alternativeId: string) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    assertStudyMutable(String(study.status));
    const { data, error } = await this.supabase
      .from("engineering_optimization_alternatives")
      .update({ status: "withdrawn" })
      .eq("id", alternativeId)
      .eq("study_id", study.id)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to withdraw alternative: ${error?.message}`);
    await this.audit(tenantId, study.workspace_id, study.id, study.project_id as string | null, "optimization.alternative.withdrawn", `Optimization alternative withdrawn: ${String(data.alternative_code)}`, null);
    return data;
  }

  async preflight(commerce: CommerceExecutionContext, tenantId: string, studyId: string) {
    assertEngineeringService(commerce, "optimization.get", tenantId);
    return this.computePreflight(await this.requireStudy(tenantId, studyId, commerce));
  }

  async setReady(commerce: CommerceExecutionContext, tenantId: string, studyId: string, actorId?: string) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    const result = await this.computePreflight(study);
    if (!result.ok) {
      const detail = result.failures.map((failure: PreflightFailure) => `${failure.code}: ${failure.message}`).join("; ");
      throw new Error(`Study is not READY: ${detail}`);
    }
    if (String(study.status) !== "draft" && String(study.status) !== "defined") {
      throw new Error(`Cannot set READY from status ${String(study.status)}.`);
    }
    const snapshot = await this.loadContextSnapshot(tenantId, study);
    const contextFingerprint = fingerprintStudyContext({
      baselineId: (study.configuration_baseline_id as string | null) ?? null,
      decision: snapshot.decision,
      systems: snapshot.systems,
      requirements: snapshot.requirements,
      assumptions: snapshot.assumptions,
      interfaces: snapshot.interfaces,
    });
    const { data, error } = await this.supabase
      .from("engineering_optimization_studies")
      .update({ status: "ready", context_fingerprint: contextFingerprint })
      .eq("id", study.id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to set study READY: ${error?.message}`);
    await this.audit(tenantId, study.workspace_id, study.id, study.project_id as string | null, "optimization.study.ready", `Optimization study READY: ${String(study.study_code)}`, actorId);
    return data;
  }

  async close(commerce: CommerceExecutionContext, tenantId: string, studyId: string, supersededById?: string | null) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    const status = supersededById ? "superseded" : "closed";
    const { data, error } = await this.supabase
      .from("engineering_optimization_studies")
      .update({ status })
      .eq("id", study.id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to close study: ${error?.message}`);
    await this.audit(
      tenantId,
      study.workspace_id,
      study.id,
      study.project_id as string | null,
      supersededById ? "optimization.study.superseded" : "optimization.study.closed",
      `Optimization study ${status}: ${String(study.study_code)}`,
      null,
    );
    return data;
  }

  async captureBaselineItems(commerce: CommerceExecutionContext, tenantId: string, studyId: string) {
    assertEngineeringService(commerce, "optimization.get", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    return this.captureBaselineItemsForStudy(study);
  }

  async captureBaselineItemsForStudy(study: StudyRow): Promise<{
    items: FingerprintItem[];
    fingerprint: string;
    baselineId: string;
    baselineStatus: string;
  }> {
    if (!study.configuration_baseline_id) throw new Error("Study has no configuration baseline.");
    const { data: baseline, error: bErr } = await this.supabase
      .from("engineering_configuration_baselines")
      .select("id, status, workspace_id, project_id, tenant_id")
      .eq("id", study.configuration_baseline_id as string)
      .maybeSingle();
    if (bErr) throw new Error(bErr.message);
    if (!baseline) throw new Error("Configuration baseline not found.");
    if (baseline.workspace_id !== study.workspace_id || baseline.tenant_id !== study.tenant_id) {
      throw new Error("Baseline is outside study workspace.");
    }
    if (study.project_id && baseline.project_id && baseline.project_id !== study.project_id) {
      throw new Error("Baseline is outside study project.");
    }
    const { data: items, error } = await this.supabase
      .from("engineering_configuration_items")
      .select("id, object_type, object_id, revision_ref, object_code_snapshot, object_title_snapshot, effective_state")
      .eq("baseline_id", String(baseline.id))
      .eq("tenant_id", study.tenant_id)
      .eq("workspace_id", study.workspace_id);
    if (error) throw new Error(error.message);
    const snapshots: FingerprintItem[] = (items ?? []).map((row) => ({
      configuration_item_id: String(row.id),
      object_type: String(row.object_type ?? ""),
      object_id: String(row.object_id ?? ""),
      revision_ref: (row.revision_ref as string | null) ?? null,
      object_code_snapshot: (row.object_code_snapshot as string | null) ?? null,
      object_title_snapshot: (row.object_title_snapshot as string | null) ?? null,
      effective_state: (row.effective_state as string | null) ?? null,
    }));
    return {
      items: snapshots,
      fingerprint: fingerprintBaselineItems(snapshots),
      baselineId: String(baseline.id),
      baselineStatus: String(baseline.status ?? ""),
    };
  }

  async staleness(commerce: CommerceExecutionContext, tenantId: string, studyId: string) {
    assertEngineeringService(commerce, "optimization.get", tenantId);
    const study = await this.requireStudy(tenantId, studyId, commerce);
    let currentFrozenBaselineId: string | null = null;
    if (study.project_id) {
      const { data: accepted } = await this.supabase
        .from("engineering_configuration_baselines")
        .select("id")
        .eq("project_id", study.project_id)
        .eq("workspace_id", study.workspace_id)
        .eq("tenant_id", tenantId)
        .eq("status", "frozen")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      currentFrozenBaselineId = (accepted?.id as string | undefined) ?? null;
    }
    const snapshot = await this.loadContextSnapshot(tenantId, study);
    const currentContextFingerprint = fingerprintStudyContext({
      baselineId: currentFrozenBaselineId ?? ((study.configuration_baseline_id as string | null) ?? null),
      decision: snapshot.decision,
      systems: snapshot.systems,
      requirements: snapshot.requirements,
      assumptions: snapshot.assumptions,
      interfaces: snapshot.interfaces,
    });
    return contextStaleness({
      studyBaselineId: study.configuration_baseline_id as string | null,
      currentFrozenBaselineId,
      pinnedContextFingerprint: (study.context_fingerprint as string | null) ?? null,
      currentContextFingerprint,
    });
  }

  async loadChildren(studyId: string) {
    const [objectives, constraints, variables, scenarios, alternatives, runs] = await Promise.all([
      this.supabase.from("engineering_optimization_objectives").select("*").eq("study_id", studyId),
      this.supabase.from("engineering_optimization_constraints").select("*").eq("study_id", studyId),
      this.supabase.from("engineering_optimization_design_variables").select("*").eq("study_id", studyId),
      this.supabase.from("engineering_optimization_scenarios").select("*").eq("study_id", studyId),
      this.supabase.from("engineering_optimization_alternatives").select("*").eq("study_id", studyId),
      this.supabase.from("engineering_optimization_runs").select("*").eq("study_id", studyId).order("created_at", { ascending: false }),
    ]);
    for (const result of [objectives, constraints, variables, scenarios, alternatives, runs]) {
      if (result.error) throw new Error(result.error.message);
    }
    return {
      objectives: objectives.data ?? [],
      constraints: constraints.data ?? [],
      variables: variables.data ?? [],
      scenarios: scenarios.data ?? [],
      alternatives: alternatives.data ?? [],
      runs: runs.data ?? [],
    };
  }

  private async computePreflight(study: StudyRow) {
    const children = await this.loadChildren(study.id);
    const systemScopeIds = await this.getSystemScopeIds(study.tenant_id, study);
    let baselineStatus: string | null = null;
    let baselineWorkspaceId: string | null = null;
    let baselineProjectId: string | null = null;
    if (study.configuration_baseline_id) {
      const { data } = await this.supabase
        .from("engineering_configuration_baselines")
        .select("status, workspace_id, project_id")
        .eq("id", study.configuration_baseline_id as string)
        .maybeSingle();
      baselineStatus = (data?.status as string | undefined) ?? null;
      baselineWorkspaceId = (data?.workspace_id as string | undefined) ?? null;
      baselineProjectId = (data?.project_id as string | undefined) ?? null;
    }
    let decisionWorkspaceId: string | null = null;
    let decisionProjectId: string | null = null;
    if (study.decision_id) {
      const { data } = await this.supabase
        .from("engineering_decisions")
        .select("workspace_id, project_id")
        .eq("id", study.decision_id as string)
        .maybeSingle();
      decisionWorkspaceId = (data?.workspace_id as string | undefined) ?? null;
      decisionProjectId = (data?.project_id as string | undefined) ?? null;
    }
    const activeAlts = children.alternatives.filter((row) => String(row.status) !== "withdrawn");
    const snapshot = await this.loadContextSnapshot(study.tenant_id, study);
    return preflightStudy({
      workspaceId: study.workspace_id,
      projectId: study.project_id,
      systemScopeCount: systemScopeIds.length,
      baselineId: (study.configuration_baseline_id as string | null) ?? null,
      baselineStatus,
      baselineWorkspaceId,
      baselineProjectId,
      decisionId: (study.decision_id as string | null) ?? null,
      decisionWorkspaceId,
      decisionProjectId,
      requirementsContext: String(study.requirements_context ?? "UNDECLARED"),
      assumptionsContext: String(study.assumptions_context ?? "UNDECLARED"),
      interfacesContext: String(study.interfaces_context ?? "UNDECLARED"),
      objectiveCount: children.objectives.length,
      constraintCount: children.constraints.length,
      alternativeCount: activeAlts.length,
      requirementLinkCount: snapshot.requirements.length,
      materialAssumptionLinkCount: snapshot.assumptions.length,
      interfaceLinkCount: snapshot.interfaces.length,
      objectives: children.objectives as Array<Record<string, unknown>>,
      constraints: children.constraints as Array<Record<string, unknown>>,
      variables: children.variables as Array<Record<string, unknown>>,
    });
  }

  private async getSystemScopeIds(tenantId: string, study: StudyRow) {
    return this.getLinkIds(tenantId, study.id, "SCOPED_TO", "system");
  }

  private async getLinkIds(tenantId: string, studyId: string, relationship: string, toType: string) {
    const { data, error } = await this.supabase
      .from("engineering_object_links")
      .select("to_id, to_type, relationship")
      .eq("from_type", "optimization_study")
      .eq("from_id", studyId)
      .eq("relationship", relationship)
      .eq("relationship_governed", true)
      .eq("tenant_id", tenantId);
    if (error) throw new Error(error.message);
    return (data ?? [])
      .filter((row) => String(row.to_type ?? toType) === toType)
      .map((row) => row.to_id as string);
  }

  async loadContextSnapshot(tenantId: string, study: StudyRow) {
    const [systemIds, requirementIds, assumptionIds, interfaceIds] = await Promise.all([
      this.getLinkIds(tenantId, study.id, "SCOPED_TO", "system"),
      this.getLinkIds(tenantId, study.id, "CONSTRAINED_BY", "requirement"),
      this.getLinkIds(tenantId, study.id, "BASED_ON", "assumption"),
      this.getLinkIds(tenantId, study.id, "CONSTRAINED_BY", "interface"),
    ]);
    const systems = await this.loadRowsByIds("engineering_systems", systemIds);
    const requirements = await this.loadRowsByIds("engineering_requirements", requirementIds);
    const assumptionsRaw = await this.loadRowsByIds("engineering_assumptions", assumptionIds);
    const interfaces = await this.loadRowsByIds("engineering_interfaces", interfaceIds);
    let decision: ReturnType<typeof decisionContextProjection> = null;
    if (study.decision_id) {
      const { data } = await this.supabase.from("engineering_decisions").select("id, status").eq("id", study.decision_id as string).maybeSingle();
      decision = decisionContextProjection((data as Record<string, unknown> | null) ?? { id: String(study.decision_id) });
    }
    return {
      systems: systems.map(systemContextProjection),
      requirements: requirements.map(requirementContextProjection),
      assumptions: assumptionsRaw.filter(isMaterialAssumption).map(assumptionContextProjection),
      assumptionsAll: assumptionsRaw.map(assumptionContextProjection),
      interfaces: interfaces.map(interfaceContextProjection),
      decision,
      requirementRows: requirements,
      assumptionRows: assumptionsRaw.filter(isMaterialAssumption),
      interfaceRows: interfaces,
      systemRows: systems,
    };
  }

  private async loadRowsByIds(table: string, ids: string[]) {
    const rows: Array<Record<string, unknown>> = [];
    for (const id of ids) {
      const { data, error } = await this.supabase.from(table).select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      if (data) rows.push(data as Record<string, unknown>);
    }
    return rows;
  }

  private async requireStudy(tenantId: string, studyId: string, commerce: CommerceExecutionContext): Promise<StudyRow> {
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace required");
    const { data, error } = await this.supabase
      .from("engineering_optimization_studies")
      .select("*")
      .eq("id", studyId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Optimization study not found.");
    return data as StudyRow;
  }

  private async assertSameScope(study: StudyRow, table: string, id: string, label: string) {
    const { data, error } = await this.supabase.from(table).select("id, workspace_id, project_id, tenant_id").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    const row = data as { tenant_id?: string; workspace_id?: string; project_id?: string | null } | null;
    if (
      !row ||
      row.tenant_id !== study.tenant_id ||
      row.workspace_id !== study.workspace_id ||
      (study.project_id && row.project_id && row.project_id !== study.project_id)
    ) {
      throw new Error(`${label} is outside study workspace/project.`);
    }
  }

  private async audit(
    tenantId: string,
    workspaceId: string,
    objectId: string,
    projectId: string | null,
    eventType: string,
    title: string,
    actorId?: string | null,
  ) {
    try {
      await this.framework.recordTimeline({
        tenantId,
        workspaceId,
        eventType,
        objectType: "optimization_study",
        objectId,
        projectId: projectId ?? undefined,
        title,
        actorId: actorId ?? undefined,
      });
      await this.framework.recordActivity({
        tenantId,
        workspaceId,
        activityType: eventType,
        objectType: "optimization_study",
        objectId,
        projectId: projectId ?? undefined,
        title,
        actorId: actorId ?? undefined,
      });
    } catch {
      // audit is best-effort; do not fail the governed write
    }
  }
}
