import type {
  SteelAdapterId,
  SteelCapacityEngineInput,
  SteelCapacityEngineOutput,
  SteelSourceAuthorityRecord,
  StructuralStandardContext,
} from "@rtb/types";
import {
  AU_ONLY_STEEL_CORE,
  EU_ONLY_STEEL_CORE,
  US_ONLY_STEEL_CORE,
  UNSOURCED_CODE_FORMULA_ALLOWED,
} from "@rtb/types";
import { assertGovernedStandardContext, nationalAnnexRequired } from "../structural-domain/binding";
import { evaluateAuSteelBending } from "./au-bending/evaluate";
import { evaluateAuSteelCombinedAction } from "./au-combined/evaluate";
import { evaluateAuSteelCompression } from "./au-compression/evaluate";
import { evaluateAuSteelShear } from "./au-shear/evaluate";
import { evaluateAuSteelTension } from "./au-tension/evaluate";
import { evaluateEuSteelTension } from "./eu-tension/evaluate";
import { requireMaterialProperties, requireSectionProperties, requireStabilityWhenNeeded } from "./properties";

const ADAPTER_SCOPES: Record<SteelAdapterId, { jurisdictions: string[]; standardPrefixes: string[]; editions: string[] }> = {
  AU_STEEL: { jurisdictions: ["australia"], standardPrefixes: ["AS 4100"], editions: [] },
  EU_STEEL: { jurisdictions: ["eu-eea", "united-kingdom", "other"], standardPrefixes: ["EN 1993"], editions: [] },
  US_STEEL: { jurisdictions: ["united-states"], standardPrefixes: ["AISC 360"], editions: [] },
};

export function selectSteelAdapter(adapterId: SteelAdapterId, context: StructuralStandardContext): void {
  if (AU_ONLY_STEEL_CORE || EU_ONLY_STEEL_CORE || US_ONLY_STEEL_CORE) {
    throw new Error("steel core must remain global; jurisdiction logic belongs in adapters");
  }
  assertGovernedStandardContext(context);
  const scope = ADAPTER_SCOPES[adapterId];
  if (!scope) throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (!scope.jurisdictions.includes(context.jurisdictionProfileRef)) {
    throw new Error("steel design fail closed: unsupported jurisdiction");
  }
  if (!scope.standardPrefixes.some((prefix) => context.standardCode.startsWith(prefix))) {
    throw new Error("steel design fail closed: unsupported standard for adapter");
  }
  if (!context.edition?.trim()) throw new Error("steel design fail closed: unsupported edition");
  if (scope.editions.length > 0 && !scope.editions.includes(context.edition)) {
    throw new Error("steel design fail closed: unsupported edition");
  }
  if (nationalAnnexRequired(context) && !context.nationalAnnexRef) {
    throw new Error("steel design fail closed: invalid annex");
  }
}

export function assertImplementedSteelEdition(adapterId: SteelAdapterId, edition: string): void {
  const scope = ADAPTER_SCOPES[adapterId];
  if (!edition?.trim() || !scope || scope.editions.length === 0 || !scope.editions.includes(edition)) {
    throw new Error("steel design fail closed: unsupported edition");
  }
}

export function evaluateSteelCapacity(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  if (UNSOURCED_CODE_FORMULA_ALLOWED) throw new Error("unsourced code formulas are forbidden");
  if (input.demand.capacityPresent) throw new Error("D1C demand must not contain capacity");
  selectSteelAdapter(input.adapterId, input.standardContext);
  if (input.designContext.standardContextRef !== input.standardContext.contextId) {
    throw new Error("steel design fail closed: standard context is ambiguous");
  }
  if (input.demand.memberId !== input.designContext.memberRef) {
    throw new Error("steel design fail closed: demand member does not match design context");
  }
  requireMaterialProperties(input.material, input.requiredProperties.filter((name) => name.startsWith("material.")).map((name) => name.slice("material.".length)));
  requireSectionProperties(input.section, input.requiredProperties.filter((name) => name.startsWith("section.")).map((name) => name.slice("section.".length)));
  requireStabilityWhenNeeded(input.limitState, input.stability);
  if (input.adapterId === "AU_STEEL") {
    if (input.limitState === "TENSION") return evaluateAuSteelTension(input);
    if (input.limitState === "COMPRESSION" || input.limitState === "MEMBER_STABILITY") {
      return evaluateAuSteelCompression(input);
    }
    if (input.limitState === "BENDING_MAJOR" || input.limitState === "BENDING_MINOR") {
      return evaluateAuSteelBending(input);
    }
    if (input.limitState === "SHEAR" || input.limitState === "SHEAR_MAJOR" || input.limitState === "SHEAR_MINOR") {
      return evaluateAuSteelShear(input);
    }
    if (input.limitState === "COMBINED_ACTION") return evaluateAuSteelCombinedAction(input);
    throw new Error("steel design fail closed: unsupported calculation scope");
  }
  if (input.adapterId === "EU_STEEL" && input.limitState === "TENSION") {
    return evaluateEuSteelTension(input);
  }
  const authority: SteelSourceAuthorityRecord = {
    authorityType: "LICENSED_STANDARD",
    identifier: input.standardContext.standardCode,
    clauseRef: null,
    edition: input.standardContext.edition,
    licensedMetadataOnly: true,
  };
  return {
    adapterId: input.adapterId,
    maturity: "FRAMEWORK_ONLY",
    implemented: false,
    capacity: null,
    reason: `${input.adapterId} is FRAMEWORK_ONLY in D1D-0. No ${input.standardContext.standardCode} resistance equations are implemented.`,
    sourceAuthority: authority,
  };
}

export const STEEL_ADAPTER_BOUNDARIES = {
  AU_STEEL: { ready: true, implemented: true, scope: "TENSION,COMPRESSION,BENDING,SHEAR,COMBINED_ACTION", standards: ["AS 4100"], loadContext: ["AS/NZS 1170"] },
  EU_STEEL: { ready: true, implemented: false, standards: ["EN 1993"], loadContext: ["EN 1990", "EN 1991"], nationalAnnex: true },
  US_STEEL: { ready: true, implemented: false, standards: ["AISC 360"], loadContext: ["ASCE 7"] },
} as const;
