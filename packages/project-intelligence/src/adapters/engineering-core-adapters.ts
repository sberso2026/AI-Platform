export interface ProjectContext { tenantId: string; workspaceId?: string; engineeringProjectId: string }
export interface EngineeringProject { id: string; code: string; name: string; status: string }
export interface EngineeringAsset { id: string; tag: string; name: string }
export interface EngineeringDocument { id: string; number: string; title: string; revision: string }
export interface EngineeringRegisterItem { id: string; type: string; title: string; status: string }
export interface TimelineEntry { id: string; occurredAt: string; type: string; summary: string }
export interface ActivityEntry { id: string; occurredAt: string; actorId?: string; action: string }
export interface SearchResult { id: string; kind: string; title: string; score?: number }
export interface CoreHealth { status: "healthy" | "warning" | "degraded" | "failed"; checkedAt: string }

export interface ProjectIntelligenceProjectAdapter { getProject(context: ProjectContext): Promise<EngineeringProject | null> }
export interface AssetAdapter { listAssets(context: ProjectContext): Promise<readonly EngineeringAsset[]> }
export interface DocumentAdapter { listDocuments(context: ProjectContext): Promise<readonly EngineeringDocument[]> }
export interface RegisterAdapter { listRegister(context: ProjectContext, register: string): Promise<readonly EngineeringRegisterItem[]> }
export interface TimelineAdapter { listTimeline(context: ProjectContext): Promise<readonly TimelineEntry[]> }
export interface ActivityAdapter { listActivity(context: ProjectContext): Promise<readonly ActivityEntry[]> }
export interface SearchAdapter { search(context: ProjectContext, query: string): Promise<readonly SearchResult[]> }
export interface HealthAdapter { getHealth(context: ProjectContext): Promise<CoreHealth> }

export class UnconfiguredEngineeringCoreAdapters implements ProjectIntelligenceProjectAdapter, AssetAdapter, DocumentAdapter, RegisterAdapter, TimelineAdapter, ActivityAdapter, SearchAdapter, HealthAdapter {
  private unavailable<T>(name: string): Promise<T> { return Promise.reject(new Error(`${name} is not configured`)); }
  getProject(context: ProjectContext): Promise<EngineeringProject | null> { return this.unavailable(`Project adapter for ${context.engineeringProjectId}`); }
  listAssets(context: ProjectContext): Promise<readonly EngineeringAsset[]> { return this.unavailable(`Asset adapter for ${context.engineeringProjectId}`); }
  listDocuments(context: ProjectContext): Promise<readonly EngineeringDocument[]> { return this.unavailable(`Document adapter for ${context.engineeringProjectId}`); }
  listRegister(context: ProjectContext, register: string): Promise<readonly EngineeringRegisterItem[]> { return this.unavailable(`Register adapter ${register} for ${context.engineeringProjectId}`); }
  listTimeline(context: ProjectContext): Promise<readonly TimelineEntry[]> { return this.unavailable(`Timeline adapter for ${context.engineeringProjectId}`); }
  listActivity(context: ProjectContext): Promise<readonly ActivityEntry[]> { return this.unavailable(`Activity adapter for ${context.engineeringProjectId}`); }
  search(context: ProjectContext, query: string): Promise<readonly SearchResult[]> { return this.unavailable(`Search adapter ${query} for ${context.engineeringProjectId}`); }
  getHealth(context: ProjectContext): Promise<CoreHealth> { return this.unavailable(`Health adapter for ${context.engineeringProjectId}`); }
}
