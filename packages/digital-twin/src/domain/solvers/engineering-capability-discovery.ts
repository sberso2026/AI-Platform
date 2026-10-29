/**
 * Phase 12J — EngineeringCapabilityDiscoveryService.
 *
 * Query-only discovery. NEVER auto-executes capabilities.
 */

import type { EngineeringSolverCapabilityRegistry } from "./engineering-solver-capability-registry";
import type {
  CompatibilityQuery,
  CompatibilitySnapshot,
  SolverProviderCompatibilityMatrix,
} from "./solver-provider-compatibility-matrix";
import type { EngineeringSolverCapability } from "./engineering-solver-capability-registry";

export type CapabilityDiscoveryQuery = {
  solverId?: string;
  methodKey?: string;
  qualificationStatus?: string;
  applicationKey?: string;
  projectType?: string;
  /** Forbidden — discovery must not execute. */
  execute?: unknown;
  autoExecute?: unknown;
  runOnDiscover?: unknown;
};

export type CapabilityDiscoveryResult = {
  capabilities: EngineeringSolverCapability[];
  compatibility?: CompatibilitySnapshot;
  executed: false;
  autoQualified: false;
};

export class EngineeringCapabilityDiscoveryService {
  constructor(
    private readonly registry: EngineeringSolverCapabilityRegistry,
    private readonly matrix: SolverProviderCompatibilityMatrix,
  ) {}

  discover(query: CapabilityDiscoveryQuery): CapabilityDiscoveryResult {
    rejectExecuteOnDiscover(query);

    const capabilities = this.registry.listCapabilities({
      solverId: query.solverId,
      qualificationStatus: query.qualificationStatus as
        | "qualified"
        | "reserved"
        | "not_qualified"
        | "registered"
        | "draft"
        | "revoked"
        | undefined,
    });

    let compatibility: CompatibilitySnapshot | undefined;
    if (query.methodKey && query.solverId) {
      const cq: CompatibilityQuery = {
        methodKey: query.methodKey,
        solverId: query.solverId,
        applicationKey: query.applicationKey,
        projectType: query.projectType,
      };
      compatibility = this.matrix.query(cq);
    }

    return {
      capabilities,
      compatibility,
      executed: false,
      autoQualified: false,
    };
  }

  getCapability(capabilityId: string): EngineeringSolverCapability | undefined {
    return this.registry.getCapability(capabilityId);
  }
}

export function rejectExecuteOnDiscover(query: Record<string, unknown>): void {
  const forbidden = [
    "execute",
    "autoExecute",
    "runOnDiscover",
    "executeOnDiscover",
    "spawnSolver",
    "runBenchmark",
    "nativeSolver",
    "solverBinary",
  ];
  for (const key of forbidden) {
    if (key in query && query[key] !== undefined && query[key] !== false) {
      throw new Error(`capability_discovery_execute_forbidden:${key}`);
    }
  }
}

export function createEngineeringCapabilityDiscoveryService(
  registry: EngineeringSolverCapabilityRegistry,
  matrix: SolverProviderCompatibilityMatrix,
): EngineeringCapabilityDiscoveryService {
  return new EngineeringCapabilityDiscoveryService(registry, matrix);
}
