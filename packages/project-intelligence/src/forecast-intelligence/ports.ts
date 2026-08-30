import type { CommandCentreScope } from "../command-centre/ports";
import type { ForecastIntelligenceSourceSnapshot } from "./types";

export type ForecastIntelligencePort = {
  readonly sourceDomain: "project_controls";
  readonly mutatesCanonicalState: false;
  readonly invokesControlsEngine: false;
  readonly computesForecast: false;
  readonly computesCompletionDate: false;
  readonly computesCostForecast: false;
  readonly computesMonteCarlo: false;
  load(scope: CommandCentreScope): Promise<ForecastIntelligenceSourceSnapshot>;
};
