import type { RcFiber, RcSectionDiscretization, RcSectionGeometryInput } from "@rtb/types";
import { RC_NUMERICAL_TOLERANCE, RC_SECTION_MECHANICS_METHOD_VERSION } from "@rtb/types";
import { boundingBox, expandSectionOutlines, pointInValidConcrete } from "./geometry";
import { failClosed } from "./units";

export function discretizeSection(input: RcSectionGeometryInput, resolutionX = 40, resolutionY = 40): RcSectionDiscretization {
  if (!Number.isInteger(resolutionX) || !Number.isInteger(resolutionY) || resolutionX < 1 || resolutionY < 1) {
    failClosed("discretization resolution invalid");
  }
  if (resolutionX > RC_NUMERICAL_TOLERANCE.maxSubdivision || resolutionY > RC_NUMERICAL_TOLERANCE.maxSubdivision) {
    failClosed("discretization exceeds maximum subdivision");
  }
  const { solids, voids } = expandSectionOutlines(input);
  const box = boundingBox(solids);
  const dx = (box.maxX - box.minX) / resolutionX;
  const dy = (box.maxY - box.minY) / resolutionY;
  if (!(dx > 0) || !(dy > 0)) failClosed("zero discretization cell size");
  const fibers: RcFiber[] = [];
  for (let i = 0; i < resolutionX; i++) {
    for (let j = 0; j < resolutionY; j++) {
      const x = box.minX + (i + 0.5) * dx;
      const y = box.minY + (j + 0.5) * dy;
      if (!pointInValidConcrete({ xMm: x, yMm: y }, solids, voids)) continue;
      fibers.push({
        fiberId: `f-${i}-${j}`,
        centroidMm: { xMm: x, yMm: y },
        areaMm2: dx * dy,
        widthMm: dx,
        heightMm: dy,
        regionId: solids[0]?.regionId ?? "region",
      });
    }
  }
  if (!fibers.length) failClosed("discretization produced no concrete cells");
  let area = 0;
  let ax = 0;
  let ay = 0;
  for (const fiber of fibers) {
    area += fiber.areaMm2;
    ax += fiber.areaMm2 * fiber.centroidMm.xMm;
    ay += fiber.areaMm2 * fiber.centroidMm.yMm;
  }
  const cx = ax / area;
  const cy = ay / area;
  let Ix = 0;
  let Iy = 0;
  let Ixy = 0;
  const IcellX = (dx * dy ** 3) / 12;
  const IcellY = (dy * dx ** 3) / 12;
  for (const fiber of fibers) {
    const dxi = fiber.centroidMm.xMm - cx;
    const dyi = fiber.centroidMm.yMm - cy;
    Ix += IcellX + fiber.areaMm2 * dyi * dyi;
    Iy += IcellY + fiber.areaMm2 * dxi * dxi;
    Ixy += fiber.areaMm2 * dxi * dyi;
  }
  return {
    method: "CARTESIAN_CELL",
    resolutionX,
    resolutionY,
    fibers,
    totalAreaMm2: area,
    centroidMm: { xMm: cx, yMm: cy },
    IxMm4: Ix,
    IyMm4: Iy,
    IxyMm4: Ixy,
    algorithmVersion: RC_SECTION_MECHANICS_METHOD_VERSION,
  };
}

export function assertDiscretizationConservation(
  analytic: { areaMm2: number; cxMm: number; cyMm: number; IxMm4: number; IyMm4: number },
  mesh: RcSectionDiscretization,
): { area: "PASS"; centroid: "PASS"; secondMoment: "PASS" } {
  const areaErr = Math.abs(mesh.totalAreaMm2 - analytic.areaMm2) / Math.max(analytic.areaMm2, 1);
  if (areaErr > RC_NUMERICAL_TOLERANCE.areaRelative) failClosed("discretization area conservation failed");
  if (Math.abs(mesh.centroidMm.xMm - analytic.cxMm) > RC_NUMERICAL_TOLERANCE.centroidMm) failClosed("discretization centroid consistency failed");
  if (Math.abs(mesh.centroidMm.yMm - analytic.cyMm) > RC_NUMERICAL_TOLERANCE.centroidMm) failClosed("discretization centroid consistency failed");
  const ixErr = Math.abs(mesh.IxMm4 - analytic.IxMm4) / Math.max(Math.abs(analytic.IxMm4), 1);
  const iyErr = Math.abs(mesh.IyMm4 - analytic.IyMm4) / Math.max(Math.abs(analytic.IyMm4), 1);
  if (ixErr > RC_NUMERICAL_TOLERANCE.secondMomentRelative || iyErr > RC_NUMERICAL_TOLERANCE.secondMomentRelative) {
    failClosed("discretization second-moment validation failed");
  }
  return { area: "PASS", centroid: "PASS", secondMoment: "PASS" };
}
