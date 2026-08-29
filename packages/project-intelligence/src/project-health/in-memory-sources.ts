import type {
  BoundCollection,
  ProjectControlsSnapshot,
  ProjectControlsSource,
  ProjectCoreSnapshot,
  ProjectCoreSource,
  ProjectKnowledgeSnapshot,
  ProjectKnowledgeSource,
  PublishedControlsOutput,
} from "./source-contracts";

function unbound<T>(): BoundCollection<T> {
  return { bound: false };
}

function emptyBound<T>(sourceTimestamp?: string): BoundCollection<T> {
  return { bound: true, items: [], sourceTimestamp };
}

export function emptyCoreSnapshot(): ProjectCoreSnapshot {
  return {
    project: null,
    risks: unbound(),
    issues: unbound(),
    decisions: unbound(),
    actions: unbound(),
    technicalQueries: unbound(),
    documents: unbound(),
    assets: unbound(),
  };
}

export function emptyControlsSnapshot(): ProjectControlsSnapshot {
  return {
    schedule: null,
    cost: null,
    progress: null,
    change: null,
    forecast: null,
    invokedScheduleEngine: false,
    invokedCostEngine: false,
    invokedProgressEngine: false,
    invokedChangeEngine: false,
    invokedForecastEngine: false,
    invokedEarnedValueEngine: false,
  };
}

export function emptyKnowledgeSnapshot(): ProjectKnowledgeSnapshot {
  return {
    findings: unbound(),
    inspectionFindings: unbound(),
  };
}

export class InMemoryProjectCoreSource implements ProjectCoreSource {
  readonly sourceDomain = "engineering_core" as const;
  readonly mutatesCanonicalState = false as const;

  constructor(private readonly snapshot: ProjectCoreSnapshot = emptyCoreSnapshot()) {}

  async load(): Promise<ProjectCoreSnapshot> {
    return this.snapshot;
  }
}

export class InMemoryProjectControlsSource implements ProjectControlsSource {
  readonly sourceDomain = "project_controls" as const;
  readonly mutatesCanonicalState = false as const;
  readonly invokesControlsEngine = false as const;

  constructor(private readonly snapshot: ProjectControlsSnapshot = emptyControlsSnapshot()) {}

  async load(): Promise<ProjectControlsSnapshot> {
    return this.snapshot;
  }
}

export class InMemoryProjectKnowledgeSource implements ProjectKnowledgeSource {
  readonly sourceDomain = "project_intelligence" as const;
  readonly mutatesCanonicalState = false as const;

  constructor(private readonly snapshot: ProjectKnowledgeSnapshot = emptyKnowledgeSnapshot()) {}

  async load(): Promise<ProjectKnowledgeSnapshot> {
    return this.snapshot;
  }
}

export function publishedControls(input: {
  assessmentId: string;
  projectId: string;
  posture: string;
  publishedAt?: string;
}): PublishedControlsOutput {
  return {
    assessmentId: input.assessmentId,
    projectId: input.projectId,
    published: true,
    abstained: false,
    posture: input.posture,
    assessedAt: input.publishedAt ?? "2026-08-01T00:00:00.000Z",
    publishedAt: input.publishedAt ?? "2026-08-01T00:00:00.000Z",
    version: 1,
    storesCanonicalCopy: false,
  };
}

export { emptyBound, unbound };
