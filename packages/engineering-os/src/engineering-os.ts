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
  timeline: EngineeringTimelineService;
  activity: EngineeringActivityService;
  objects: EngineeringObjectFramework;
  demo: EngineeringDemoDataService;
  health: EngineeringHealthService;
}

export function createEngineeringOS(
  supabase: SupabaseClient,
  kernel: PlatformKernel,
  options?: { documentBodyRetriever?: DocumentBodyRetrievalProbe },
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
  const timeline = new EngineeringTimelineService(supabase);
  const activity = new EngineeringActivityService(supabase);
  const objects = new EngineeringObjectFramework(supabase, kernel);
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
    timeline,
    activity,
    objects,
    demo,
    health,
  };
}

