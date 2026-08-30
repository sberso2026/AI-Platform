/**
 * Hosted Command Centre load ports. Adapters wrap existing domain services.
 */

import type { ProjectControlsSnapshot, ProjectCoreSnapshot, ProjectKnowledgeSnapshot } from "../project-health/source-contracts";
import type {
  CommandCentreAvailability,
  CommandCentreControlsAvailability,
  CommandCentreProjectProjection,
} from "./types";

export type CommandCentreScope = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type CommandCentreCoreLoad = {
  identity: CommandCentreProjectProjection;
  snapshot: ProjectCoreSnapshot;
};

export type CommandCentreControlsLoad = {
  snapshot: ProjectControlsSnapshot;
  availability: CommandCentreControlsAvailability;
};

export type CommandCentreKnowledgeLoad = {
  snapshot: ProjectKnowledgeSnapshot;
  availability: CommandCentreAvailability;
};

export type CommandCentreCorePort = {
  readonly sourceDomain: "engineering_core";
  readonly mutatesCanonicalState: false;
  load(scope: CommandCentreScope): Promise<CommandCentreCoreLoad>;
};

export type CommandCentreControlsPort = {
  readonly sourceDomain: "project_controls";
  readonly mutatesCanonicalState: false;
  readonly invokesControlsEngine: false;
  load(scope: CommandCentreScope): Promise<CommandCentreControlsLoad>;
};

export type CommandCentreKnowledgePort = {
  readonly sourceDomain: "project_intelligence";
  readonly mutatesCanonicalState: false;
  load(scope: CommandCentreScope): Promise<CommandCentreKnowledgeLoad>;
};

export type CommandCentreSourceBundle = {
  core: CommandCentreCorePort;
  controls: CommandCentreControlsPort;
  knowledge: CommandCentreKnowledgePort;
  schedule?: import("../schedule-intelligence/ports").ScheduleIntelligencePort;
  costProgress?: import("../cost-progress-intelligence/ports").CostProgressIntelligencePort;
  riskChange?: import("../risk-change-intelligence/ports").RiskChangeIntelligencePort;
  queryDecision?: import("../query-decision-intelligence/ports").QueryDecisionIntelligencePort;
  forecast?: import("../forecast-intelligence/ports").ForecastIntelligencePort;
};
