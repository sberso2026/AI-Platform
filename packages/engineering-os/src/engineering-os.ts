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
    timeline,
    activity,
    objects,
    demo,
    health,
  };
}

