/**
 * Pack-aware mobile form descriptors — packs declare presentation only, never executable code.
 */
import type { InspectionPackSdkManifest } from "../pack-sdk";

export type InspectionPackMobileFormDescriptor = {
  packId: string;
  checklistPresentation: "list" | "stepper" | "cards";
  measurementInputType: "numeric" | "select" | "dft" | "text";
  evidenceRequirements: readonly string[];
  allowedAnnotations: readonly string[];
  fieldValidation: readonly string[];
  acceptanceCriteriaDisplay: boolean;
  mobileHelp: string;
  reportLabels: readonly string[];
  /** Packs must never inject executable code. */
  executableCodeForbidden: true;
};

export function toPackMobileFormDescriptor(
  pack: InspectionPackSdkManifest,
): InspectionPackMobileFormDescriptor {
  return {
    packId: pack.packId,
    checklistPresentation: "stepper",
    measurementInputType: pack.measurementLibrary.includes("dft_micron") ? "dft" : "numeric",
    evidenceRequirements: pack.evidenceTypes,
    allowedAnnotations: ["arrow", "rectangle", "severity_marker", "text_callout"],
    fieldValidation: ["required_when_photo_required", "numeric_range"],
    acceptanceCriteriaDisplay: true,
    mobileHelp: `${pack.displayName} mobile guidance`,
    reportLabels: pack.reportTemplates,
    executableCodeForbidden: true,
  };
}
