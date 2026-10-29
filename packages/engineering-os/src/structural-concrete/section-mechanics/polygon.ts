import type { RcPointMm } from "@rtb/types";
import { RC_NUMERICAL_TOLERANCE } from "@rtb/types";
import { assertFiniteNumber, failClosed } from "./units";

export type PolygonMoments = {
  areaMm2: number;
  cxMm: number;
  cyMm: number;
  IxMm4: number;
  IyMm4: number;
  IxyMm4: number;
  winding: "CCW" | "CW";
};

function closedRing(vertices: readonly RcPointMm[]): RcPointMm[] {
  if (vertices.length < 3) failClosed("polygon has fewer than 3 vertices");
  for (const p of vertices) {
    assertFiniteNumber(p.xMm, "polygon.x");
    assertFiniteNumber(p.yMm, "polygon.y");
  }
  const first = vertices[0];
  const last = vertices[vertices.length - 1];
  if (!first || !last) failClosed("polygon vertices missing");
  if (first.xMm === last.xMm && first.yMm === last.yMm) return vertices.slice(0, -1);
  return [...vertices];
}

function segmentsIntersect(a1: RcPointMm, a2: RcPointMm, b1: RcPointMm, b2: RcPointMm): boolean {
  const den = (a2.xMm - a1.xMm) * (b2.yMm - b1.yMm) - (a2.yMm - a1.yMm) * (b2.xMm - b1.xMm);
  if (Math.abs(den) < RC_NUMERICAL_TOLERANCE.lengthMm) return false;
  const ua = ((b1.xMm - a1.xMm) * (b2.yMm - b1.yMm) - (b1.yMm - a1.yMm) * (b2.xMm - b1.xMm)) / den;
  const ub = ((b1.xMm - a1.xMm) * (a2.yMm - a1.yMm) - (b1.yMm - a1.yMm) * (a2.xMm - a1.xMm)) / den;
  return ua > 1e-9 && ua < 1 - 1e-9 && ub > 1e-9 && ub < 1 - 1e-9;
}

export function assertValidPolygon(vertices: readonly RcPointMm[], label: string): RcPointMm[] {
  const ring = closedRing(vertices);
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    if (!a || !b) failClosed(`${label} degenerate`);
    if (Math.hypot(a.xMm - b.xMm, a.yMm - b.yMm) < RC_NUMERICAL_TOLERANCE.lengthMm) {
      failClosed(`${label} duplicate-degenerate boundary`);
    }
  }
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const a1 = ring[i];
    const a2 = ring[(i + 1) % n];
    if (!a1 || !a2) continue;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(i - j) <= 1 || (i === 0 && j === n - 1)) continue;
      const b1 = ring[j];
      const b2 = ring[(j + 1) % n];
      if (!b1 || !b2) continue;
      if (j === (i + 1) % n || i === (j + 1) % n) continue;
      if (segmentsIntersect(a1, a2, b1, b2)) failClosed(`${label} self-intersecting polygon`);
    }
  }
  return ring;
}

export function polygonMoments(vertices: readonly RcPointMm[], label: string): PolygonMoments {
  const ring = assertValidPolygon(vertices, label);
  let twiceArea = 0;
  let cxAcc = 0;
  let cyAcc = 0;
  let ixxO = 0;
  let iyyO = 0;
  let ixyO = 0;
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const p = ring[i];
    const q = ring[(i + 1) % n];
    if (!p || !q) failClosed(`${label} incomplete`);
    const cross = p.xMm * q.yMm - q.xMm * p.yMm;
    twiceArea += cross;
    cxAcc += (p.xMm + q.xMm) * cross;
    cyAcc += (p.yMm + q.yMm) * cross;
    ixxO += (p.yMm ** 2 + p.yMm * q.yMm + q.yMm ** 2) * cross;
    iyyO += (p.xMm ** 2 + p.xMm * q.xMm + q.xMm ** 2) * cross;
    ixyO += (p.xMm * q.yMm + 2 * p.xMm * p.yMm + 2 * q.xMm * q.yMm + q.xMm * p.yMm) * cross;
  }
  const area = twiceArea / 2;
  if (Math.abs(area) < RC_NUMERICAL_TOLERANCE.lengthMm) failClosed(`${label} zero-area polygon`);
  const winding: "CCW" | "CW" = area > 0 ? "CCW" : "CW";
  const A = area;
  const cx = cxAcc / (6 * A);
  const cy = cyAcc / (6 * A);
  const IxxOrigin = ixxO / 12;
  const IyyOrigin = iyyO / 12;
  const IxyOrigin = ixyO / 24;
  return {
    areaMm2: A,
    cxMm: cx,
    cyMm: cy,
    IxMm4: IxxOrigin - A * cy * cy,
    IyMm4: IyyOrigin - A * cx * cx,
    IxyMm4: IxyOrigin - A * cx * cy,
    winding,
  };
}

export function pointInPolygon(point: RcPointMm, vertices: readonly RcPointMm[]): boolean {
  const ring = assertValidPolygon(vertices, "containment-polygon");
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const pi = ring[i];
    const pj = ring[j];
    if (!pi || !pj) continue;
    const onEdge =
      Math.abs((pi.yMm - pj.yMm) * (point.xMm - pj.xMm) - (pi.xMm - pj.xMm) * (point.yMm - pj.yMm)) < 1e-7 &&
      point.xMm >= Math.min(pi.xMm, pj.xMm) - 1e-9 &&
      point.xMm <= Math.max(pi.xMm, pj.xMm) + 1e-9 &&
      point.yMm >= Math.min(pi.yMm, pj.yMm) - 1e-9 &&
      point.yMm <= Math.max(pi.yMm, pj.yMm) + 1e-9;
    if (onEdge) return true;
    const intersect = pi.yMm > point.yMm !== pj.yMm > point.yMm &&
      point.xMm < ((pj.xMm - pi.xMm) * (point.yMm - pi.yMm)) / (pj.yMm - pi.yMm + 0) + pi.xMm;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function distancePointToSegment(point: RcPointMm, a: RcPointMm, b: RcPointMm): number {
  const dx = b.xMm - a.xMm;
  const dy = b.yMm - a.yMm;
  const len2 = dx * dx + dy * dy;
  if (len2 < RC_NUMERICAL_TOLERANCE.lengthMm) return Math.hypot(point.xMm - a.xMm, point.yMm - a.yMm);
  const t = Math.max(0, Math.min(1, ((point.xMm - a.xMm) * dx + (point.yMm - a.yMm) * dy) / len2));
  return Math.hypot(point.xMm - (a.xMm + t * dx), point.yMm - (a.yMm + t * dy));
}

export function minDistanceToBoundary(point: RcPointMm, vertices: readonly RcPointMm[]): number {
  const ring = assertValidPolygon(vertices, "clearance-polygon");
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    if (!a || !b) continue;
    min = Math.min(min, distancePointToSegment(point, a, b));
  }
  return min;
}

export function polygonsEdgesIntersect(a: readonly RcPointMm[], b: readonly RcPointMm[]): boolean {
  const ra = assertValidPolygon(a, "overlap-a");
  const rb = assertValidPolygon(b, "overlap-b");
  for (let i = 0; i < ra.length; i++) {
    const a1 = ra[i];
    const a2 = ra[(i + 1) % ra.length];
    if (!a1 || !a2) continue;
    for (let j = 0; j < rb.length; j++) {
      const b1 = rb[j];
      const b2 = rb[(j + 1) % rb.length];
      if (!b1 || !b2) continue;
      if (segmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

export function rectangleVertices(origin: RcPointMm, widthMm: number, depthMm: number): RcPointMm[] {
  return [
    { xMm: origin.xMm, yMm: origin.yMm },
    { xMm: origin.xMm + widthMm, yMm: origin.yMm },
    { xMm: origin.xMm + widthMm, yMm: origin.yMm + depthMm },
    { xMm: origin.xMm, yMm: origin.yMm + depthMm },
  ];
}

export function circleNgon(center: RcPointMm, radiusMm: number, segments = 64): RcPointMm[] {
  const verts: RcPointMm[] = [];
  for (let i = 0; i < segments; i++) {
    const t = (2 * Math.PI * i) / segments;
    verts.push({ xMm: center.xMm + radiusMm * Math.cos(t), yMm: center.yMm + radiusMm * Math.sin(t) });
  }
  return verts;
}
