import type { IsolationProbeDefinition, IsolationProbeLifecycle } from "../../isolation-contracts";
import { SEED_ISOLATION_PROBES } from "./seed-probes";

const LIFECYCLE: IsolationProbeLifecycle[] = [
  "draft",
  "active",
  "deprecated",
  "retired",
];

/**
 * IsolationProbeRegistry — versioned definitions only.
 * Unrestricted executable code registration is forbidden.
 */
export class IsolationProbeRegistry {
  readonly kind = "isolation_probe_registry" as const;
  private probes = new Map<string, IsolationProbeDefinition>();

  constructor(seed: IsolationProbeDefinition[] = SEED_ISOLATION_PROBES) {
    for (const p of seed) this.register(p);
  }

  register(probe: IsolationProbeDefinition): void {
    if (!probe.harnessKey || probe.harnessKey.includes("eval(")) {
      throw new Error("Unrestricted executable probe registration is forbidden");
    }
    if (probe.mutatesAuthorization || probe.mutatesRls) {
      throw new Error("Probes must not mutate authorization/RLS");
    }
    if (!probe.productionSafe) {
      throw new Error("Probes must be production-safe");
    }
    const key = `${probe.probeId}@${probe.version}`;
    this.probes.set(key, probe);
  }

  /** Reject raw function registration. */
  registerExecutable(_fn: unknown): never {
    throw new Error("Unrestricted executable code registration is forbidden");
  }

  require(probeId: string, version = "1.0.0"): IsolationProbeDefinition {
    const p = this.probes.get(`${probeId}@${version}`);
    if (!p) throw new Error(`Unknown probe: ${probeId}@${version}`);
    return p;
  }

  list(status?: IsolationProbeLifecycle): IsolationProbeDefinition[] {
    const all = [...this.probes.values()];
    return status ? all.filter((p) => p.status === status) : all;
  }

  listByPlane(plane: IsolationProbeDefinition["targetPlane"]): IsolationProbeDefinition[] {
    return this.list("active").filter((p) => p.targetPlane === plane);
  }

  transition(probeId: string, version: string, to: IsolationProbeLifecycle): IsolationProbeDefinition {
    const current = this.require(probeId, version);
    const fromIdx = LIFECYCLE.indexOf(current.status);
    const toIdx = LIFECYCLE.indexOf(to);
    if (toIdx < fromIdx) {
      throw new Error(`Invalid probe lifecycle ${current.status} → ${to}`);
    }
    const next = { ...current, status: to };
    this.probes.set(`${probeId}@${version}`, next);
    return next;
  }
}
