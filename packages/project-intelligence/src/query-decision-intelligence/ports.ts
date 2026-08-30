import type { CommandCentreScope } from "../command-centre/ports";
import type { QueryDecisionSourceSnapshot } from "./types";

export type QueryDecisionIntelligencePort = {
  readonly sourceDomain: "engineering_core";
  readonly mutatesCanonicalState: false;
  readonly storesQueryRegister: false;
  readonly storesDecisionRegister: false;
  readonly storesActionRegister: false;
  readonly mutatesQuery: false;
  readonly mutatesDecision: false;
  readonly mutatesAction: false;
  load(scope: CommandCentreScope): Promise<QueryDecisionSourceSnapshot>;
};
