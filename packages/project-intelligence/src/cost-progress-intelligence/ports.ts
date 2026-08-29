import type { CommandCentreScope } from "../command-centre/ports";
import type { CostProgressSourceSnapshot } from "./types";

export type CostProgressIntelligencePort = {
  readonly sourceDomain: "project_controls";
  readonly mutatesCanonicalState: false;
  readonly invokesControlsEngine: false;
  readonly computesEarnedValue: false;
  readonly computesForecast: false;
  readonly computesPhysicalProgress: false;
  load(scope: CommandCentreScope): Promise<CostProgressSourceSnapshot>;
};
