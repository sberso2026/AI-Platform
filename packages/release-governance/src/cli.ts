import { PRODUCTION_PROJECT_REF } from "./types";
import { buildInventory } from "./classify";
import { evaluateProductionPromotion } from "./guard";
import { driftReport } from "./report";

const command = process.argv[2] ?? "report";

if (command === "report") {
  const report = driftReport(buildInventory());
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exit(0);
}

if (command === "guard") {
  const proposedFlag = process.argv.indexOf("--proposed");
  const refFlag = process.argv.indexOf("--project-ref");
  const proposed =
    proposedFlag >= 0 && process.argv[proposedFlag + 1]
      ? process.argv[proposedFlag + 1].split(",").map((id) => id.trim())
      : [];
  const projectRef = refFlag >= 0 ? process.argv[refFlag + 1] : PRODUCTION_PROJECT_REF;
  const decision = evaluateProductionPromotion({
    proposed,
    productionProjectRef: projectRef ?? PRODUCTION_PROJECT_REF,
    records: buildInventory(),
  });
  process.stdout.write(`${JSON.stringify(decision, null, 2)}\n`);
  process.exit(decision.ok ? 0 : 1);
}

console.error("usage: report | guard --proposed id[,id] [--project-ref ref]");
process.exit(2);
