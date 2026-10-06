import type {
  RcBarContainmentState,
  RcPointMm,
  ReinforcementBar,
  ReinforcementLayout,
} from "@rtb/types";
import { UNGOVERNED_BAR_DESIGNATION_GENERATES_AREA, UNGOVERNED_BAR_NAME_GENERATES_AREA } from "@rtb/types";
import { aggregateReinforcementGeometry } from "../reinforcement";
import { assertBarAreaNotInferredFromDesignation } from "../materials";
import { expandSectionOutlines, geometricClearanceToSurfaceMm, pointInValidConcrete, type SolidOutline } from "./geometry";
import type { RcSectionGeometryInput } from "@rtb/types";
import { failClosed } from "./units";

export type RcBarGeometryRecord = {
  barId: string;
  xMm: number;
  yMm: number;
  diameterMm: number | null;
  areaMm2: number;
  count: number;
  materialRef: string;
  groupId: string | null;
  layerId: string | null;
  face: string | null;
  direction: string | null;
  provenanceRef: string;
  containment: RcBarContainmentState;
};

function barNumericArea(bar: ReinforcementBar): number {
  if (UNGOVERNED_BAR_NAME_GENERATES_AREA || UNGOVERNED_BAR_DESIGNATION_GENERATES_AREA) {
    failClosed("ungoverned bar designation must not generate area");
  }
  const area = assertBarAreaNotInferredFromDesignation(bar.designation, bar.areaMm2);
  const value = typeof area.value === "number" ? area.value : Number(area.value);
  if (!Number.isFinite(value) || value <= 0) failClosed("negative or missing bar area");
  return value * bar.count;
}

function barDiameterMm(bar: ReinforcementBar): number | null {
  if (!bar.diameterMm || bar.diameterMm.value == null) return null;
  const value = typeof bar.diameterMm.value === "number" ? bar.diameterMm.value : Number(bar.diameterMm.value);
  if (!Number.isFinite(value) || value <= 0) failClosed("invalid bar diameter");
  if (bar.diameterMm.unit !== "mm") failClosed("bar diameter unit must be mm");
  return value;
}

function classifyContainment(point: RcPointMm, radiusMm: number, solids: readonly SolidOutline[], voids: readonly SolidOutline[]): RcBarContainmentState {
  const inVoid = voids.some((hole) => {
    if (hole.circle) {
      return Math.hypot(point.xMm - hole.circle.centerMm.xMm, point.yMm - hole.circle.centerMm.yMm) <= hole.circle.radiusMm + radiusMm;
    }
    return pointInValidConcrete(point, [hole], []);
  });
  if (inVoid) return "INSIDE_VOID";
  const inSolid = pointInValidConcrete(point, solids, []);
  if (!inSolid) return "OUTSIDE_CONCRETE";
  const clearance = geometricClearanceToSurfaceMm(point, radiusMm, solids, voids);
  if (clearance < -1e-6) return "ON_INVALID_BOUNDARY";
  if (Math.abs(clearance) <= 1e-6) return "ON_INVALID_BOUNDARY";
  return "INSIDE_CONCRETE";
}

export function evaluateBarGeometry(layout: ReinforcementLayout, geometry: RcSectionGeometryInput): {
  bars: RcBarGeometryRecord[];
  totalAreaMm2: number;
  centroid: { xMm: number; yMm: number } | null;
  IxSteelMm4: number;
  IySteelMm4: number;
  IxySteelMm4: number;
  groupCentroids: Record<string, { xMm: number; yMm: number; areaMm2: number; count: number }>;
  layerCentroids: Record<string, { xMm: number; yMm: number; areaMm2: number; count: number; extremeYMm: number }>;
  minBarClearSpacingMm: number | null;
} {
  const { solids, voids } = expandSectionOutlines(geometry);
  const bars: RcBarGeometryRecord[] = [];
  for (const bar of layout.bars) {
    if (bar.xMm == null || bar.yMm == null) failClosed("bar coordinates missing");
    const areaMm2 = barNumericArea(bar);
    const diameterMm = barDiameterMm(bar);
    const radius = diameterMm != null ? diameterMm / 2 : 0;
    const containment = classifyContainment({ xMm: bar.xMm, yMm: bar.yMm }, radius, solids, voids);
    if (containment !== "INSIDE_CONCRETE") failClosed(`bar ${bar.barId} ${containment.toLowerCase().replace(/_/g, " ")}`);
    bars.push({
      barId: bar.barId,
      xMm: bar.xMm,
      yMm: bar.yMm,
      diameterMm,
      areaMm2,
      count: bar.count,
      materialRef: bar.materialRef,
      groupId: bar.groupId,
      layerId: bar.layerId,
      face: bar.face,
      direction: bar.direction,
      provenanceRef: bar.provenanceRef,
      containment,
    });
  }
  const aggregation = aggregateReinforcementGeometry(layout);
  let Ix = 0;
  let Iy = 0;
  let Ixy = 0;
  const c = aggregation.centroid;
  if (c) {
    for (const bar of bars) {
      const dx = bar.xMm - c.xMm;
      const dy = bar.yMm - c.yMm;
      Ix += bar.areaMm2 * dy * dy;
      Iy += bar.areaMm2 * dx * dx;
      Ixy += bar.areaMm2 * dx * dy;
    }
  }
  const groupCentroids: Record<string, { xMm: number; yMm: number; areaMm2: number; count: number }> = {};
  for (const group of layout.groups) {
    const members = bars.filter((bar) => group.barIds.includes(bar.barId));
    const area = members.reduce((sum, bar) => sum + bar.areaMm2, 0);
    groupCentroids[group.groupId] = {
      xMm: area ? members.reduce((sum, bar) => sum + bar.areaMm2 * bar.xMm, 0) / area : 0,
      yMm: area ? members.reduce((sum, bar) => sum + bar.areaMm2 * bar.yMm, 0) / area : 0,
      areaMm2: area,
      count: members.reduce((sum, bar) => sum + bar.count, 0),
    };
  }
  const layerCentroids: Record<string, { xMm: number; yMm: number; areaMm2: number; count: number; extremeYMm: number }> = {};
  for (const layer of layout.layers) {
    const members = bars.filter((bar) => bar.layerId === layer.layerId);
    const area = members.reduce((sum, bar) => sum + bar.areaMm2, 0);
    layerCentroids[layer.layerId] = {
      xMm: area ? members.reduce((sum, bar) => sum + bar.areaMm2 * bar.xMm, 0) / area : 0,
      yMm: area ? members.reduce((sum, bar) => sum + bar.areaMm2 * bar.yMm, 0) / area : 0,
      areaMm2: area,
      count: members.reduce((sum, bar) => sum + bar.count, 0),
      extremeYMm: members.length ? Math.min(...members.map((bar) => bar.yMm)) : 0,
    };
  }
  let minClear: number | null = null;
  for (let i = 0; i < bars.length; i++) {
    for (let j = i + 1; j < bars.length; j++) {
      const a = bars[i];
      const b = bars[j];
      if (!a || !b) continue;
      const ra = (a.diameterMm ?? 0) / 2;
      const rb = (b.diameterMm ?? 0) / 2;
      const clear = Math.hypot(a.xMm - b.xMm, a.yMm - b.yMm) - ra - rb;
      minClear = minClear == null ? clear : Math.min(minClear, clear);
    }
  }
  return {
    bars,
    totalAreaMm2: aggregation.totalAreaMm2,
    centroid: aggregation.centroid,
    IxSteelMm4: Ix,
    IySteelMm4: Iy,
    IxySteelMm4: Ixy,
    groupCentroids,
    layerCentroids,
    minBarClearSpacingMm: minClear,
  };
}

export function geometricClearances(layout: ReinforcementLayout, geometry: RcSectionGeometryInput): { barId: string; geometricClearanceMm: number; codeCoverCompliance: false }[] {
  const { solids, voids } = expandSectionOutlines(geometry);
  const evaluated = evaluateBarGeometry(layout, geometry);
  return evaluated.bars.map((bar) => ({
    barId: bar.barId,
    geometricClearanceMm: geometricClearanceToSurfaceMm({ xMm: bar.xMm, yMm: bar.yMm }, (bar.diameterMm ?? 0) / 2, solids, voids),
    codeCoverCompliance: false as const,
  }));
}
