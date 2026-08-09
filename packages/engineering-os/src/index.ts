export * from "./version";
export * from "./manifest";
export * from "./module-registry";
export * from "./module-sdk";
export * from "./domain-sdk";
export * from "./workflow-sdk";
export * from "./mobile-sdk";
export * from "./shared-services";
export * from "./ai-framework";
export * from "./permissions";
export * from "./engineering-os";
export {
  normalizeDisciplineKey,
  dedupeDisciplinesForDisplay,
  assertNoDuplicateDisciplineNames,
} from "./services/discipline-dedupe";
export {
  EngineeringProjectService,
  EngineeringAssetService,
  EngineeringDocumentService,
} from "./services/core-services";
export {
  EngineeringDisciplineService,
  EngineeringCompanyService,
  EngineeringApplicationRuntime,
  EngineeringSettingsService,
  EngineeringSearchService,
  EngineeringAIService,
  EngineeringDashboardService,
} from "./services/supporting-services";
export {
  EngineeringObjectFramework,
  EngineeringTimelineService,
  EngineeringActivityService,
} from "./services/object-framework";
export {
  EngineeringDecisionService,
  EngineeringActionService,
  EngineeringRiskService,
  EngineeringIssueService,
  EngineeringTechnicalQueryService,
  EngineeringLessonService,
} from "./services/register-services";
export {
  EngineeringDemoDataService,
  type DemoSeedResult,
  type DemoResetResult,
  type DemoDataStatus,
} from "./services/demo-data-service";
export {
  EngineeringHealthService,
  type EngineeringHealthReport,
  type HealthCheckItem,
} from "./services/health-service";
