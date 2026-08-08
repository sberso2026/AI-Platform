/**
 * Phase 12H — SimulationQualificationEligibilityEngine (fail-closed).
 */

import {
  isMethodQualificationValidAt,
  type SimulationMethodQualification,
} from "./simulation-method-qualification";
import {
  isProviderQualificationValidAt,
  type SimulationProviderQualification,
} from "./simulation-provider-qualification";
import {
  isApplicationQualificationValidAt,
  type SimulationApplicationQualification,
} from "./simulation-application-qualification";
import {
  detectQualificationConflicts,
  queryCompatibilityMatrix,
  type CompatibilityMatrixEntry,
} from "./simulation-qualification-compatibility";

export const ELIGIBILITY_OUTCOMES = [
  "eligible",
  "conditionally_eligible",
  "not_eligible",
  "insufficient_evidence",
  "qualification_expired",
  "qualification_revoked",
  "unknown",
] as const;

export type EligibilityOutcome = (typeof ELIGIBILITY_OUTCOMES)[number];

export type EligibilityAssessment = {
  outcome: EligibilityOutcome;
  reasons: string[];
  methodQualificationId?: string;
  providerQualificationId?: string;
  applicationQualificationId?: string;
  evaluatedAt: string;
  failClosed: true;
  autoInherited: false;
};

export type EligibilityInput = {
  methodId: string;
  providerId: string;
  applicationKey: string;
  evaluatedAt?: string;
  methodQualifications?: SimulationMethodQualification[];
  providerQualifications?: SimulationProviderQualification[];
  applicationQualifications?: SimulationApplicationQualification[];
  compatibilityEntries?: CompatibilityMatrixEntry[];
  assuranceRequired?: boolean;
  conditionalNotes?: string[];
};

export function assessSimulationQualificationEligibility(
  input: EligibilityInput,
): EligibilityAssessment {
  const evaluatedAt = input.evaluatedAt ?? new Date().toISOString();
  const reasons: string[] = [];
  const assuranceRequired = input.assuranceRequired !== false;

  if (!assuranceRequired) {
    return {
      outcome: "conditionally_eligible",
      reasons: ["assurance_mode_not_required"],
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }

  const methods = input.methodQualifications ?? [];
  const providers = input.providerQualifications ?? [];
  const applications = input.applicationQualifications ?? [];

  if (methods.length === 0 || providers.length === 0 || applications.length === 0) {
    return {
      outcome: "insufficient_evidence",
      reasons: ["missing_qualification_records"],
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }

  const conflicts = detectQualificationConflicts({
    methodQualifications: methods,
    providerQualifications: providers,
    applicationQualifications: applications,
  });
  if (conflicts.length > 0) {
    return {
      outcome: "not_eligible",
      reasons: conflicts.map((c) => `conflict:${c}`),
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }

  const methodQ = methods.find((q) => q.methodId === input.methodId);
  if (!methodQ) {
    return {
      outcome: "insufficient_evidence",
      reasons: ["method_qualification_not_found"],
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }
  if (methodQ.status === "revoked") {
    return {
      outcome: "qualification_revoked",
      reasons: ["method_qualification_revoked"],
      methodQualificationId: methodQ.methodQualificationId,
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }
  if (
    methodQ.effectiveTo &&
    Date.parse(methodQ.effectiveTo) < Date.parse(evaluatedAt) &&
    methodQ.status === "active"
  ) {
    return {
      outcome: "qualification_expired",
      reasons: ["method_qualification_expired"],
      methodQualificationId: methodQ.methodQualificationId,
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }
  if (!isMethodQualificationValidAt(methodQ, evaluatedAt)) {
    reasons.push("method_qualification_not_valid_at_execution_time");
  }

  const providerQ = providers.find(
    (q) => q.providerId === input.providerId && q.methodId === input.methodId,
  );
  if (!providerQ) {
    // Explicit: do not infer from other methods
    const anyOther = providers.some((q) => q.providerId === input.providerId);
    return {
      outcome: anyOther ? "not_eligible" : "insufficient_evidence",
      reasons: [
        anyOther
          ? "provider_qualification_not_method_specific_no_auto_inherit"
          : "provider_qualification_not_found",
      ],
      methodQualificationId: methodQ.methodQualificationId,
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }
  if (providerQ.status === "revoked") {
    return {
      outcome: "qualification_revoked",
      reasons: ["provider_qualification_revoked"],
      methodQualificationId: methodQ.methodQualificationId,
      providerQualificationId: providerQ.providerQualificationId,
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }
  if (
    providerQ.effectiveTo &&
    Date.parse(providerQ.effectiveTo) < Date.parse(evaluatedAt) &&
    providerQ.status === "active"
  ) {
    return {
      outcome: "qualification_expired",
      reasons: ["provider_qualification_expired"],
      methodQualificationId: methodQ.methodQualificationId,
      providerQualificationId: providerQ.providerQualificationId,
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }
  if (!isProviderQualificationValidAt(providerQ, evaluatedAt, input.methodId)) {
    reasons.push("provider_qualification_not_valid_at_execution_time");
  }

  const appQ = applications.find(
    (q) =>
      q.methodId === input.methodId &&
      q.providerId === input.providerId &&
      q.context.applicationKey === input.applicationKey,
  );
  if (!appQ) {
    return {
      outcome: "insufficient_evidence",
      reasons: ["application_qualification_not_found_for_context"],
      methodQualificationId: methodQ.methodQualificationId,
      providerQualificationId: providerQ.providerQualificationId,
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }
  if (appQ.status === "revoked") {
    return {
      outcome: "qualification_revoked",
      reasons: ["application_qualification_revoked"],
      methodQualificationId: methodQ.methodQualificationId,
      providerQualificationId: providerQ.providerQualificationId,
      applicationQualificationId: appQ.applicationQualificationId,
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }
  if (
    appQ.effectiveTo &&
    Date.parse(appQ.effectiveTo) < Date.parse(evaluatedAt) &&
    appQ.status === "active"
  ) {
    return {
      outcome: "qualification_expired",
      reasons: ["application_qualification_expired"],
      methodQualificationId: methodQ.methodQualificationId,
      providerQualificationId: providerQ.providerQualificationId,
      applicationQualificationId: appQ.applicationQualificationId,
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }
  if (
    !isApplicationQualificationValidAt(
      appQ,
      evaluatedAt,
      input.methodId,
      input.providerId,
      input.applicationKey,
    )
  ) {
    reasons.push("application_qualification_not_valid_at_execution_time");
  }

  const matrix = queryCompatibilityMatrix(input.compatibilityEntries ?? [], {
    methodId: input.methodId,
    providerId: input.providerId,
    applicationKey: input.applicationKey,
  });
  if (matrix.length === 0) {
    reasons.push("compatibility_matrix_entry_missing_no_false_inference");
    return {
      outcome: "unknown",
      reasons,
      methodQualificationId: methodQ.methodQualificationId,
      providerQualificationId: providerQ.providerQualificationId,
      applicationQualificationId: appQ.applicationQualificationId,
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }
  if (matrix.some((e) => !e.compatible)) {
    return {
      outcome: "not_eligible",
      reasons: ["compatibility_matrix_incompatible"],
      methodQualificationId: methodQ.methodQualificationId,
      providerQualificationId: providerQ.providerQualificationId,
      applicationQualificationId: appQ.applicationQualificationId,
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }

  if (reasons.length > 0) {
    return {
      outcome: "not_eligible",
      reasons,
      methodQualificationId: methodQ.methodQualificationId,
      providerQualificationId: providerQ.providerQualificationId,
      applicationQualificationId: appQ.applicationQualificationId,
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }

  if (input.conditionalNotes && input.conditionalNotes.length > 0) {
    return {
      outcome: "conditionally_eligible",
      reasons: input.conditionalNotes,
      methodQualificationId: methodQ.methodQualificationId,
      providerQualificationId: providerQ.providerQualificationId,
      applicationQualificationId: appQ.applicationQualificationId,
      evaluatedAt,
      failClosed: true,
      autoInherited: false,
    };
  }

  return {
    outcome: "eligible",
    reasons: ["all_layers_valid_at_execution_time"],
    methodQualificationId: methodQ.methodQualificationId,
    providerQualificationId: providerQ.providerQualificationId,
    applicationQualificationId: appQ.applicationQualificationId,
    evaluatedAt,
    failClosed: true,
    autoInherited: false,
  };
}

export function assertEligibleForExecution(assessment: EligibilityAssessment): void {
  if (assessment.outcome !== "eligible" && assessment.outcome !== "conditionally_eligible") {
    throw new Error(`simulation_not_eligible:${assessment.outcome}:${assessment.reasons.join(",")}`);
  }
}
