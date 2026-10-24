import type {
  ConcreteSectionGeometryProperties,
  RcConcreteRegion,
  RcPointMm,
  RcSectionGeometryInput,
  RcSectionVoidGeometry,
} from "@rtb/types";
import { RC_SECTION_MECHANICS_METHOD_VERSION } from "@rtb/types";
import {
  circleNgon,
  minDistanceToBoundary,
  pointInPolygon,
  polygonMoments,
  polygonsEdgesIntersect,
  rectangleVertices,
  type PolygonMoments,
} from "./polygon";
import { assertFiniteNumber, assertPositiveLengthMm, failClosed } from "./units";

export type SolidOutline = {
  regionId: string;
  kind: RcConcreteRegion["kind"];
  verticesMm: RcPointMm[];
  circle?: { centerMm: RcPointMm; radiusMm: number };
};

function regionToOutline(region: RcConcreteRegion, label: string): SolidOutline {
  if (region.kind === "RECTANGLE") {
    const origin = region.originMm ?? failClosed(`${label} rectangle origin missing`);
    const width = assertPositiveLengthMm(region.widthMm ?? NaN, "mm", `${label}.width`);
    const depth = assertPositiveLengthMm(region.depthMm ?? NaN, "mm", `${label}.depth`);
    return { regionId: region.regionId, kind: "RECTANGLE", verticesMm: rectangleVertices(origin, width, depth) };
  }
  if (region.kind === "CIRCLE") {
    const center = region.centerMm ?? failClosed(`${label} circle center missing`);
    const diameter = assertPositiveLengthMm(region.diameterMm ?? NaN, "mm", `${label}.diameter`);
    const radius = diameter / 2;
    return {
      regionId: region.regionId,
      kind: "CIRCLE",
      verticesMm: circleNgon(center, radius),
      circle: { centerMm: center, radiusMm: radius },
    };
  }
  if (region.kind === "POLYGON") {
    const vertices = region.verticesMm ?? failClosed(`${label} polygon vertices missing`);
    return { regionId: region.regionId, kind: "POLYGON", verticesMm: [...vertices] };
  }
  failClosed(`${label} unknown region kind`);
}

function circleMoments(center: RcPointMm, radiusMm: number): PolygonMoments {
  const area = Math.PI * radiusMm * radiusMm;
  const I = (Math.PI * radiusMm ** 4) / 4;
  return { areaMm2: area, cxMm: center.xMm, cyMm: center.yMm, IxMm4: I, IyMm4: I, IxyMm4: 0, winding: "CCW" };
}

function outlineMoments(outline: SolidOutline, label: string): PolygonMoments {
  if (outline.circle) return circleMoments(outline.circle.centerMm, outline.circle.radiusMm);
  return polygonMoments(outline.verticesMm, label);
}

function addMoments(parts: PolygonMoments[]): PolygonMoments {
  if (parts.length === 0) failClosed("no geometric regions");
  let area = 0;
  let ax = 0;
  let ay = 0;
  for (const p of parts) {
    area += p.areaMm2;
    ax += p.areaMm2 * p.cxMm;
    ay += p.areaMm2 * p.cyMm;
  }
  if (!(Math.abs(area) > 0)) failClosed("zero-area section");
  const cx = ax / area;
  const cy = ay / area;
  let Ix = 0;
  let Iy = 0;
  let Ixy = 0;
  for (const p of parts) {
    const dx = p.cxMm - cx;
    const dy = p.cyMm - cy;
    Ix += p.IxMm4 + p.areaMm2 * dy * dy;
    Iy += p.IyMm4 + p.areaMm2 * dx * dx;
    Ixy += p.IxyMm4 + p.areaMm2 * dx * dy;
  }
  return { areaMm2: area, cxMm: cx, cyMm: cy, IxMm4: Ix, IyMm4: Iy, IxyMm4: Ixy, winding: area >= 0 ? "CCW" : "CW" };
}

function subtractMoments(host: PolygonMoments, hole: PolygonMoments): PolygonMoments {
  const area = host.areaMm2 - hole.areaMm2;
  if (!(area > 0)) failClosed("void area consumes section");
  const cx = (host.areaMm2 * host.cxMm - hole.areaMm2 * hole.cxMm) / area;
  const cy = (host.areaMm2 * host.cyMm - hole.areaMm2 * hole.cyMm) / area;
  const hostIx = host.IxMm4 + host.areaMm2 * (host.cyMm - cy) ** 2;
  const hostIy = host.IyMm4 + host.areaMm2 * (host.cxMm - cx) ** 2;
  const hostIxy = host.IxyMm4 + host.areaMm2 * (host.cxMm - cx) * (host.cyMm - cy);
  const holeIx = hole.IxMm4 + hole.areaMm2 * (hole.cyMm - cy) ** 2;
  const holeIy = hole.IyMm4 + hole.areaMm2 * (hole.cxMm - cx) ** 2;
  const holeIxy = hole.IxyMm4 + hole.areaMm2 * (hole.cxMm - cx) * (hole.cyMm - cy);
  return {
    areaMm2: area,
    cxMm: cx,
    cyMm: cy,
    IxMm4: hostIx - holeIx,
    IyMm4: hostIy - holeIy,
    IxyMm4: hostIxy - holeIxy,
    winding: "CCW",
  };
}

function pointInCircle(point: RcPointMm, center: RcPointMm, radiusMm: number): boolean {
  return Math.hypot(point.xMm - center.xMm, point.yMm - center.yMm) <= radiusMm + 1e-9;
}

function regionContains(outline: SolidOutline, point: RcPointMm): boolean {
  if (outline.circle) return pointInCircle(point, outline.circle.centerMm, outline.circle.radiusMm);
  return pointInPolygon(point, outline.verticesMm);
}

function assertVoidInside(host: SolidOutline, hole: SolidOutline): void {
  if (hole.circle) {
    const samples = hole.verticesMm;
    for (const p of samples) {
      if (!regionContains(host, p)) failClosed("void not contained in concrete region");
    }
    return;
  }
  for (const p of hole.verticesMm) {
    if (!regionContains(host, p)) failClosed("void not contained in concrete region");
  }
  if (polygonsEdgesIntersect(host.verticesMm, hole.verticesMm) && !hole.circle && !host.circle) {
    failClosed("void boundary intersects concrete boundary");
  }
}

export function expandSectionOutlines(input: RcSectionGeometryInput): { solids: SolidOutline[]; voids: SolidOutline[] } {
  if (input.lengthUnit !== "mm") failClosed("section length unit must be mm");
  if (!input.regions.length) failClosed("section regions missing");
  const ids = new Set<string>();
  const solids = input.regions.map((region) => {
    if (ids.has(region.regionId)) failClosed("duplicate conflicting geometry identifier");
    ids.add(region.regionId);
    return regionToOutline(region, region.regionId);
  });
  const voids = input.voids.map((region) => {
    if (ids.has(region.voidId) || ids.has(region.regionId)) failClosed("duplicate conflicting geometry identifier");
    ids.add(region.voidId);
    const outline = regionToOutline(region, region.voidId);
    return outline;
  });
  for (let i = 0; i < solids.length; i++) {
    for (let j = i + 1; j < solids.length; j++) {
      const a = solids[i];
      const b = solids[j];
      if (!a || !b) continue;
      if (polygonsEdgesIntersect(a.verticesMm, b.verticesMm)) failClosed("overlapping concrete regions");
    }
  }
  for (const hole of voids) {
    const holeMom = outlineMoments(hole, hole.regionId);
    if (!(Math.abs(holeMom.areaMm2) > 0)) failClosed("void area non-zero required");
    const contained = solids.some((solid) => {
      try {
        assertVoidInside(solid, hole);
        return true;
      } catch {
        return false;
      }
    });
    if (!contained) failClosed("void not contained in concrete region");
  }
  for (let i = 0; i < voids.length; i++) {
    for (let j = i + 1; j < voids.length; j++) {
      const a = voids[i];
      const b = voids[j];
      if (!a || !b) continue;
      if (polygonsEdgesIntersect(a.verticesMm, b.verticesMm)) failClosed("overlapping voids");
    }
  }
  return { solids, voids };
}

export function pointInValidConcrete(point: RcPointMm, solids: readonly SolidOutline[], voids: readonly SolidOutline[]): boolean {
  const inSolid = solids.some((solid) => regionContains(solid, point));
  if (!inSolid) return false;
  const inVoid = voids.some((hole) => regionContains(hole, point));
  return !inVoid;
}

export function geometricClearanceToSurfaceMm(point: RcPointMm, radiusMm: number, solids: readonly SolidOutline[], voids: readonly SolidOutline[]): number {
  let minSolid = Number.POSITIVE_INFINITY;
  for (const solid of solids) {
    if (solid.circle) {
      minSolid = Math.min(minSolid, solid.circle.radiusMm - Math.hypot(point.xMm - solid.circle.centerMm.xMm, point.yMm - solid.circle.centerMm.yMm));
    } else {
      minSolid = Math.min(minSolid, minDistanceToBoundary(point, solid.verticesMm));
    }
  }
  let minVoid = Number.POSITIVE_INFINITY;
  for (const hole of voids) {
    if (hole.circle) {
      minVoid = Math.min(minVoid, Math.hypot(point.xMm - hole.circle.centerMm.xMm, point.yMm - hole.circle.centerMm.yMm) - hole.circle.radiusMm);
    } else {
      minVoid = Math.min(minVoid, minDistanceToBoundary(point, hole.verticesMm));
    }
  }
  const toSurface = Math.min(minSolid, minVoid) - radiusMm;
  return toSurface;
}

export function boundingBox(solids: readonly SolidOutline[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const solid of solids) {
    for (const p of solid.verticesMm) {
      minX = Math.min(minX, p.xMm);
      minY = Math.min(minY, p.yMm);
      maxX = Math.max(maxX, p.xMm);
      maxY = Math.max(maxY, p.yMm);
    }
  }
  if (!Number.isFinite(minX)) failClosed("empty bounding box");
  return { minX, minY, maxX, maxY };
}

function principalFrom(Ix: number, Iy: number, Ixy: number): { I1: number; I2: number; angle: number } {
  const avg = (Ix + Iy) / 2;
  const radius = Math.sqrt(((Ix - Iy) / 2) ** 2 + Ixy ** 2);
  const I1 = avg + radius;
  const I2 = avg - radius;
  const angle = 0.5 * Math.atan2(2 * Ixy, Iy - Ix);
  return { I1, I2, angle };
}

export function computeGrossSectionProperties(input: RcSectionGeometryInput, timestamp = "deterministic"): ConcreteSectionGeometryProperties {
  assertFiniteNumber(input.coordinateSystem.originMm.xMm, "origin.x");
  assertFiniteNumber(input.coordinateSystem.originMm.yMm, "origin.y");
  const { solids, voids } = expandSectionOutlines(input);
  const solidMoments = addMoments(solids.map((solid) => outlineMoments(solid, solid.regionId)));
  let net = solidMoments;
  for (const hole of voids) {
    net = subtractMoments(net, outlineMoments(hole, hole.regionId));
  }
  const principal = principalFrom(net.IxMm4, net.IyMm4, net.IxyMm4);
  return {
    resultAuthority: "GEOMETRY_RESULT",
    sectionRef: input.sectionId,
    geometryVersion: input.geometryVersion,
    inputDimensions: {
      shape: input.shape,
      regionCount: input.regions.length,
      voidCount: input.voids.length,
      lengthUnit: input.lengthUnit,
    },
    unitSystem: { length: "mm", area: "mm2", secondMoment: "mm4", angle: "rad" },
    derivationMethod: "DETERMINISTIC_PLANE_GEOMETRY",
    implementationVersion: RC_SECTION_MECHANICS_METHOD_VERSION,
    grossConcreteAreaMm2: net.areaMm2,
    centroidXMm: net.cxMm,
    centroidYMm: net.cyMm,
    IxMm4: net.IxMm4,
    IyMm4: net.IyMm4,
    IxyMm4: net.IxyMm4,
    principalI1Mm4: principal.I1,
    principalI2Mm4: principal.I2,
    principalAngleRad: principal.angle,
    timestamp,
    provenanceRef: input.provenanceRef,
    labelledCodeCapacity: false,
  };
}

export function rectangleSection(sectionId: string, widthMm: number, depthMm: number, provenanceRef: string): RcSectionGeometryInput {
  return {
    sectionId,
    shape: "RECTANGULAR",
    regions: [{ regionId: `${sectionId}-rect`, kind: "RECTANGLE", originMm: { xMm: 0, yMm: 0 }, widthMm, depthMm }],
    voids: [],
    coordinateSystem: {
      originMm: { xMm: 0, yMm: 0 },
      xAxis: "+X_RIGHT",
      yAxis: "+Y_UP",
      orientationRad: 0,
      lengthUnit: "mm",
      source: "explicit",
      provenanceRef,
    },
    lengthUnit: "mm",
    geometryVersion: "1",
    provenanceRef,
  };
}

export function circularSection(sectionId: string, diameterMm: number, provenanceRef: string): RcSectionGeometryInput {
  const r = diameterMm / 2;
  return {
    sectionId,
    shape: "CIRCULAR",
    regions: [{ regionId: `${sectionId}-circ`, kind: "CIRCLE", centerMm: { xMm: r, yMm: r }, diameterMm }],
    voids: [],
    coordinateSystem: {
      originMm: { xMm: 0, yMm: 0 },
      xAxis: "+X_RIGHT",
      yAxis: "+Y_UP",
      orientationRad: 0,
      lengthUnit: "mm",
      source: "explicit",
      provenanceRef,
    },
    lengthUnit: "mm",
    geometryVersion: "1",
    provenanceRef,
  };
}

export function flangedTSection(
  sectionId: string,
  flangeWidthMm: number,
  flangeThicknessMm: number,
  webWidthMm: number,
  overallDepthMm: number,
  provenanceRef: string,
): RcSectionGeometryInput {
  const webHeight = overallDepthMm - flangeThicknessMm;
  if (!(webHeight > 0)) failClosed("T-section web height invalid");
  const webX = (flangeWidthMm - webWidthMm) / 2;
  return {
    sectionId,
    shape: "T_SECTION",
    regions: [
      { regionId: `${sectionId}-web`, kind: "RECTANGLE", originMm: { xMm: webX, yMm: 0 }, widthMm: webWidthMm, depthMm: webHeight },
      { regionId: `${sectionId}-flange`, kind: "RECTANGLE", originMm: { xMm: 0, yMm: webHeight }, widthMm: flangeWidthMm, depthMm: flangeThicknessMm },
    ],
    voids: [],
    coordinateSystem: {
      originMm: { xMm: 0, yMm: 0 },
      xAxis: "+X_RIGHT",
      yAxis: "+Y_UP",
      orientationRad: 0,
      lengthUnit: "mm",
      source: "explicit",
      provenanceRef,
    },
    lengthUnit: "mm",
    geometryVersion: "1",
    provenanceRef,
  };
}

export function lSection(
  sectionId: string,
  widthMm: number,
  depthMm: number,
  thicknessXMm: number,
  thicknessYMm: number,
  provenanceRef: string,
): RcSectionGeometryInput {
  return {
    sectionId,
    shape: "L_SECTION",
    regions: [
      { regionId: `${sectionId}-vert`, kind: "RECTANGLE", originMm: { xMm: 0, yMm: 0 }, widthMm: thicknessXMm, depthMm },
      { regionId: `${sectionId}-horiz`, kind: "RECTANGLE", originMm: { xMm: thicknessXMm, yMm: 0 }, widthMm: widthMm - thicknessXMm, depthMm: thicknessYMm },
    ],
    voids: [],
    coordinateSystem: {
      originMm: { xMm: 0, yMm: 0 },
      xAxis: "+X_RIGHT",
      yAxis: "+Y_UP",
      orientationRad: 0,
      lengthUnit: "mm",
      source: "explicit",
      provenanceRef,
    },
    lengthUnit: "mm",
    geometryVersion: "1",
    provenanceRef,
  };
}

export function polygonalSection(sectionId: string, verticesMm: readonly RcPointMm[], voids: readonly RcSectionVoidGeometry[], provenanceRef: string): RcSectionGeometryInput {
  return {
    sectionId,
    shape: "POLYGONAL",
    regions: [{ regionId: `${sectionId}-poly`, kind: "POLYGON", verticesMm }],
    voids,
    coordinateSystem: {
      originMm: { xMm: 0, yMm: 0 },
      xAxis: "+X_RIGHT",
      yAxis: "+Y_UP",
      orientationRad: 0,
      lengthUnit: "mm",
      source: "explicit",
      provenanceRef,
    },
    lengthUnit: "mm",
    geometryVersion: "1",
    provenanceRef,
  };
}
