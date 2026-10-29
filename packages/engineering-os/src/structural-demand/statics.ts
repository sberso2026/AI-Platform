import type { StructuralBoundaryCondition, StructuralDemandMethodId, StructuralLoadApplication } from "@rtb/types";
import { demandMethodRecord } from "./methods";
import { assertBoundary, assertLoadApplicationShape, toDistributedNpm, toForceN, toLengthM, toMomentNm } from "./units";

export type StiffnessSI = { EPa: number; I_m4: number };

export type DemandStation = { xM: number; shearN: number; momentNm: number; deflectionM: number | null };

export type PrimitiveContribution = {
  methodId: StructuralDemandMethodId;
  startFyN: number;
  endFyN: number;
  startMzNm: number;
  endMzNm: number;
  stations: DemandStation[];
  deflectionSupported: boolean;
  axialN: number;
};

function stationsOf(L: number, extras: number[]): number[] {
  const xs = new Set<number>([0, L / 2, L, ...extras]);
  for (let i = 1; i < 16; i += 1) xs.add((L * i) / 16);
  return [...xs].filter((x) => x >= -1e-12 && x <= L + 1e-12).sort((a, b) => a - b).map((x) => Math.min(L, Math.max(0, x)));
}

function ei(stiffness: StiffnessSI | null): number | null {
  if (!stiffness) return null;
  if (!(stiffness.EPa > 0) || !(stiffness.I_m4 > 0)) {
    throw new Error("UNSUPPORTED_CASE: missing stiffness deflection fail closed");
  }
  return stiffness.EPa * stiffness.I_m4;
}

function ssUdl(L: number, w: number, stiffness: StiffnessSI | null, extras: number[]): PrimitiveContribution {
  const RA = w * L / 2;
  const RB = w * L / 2;
  const EI = ei(stiffness);
  const xs = stationsOf(L, extras);
  return {
    methodId: "SS_BEAM_UDL",
    startFyN: RA,
    endFyN: RB,
    startMzNm: 0,
    endMzNm: 0,
    deflectionSupported: EI != null,
    axialN: 0,
    stations: xs.map((x) => ({
      xM: x,
      shearN: RA - w * x,
      momentNm: RA * x - w * x * x / 2,
      deflectionM: EI == null ? null : w * x * (L ** 3 - 2 * L * x * x + x ** 3) / (24 * EI),
    })),
  };
}

function ssPoint(L: number, P: number, a: number, stiffness: StiffnessSI | null, extras: number[]): PrimitiveContribution {
  const b = L - a;
  const RA = P * b / L;
  const RB = P * a / L;
  const EI = ei(stiffness);
  const xs = stationsOf(L, [a, ...extras]);
  return {
    methodId: "SS_BEAM_POINT_LOAD",
    startFyN: RA,
    endFyN: RB,
    startMzNm: 0,
    endMzNm: 0,
    deflectionSupported: EI != null,
    axialN: 0,
    stations: xs.map((x) => {
      const shearN = x <= a ? RA : RA - P;
      const momentNm = x <= a ? RA * x : RA * x - P * (x - a);
      let deflectionM: number | null = null;
      if (EI != null) {
        deflectionM = x <= a
          ? P * b * x * (L * L - b * b - x * x) / (6 * EI * L)
          : P * a * (L - x) * (L * L - a * a - (L - x) * (L - x)) / (6 * EI * L);
      }
      return { xM: x, shearN, momentNm, deflectionM };
    }),
  };
}

function ssMoment(L: number, M0: number, a: number, stiffness: StiffnessSI | null, extras: number[]): PrimitiveContribution {
  const RA = -M0 / L;
  const RB = M0 / L;
  const EI = ei(stiffness);
  const C3 = EI == null ? 0 : -M0 * L / (3 * EI) - M0 * a * a / (2 * EI * L);
  const C4 = EI == null ? 0 : M0 * a * a / (2 * EI);
  const C1 = EI == null ? 0 : M0 * a / EI + C3;
  const xs = stationsOf(L, [Math.max(0, a - 1e-9), a, Math.min(L, a + 1e-9), ...extras]);
  return {
    methodId: "SS_BEAM_APPLIED_MOMENT",
    startFyN: RA,
    endFyN: RB,
    startMzNm: 0,
    endMzNm: 0,
    deflectionSupported: EI != null,
    axialN: 0,
    stations: xs.map((x) => {
      const shearN = RA;
      const momentNm = x < a ? RA * x : RA * x + M0;
      let deflectionM: number | null = null;
      if (EI != null) {
        deflectionM = x <= a
          ? -(M0 / (L * EI)) * x ** 3 / 6 + C1 * x
          : -(M0 / (L * EI)) * x ** 3 / 6 + (M0 / EI) * x ** 2 / 2 + C3 * x + C4;
      }
      return { xM: x, shearN, momentNm, deflectionM };
    }),
  };
}

function ssLinear(L: number, w1: number, w2: number, extras: number[]): PrimitiveContribution {
  const RA = L * (2 * w1 + w2) / 6;
  const RB = L * (w1 + 2 * w2) / 6;
  const xs = stationsOf(L, [L / Math.sqrt(3), ...extras]);
  return {
    methodId: "SS_BEAM_LINEAR_VARYING",
    startFyN: RA,
    endFyN: RB,
    startMzNm: 0,
    endMzNm: 0,
    deflectionSupported: false,
    axialN: 0,
    stations: xs.map((x) => ({
      xM: x,
      shearN: RA - w1 * x - (w2 - w1) * x * x / (2 * L),
      momentNm: RA * x - w1 * x * x / 2 - (w2 - w1) * x ** 3 / (6 * L),
      deflectionM: null,
    })),
  };
}

function cantUdl(L: number, w: number, stiffness: StiffnessSI | null, extras: number[]): PrimitiveContribution {
  const RA = w * L;
  const MA = -w * L * L / 2;
  const EI = ei(stiffness);
  const xs = stationsOf(L, extras);
  return {
    methodId: "CANTILEVER_UDL",
    startFyN: RA,
    endFyN: 0,
    startMzNm: MA,
    endMzNm: 0,
    deflectionSupported: EI != null,
    axialN: 0,
    stations: xs.map((x) => ({
      xM: x,
      shearN: w * (L - x),
      momentNm: -w * (L - x) * (L - x) / 2,
      deflectionM: EI == null ? null : w * x * x * (6 * L * L - 4 * L * x + x * x) / (24 * EI),
    })),
  };
}

function cantPoint(L: number, P: number, a: number, stiffness: StiffnessSI | null, extras: number[]): PrimitiveContribution {
  const RA = P;
  const MA = -P * a;
  const EI = ei(stiffness);
  const xs = stationsOf(L, [a, ...extras]);
  return {
    methodId: "CANTILEVER_POINT_LOAD",
    startFyN: RA,
    endFyN: 0,
    startMzNm: MA,
    endMzNm: 0,
    deflectionSupported: EI != null,
    axialN: 0,
    stations: xs.map((x) => {
      const shearN = x <= a ? P : 0;
      const momentNm = x <= a ? -P * (a - x) : 0;
      let deflectionM: number | null = null;
      if (EI != null) {
        deflectionM = x <= a ? P * x * x * (3 * a - x) / (6 * EI) : P * a * a * (3 * x - a) / (6 * EI);
      }
      return { xM: x, shearN, momentNm, deflectionM };
    }),
  };
}

function cantMoment(L: number, M0: number, a: number, stiffness: StiffnessSI | null, extras: number[]): PrimitiveContribution {
  const atTip = Math.abs(a - L) <= 1e-12;
  const EI = ei(stiffness);
  const deflectionSupported = atTip && EI != null;
  const xs = stationsOf(L, [a, ...extras]);
  return {
    methodId: "CANTILEVER_APPLIED_MOMENT",
    startFyN: 0,
    endFyN: 0,
    startMzNm: atTip ? M0 : -M0,
    endMzNm: atTip ? M0 : 0,
    deflectionSupported,
    axialN: 0,
    stations: xs.map((x) => {
      const momentNm = atTip ? M0 : x < a ? -M0 : 0;
      const deflectionM = deflectionSupported ? M0 * x * x / (2 * EI!) : null;
      return { xM: x, shearN: 0, momentNm, deflectionM };
    }),
  };
}

function cantLinear(L: number, w1: number, w2: number, extras: number[]): PrimitiveContribution {
  const RA = (w1 + w2) * L / 2;
  const MA = -L * L * (w1 + 2 * w2) / 6;
  const xs = stationsOf(L, extras);
  return {
    methodId: "CANTILEVER_LINEAR_VARYING",
    startFyN: RA,
    endFyN: 0,
    startMzNm: MA,
    endMzNm: 0,
    deflectionSupported: false,
    axialN: 0,
    stations: xs.map((x) => ({
      xM: x,
      shearN: RA - w1 * x - (w2 - w1) * x * x / (2 * L),
      momentNm: MA + RA * x - w1 * x * x / 2 - (w2 - w1) * x ** 3 / (6 * L),
      deflectionM: null,
    })),
  };
}

function requireFullSpan(app: StructuralLoadApplication, L: number): void {
  const start = toLengthM(app.startM ?? 0, "m");
  const end = toLengthM(app.endM ?? L, "m");
  if (Math.abs(start) > 1e-12 || Math.abs(end - L) > 1e-12) {
    throw new Error("UNSUPPORTED_CASE: distributed loads are implemented for the full member span only");
  }
}

function positionOnMember(app: StructuralLoadApplication, L: number): number {
  if (app.kind === "NODAL_FORCE" || app.kind === "NODAL_MOMENT") {
    if (app.positionM == null) throw new Error("governed load input is malformed: nodal position is required");
  }
  const x = toLengthM(app.positionM ?? 0, "m");
  if (x > L + 1e-12) throw new Error("governed load input is malformed: application position is outside the member");
  return Math.min(L, Math.max(0, x));
}

export function evaluateLoadPrimitive(
  boundary: StructuralBoundaryCondition,
  L: number,
  app: StructuralLoadApplication,
  stiffness: StiffnessSI | null,
  extraStations: number[] = [],
): PrimitiveContribution {
  assertBoundary(boundary);
  assertLoadApplicationShape(app);
  if (!app.targetMemberId) throw new Error("governed load input is malformed: target object is required");
  if (app.direction === "AXIAL") {
    if (app.kind !== "POINT_FORCE" && app.kind !== "NODAL_FORCE") {
      throw new Error("UNSUPPORTED_CASE: axial demand is implemented for point/nodal force only");
    }
    const P = toForceN(app.magnitude);
    return {
      methodId: "AXIAL_DIRECT",
      startFyN: 0,
      endFyN: 0,
      startMzNm: 0,
      endMzNm: 0,
      deflectionSupported: false,
      axialN: P,
      stations: stationsOf(L, extraStations).map((x) => ({ xM: x, shearN: 0, momentNm: 0, deflectionM: null })),
    };
  }
  if (app.kind === "UNIFORM_DISTRIBUTED_LOAD") {
    requireFullSpan(app, L);
    const w = toDistributedNpm(app.magnitude);
    return boundary === "SIMPLE_SIMPLE" ? ssUdl(L, w, stiffness, extraStations) : cantUdl(L, w, stiffness, extraStations);
  }
  if (app.kind === "LINEARLY_VARYING_DISTRIBUTED_LOAD") {
    requireFullSpan(app, L);
    if (!app.endMagnitude) throw new Error("governed load input is malformed: linearly varying load requires start and end magnitude");
    const w1 = toDistributedNpm(app.magnitude);
    const w2 = toDistributedNpm(app.endMagnitude);
    return boundary === "SIMPLE_SIMPLE" ? ssLinear(L, w1, w2, extraStations) : cantLinear(L, w1, w2, extraStations);
  }
  if (app.kind === "POINT_FORCE" || app.kind === "NODAL_FORCE") {
    const P = toForceN(app.magnitude);
    const a = positionOnMember(app, L);
    return boundary === "SIMPLE_SIMPLE" ? ssPoint(L, P, a, stiffness, extraStations) : cantPoint(L, P, a, stiffness, extraStations);
  }
  if (app.kind === "POINT_MOMENT" || app.kind === "NODAL_MOMENT") {
    const M0 = toMomentNm(app.magnitude);
    const a = positionOnMember(app, L);
    if (boundary === "SIMPLE_SIMPLE" && (a <= 1e-12 || Math.abs(a - L) <= 1e-12)) {
      throw new Error("UNSUPPORTED_CASE: simply supported ends cannot resist an applied couple");
    }
    return boundary === "SIMPLE_SIMPLE" ? ssMoment(L, M0, a, stiffness, extraStations) : cantMoment(L, M0, a, stiffness, extraStations);
  }
  throw new Error("UNSUPPORTED_CASE: unsupported load application");
}

export function superposePrimitives(parts: PrimitiveContribution[]): PrimitiveContribution {
  if (parts.length === 0) throw new Error("UNSUPPORTED_CASE: no supported load primitives");
  const xs = [...new Set(parts.flatMap((part) => part.stations.map((row) => row.xM)))].sort((a, b) => a - b);
  const deflectionSupported = parts.every((part) => part.deflectionSupported);
  function at(part: PrimitiveContribution, x: number): DemandStation {
    const exact = part.stations.find((row) => Math.abs(row.xM - x) <= 1e-12);
    if (exact) return exact;
    const next = part.stations.find((row) => row.xM > x) ?? part.stations[part.stations.length - 1]!;
    return next;
  }
  return {
    methodId: parts.length === 1 ? parts[0]!.methodId : "LINEAR_SUPERPOSITION",
    startFyN: parts.reduce((sum, part) => sum + part.startFyN, 0),
    endFyN: parts.reduce((sum, part) => sum + part.endFyN, 0),
    startMzNm: parts.reduce((sum, part) => sum + part.startMzNm, 0),
    endMzNm: parts.reduce((sum, part) => sum + part.endMzNm, 0),
    deflectionSupported,
    axialN: parts.reduce((sum, part) => sum + part.axialN, 0),
    stations: xs.map((x) => ({
      xM: x,
      shearN: parts.reduce((sum, part) => sum + at(part, x).shearN, 0),
      momentNm: parts.reduce((sum, part) => sum + at(part, x).momentNm, 0),
      deflectionM: deflectionSupported ? parts.reduce((sum, part) => sum + (at(part, x).deflectionM ?? 0), 0) : null,
    })),
  };
}

export function assertMethodMatches(boundary: StructuralBoundaryCondition, methodId: StructuralDemandMethodId): void {
  const row = demandMethodRecord(methodId);
  if (row.boundary !== "ANY" && row.boundary !== boundary) {
    throw new Error("UNSUPPORTED_CASE: method does not match support condition");
  }
}
