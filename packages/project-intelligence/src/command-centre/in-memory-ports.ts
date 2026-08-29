import {
  emptyControlsSnapshot,
  emptyCoreSnapshot,
  emptyKnowledgeSnapshot,
} from "../project-health/in-memory-sources";
import type { ProjectControlsSnapshot, ProjectCoreSnapshot, ProjectKnowledgeSnapshot } from "../project-health/source-contracts";
import { commandCentreForbidden, commandCentreNotFound } from "./errors";
import type {
  CommandCentreControlsPort,
  CommandCentreCorePort,
  CommandCentreKnowledgePort,
  CommandCentreScope,
} from "./ports";
import type {
  CommandCentreAvailability,
  CommandCentreControlsAvailability,
  CommandCentreProjectProjection,
} from "./types";

export class InMemoryCommandCentreCorePort implements CommandCentreCorePort {
  readonly sourceDomain = "engineering_core" as const;
  readonly mutatesCanonicalState = false as const;

  constructor(
    private readonly identity: CommandCentreProjectProjection | null,
    private readonly snapshot: ProjectCoreSnapshot = emptyCoreSnapshot(),
    private readonly failMode?: "throw" | "forbidden_tenant" | "forbidden_workspace",
  ) {}

  async load(scope: CommandCentreScope) {
    if (this.failMode === "throw") {
      throw new Error("core_read_failed");
    }
    if (!this.identity) {
      throw commandCentreNotFound(scope.projectId);
    }
    if (this.failMode === "forbidden_tenant" || this.identity.tenantId !== scope.tenantId) {
      throw commandCentreForbidden(scope.projectId, "cross_tenant");
    }
    if (this.failMode === "forbidden_workspace" || (this.identity.workspaceId && this.identity.workspaceId !== scope.workspaceId)) {
      throw commandCentreForbidden(scope.projectId, "cross_workspace");
    }
    return { identity: this.identity, snapshot: this.snapshot };
  }
}

export class InMemoryCommandCentreControlsPort implements CommandCentreControlsPort {
  readonly sourceDomain = "project_controls" as const;
  readonly mutatesCanonicalState = false as const;
  readonly invokesControlsEngine = false as const;

  constructor(
    private readonly snapshot: ProjectControlsSnapshot = emptyControlsSnapshot(),
    private readonly availability: CommandCentreControlsAvailability = {
      schedule: snapshot.schedule ? "ok" : "no_data",
      cost: snapshot.cost ? "ok" : "no_data",
      progress: snapshot.progress ? "ok" : "no_data",
      change: snapshot.change ? "ok" : "no_data",
      forecast: snapshot.forecast ? "ok" : "no_data",
    },
    private readonly fail?: "throw" | Partial<CommandCentreControlsAvailability>,
  ) {}

  async load() {
    if (this.fail === "throw") {
      throw new Error("controls_read_failed");
    }
    const availability = this.fail
      ? { ...this.availability, ...this.fail }
      : this.availability;
    return { snapshot: this.snapshot, availability };
  }
}

export class InMemoryCommandCentreKnowledgePort implements CommandCentreKnowledgePort {
  readonly sourceDomain = "project_intelligence" as const;
  readonly mutatesCanonicalState = false as const;

  constructor(
    private readonly snapshot: ProjectKnowledgeSnapshot = emptyKnowledgeSnapshot(),
    private readonly availability: CommandCentreAvailability = snapshot.findings.bound ? "ok" : "no_data",
    private readonly fail?: "throw",
  ) {}

  async load() {
    if (this.fail === "throw") {
      throw new Error("knowledge_read_failed");
    }
    return { snapshot: this.snapshot, availability: this.fail ? "error" : this.availability };
  }
}

export function sampleProjectIdentity(
  overrides: Partial<CommandCentreProjectProjection> = {},
): CommandCentreProjectProjection {
  return {
    projectId: "p1",
    tenantId: "tenant",
    workspaceId: "workspace",
    projectCode: "PRJ-1",
    projectName: "Alpha",
    phase: "design",
    status: "active",
    storesCanonicalCopy: false,
    ...overrides,
  };
}
