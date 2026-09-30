import { createHash } from "node:crypto";
import type { DeliverableCanonicalFacts, DeliverableExpectation } from "./types";

export function fingerprintDeliverableEvidence(input: {
  expectation: DeliverableExpectation;
  facts: DeliverableCanonicalFacts;
  bindingKeys: string[];
  purpose: string;
  profileId: string;
  profileVersion: string;
}): string {
  const payload = JSON.stringify({
    expectationId: input.expectation.id,
    definition: `${input.expectation.definitionId}:${input.expectation.definitionVersion}`,
    purpose: input.purpose,
    profile: `${input.profileId}:${input.profileVersion}`,
    bindings: [...input.bindingKeys].sort(),
    facts: {
      primaryPresent: input.facts.primaryPresent,
      reviewComplete: input.facts.reviewComplete,
      analysisValid: input.facts.analysisValid,
      analysisReviewed: input.facts.analysisReviewed,
      analysisStale: input.facts.analysisStale,
      baselineFrozen: input.facts.baselineFrozen,
      requirementLinked: input.facts.requirementLinked,
      interfacesComplete: input.facts.interfacesComplete,
      assumptionInvalidated: input.facts.assumptionInvalidated,
      artifacts: input.facts.artifactStates.map((row) => `${row.artifactClass}:${row.artifactId}:${row.state}:${row.revision ?? ""}`).sort(),
    },
  });
  return createHash("sha256").update(payload).digest("hex");
}

export function composeDeliverableThread(input: {
  projectId: string;
  stage: string;
  expectationId: string;
  definitionCode: string;
  assessmentId?: string | null;
  artifactIds?: string[];
}): string {
  return [
    `project:${input.projectId}`,
    `lifecycle_stage:${input.stage}`,
    `deliverable_expectation:${input.expectationId}`,
    `deliverable_definition:${input.definitionCode}`,
    ...(input.artifactIds ?? []).map((id) => `deliverable_artifact:${id}`),
    input.assessmentId ? `deliverable_assessment:${input.assessmentId}` : null,
  ]
    .filter(Boolean)
    .join(" → ");
}
