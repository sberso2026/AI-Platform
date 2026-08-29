import type { CommandCentreScope } from "../command-centre/ports";
import type { ScheduleIntelligenceSourceSnapshot } from "./types";

export type ScheduleIntelligencePort = {
  readonly sourceDomain: "project_controls";
  readonly mutatesCanonicalState: false;
  readonly invokesControlsEngine: false;
  readonly computesCriticalPath: false;
  readonly computesFloat: false;
  load(scope: CommandCentreScope): Promise<ScheduleIntelligenceSourceSnapshot>;
};
