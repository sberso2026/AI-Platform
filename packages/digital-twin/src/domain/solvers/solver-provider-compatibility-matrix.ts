/**
 * Phase 12J — SolverProviderCompatibilityMatrix.
 *
 * Deterministic Method × Solver × Version × Application × ProjectType queries.
 * Query-only — NEVER executes a solver.
 */

import {
  CALCULIX_LINEAR_STATIC_CAPABILITY_ID,
  type EngineeringSolverCapabilityRegistry,
} from "./engineering-solver-capability-registry";
import { LINEAR_ELASTIC_STATIC_METHOD_KEY } from "./solver-mappers";
import {
  CALCULIX_ADAPTER_ID,
  CALCULIX_ADAPTER_VERSION,
} from "./calculix-adapter";

export type CompatibilityQuery = {
  methodKey: string;
  solverId: string;
  solverVersion?: string;
  applicationKey?: string;
  projectType?: string;
  capabilityId?: string;
};

export type CompatibilitySnapshot = {
  compatibilityId: string;
  methodKey: string;
  solverId: string;
  solverVersion: string;
  applicationKey: string;
  projectType: string;
  capabilityId: string;
  capabilityVersion: string;
  adapterId: string;
  adapterVersion: string;
  compatible: boolean;
  executable: boolean;
  reason: string;
  queriedAt: string;
};

export type AdapterVersionGovernance = {
  adapterVersionId: string;
  adapterId: string;
  adapterVersion: string;
  solverId: string;
  supportedSolverVersions: string[];
  deprecatedSolverVersions: string[];
  revokedSolverVersions: string[];
  compatibilityNotes: string;
  /** Historic runs remain reproducible against pinned adapter/solver versions. */
  historicRunsReproducible: true;
};

export const CALCULIX_ADAPTER_GOVERNANCE: AdapterVersionGovernance = {
  adapterVersionId: `${CALCULIX_ADAPTER_ID}@${CALCULIX_ADAPTER_VERSION}`,
  adapterId: CALCULIX_ADAPTER_ID,
  adapterVersion: CALCULIX_ADAPTER_VERSION,
  solverId: "calculix",
  supportedSolverVersions: ["2.21", "2.20", "2.19"],
  deprecatedSolverVersions: ["2.17"],
  revokedSolverVersions: [],
  compatibilityNotes:
    "Phase 12I CalculiX adapter — linear_elastic_static only. Historic runs pin adapter+solver versions.",
  historicRunsReproducible: true,
};

export class SolverProviderCompatibilityMatrix {
  constructor(
    private readonly registry: EngineeringSolverCapabilityRegistry,
    private readonly adapterGovernance: AdapterVersionGovernance[] = [CALCULIX_ADAPTER_GOVERNANCE],
  ) {}

  query(input: CompatibilityQuery): CompatibilitySnapshot {
    const now = new Date().toISOString();
    const capabilityId =
      input.capabilityId ??
      (input.solverId === "calculix" && input.methodKey === LINEAR_ELASTIC_STATIC_METHOD_KEY
        ? CALCULIX_LINEAR_STATIC_CAPABILITY_ID
        : `${input.solverId}.unknown`);
    const capability = this.registry.getCapability(capabilityId);
    const governance = this.adapterGovernance.find((g) => g.solverId === input.solverId);
    const solverVersion = input.solverVersion ?? "unspecified";
    const applicationKey = input.applicationKey ?? "unspecified";
    const projectType = input.projectType ?? "unspecified";

    const qualified =
      capability?.qualificationStatus === "qualified" &&
      capability.capabilityId === CALCULIX_LINEAR_STATIC_CAPABILITY_ID &&
      input.methodKey === LINEAR_ELASTIC_STATIC_METHOD_KEY;

    const versionOk =
      !governance ||
      solverVersion === "unspecified" ||
      governance.supportedSolverVersions.includes(solverVersion) ||
      !governance.revokedSolverVersions.includes(solverVersion);

    const compatible = Boolean(capability) && versionOk && !governance?.revokedSolverVersions.includes(solverVersion);
    // Compatible for discovery ≠ executable. Only qualified CalculiX linear_static is executable.
    const executable = Boolean(qualified && compatible);

    return {
      compatibilityId: [
        input.methodKey,
        input.solverId,
        solverVersion,
        applicationKey,
        projectType,
        capabilityId,
      ].join("|"),
      methodKey: input.methodKey,
      solverId: input.solverId,
      solverVersion,
      applicationKey,
      projectType,
      capabilityId,
      capabilityVersion: capability
        ? this.registry.listVersions(capabilityId)[0]?.version ?? "unknown"
        : "unknown",
      adapterId: governance?.adapterId ?? "none",
      adapterVersion: governance?.adapterVersion ?? "none",
      compatible,
      executable,
      reason: executable
        ? "qualified_calculix_linear_elastic_static"
        : capability?.qualificationStatus === "reserved" ||
            capability?.qualificationStatus === "not_qualified"
          ? "capability_reserved_or_not_qualified"
          : "not_compatible_or_unqualified",
      queriedAt: now,
    };
  }

  getAdapterGovernance(solverId: string): AdapterVersionGovernance | undefined {
    return this.adapterGovernance.find((g) => g.solverId === solverId);
  }

  listAdapterGovernance(): AdapterVersionGovernance[] {
    return [...this.adapterGovernance];
  }
}

export function createSolverProviderCompatibilityMatrix(
  registry: EngineeringSolverCapabilityRegistry,
): SolverProviderCompatibilityMatrix {
  return new SolverProviderCompatibilityMatrix(registry);
}
