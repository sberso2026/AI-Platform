import type { EngineeringInformationRequirement } from "./types";
import type { RequirementSatisfactionResult } from "./satisfaction";
import type { EngineeringWorkType, WorkReadinessState } from "./types";

export type WorkReadinessResolution = {
  workType: EngineeringWorkType;
  projectId: string;
  state: WorkReadinessState;
  required: EngineeringInformationRequirement[];
  available: RequirementSatisfactionResult[];
  missing: RequirementSatisfactionResult[];
  stale: RequirementSatisfactionResult[];
  unaccepted: RequirementSatisfactionResult[];
  explanation: string;
  engineeringApproved: false;
  projectReadinessScore: null;
  durationMs: number;
};

export function resolveWorkReadiness(input: {
  workType: EngineeringWorkType;
  projectId: string;
  requirements: EngineeringInformationRequirement[];
  evaluations: RequirementSatisfactionResult[];
}): WorkReadinessResolution {
  const started = Date.now();
  const required = input.requirements.filter((row) => row.workType === input.workType && row.projectId === input.projectId);
  const byId = new Map(input.evaluations.map((row) => [row.requirementId, row]));
  const available = required.map((row) => byId.get(row.id)).filter((row): row is RequirementSatisfactionResult => Boolean(row?.satisfied));
  const missing = required
    .filter((row) => row.blocking)
    .map((row) => byId.get(row.id))
    .filter((row): row is RequirementSatisfactionResult => Boolean(row && !row.received));
  const stale = required
    .filter((row) => row.blocking)
    .map((row) => byId.get(row.id))
    .filter((row): row is RequirementSatisfactionResult => Boolean(row?.stale || row?.superseded));
  const unaccepted = required
    .filter((row) => row.blocking)
    .map((row) => byId.get(row.id))
    .filter((row): row is RequirementSatisfactionResult => Boolean(row?.received && !row.acceptedForPurpose));
  let state: WorkReadinessState = "READY";
  if (required.length === 0) state = "UNKNOWN";
  else if (missing.length) state = "BLOCKED_INFORMATION_MISSING";
  else if (stale.length) state = "BLOCKED_INFORMATION_STALE";
  else if (unaccepted.length) state = "BLOCKED_INFORMATION_UNACCEPTED";
  else if (available.length < required.length) state = "READY_WITH_CONDITIONS";
  const explanation =
    state === "READY"
      ? "Configured required information is accepted for purpose. Not engineering approval."
      : state === "BLOCKED_INFORMATION_MISSING"
        ? `Blocked: ${missing.length} required information item(s) missing.`
        : state === "BLOCKED_INFORMATION_UNACCEPTED"
          ? `Blocked: information received but not accepted for purpose.`
          : state === "BLOCKED_INFORMATION_STALE"
            ? `Blocked: required information is stale or superseded.`
            : state === "READY_WITH_CONDITIONS"
              ? "Ready with conditions: non-blocking information remains outstanding."
              : "No configured information requirements for this work type.";
  return {
    workType: input.workType,
    projectId: input.projectId,
    state,
    required,
    available,
    missing,
    stale,
    unaccepted,
    explanation,
    engineeringApproved: false,
    projectReadinessScore: null,
    durationMs: Date.now() - started,
  };
}

export function canStartWork(resolution: WorkReadinessResolution): boolean {
  return resolution.state === "READY" || resolution.state === "READY_WITH_CONDITIONS";
}
