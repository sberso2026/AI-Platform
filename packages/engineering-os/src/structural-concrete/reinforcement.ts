import type { ReinforcementBar, ReinforcementLayout } from "@rtb/types";
import { CODE_REINFORCEMENT_RATIO_RULE_IMPLEMENTED } from "@rtb/types";
import { assertBarAreaNotInferredFromDesignation } from "./materials";

export type ReinforcementGeometryAggregation = {
  barAreasMm2: readonly number[];
  groupAreasMm2: Record<string, number>;
  layerAreasMm2: Record<string, number>;
  totalAreaMm2: number;
  centroid: { xMm: number; yMm: number } | null;
};

function barArea(bar: ReinforcementBar): number {
  const area = assertBarAreaNotInferredFromDesignation(bar.designation, bar.areaMm2);
  const value = typeof area.value === "number" ? area.value : Number(area.value);
  if (!Number.isFinite(value) || value <= 0) throw new Error("concrete design fail closed: missing reinforcement geometry");
  return value * bar.count;
}

export function aggregateReinforcementGeometry(layout: ReinforcementLayout): ReinforcementGeometryAggregation {
  if (CODE_REINFORCEMENT_RATIO_RULE_IMPLEMENTED) {
    throw new Error("code reinforcement ratio rules must not be implemented in the common core");
  }
  const barAreasMm2 = layout.bars.map(barArea);
  const byBar = new Map(layout.bars.map((bar, index) => [bar.barId, barAreasMm2[index] ?? 0]));
  const groupAreasMm2: Record<string, number> = {};
  for (const group of layout.groups) {
    groupAreasMm2[group.groupId] = group.barIds.reduce((sum, id) => sum + (byBar.get(id) ?? 0), 0);
  }
  const layerAreasMm2: Record<string, number> = {};
  for (const layer of layout.layers) {
    layerAreasMm2[layer.layerId] = layer.groupIds.reduce((sum, id) => sum + (groupAreasMm2[id] ?? 0), 0);
  }
  const totalAreaMm2 = barAreasMm2.reduce((sum, area) => sum + area, 0);
  let ax = 0;
  let ay = 0;
  let weight = 0;
  for (const bar of layout.bars) {
    if (bar.xMm == null || bar.yMm == null) continue;
    const area = byBar.get(bar.barId) ?? 0;
    ax += area * bar.xMm;
    ay += area * bar.yMm;
    weight += area;
  }
  return {
    barAreasMm2,
    groupAreasMm2,
    layerAreasMm2,
    totalAreaMm2,
    centroid: weight > 0 ? { xMm: ax / weight, yMm: ay / weight } : null,
  };
}

export function assertNoCodeReinforcementRatio(rho: number | null | undefined): void {
  if (CODE_REINFORCEMENT_RATIO_RULE_IMPLEMENTED || rho != null) {
    throw new Error("code reinforcement ratio rules are not implemented");
  }
}
