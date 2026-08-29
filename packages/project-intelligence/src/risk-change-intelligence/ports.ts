import type { CommandCentreScope } from "../command-centre/ports";
import type { RiskChangeSourceSnapshot } from "./types";

export type RiskChangeIntelligencePort = {
  readonly sourceDomain: "engineering_core_and_project_controls";
  readonly mutatesCanonicalState: false;
  readonly invokesControlsEngine: false;
  readonly storesRiskRegister: false;
  readonly mutatesRisk: false;
  readonly mutatesChange: false;
  readonly computesChangeImpact: false;
  readonly computesIndependentRiskScore: false;
  load(scope: CommandCentreScope): Promise<RiskChangeSourceSnapshot>;
};
