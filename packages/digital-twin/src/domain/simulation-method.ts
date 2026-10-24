/**
 * Phase 12G — TwinSimulationMethodRegistry.
 *
 * draft → registered → qualified → certified → suspended → deprecated → revoked
 * Fixture qualification = framework qualification only (not engineering solver certification).
 */

import type { SimulationClass } from "./simulation-class";
import { assertSimulationClass } from "./simulation-class";

export const SIMULATION_METHOD_STATUSES = [
  "draft",
  "registered",
  "qualified",
  "certified",
  "suspended",
  "deprecated",
  "revoked",
] as const;

export type SimulationMethodStatus = (typeof SIMULATION_METHOD_STATUSES)[number];

export type TwinSimulationMethodQualification = {
  /** Fixture qualification proves orchestration framework only — not FEA/CFD solver quality. */
  fixtureQualificationOnly: true;
  qualifiedAt?: string;
  qualifiedBy?: string;
  notes?: string;
  claimsNativeSolver: false;
};

export type TwinSimulationMethod = {
  methodId: string;
  tenantId: string;
  workspaceId: string;
  methodKey: string;
  displayName: string;
  simulationClass: SimulationClass;
  status: SimulationMethodStatus;
  version: number;
  applicabilityNotes?: string;
  qualification: TwinSimulationMethodQualification;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export function createTwinSimulationMethod(input: {
  methodId: string;
  tenantId: string;
  workspaceId: string;
  methodKey: string;
  displayName: string;
  simulationClass: string;
  createdBy?: string;
}): TwinSimulationMethod {
  const now = new Date().toISOString();
  return {
    methodId: input.methodId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    methodKey: input.methodKey,
    displayName: input.displayName,
    simulationClass: assertSimulationClass(input.simulationClass),
    status: "draft",
    version: 1,
    qualification: {
      fixtureQualificationOnly: true,
      claimsNativeSolver: false,
    },
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
}

export function canTransitionMethodStatus(
  from: SimulationMethodStatus,
  to: SimulationMethodStatus,
): boolean {
  const transitions: Record<SimulationMethodStatus, SimulationMethodStatus[]> = {
    draft: ["registered", "revoked"],
    registered: ["qualified", "suspended", "deprecated", "revoked"],
    qualified: ["certified", "suspended", "deprecated", "revoked"],
    certified: ["suspended", "deprecated", "revoked"],
    suspended: ["registered", "qualified", "certified", "deprecated", "revoked"],
    deprecated: ["revoked"],
    revoked: [],
  };
  return transitions[from].includes(to);
}

export function transitionMethodStatus(
  method: TwinSimulationMethod,
  to: SimulationMethodStatus,
): TwinSimulationMethod {
  if (!canTransitionMethodStatus(method.status, to)) {
    throw new Error(`invalid_method_status_transition:${method.status}->${to}`);
  }
  const next: TwinSimulationMethod = {
    ...method,
    status: to,
    updatedAt: new Date().toISOString(),
  };
  if (to === "qualified" || to === "certified") {
    next.qualification = {
      ...method.qualification,
      fixtureQualificationOnly: true,
      claimsNativeSolver: false,
      qualifiedAt: next.updatedAt,
    };
  }
  return next;
}

export function assertMethodExecutable(method: TwinSimulationMethod): void {
  if (method.status === "revoked" || method.status === "suspended" || method.status === "deprecated") {
    throw new Error(`method_not_executable:${method.status}`);
  }
  if (method.status !== "certified" && method.status !== "qualified" && method.status !== "registered") {
    throw new Error(`method_not_ready:${method.status}`);
  }
  if (method.qualification.claimsNativeSolver) {
    throw new Error("native_solver_claim_forbidden");
  }
}

export type TwinSimulationMethodRegistry = {
  methods: TwinSimulationMethod[];
};

export function createTwinSimulationMethodRegistry(
  methods: TwinSimulationMethod[] = [],
): TwinSimulationMethodRegistry {
  return { methods: [...methods] };
}
