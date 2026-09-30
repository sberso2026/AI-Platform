import type { CanonicalHarvestBundle } from "../lifecycle-intelligence/harvest";
import type { DeliverableArtifactBinding, DeliverableCanonicalFacts, DeliverableDefinition } from "./types";

const COMPLETE_INTERFACE = new Set(["PROVIDED", "ACCEPTED"]);
const COMPLETE_REVIEW = new Set(["complete", "completed"]);

export function factsFromCanonical(input: {
  definition: DeliverableDefinition;
  bindings: readonly DeliverableArtifactBinding[];
  bundle: CanonicalHarvestBundle;
  requirementLinked?: boolean;
  contributingIdentified?: boolean;
}): DeliverableCanonicalFacts {
  const records = input.bundle.records;
  const byId = new Map(records.map((row) => [`${row.objectType}:${row.objectId}`, row]));
  const artifactStates = input.bindings.map((binding) => {
    const row = byId.get(`${binding.artifactClass}:${binding.artifactId}`);
    return {
      artifactClass: binding.artifactClass,
      artifactId: binding.artifactId,
      state: row?.state ?? "unharvested",
      revision: binding.revisionRef ?? row?.version ?? null,
    };
  });
  const primary = input.bindings.filter((row) => row.artifactRole === "PRIMARY");
  const reviewBindings = input.bindings.filter((row) => row.artifactRole === "REVIEW" || row.artifactClass === "review_package");
  const analysisBindings = input.bindings.filter((row) => row.artifactRole === "CALCULATION" || row.artifactClass === "analysis_result");
  const baselineBindings = input.bindings.filter((row) => row.artifactRole === "CONFIGURATION" || row.artifactClass === "configuration_baseline");
  const harvestedReviews = reviewBindings.map((row) => byId.get(`${row.artifactClass}:${row.artifactId}`)).filter(Boolean);
  const harvestedAnalyses = analysisBindings.map((row) => byId.get(`${row.artifactClass}:${row.artifactId}`)).filter(Boolean);
  const harvestedBaselines = [
    ...baselineBindings.map((row) => byId.get(`${row.artifactClass}:${row.artifactId}`)),
    ...records.filter((row) => row.objectType === "configuration_baseline"),
  ].filter(Boolean);
  const interfaces = records.filter((row) => row.objectType === "interface");
  const interfacesComplete =
    !input.definition.coordinationRequired ||
    (interfaces.length > 0 && interfaces.every((row) => COMPLETE_INTERFACE.has(String(row.fields.status ?? row.state))));

  return {
    truncated: Boolean(input.bundle.truncated),
    failed: Boolean(input.bundle.failed),
    failureReason: input.bundle.failureReason ?? null,
    primaryPresent: primary.length > 0,
    boundCount: input.bindings.length,
    reviewPresent: reviewBindings.length > 0,
    reviewComplete: harvestedReviews.some((row) => COMPLETE_REVIEW.has(String(row?.fields.status ?? row?.state))),
    analysisPresent: analysisBindings.length > 0,
    analysisValid: harvestedAnalyses.some((row) => Boolean(row?.fields.valid)),
    analysisReviewed: harvestedAnalyses.some((row) => Boolean(row?.fields.reviewed)),
    analysisStale: harvestedAnalyses.some((row) => Boolean(row?.stale || row?.fields.stale)),
    baselineFrozen: harvestedBaselines.some((row) => String(row?.fields.status ?? row?.state) === "frozen"),
    requirementLinked:
      input.requirementLinked ??
      records.some((row) => row.objectType === "requirement" && (row.fields.allocated === true || row.state === "active")),
    interfacesComplete,
    contributingIdentified: input.contributingIdentified ?? input.definition.contributingDisciplines.length > 0,
    assumptionInvalidated: records.some((row) => row.objectType === "assumption" && Boolean(row.fields.expired)),
    artifactStates,
  };
}
