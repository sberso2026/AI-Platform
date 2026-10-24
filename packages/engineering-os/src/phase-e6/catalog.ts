/**
 * Engineering tool capability catalog + deterministic reference executors.
 * Capability-only entries are UNAVAILABLE — not fake calculators.
 */

import type { EngineeringTool } from "./contracts";

const REG_REF = "platform-intelligence:ai_tools" as const;

function capabilityOnly(partial: {
  toolId: string;
  name: string;
  capability: string;
  discipline?: string;
  toolType: EngineeringTool["toolType"];
}): EngineeringTool {
  return {
    ...partial,
    discipline: partial.discipline ?? null,
    inputSchema: { type: "object", properties: {} },
    outputSchema: { type: "object", properties: {} },
    version: "0.0.0-capability",
    owner: "platform_intelligence",
    platformRegistryRef: REG_REF,
    status: "UNAVAILABLE",
    authorityClass: "ADVISORY",
    permissions: ["engineering_tool.discover"],
    executionMode: "UNAVAILABLE",
    timeoutMs: 0,
    certification: "UNCERTIFIED",
    failurePolicy: "REPORT_UNAVAILABLE",
    capabilityOnly: true,
  };
}

/** Deterministic reference tools (non-safety-critical fixtures). */
export const REFERENCE_ENGINEERING_TOOLS: EngineeringTool[] = [
  {
    toolId: "eos.rectangle_area",
    name: "Rectangle Area Calculator",
    capability: "estimate.geometry.area",
    discipline: "general",
    toolType: "DETERMINISTIC_CALCULATION",
    inputSchema: {
      type: "object",
      required: ["length", "width"],
      properties: {
        length: { type: "number", description: "Length", unitRequired: true },
        width: { type: "number", description: "Width", unitRequired: true },
      },
    },
    outputSchema: {
      type: "object",
      required: ["area"],
      properties: {
        area: { type: "number", description: "Area", unitRequired: true },
      },
    },
    version: "1.0.0-e6",
    owner: "engineering_os_adapter",
    platformRegistryRef: REG_REF,
    status: "AVAILABLE",
    authorityClass: "GOVERNED_CALCULATION",
    permissions: ["engineering_tool.execute", "engineering_tool.discover"],
    executionMode: "IN_PROCESS",
    timeoutMs: 2000,
    certification: "VALIDATED",
    applicableCodes: [],
    evidenceRequirements: [],
    failurePolicy: "FAIL_CLOSED",
  },
  {
    toolId: "eos.document_title_comparator",
    name: "Document Title Comparator",
    capability: "compare.document.title",
    discipline: "document_control",
    toolType: "COMPARATOR",
    inputSchema: {
      type: "object",
      required: ["titleA", "titleB"],
      properties: {
        titleA: { type: "string", description: "First title" },
        titleB: { type: "string", description: "Second title" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        equal: { type: "boolean" },
        normalisedEqual: { type: "boolean" },
      },
    },
    version: "1.0.0-e6",
    owner: "engineering_os_adapter",
    platformRegistryRef: REG_REF,
    status: "AVAILABLE",
    authorityClass: "ADVISORY",
    permissions: ["engineering_tool.execute", "engineering_tool.discover"],
    executionMode: "IN_PROCESS",
    timeoutMs: 2000,
    certification: "VALIDATED",
    failurePolicy: "FAIL_CLOSED",
  },
  {
    toolId: "eos.material_length_estimator",
    name: "Material Length Estimator",
    capability: "estimate.material.length",
    discipline: "materials",
    toolType: "ESTIMATOR",
    inputSchema: {
      type: "object",
      required: ["pieceCount", "pieceLength"],
      properties: {
        pieceCount: { type: "number", description: "Number of pieces" },
        pieceLength: {
          type: "number",
          description: "Length per piece",
          unitRequired: true,
        },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        totalLength: { type: "number", unitRequired: true },
      },
    },
    version: "1.0.0-e6",
    owner: "engineering_os_adapter",
    platformRegistryRef: REG_REF,
    status: "AVAILABLE",
    authorityClass: "ADVISORY",
    permissions: ["engineering_tool.execute", "engineering_tool.discover"],
    executionMode: "IN_PROCESS",
    timeoutMs: 2000,
    certification: "EXPERIMENTAL",
    failurePolicy: "FAIL_CLOSED",
  },
  {
    toolId: "eos.evidence_keyword_check",
    name: "Evidence Keyword Rule Check",
    capability: "check.evidence.keyword",
    discipline: "assurance",
    toolType: "RULE_CHECK",
    inputSchema: {
      type: "object",
      required: ["haystack", "needle"],
      properties: {
        haystack: { type: "string" },
        needle: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      properties: { matched: { type: "boolean" } },
    },
    version: "1.0.0-e6",
    owner: "engineering_os_adapter",
    platformRegistryRef: REG_REF,
    status: "AVAILABLE",
    authorityClass: "ADVISORY",
    permissions: ["engineering_tool.execute", "engineering_tool.discover"],
    executionMode: "IN_PROCESS",
    timeoutMs: 2000,
    certification: "CERTIFIED",
    failurePolicy: "FAIL_CLOSED",
  },
];

/** Architectural capability slots — UNAVAILABLE until real tools exist. */
export const CAPABILITY_ONLY_ENGINEERING_TOOLS: EngineeringTool[] = [
  capabilityOnly({
    toolId: "eos.cap.structural_calculator",
    name: "Structural Calculator",
    capability: "calculate.structural",
    discipline: "structural",
    toolType: "DETERMINISTIC_CALCULATION",
  }),
  capabilityOnly({
    toolId: "eos.cap.pressure_vessel_calculator",
    name: "Pressure Vessel Calculator",
    capability: "calculate.pressure_vessel",
    discipline: "mechanical",
    toolType: "DETERMINISTIC_CALCULATION",
  }),
  capabilityOnly({
    toolId: "eos.cap.concrete_design",
    name: "Concrete Design",
    capability: "calculate.concrete",
    discipline: "structural",
    toolType: "DETERMINISTIC_CALCULATION",
  }),
  capabilityOnly({
    toolId: "eos.cap.material_estimator",
    name: "Material Estimator (enterprise)",
    capability: "estimate.material.enterprise",
    toolType: "ESTIMATOR",
  }),
  capabilityOnly({
    toolId: "eos.cap.drawing_search",
    name: "Drawing Search",
    capability: "search.drawing",
    toolType: "RETRIEVAL",
  }),
  capabilityOnly({
    toolId: "eos.cap.code_standard_search",
    name: "Code/Standard Search",
    capability: "search.code_standard",
    toolType: "RETRIEVAL",
  }),
  capabilityOnly({
    toolId: "eos.cap.document_comparator",
    name: "Document Comparator (full)",
    capability: "compare.document.full",
    toolType: "COMPARATOR",
  }),
  capabilityOnly({
    toolId: "eos.cap.inspection_planner",
    name: "Inspection Planner",
    capability: "plan.inspection",
    toolType: "QUERY",
  }),
  capabilityOnly({
    toolId: "eos.cap.schedule_risk",
    name: "Schedule Risk",
    capability: "analyse.schedule_risk",
    toolType: "ANALYTICAL_MODEL",
  }),
  capabilityOnly({
    toolId: "eos.cap.cost_forecast",
    name: "Cost Forecast",
    capability: "forecast.cost",
    toolType: "ANALYTICAL_MODEL",
  }),
  capabilityOnly({
    toolId: "eos.cap.shm_analysis",
    name: "SHM Analysis",
    capability: "analyse.shm",
    toolType: "ANALYTICAL_MODEL",
  }),
  capabilityOnly({
    toolId: "eos.cap.project_risk",
    name: "Project Risk",
    capability: "analyse.project_risk",
    toolType: "ANALYTICAL_MODEL",
  }),
  capabilityOnly({
    toolId: "eos.cap.digital_twin_query",
    name: "Digital Twin Query",
    capability: "query.digital_twin",
    toolType: "QUERY",
  }),
  capabilityOnly({
    toolId: "eos.cap.fea_query",
    name: "FEA Query",
    capability: "query.fea",
    toolType: "QUERY",
  }),
  capabilityOnly({
    toolId: "eos.cap.ndt_advisor",
    name: "NDT Advisor",
    capability: "advise.ndt",
    toolType: "AI_ML_MODEL",
  }),
  capabilityOnly({
    toolId: "eos.cap.specification_checker",
    name: "Specification Checker",
    capability: "check.specification",
    toolType: "RULE_CHECK",
  }),
];

export function getDefaultEngineeringToolCatalog(): EngineeringTool[] {
  return [...REFERENCE_ENGINEERING_TOOLS, ...CAPABILITY_ONLY_ENGINEERING_TOOLS];
}

export type ToolExecutor = (input: {
  inputs: Record<string, unknown>;
  units?: Record<string, string>;
}) => Promise<{
  output: Record<string, unknown>;
  outputKind: "CALCULATED" | "CHECKED" | "ESTIMATED" | "PREDICTED" | "RETRIEVED";
  assumptions?: string[];
  warnings?: string[];
}>;

export const REFERENCE_TOOL_EXECUTORS: Record<string, ToolExecutor> = {
  "eos.rectangle_area": async ({ inputs, units }) => {
    const length = Number(inputs.length);
    const width = Number(inputs.width);
    const lengthUnit = units?.length;
    const widthUnit = units?.width;
    if (lengthUnit !== widthUnit) {
      throw new Error("unit_mismatch:length_width");
    }
    return {
      output: { area: length * width, unit: `${lengthUnit}²` },
      outputKind: "CALCULATED",
      assumptions: ["Rectangle area = length × width; planar geometry assumed."],
    };
  },
  "eos.document_title_comparator": async ({ inputs }) => {
    const a = String(inputs.titleA ?? "");
    const b = String(inputs.titleB ?? "");
    const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
    return {
      output: {
        equal: a === b,
        normalisedEqual: norm(a) === norm(b),
      },
      outputKind: "CHECKED",
    };
  },
  "eos.material_length_estimator": async ({ inputs, units }) => {
    const count = Number(inputs.pieceCount);
    const pieceLength = Number(inputs.pieceLength);
    const u = units?.pieceLength;
    return {
      output: { totalLength: count * pieceLength, unit: u },
      outputKind: "ESTIMATED",
      assumptions: ["Total length = pieceCount × pieceLength; no waste factor applied."],
      warnings: ["EXPERIMENTAL estimator — advisory only."],
    };
  },
  "eos.evidence_keyword_check": async ({ inputs }) => {
    const haystack = String(inputs.haystack ?? "").toLowerCase();
    const needle = String(inputs.needle ?? "").toLowerCase();
    return {
      output: { matched: needle.length > 0 && haystack.includes(needle) },
      outputKind: "CHECKED",
    };
  },
};
