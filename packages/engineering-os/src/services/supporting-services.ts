import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type {
  CommerceExecutionContext,
  EngineeringApplication,
  EngineeringCompany,
  EngineeringCompanyType,
  EngineeringDiscipline,
  EngineeringSettings,
} from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import {
  EngineeringAssetService,
  EngineeringDocumentService,
  EngineeringProjectService,
} from "./core-services";
import { dedupeDisciplinesForDisplay } from "./discipline-dedupe";

export class EngineeringDisciplineService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * User-facing disciplines list.
   * Loads system + tenant rows, then returns one row per key
   * (tenant overrides system when both exist).
   */
  async list(
    commerce: CommerceExecutionContext,
    tenantId: string,
    options?: { includeSource?: boolean }
  ): Promise<EngineeringDiscipline[]> {
    assertEngineeringService(commerce, "discipline.list", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_disciplines")
      .select("*")
      .or(`tenant_id.eq.${tenantId},and(tenant_id.is.null,is_system.eq.true)`)
      .order("name");
    if (error) throw new Error(`Failed to list disciplines: ${error.message}`);
    const mapped = (data ?? []).map((row) => this.mapRow(row));
    const deduped = dedupeDisciplinesForDisplay(mapped, tenantId);
    if (options?.includeSource) {
      return deduped.map((d) => ({
        ...d,
        // Debug-only hint for admin tooling (ignored by normal list UI)
        source: d.tenant_id === tenantId ? "tenant" : "system",
      })) as EngineeringDiscipline[];
    }
    return deduped;
  }

  private mapRow(row: Record<string, unknown>): EngineeringDiscipline {
    return {
      id: row.id as string,
      tenant_id: (row.tenant_id as string | undefined) ?? undefined,
      discipline_key: row.discipline_key as string,
      name: row.name as string,
      description: (row.description as string | undefined) ?? undefined,
      is_system: Boolean(row.is_system),
      created_at: row.created_at as string,
    };
  }

  async create(commerce: CommerceExecutionContext, input: {
    tenantId: string;
    disciplineKey: string;
    name: string;
    description?: string;
  }) {
    assertEngineeringService(commerce, "discipline.list", input.tenantId);
    const { data, error } = await this.supabase
      .from("engineering_disciplines")
      .insert({
        tenant_id: input.tenantId,
        discipline_key: input.disciplineKey,
        name: input.name,
        description: input.description ?? null,
        is_system: false,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create discipline: ${error.message}`);
    return data;
  }
}

export class EngineeringCompanyService {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(commerce: CommerceExecutionContext, tenantId: string): Promise<EngineeringCompany[]> {
    assertEngineeringService(commerce, "company.list", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_companies")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) throw new Error(`Failed to list companies: ${error.message}`);
    return (data ?? []).map(mapCompany);
  }

  async create(commerce: CommerceExecutionContext, input: {
    tenantId: string;
    name: string;
    companyType: EngineeringCompanyType;
    registrationNumber?: string;
    country?: string;
  }): Promise<EngineeringCompany> {
    assertEngineeringService(commerce, "company.create", input.tenantId);
    const { data, error } = await this.supabase
      .from("engineering_companies")
      .insert({
        tenant_id: input.tenantId,
        name: input.name,
        company_type: input.companyType,
        registration_number: input.registrationNumber ?? null,
        country: input.country ?? null,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create company: ${error?.message}`);
    return mapCompany(data);
  }
}

function mapCompany(row: Record<string, unknown>): EngineeringCompany {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    name: row.name as string,
    company_type: row.company_type as EngineeringCompanyType,
    registration_number: row.registration_number as string | undefined,
    country: row.country as string | undefined,
    status: row.status as string,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export class EngineeringApplicationRuntime {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel?: PlatformKernel
  ) {}

  async listApplications(commerce: CommerceExecutionContext, options?: { aggregate?: boolean }): Promise<EngineeringApplication[]> {
    assertEngineeringService(commerce, "application.list", undefined, options);
    const { data, error } = await this.supabase
      .from("engineering_application_registry")
      .select("*")
      .order("name");
    if (error) throw new Error(`Failed to list applications: ${error.message}`);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      app_key: row.app_key as string,
      name: row.name as string,
      description: row.description as string | undefined,
      status: row.status as string,
      version: row.version as string,
      required_capabilities: (row.required_capabilities as string[]) ?? [],
      required_permissions: (row.required_permissions as string[]) ?? [],
      routes: (row.routes as unknown[]) ?? [],
      enabled: row.enabled as boolean,
      installed_at: row.installed_at as string | undefined,
    }));
  }

  async listInstallations(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "application.list", tenantId);
    const { data: commerceInstalls, error: commerceError } = await this.supabase
      .from("commercial_application_installations")
      .select("*")
      .eq("tenant_id", tenantId);
    if (commerceError) {
      throw new Error(`Failed to list commerce application installations: ${commerceError.message}`);
    }

    const { data: runtimeInstalls, error } = await this.supabase
      .from("engineering_application_installations")
      .select("*, engineering_application_registry(app_key)")
      .eq("tenant_id", tenantId);
    if (error) throw new Error(`Failed to list runtime installations: ${error.message}`);

    const runtimeByKey = new Map<string, Record<string, unknown>>();
    for (const row of runtimeInstalls ?? []) {
      const record = row as Record<string, unknown>;
      const registry = record.engineering_application_registry as { app_key?: string } | null;
      if (registry?.app_key) runtimeByKey.set(registry.app_key, record);
    }

    return (commerceInstalls ?? []).map((commerceRow) => {
      const commerce = commerceRow as Record<string, unknown>;
      const runtime = runtimeByKey.get(commerce.application_key as string);
      return {
        ...commerce,
        source_of_truth: "commercial_application_installations",
        runtime_registration: runtime ?? null,
        enabled:
          (commerce.status === "active" || commerce.status === "degraded") &&
          Boolean(runtime?.enabled ?? true),
      };
    });
  }

  async setEnabled(commerce: CommerceExecutionContext, tenantId: string, appKey: string, enabled: boolean) {
    assertEngineeringService(commerce, "application.list", tenantId);
    const { data: commerceInstall } = await this.supabase
      .from("commercial_application_installations")
      .select("id, status")
      .eq("tenant_id", tenantId)
      .eq("application_key", appKey)
      .maybeSingle();
    if (!commerceInstall) {
      throw new Error("Commercial application installation required");
    }
    if (
      enabled &&
      commerceInstall.status !== "active" &&
      commerceInstall.status !== "degraded"
    ) {
      throw new Error("Cannot enable runtime registration when commercial installation is not active");
    }

    const { data: app } = await this.supabase
      .from("engineering_application_registry")
      .select("id")
      .eq("app_key", appKey)
      .single();
    if (!app) throw new Error("Application not found");

    const { data, error } = await this.supabase
      .from("engineering_application_installations")
      .upsert({
        tenant_id: tenantId,
        app_id: app.id,
        enabled,
        installed_at: enabled ? new Date().toISOString() : undefined,
        metadata: { source: "commercial_application_installations", commercial_id: commerceInstall.id },
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to update installation: ${error.message}`);

    if (enabled) {
      await this.kernel?.eventBus.publish({
        tenantId,
        eventType: "engineering.application.enabled",
        source: "engineering-os",
        payload: { app_key: appKey },
      });
    }

    return data;
  }
}

export class EngineeringSettingsService {
  constructor(private readonly supabase: SupabaseClient) {}

  async get(commerce: CommerceExecutionContext, tenantId: string): Promise<EngineeringSettings | null> {
    assertEngineeringService(commerce, "settings.get", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_settings")
      .select("*")
      .eq("tenant_id", tenantId)
      .single();
    if (error) return null;
    return {
      id: data.id as string,
      tenant_id: data.tenant_id as string,
      document_numbering_format: data.document_numbering_format as string,
     asset_tag_format: data.asset_tag_format as string,
      ai_review_threshold: Number(data.ai_review_threshold),
      enabled_applications: (data.enabled_applications as string[]) ?? [],
      metadata: (data.metadata as Record<string, unknown>) ?? {},
      updated_at: data.updated_at as string,
    };
  }

  async upsert(commerce: CommerceExecutionContext, tenantId: string, updates: Partial<{
    documentNumberingFormat: string;
    assetTagFormat: string;
    aiReviewThreshold: number;
    enabledApplications: string[];
    metadata: Record<string, unknown>;
  }>): Promise<EngineeringSettings> {
    assertEngineeringService(commerce, "settings.update", tenantId);
    const existing = await this.get(commerce, tenantId);
    const payload = {
      tenant_id: tenantId,
      document_numbering_format: updates.documentNumberingFormat ?? existing?.document_numbering_format ?? "{PROJECT}-{DISC}-{SEQ}",
      asset_tag_format: updates.assetTagFormat ?? existing?.asset_tag_format ?? "{PROJECT}-{SYS}-{SEQ}",
      ai_review_threshold: updates.aiReviewThreshold ?? existing?.ai_review_threshold ?? 0.7,
      enabled_applications: (updates.enabledApplications ?? existing?.enabled_applications ?? []) as unknown as Json,
      metadata: (updates.metadata ?? existing?.metadata ?? {}) as Json,
    };

    const { data, error } = await this.supabase
      .from("engineering_settings")
      .upsert(payload)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update settings: ${error?.message}`);
    return (await this.get(commerce, tenantId))!;
  }
}

export class EngineeringSearchService {
  constructor(
    private readonly projects: EngineeringProjectService,
    private readonly assets: EngineeringAssetService,
    private readonly documents: EngineeringDocumentService,
    private readonly kernel?: PlatformKernel,
    private readonly registers?: {
      decisions: { search: (commerce: CommerceExecutionContext, tenantId: string, q: string, options?: { aggregate?: boolean }) => Promise<unknown[]> };
      actions: { search: (commerce: CommerceExecutionContext, tenantId: string, q: string, options?: { aggregate?: boolean }) => Promise<unknown[]> };
      risks: { search: (commerce: CommerceExecutionContext, tenantId: string, q: string, options?: { aggregate?: boolean }) => Promise<unknown[]> };
      issues: { search: (commerce: CommerceExecutionContext, tenantId: string, q: string, options?: { aggregate?: boolean }) => Promise<unknown[]> };
      technicalQueries: { search: (commerce: CommerceExecutionContext, tenantId: string, q: string, options?: { aggregate?: boolean }) => Promise<unknown[]> };
      lessons: { search: (commerce: CommerceExecutionContext, tenantId: string, q: string, options?: { aggregate?: boolean }) => Promise<unknown[]> };
    }
  ) {}

  async search(commerce: CommerceExecutionContext, tenantId: string, query: string, filters?: {
    type?: string;
    projectId?: string;
    status?: string;
    includeKnowledgeGraph?: boolean;
  }) {
    assertEngineeringService(commerce, "search.query", tenantId);
    const type = filters?.type ?? "all";
    const aggregate = { aggregate: true as const };
    const [projects, assets, documents, decisions, actions, risks, issues, technicalQueries, lessons] =
      await Promise.all([
        type === "all" || type === "project" ? this.projects.search(commerce, tenantId, query, aggregate) : Promise.resolve([]),
        type === "all" || type === "asset" ? this.assets.search(commerce, tenantId, query, aggregate) : Promise.resolve([]),
        type === "all" || type === "document" ? this.documents.search(commerce, tenantId, query, aggregate) : Promise.resolve([]),
        (type === "all" || type === "decision") && this.registers
          ? this.registers.decisions.search(commerce, tenantId, query, aggregate)
          : Promise.resolve([]),
        (type === "all" || type === "action") && this.registers
          ? this.registers.actions.search(commerce, tenantId, query, aggregate)
          : Promise.resolve([]),
        (type === "all" || type === "risk") && this.registers
          ? this.registers.risks.search(commerce, tenantId, query, aggregate)
          : Promise.resolve([]),
        (type === "all" || type === "issue") && this.registers
          ? this.registers.issues.search(commerce, tenantId, query, aggregate)
          : Promise.resolve([]),
        (type === "all" || type === "technical_query") && this.registers
          ? this.registers.technicalQueries.search(commerce, tenantId, query, aggregate)
          : Promise.resolve([]),
        (type === "all" || type === "lesson") && this.registers
          ? this.registers.lessons.search(commerce, tenantId, query, aggregate)
          : Promise.resolve([]),
      ]);

    let knowledgeNodes: unknown[] = [];
    if (filters?.includeKnowledgeGraph && this.kernel?.knowledgeGraph) {
      try {
        const listed = await this.kernel.knowledgeGraph.listNodes(tenantId, 20);
        knowledgeNodes = listed.filter((n) =>
          (n.title ?? "").toLowerCase().includes(query.toLowerCase())
        );
      } catch {
        knowledgeNodes = [];
      }
    }

    return {
      projects: filters?.status
        ? projects.filter((p) => p.status === filters.status)
        : projects,
      assets,
      documents: filters?.status
        ? documents.filter((d) => d.status === filters.status)
        : documents,
      decisions,
      actions,
      risks,
      issues,
      technicalQueries,
      lessons,
      knowledgeNodes,
    };
  }
}

export class EngineeringAIService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel: PlatformKernel,
    private readonly search?: EngineeringSearchService,
  ) {}

  async run(commerce: CommerceExecutionContext, input: {
    tenantId: string;
    workspaceId?: string;
    userId: string;
    message: string;
    projectId?: string;
    assetId?: string;
    documentId?: string;
    disciplineId?: string;
    agentSlug?: string;
    objectType?: string;
    objectId?: string;
    scope?: string;
    sessionId?: string;
  }) {
    assertEngineeringService(commerce, "ai.execute", input.tenantId);
    const enabled = await this.kernel.intelligence.features.evaluate({
      tenantId: input.tenantId,
      featureKey: "engineering_os_enabled",
      userId: input.userId,
    });
    if (!enabled) {
      throw new Error("Engineering OS is not enabled for this tenant");
    }

    // E2/E3 grounded path: context resolver enriches retrieval; degrades to E2 on failure.
    if (this.search) {
      const { EngineeringRetrievalService } = await import("./engineering-retrieval-service");
      const { runGroundedEngineeringAsk } = await import("./grounded-ask");
      const { createSupabaseContextProvider } = await import("./supabase-context-provider");
      const retrieval = new EngineeringRetrievalService(this.search, {
        available: false,
      });

      const objectType =
        input.objectType ??
        (input.documentId ? "document" : input.assetId ? "asset" : input.projectId ? "project" : null);
      const objectId = input.objectId ?? input.documentId ?? input.assetId ?? null;

      const contextProvider = createSupabaseContextProvider(this.supabase, input.tenantId);
      const contextAuth = {
        tenantId: input.tenantId,
        workspaceId: input.workspaceId ?? null,
        canAccessObject: (ref: {
          objectType: string;
          objectId: string;
          tenantId: string;
          workspaceId?: string | null;
          projectId?: string | null;
        }) => ref.tenantId === input.tenantId,
      };

      const grounded = await runGroundedEngineeringAsk({
        commerce,
        retrieval,
        query: {
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          userId: input.userId,
          projectId: input.projectId,
          objectType,
          objectId,
          query: input.message,
          scope: (input.scope as
            | "workspace"
            | "project"
            | "asset"
            | "document"
            | "object"
            | undefined) ?? undefined,
          limit: 12,
        },
        contextProvider,
        contextAuth,
        tryGenerate: async ({ message }) => {
          try {
            let agentId: string | undefined;
            const slug = input.agentSlug ?? "engineering-director";
            const { data: agent } = await this.supabase
              .from("agents")
              .select("id")
              .eq("tenant_id", input.tenantId)
              .eq("slug", slug)
              .maybeSingle();
            agentId = agent?.id as string | undefined;

            const result = await this.kernel.aiDirector.run({
              tenantId: input.tenantId,
              workspaceId: input.workspaceId,
              userId: input.userId,
              agentId,
              sessionId: input.sessionId,
              message,
              context: {
                operating_system: "engineering",
                project_id: input.projectId,
                asset_id: input.assetId,
                document_id: input.documentId,
                discipline_id: input.disciplineId,
                grounded: true,
                phase: "E5",
              },
            });
            return { content: result.message ?? "", failed: false };
          } catch {
            return { content: "", failed: true };
          }
        },
      });

      await this.kernel.eventBus.publish({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        eventType: "engineering.ai.run.completed",
        source: "engineering-os",
        payload: {
          grounded: true,
          evidence_state: grounded.evidenceState,
          requires_review: grounded.requiresReview,
          sources: grounded.evidence.length,
          explanation_status: grounded.reasoning?.explanationStatus ?? null,
        },
      });

      return {
        message: grounded.message,
        requiresReview: grounded.requiresReview,
        evidence: grounded.evidence,
        evidenceState: grounded.evidenceState,
        scope: grounded.scope,
        limitations: grounded.limitations,
        retrievalMode: grounded.retrievalMode,
        grounded: grounded.grounded,
        reasoning: grounded.reasoning ?? null,
        why: grounded.why ?? null,
        recommendedNextActions: grounded.recommendedNextActions ?? [],
        basis: grounded.reasoning?.basis ?? [],
        assumptions: grounded.reasoning?.assumptions ?? [],
        authorityStatus: grounded.reasoning?.authorityStatus ?? null,
        explanationStatus: grounded.reasoning?.explanationStatus ?? null,
        meta: {
          ...grounded.meta,
          confidence: grounded.reasoning?.confidence ?? (grounded.grounded.abstained ? 0 : 0.7),
          requiresReview: grounded.requiresReview,
          policyApplied: true,
          phase: grounded.meta.phase ?? "E5",
        },
      };
    }

    let agentId: string | undefined;
    const slug = input.agentSlug ?? "engineering-director";
    const { data: agent } = await this.supabase
      .from("agents")
      .select("id")
      .eq("tenant_id", input.tenantId)
      .eq("slug", slug)
      .maybeSingle();
    agentId = agent?.id as string | undefined;

    const context: Record<string, unknown> = {
      operating_system: "engineering",
      project_id: input.projectId,
      asset_id: input.assetId,
      document_id: input.documentId,
      discipline_id: input.disciplineId,
    };

    const result = await this.kernel.aiDirector.run({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      userId: input.userId,
      agentId,
      message: input.message,
      context,
    });

    // Force review for engineering decision language
    const decisionKeywords = [
      "approve",
      "sign off",
      "certify",
      "engineering approval",
      "structural approval",
    ];
    const isDecision = decisionKeywords.some((k) =>
      input.message.toLowerCase().includes(k)
    );
    const requiresReview = result.requiresReview || isDecision || result.run.intent === "engineering";

    await this.kernel.eventBus.publish({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      eventType: "engineering.ai.run.completed",
      source: "engineering-os",
      payload: {
        run_id: result.run.id,
        requires_review: requiresReview,
        confidence: result.run.confidence,
      },
    });

    if (requiresReview) {
      await this.kernel.notifications
        .create({
          tenantId: input.tenantId,
          userId: input.userId,
          title: "Engineering review required",
          body: "An Engineering AI run requires human review before action.",
          type: "engineering.review.required",
        })
        .catch(() => undefined);
    }

    const promptUsage = await this.kernel.intelligence.prompts
      .selectForAgent(input.tenantId, slug)
      .catch(() => null);

    const modelRoute = await this.kernel.intelligence.models
      .resolveRoute(input.tenantId, result.run.intent ?? "engineering")
      .catch(() => ({ modelKey: result.run.model_name ?? "mock-gpt", providerType: "mock" }));

    return {
      ...result,
      requiresReview,
      evidence: [],
      evidenceState: "INSUFFICIENT" as const,
      limitations: [
        "Grounded retrieval service was not wired; refusing to present ungrounded evidence.",
      ],
      meta: {
        confidence: result.run.confidence,
        requiresReview,
        promptVersionId: (result.run as { prompt_version_id?: string }).prompt_version_id
          ?? promptUsage?.version?.id,
        modelRoute: modelRoute.modelKey,
        modelProvider: "providerType" in modelRoute ? modelRoute.providerType : "mock",
        traceId: (result.run as { trace_id?: string }).trace_id,
        costEventRef: result.run.id,
        policyApplied: true,
        grounded: false,
      },
    };
  }
}

export class EngineeringDashboardService {
  constructor(
    private readonly projects: EngineeringProjectService,
    private readonly assets: EngineeringAssetService,
    private readonly documents: EngineeringDocumentService,
    private readonly applications: EngineeringApplicationRuntime,
    private readonly kernel?: PlatformKernel,
    private readonly registers?: {
      actions: { list: (commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit?: number, options?: { aggregate?: boolean }) => Promise<Record<string, unknown>[]> };
      decisions: { list: (commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit?: number, options?: { aggregate?: boolean }) => Promise<Record<string, unknown>[]> };
      risks: { list: (commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit?: number, options?: { aggregate?: boolean }) => Promise<Record<string, unknown>[]> };
      issues: { list: (commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit?: number, options?: { aggregate?: boolean }) => Promise<Record<string, unknown>[]> };
      technicalQueries: { list: (commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit?: number, options?: { aggregate?: boolean }) => Promise<Record<string, unknown>[]> };
      lessons: { list: (commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit?: number, options?: { aggregate?: boolean }) => Promise<Record<string, unknown>[]> };
    }
  ) {}

  async getDashboard(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "dashboard.read", tenantId);
    const aggregate = { aggregate: true as const };
    const [projects, assets, documents, apps, runs, actions, decisions, risks, issues, technicalQueries, lessons] =
      await Promise.all([
      this.projects.list(commerce, tenantId, 10, aggregate),
      this.assets.list(commerce, tenantId, undefined, 10, aggregate),
      this.documents.list(commerce, tenantId, undefined, 10, aggregate),
      this.applications.listApplications(commerce, aggregate),
      this.kernel?.aiDirector.listRuns(tenantId, 10) ?? Promise.resolve([]),
      this.registers?.actions.list(commerce, tenantId, undefined, undefined, aggregate) ?? Promise.resolve([]),
      this.registers?.decisions.list(commerce, tenantId, undefined, undefined, aggregate) ?? Promise.resolve([]),
      this.registers?.risks.list(commerce, tenantId, undefined, undefined, aggregate) ?? Promise.resolve([]),
      this.registers?.issues.list(commerce, tenantId, undefined, undefined, aggregate) ?? Promise.resolve([]),
      this.registers?.technicalQueries.list(commerce, tenantId, undefined, undefined, aggregate) ?? Promise.resolve([]),
      this.registers?.lessons.list(commerce, tenantId, undefined, undefined, aggregate) ?? Promise.resolve([]),
    ]);

    const activeProjects = projects.filter((p) => p.status === "active");
    const highRiskAssets = assets.filter(
      (a) => a.criticality === "high" || a.criticality === "critical"
    );
    const reviewRequired = runs.filter((r) => r.requires_review || r.status === "review_required");
    const openActions = actions.filter((a) => !["completed", "cancelled"].includes(String(a.status)));
    const pendingDecisions = decisions.filter((d) => d.approval_status !== "approved");
    const openRisks = risks.filter((r) => r.status !== "closed");
    const openIssues = issues.filter((i) => !["resolved", "closed"].includes(String(i.status)));
    const openTqs = technicalQueries.filter((t) => t.status !== "answered" && t.status !== "closed");

    return {
      activeProjects,
      highRiskAssets,
      recentDocuments: documents.slice(0, 5),
      recentAiRuns: runs.slice(0, 5),
      applications: apps,
      reviewRequiredCount: reviewRequired.length,
      openActionsCount: openActions.length,
      pendingDecisionsCount: pendingDecisions.length,
      openRisksCount: openRisks.length,
      openIssuesCount: openIssues.length,
      openTechnicalQueriesCount: openTqs.length,
      lessonsCount: lessons.length,
      platformHealth: {
        engineeringOs: "operational",
        aiDirector: "operational",
        knowledgeGraph: "operational",
        digitalTwin: "operational",
      },
    };
  }
}

