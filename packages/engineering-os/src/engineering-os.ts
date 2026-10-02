import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import {
  EngineeringAssetService,
  EngineeringDocumentService,
  EngineeringProjectService,
} from "./services/core-services";
import {
  EngineeringAIService,
  EngineeringApplicationRuntime,
  EngineeringCompanyService,
  EngineeringDashboardService,
  EngineeringDisciplineService,
  EngineeringSearchService,
  EngineeringSettingsService,
} from "./services/supporting-services";
import type { DocumentBodyRetrievalProbe } from "./services/engineering-retrieval-service";
import {
  EngineeringActivityService,
  EngineeringObjectFramework,
  EngineeringTimelineService,
} from "./services/object-framework";
import {
  EngineeringActionService,
  EngineeringDecisionService,
  EngineeringIssueService,
  EngineeringLessonService,
  EngineeringRiskService,
  EngineeringTechnicalQueryService,
} from "./services/register-services";
import { EngineeringAssumptionService } from "./decision-intelligence/assumption-service";
import { EngineeringSystemService } from "./systems-intelligence/system-service";
import { EngineeringInterfaceService } from "./systems-intelligence/interface-service";
import { EngineeringRequirementService } from "./control-intelligence/requirement-service";
import { EngineeringChangeService } from "./control-intelligence/change-service";
import { EngineeringImpactService } from "./control-intelligence/impact-service";
import { EngineeringConfigurationService } from "./control-intelligence/configuration-service";
import { OptimizationStudyService } from "./optimization-intelligence/study-service";
import { OptimizationRunService } from "./optimization-intelligence/run-service";
import { ExternalToolProfileService } from "./external-tools/profile-service";
import { ExternalToolAssignmentService } from "./external-tools/assignment-service";
import { DisciplineIntelligenceService } from "./discipline-intelligence/service";
import { AnalysisRequestService } from "./analysis-intelligence/request-service";
import { EngineeringDigitalThreadService } from "./digital-thread/service";
import {
  EngineeringDigitalThreadProjectionService,
  PlatformKgThreadProjectionStore,
  registerThreadProjectionJobHandler,
} from "./digital-thread/projection";
import { EngineeringAssuranceService, registerAssuranceEvaluateHandler } from "./assurance";
import { EngineeringLifecycleService } from "./lifecycle-intelligence/service";
import { EngineeringDeliverableService } from "./deliverable-intelligence/service";
import { EngineeringInformationService } from "./information-intelligence/service";
import { EngineeringWorkContextService } from "./work-context/service";
import { EngineeringM365ConnectorService, registerSharePointSyncHandler } from "./connectors/m365";
import { LiveGraphPort } from "./connectors/m365/graph";
import { EngineeringExternalConnectorService, registerExternalConnectorSyncHandler } from "./connectors/engineering";
import { EngineeringInformationRequirementService } from "./information-requirements/service";
import { EngineeringWorkGeneratorService } from "./work-generator/service";
import { EngineeringArtifactAutomationService } from "./artifact-automation/service";
import { LegacyRelationalArtifactBinaryStore, RoutingArtifactBinaryStore } from "./artifact-automation/binary-adapters";
import { SupabaseArtifactBinaryStore } from "./artifact-automation/supabase-binary-store";
import { objectStorageWritesEnabled } from "./artifact-automation/binary-store";
import { EngineeringToolOrchestrationService } from "./tool-orchestration/service";
import { EngineeringPreIssueReviewService } from "./pre-issue-review/service";
import { SupabasePreIssueStore } from "./pre-issue-review/supabase-store";
import { EngineeringChangeWorkbenchService } from "./change-workbench/service";
import { EngineeringAttentionService } from "./attention/service";
import { EngineeringQuantityMtoService } from "./lifecycle-intelligence/quantity-mto-service";
import { SupabaseQuantityMtoStore } from "./lifecycle-intelligence/quantity-mto-store";
import { MemoryEngineeringReviewStore, createSharedReviewMemory } from "@rtb/engineering-review";
import { SupabaseWorkPlanStore } from "./work-generator/supabase-store";
import { registerAnalysisExecuteHandler } from "./analysis-intelligence/job-handler";
import { registerOptimizationEvaluateHandler } from "./optimization-intelligence/job-handler";
import { EngineeringDemoDataService } from "./services/demo-data-service";
import { EngineeringHealthService } from "./services/health-service";
import { workspaceScopeId } from "./commerce/workspace-scope";

export interface EngineeringOS {
  projects: EngineeringProjectService;
  assets: EngineeringAssetService;
  documents: EngineeringDocumentService;
  disciplines: EngineeringDisciplineService;
  companies: EngineeringCompanyService;
  applications: EngineeringApplicationRuntime;
  settings: EngineeringSettingsService;
  search: EngineeringSearchService;
  ai: EngineeringAIService;
  dashboard: EngineeringDashboardService;
  decisions: EngineeringDecisionService;
  actions: EngineeringActionService;
  risks: EngineeringRiskService;
  issues: EngineeringIssueService;
  technicalQueries: EngineeringTechnicalQueryService;
  lessons: EngineeringLessonService;
  assumptions: EngineeringAssumptionService;
  systems: EngineeringSystemService;
  interfaces: EngineeringInterfaceService;
  requirements: EngineeringRequirementService;
  changes: EngineeringChangeService;
  impacts: EngineeringImpactService;
  configuration: EngineeringConfigurationService;
  optimizationStudies: OptimizationStudyService;
  optimizationRuns: OptimizationRunService;
  externalTools: ExternalToolProfileService;
  externalToolAssignments: ExternalToolAssignmentService;
  disciplineIntelligence: DisciplineIntelligenceService;
  analysisRequests: AnalysisRequestService;
  digitalThread: EngineeringDigitalThreadService;
  threadProjection: EngineeringDigitalThreadProjectionService;
  assurance: EngineeringAssuranceService;
  lifecycle: EngineeringLifecycleService;
  deliverables: EngineeringDeliverableService;
  information: EngineeringInformationService;
  work: EngineeringWorkContextService;
  workGenerator: EngineeringWorkGeneratorService;
  artifactAutomation: EngineeringArtifactAutomationService;
  toolOrchestration: EngineeringToolOrchestrationService;
  preIssueReview: EngineeringPreIssueReviewService;
  changeWorkbench: EngineeringChangeWorkbenchService;
  informationRequirements: EngineeringInformationRequirementService;
  m365Connector: EngineeringM365ConnectorService;
  engineeringConnector: EngineeringExternalConnectorService;
  attention: EngineeringAttentionService;
  quantityMto: EngineeringQuantityMtoService;
  timeline: EngineeringTimelineService;
  activity: EngineeringActivityService;
  objects: EngineeringObjectFramework;
  demo: EngineeringDemoDataService;
  health: EngineeringHealthService;
}

export function createEngineeringOS(
  supabase: SupabaseClient,
  kernel: PlatformKernel,
  options?: {
    documentBodyRetriever?: DocumentBodyRetrievalProbe;
    projectionWriteClient?: SupabaseClient;
    artifactStorageClient?: SupabaseClient;
  },
): EngineeringOS {
  const projects = new EngineeringProjectService(supabase, kernel);
  const assets = new EngineeringAssetService(supabase, kernel);
  const documents = new EngineeringDocumentService(supabase, kernel);
  const disciplines = new EngineeringDisciplineService(supabase);
  const companies = new EngineeringCompanyService(supabase);
  const applications = new EngineeringApplicationRuntime(supabase, kernel);
  const settings = new EngineeringSettingsService(supabase);
  const decisions = new EngineeringDecisionService(supabase, kernel);
  const actions = new EngineeringActionService(supabase, kernel);
  const risks = new EngineeringRiskService(supabase, kernel);
  const issues = new EngineeringIssueService(supabase, kernel);
  const technicalQueries = new EngineeringTechnicalQueryService(supabase, kernel);
  const lessons = new EngineeringLessonService(supabase, kernel);
  const assumptions = new EngineeringAssumptionService(supabase, kernel);
  const systems = new EngineeringSystemService(supabase, kernel);
  const interfaces = new EngineeringInterfaceService(supabase, kernel);
  const requirements = new EngineeringRequirementService(supabase, kernel);
  const changes = new EngineeringChangeService(supabase, kernel);
  const impacts = new EngineeringImpactService(supabase, kernel);
  const configuration = new EngineeringConfigurationService(supabase, kernel);
  const optimizationStudies = new OptimizationStudyService(supabase, kernel);
  const optimizationRuns = new OptimizationRunService(supabase, kernel);
  const externalTools = new ExternalToolProfileService(supabase);
  const externalToolAssignments = new ExternalToolAssignmentService(supabase);
  const disciplineIntelligence = new DisciplineIntelligenceService(supabase);
  const analysisRequests = new AnalysisRequestService(supabase, kernel);
  const threadProjection = new EngineeringDigitalThreadProjectionService(
    new PlatformKgThreadProjectionStore(options?.projectionWriteClient ?? supabase, supabase),
  );
  const digitalThread = new EngineeringDigitalThreadService(supabase, threadProjection);
  const assurance = new EngineeringAssuranceService(supabase, digitalThread);
  const deliverables = new EngineeringDeliverableService(supabase);
  const information = new EngineeringInformationService(supabase);
  const informationRequirements = new EngineeringInformationRequirementService(supabase);
  const work = new EngineeringWorkContextService(supabase, undefined, {
    async publish(input) {
      try {
        await kernel.eventBus.publish(input);
      } catch {
        // Non-UUID fixture tenants still persist work events.
      }
    },
  });
  const m365Connector = new EngineeringM365ConnectorService(supabase, {
    work,
    information,
    jobs: kernel.jobs,
    graph: new LiveGraphPort({
      async getSecretValue() {
        return null;
      },
    }),
  });
  registerSharePointSyncHandler(kernel.jobs, m365Connector);
  const connectorHolder: { current: EngineeringExternalConnectorService | null } = { current: null };
  const workGenerator = new EngineeringWorkGeneratorService(supabase, undefined, async (commerce, tenantId, input) => {
    await work.recordMaterialEvent(commerce, tenantId, {
      eventType: input.eventType,
      projectId: input.projectId,
      sourceObjectType: "engineering_work_plan",
      sourceObjectId: input.planId,
      sourceEventId: `${input.eventType}:${input.planId}`,
      actorId: input.actorId,
      systemId: input.systemId,
      lifecycleStage: input.lifecycleStage,
    });
  });
  const quantityMto = new EngineeringQuantityMtoService(
    supabase,
    new SupabaseQuantityMtoStore(supabase),
    (id) => new SupabaseWorkPlanStore(supabase).getPlan(id),
    async (commerce, tenantId, input) => {
      await work.recordMaterialEvent(commerce, tenantId, {
        eventType: input.eventType,
        projectId: input.projectId,
        sourceObjectType: "engineering_mto_snapshot",
        sourceObjectId: input.sourceObjectId,
        sourceEventId: `${input.eventType}:${input.sourceObjectId}`,
        actorId: input.actorId,
      });
    },
  );
  const artifactBinaryStore = new RoutingArtifactBinaryStore(
    new LegacyRelationalArtifactBinaryStore(),
    SupabaseArtifactBinaryStore.fromSupabase(options?.artifactStorageClient ?? supabase),
    objectStorageWritesEnabled() ? "OBJECT_STORAGE" : "LEGACY_RELATIONAL",
  );
  const artifactAutomation = new EngineeringArtifactAutomationService(
    supabase,
    undefined,
    (id) => new SupabaseWorkPlanStore(supabase).getPlan(id),
    async (commerce, tenantId, input) => {
      await work.recordMaterialEvent(commerce, tenantId, {
        eventType: input.eventType,
        projectId: input.projectId,
        sourceObjectType: input.artifactId ? "engineering_generated_artifact" : "engineering_work_plan",
        sourceObjectId: input.artifactId ?? input.planId,
        sourceEventId: `${input.eventType}:${input.artifactId ?? input.planId}`,
        actorId: input.actorId,
      });
    },
    undefined,
    {
      retrieve: (commerce, tenantId, input) => m365Connector.retrieveTemplateBinary(commerce, tenantId, input),
    },
    artifactBinaryStore,
  );
  const toolOrchestration = new EngineeringToolOrchestrationService(
    supabase,
    undefined,
    undefined,
    (id) => new SupabaseWorkPlanStore(supabase).getPlan(id),
    async (commerce, tenantId, input) => {
      await work.recordMaterialEvent(commerce, tenantId, {
        eventType: input.eventType,
        projectId: input.projectId,
        sourceObjectType: input.artifactId ? "engineering_generated_artifact" : "engineering_work_plan",
        sourceObjectId: input.artifactId ?? input.planId,
        sourceEventId: `${input.eventType}:${input.artifactId ?? input.planId}`,
        actorId: input.actorId,
      });
    },
    undefined,
    async (commerce, tenantId, input) => {
      const opened = await m365Connector.openManagedSource(commerce, tenantId, {
        projectId: input.projectId,
      });
      if (opened.ok) {
        return { ok: true, href: opened.href ?? undefined, title: opened.title, connectorImplemented: opened.connectorImplemented };
      }
      const ext = connectorHolder.current;
      if (!ext) return { ok: false, connectorImplemented: false };
      try {
        const objects = await ext.listObjects(commerce, tenantId, input.projectId);
        const drawing = objects.find((row) => row.objectType === "DRAWING" || row.objectType === "MODEL");
        if (!drawing) return { ok: false, connectorImplemented: false };
        const external = await ext.openExternalSource(commerce, tenantId, drawing.id);
        return { ok: true, href: external.href ?? undefined, title: external.title, connectorImplemented: true };
      } catch {
        return { ok: false, connectorImplemented: false };
      }
    },
    artifactBinaryStore,
  );
  const hostedReviewMemory = createSharedReviewMemory();
  const preIssueReview = new EngineeringPreIssueReviewService(
    supabase,
    undefined,
    new SupabasePreIssueStore(supabase),
    (tenantId, workspaceId, userId) =>
      new MemoryEngineeringReviewStore(
        {
          userId,
          tenantIds: [tenantId],
          workspaceIds: [workspaceId],
          permissions: [{ resource: "engineering", action: "execute" }],
        },
        hostedReviewMemory,
      ),
    (id) => new SupabaseWorkPlanStore(supabase).getPlan(id),
    async (commerce, tenantId, input) => {
      await work.recordMaterialEvent(commerce, tenantId, {
        eventType: input.eventType,
        projectId: input.projectId,
        sourceObjectType: input.artifactId ? "engineering_generated_artifact" : "engineering_work_plan",
        sourceObjectId: input.artifactId ?? input.planId,
        sourceEventId: `${input.eventType}:${input.artifactId ?? input.planId}`,
        actorId: input.actorId,
      });
    },
  );
  const changeWorkbench = new EngineeringChangeWorkbenchService(
    supabase,
    undefined,
    (tenantId, workspaceId) => digitalThread.loadAuthorizedWorkspaceGraph(tenantId, workspaceId),
    async (commerce, tenantId, input) => {
      await work.recordMaterialEvent(commerce, tenantId, {
        eventType: input.eventType,
        projectId: input.projectId,
        sourceObjectType: "engineering_impact_assessment",
        sourceObjectId: input.assessmentId,
        sourceEventId: `${input.eventType}:${input.assessmentId}`,
        actorId: input.actorId,
      });
    },
  );
  preIssueReview.bindQuantityMto((planId) => quantityMto.loadForPlan(planId));
  const attention = new EngineeringAttentionService(supabase, {
    projects,
    workGenerator,
    informationRequirements,
    work,
    preIssueReview,
    changeWorkbench,
    quantityMto,
    decisions,
    interfaces,
    notifications: kernel.notifications,
  });
  const engineeringConnector = new EngineeringExternalConnectorService(supabase, {
    work,
    information,
    workGenerator,
    changeWorkbench,
    jobs: kernel.jobs,
  });
  connectorHolder.current = engineeringConnector;
  registerExternalConnectorSyncHandler(kernel.jobs, engineeringConnector);
  const lifecycle = new EngineeringLifecycleService(supabase, undefined, undefined, deliverables);
  registerOptimizationEvaluateHandler(kernel.jobs, supabase);
  registerAnalysisExecuteHandler(kernel.jobs, supabase);
  registerThreadProjectionJobHandler(kernel.jobs, threadProjection, {
    loadWorkspaceLinks: (tenantId, workspaceId) => digitalThread.loadCanonicalLinks(tenantId, workspaceId),
  });
  registerAssuranceEvaluateHandler(kernel.jobs, assurance);
  const timeline = new EngineeringTimelineService(supabase);
  const activity = new EngineeringActivityService(supabase);
  const objects = new EngineeringObjectFramework(supabase, kernel);
  objects.setThreadProjection(threadProjection);
  const demo = new EngineeringDemoDataService(supabase, kernel);
  const health = new EngineeringHealthService(supabase, kernel, demo);
  const inspections = {
    async list(
      commerce: Parameters<typeof workspaceScopeId>[0],
      tenantId: string,
    ) {
      const workspaceId = workspaceScopeId(commerce);
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("inspection_observations")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .order("recorded_at", { ascending: false })
        .limit(20);
      if (error) return [];
      return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
        ...row,
        title: `Inspection finding: ${String(row.body ?? "").slice(0, 120)}`,
        description: row.body,
      }));
    },
  };
  const search = new EngineeringSearchService(
    projects,
    assets,
    documents,
    kernel,
    { decisions, actions, risks, issues, technicalQueries, lessons },
    inspections,
  );
  const ai = new EngineeringAIService(supabase, kernel, search, options?.documentBodyRetriever);
  const dashboard = new EngineeringDashboardService(
    projects,
    assets,
    documents,
    applications,
    kernel,
    { decisions, actions, risks, issues, technicalQueries, lessons }
  );

  return {
    projects,
    assets,
    documents,
    disciplines,
    companies,
    applications,
    settings,
    search,
    ai,
    dashboard,
    decisions,
    actions,
    risks,
    issues,
    technicalQueries,
    lessons,
    assumptions,
    systems,
    interfaces,
    requirements,
    changes,
    impacts,
    configuration,
    optimizationStudies,
    optimizationRuns,
    externalTools,
    externalToolAssignments,
    disciplineIntelligence,
    analysisRequests,
    digitalThread,
    threadProjection,
    assurance,
    lifecycle,
    deliverables,
    information,
    work,
    workGenerator,
    artifactAutomation,
    toolOrchestration,
    preIssueReview,
    changeWorkbench,
    attention,
    quantityMto,
    informationRequirements,
    m365Connector,
    engineeringConnector,
    timeline,
    activity,
    objects,
    demo,
    health,
  };
}

