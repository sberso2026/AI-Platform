const CORROSION_CAPACITY_CHECKS = [
  "original section designation and dimensions",
  "member geometry",
  "material grade and properties",
  "corrosion location, length, and extent",
  "remaining thickness",
  "generalized section loss and section-property reduction",
  "localized pitting",
  "corrosion around base plates, welds, or interfaces",
  "connection condition",
  "base plate condition",
  "anchor condition where applicable",
  "member deformation",
  "original and current loading",
  "load combinations",
  "support and restraint conditions",
  "effective member length",
  "local buckling considerations",
  "global member stability",
  "inspection measurement uncertainty",
  "inaccessible surfaces",
  "historical inspection information",
  "environmental exposure",
  "applicable design or assessment basis",
  "qualified engineering review",
];

const MECHANICAL_CHECKS = [
  "equipment identity and nameplate data",
  "operating speed, load, and duty",
  "alignment, clearance, and vibration",
  "lubrication and seal condition",
  "fastener and support condition",
  "inspection access and measurement uncertainty",
  "applicable assessment basis and qualified engineering review",
];

const PIPING_CHECKS = [
  "line identification, service, and material",
  "design and operating pressure and temperature",
  "wall thickness and corrosion allowance",
  "support, flexibility, and restraint conditions",
  "corrosion or damage location and extent",
  "inspection access and measurement uncertainty",
  "applicable piping check basis and qualified engineering review",
];

const ELECTRICAL_CHECKS = [
  "system voltage and supply arrangement",
  "load, protection, and fault level",
  "conductor, insulation, and termination condition",
  "earthing and bonding",
  "environmental or hazardous-area exposure",
  "inspection access and measurement uncertainty",
  "applicable electrical check basis and qualified engineering review",
];

const CIVIL_CHECKS = [
  "ground and groundwater conditions",
  "geometry, levels, and support arrangement",
  "permanent and imposed loads",
  "settlement, movement, or distress evidence",
  "material and construction records",
  "inspection access and measurement uncertainty",
  "applicable civil or geotechnical check basis and qualified engineering review",
];

const PROCESS_CHECKS = [
  "fluid service and composition",
  "operating and design pressure and temperature",
  "flow, level, and relief arrangement",
  "materials of construction and degradation",
  "operating history and upset conditions",
  "measurement uncertainty",
  "applicable process check basis and qualified engineering review",
];

function isApprovalRequest(query: string): boolean {
  return /\b(approve|approval|certif|sign-off|sign off)\b/i.test(query)
    || /\bconfirm\b[\s\S]{0,80}\b(safe|adequate|compliant)\b/i.test(query)
    || /\b(is|are) safe\b/i.test(query)
    || /\brepair is unnecessary\b/i.test(query);
}

function isCalculationRequest(query: string): boolean {
  return /\b(calculat|compute|determine the (capacity|stress|utilisation|utilization))\b/i.test(query)
    && !/\b(what information|collect|should an engineer)\b/i.test(query);
}

function methodologyCategories(query: string): { heading: string; items: string[] } {
  if (/corrosion|pipe rack|section loss|structural capacity|column base/i.test(query)) {
    return {
      heading: "Information an engineer would normally collect before assessing remaining structural capacity:",
      items: CORROSION_CAPACITY_CHECKS,
    };
  }
  if (/piping|pipeline|pipe wall/i.test(query)) {
    return { heading: "Information normally collected for general piping engineering:", items: PIPING_CHECKS };
  }
  if (/electrical|earthing|switchgear|cable/i.test(query)) {
    return { heading: "Information normally collected for general electrical engineering:", items: ELECTRICAL_CHECKS };
  }
  if (/geotech|foundation|settlement|civil/i.test(query)) {
    return { heading: "Information normally collected for general civil or geotechnical engineering:", items: CIVIL_CHECKS };
  }
  if (/process|relief|fluid service/i.test(query)) {
    return { heading: "Information normally collected for general process engineering:", items: PROCESS_CHECKS };
  }
  if (/mechanical|vibration|alignment|rotating/i.test(query)) {
    return { heading: "Information normally collected for a general mechanical inspection:", items: MECHANICAL_CHECKS };
  }
  return {
    heading: "Information normally collected before a general engineering assessment:",
    items: [
      "the decision the question would support",
      "geometry, materials, and condition",
      "loads, restraints, and operating conditions",
      "inspection access and measurement uncertainty",
      "the applicable check basis",
      "what a qualified engineer still has to verify",
    ],
  };
}

/**
 * General methodology for All Engineering. It does not use project records
 * and it does not conclude that any structure is adequate.
 */
export function generalEngineeringMethodology(query: string): {
  finding: string;
  answer: string;
  limitations: string[];
} {
  if (isApprovalRequest(query)) {
    return {
      finding: "Engineering approval was not given.",
      answer: [
        "All Engineering cannot approve, certify, or confirm that a member or repair is adequate.",
        "",
        "This answer does not state that a structure is safe, that corrosion is acceptable, or that a repair is unnecessary.",
        "A qualified engineer would still need authorised project evidence for geometry, condition, loads, supports, and the applicable check basis.",
        "No project facts were used. No calculation was performed. No professional approval or certification was issued.",
      ].join("\n"),
      limitations: [
        "Searched scope: all_engineering.",
        "General engineering guidance, not authorised project evidence.",
        "No calculation, approval, or certification was performed.",
      ],
    };
  }
  if (isCalculationRequest(query)) {
    return {
      finding: "No engineering calculation was performed.",
      answer: [
        "All Engineering does not calculate project capacity or stress from a general question.",
        "",
        "A qualified engineer would need authorised geometry, material, condition, load, and support evidence before any calculation.",
        "No numeric result was produced. No project facts were used. This is not an approval or certification.",
      ].join("\n"),
      limitations: [
        "Searched scope: all_engineering.",
        "General engineering guidance, not authorised project evidence.",
        "No calculation, approval, or certification was performed.",
      ],
    };
  }
  const categories = methodologyCategories(query);
  const answer = [
    "General engineering guidance, not authorised project evidence. This is not a project-specific finding.",
    "",
    categories.heading,
    ...categories.items.map((item) => `- ${item}`),
    "",
    "Keep these categories distinct:",
    "- General methodology: the checklist above.",
    "- Project-specific facts: none are stated here.",
    "- Assumptions: none of the checklist items may be assumed from this answer.",
    "- Calculations: none were performed.",
    "- Approval and certification: this answer does not approve, certify, or establish adequacy.",
    "",
    "A qualified engineer must apply authorised project evidence before any project conclusion. This answer does not establish that a structure is safe, adequate, compliant, or approved.",
  ].join("\n");
  return {
    finding: "General engineering methodology, not a project conclusion.",
    answer,
    limitations: [
      "Searched scope: all_engineering.",
      "General methodology is not authorised project evidence.",
      "No calculation, approval, or certification was performed.",
    ],
  };
}

export function projectEvidenceAbstention(): string {
  return "Insufficient authorised project evidence is available to provide a project-specific conclusion. No project facts, standards, revisions, approvals, calculations, or asset history were invented.";
}

export function prepareEngineeringAskScope(input: {
  scope?: string | null;
  projectId?: string | null;
  assetId?: string | null;
  documentId?: string | null;
  objectType?: string | null;
  objectId?: string | null;
}):
  | { ok: false; scope: string; message: string }
  | {
      ok: true;
      publicScope: string;
      retrievalScope: "workspace" | "project" | "asset" | "document" | "object";
      projectId?: string;
      objectType: string | null;
      objectId: string | null;
    } {
  const requested = input.scope ?? "";
  if (!requested) {
    const objectType =
      input.objectType ??
      (input.documentId ? "document" : input.assetId ? "asset" : input.projectId ? "project" : null);
    const objectId = input.objectId ?? input.documentId ?? input.assetId ?? null;
    const retrievalScope = input.documentId
      ? "document"
      : input.assetId
        ? "asset"
        : input.projectId
          ? "project"
          : "workspace";
    return {
      ok: true,
      publicScope: retrievalScope === "workspace" ? "all_engineering" : retrievalScope,
      retrievalScope,
      projectId: input.projectId ?? undefined,
      objectType,
      objectId,
    };
  }
  if (requested === "all_engineering" || requested === "workspace") {
    return {
      ok: true,
      publicScope: "all_engineering",
      retrievalScope: "workspace",
      objectType: null,
      objectId: null,
    };
  }
  if (requested === "project" && !input.projectId) {
    return { ok: false, scope: "project", message: missingAskContextMessage("project") };
  }
  if (requested === "asset" && !input.assetId && !(input.objectType === "asset" && input.objectId)) {
    return { ok: false, scope: "asset", message: missingAskContextMessage("asset") };
  }
  if (requested === "document" && !input.documentId && !(input.objectType === "document" && input.objectId)) {
    return { ok: false, scope: "document", message: missingAskContextMessage("document") };
  }
  const retrievalScope = (requested === "project" || requested === "asset" || requested === "document" || requested === "object"
    ? requested
    : "workspace") as "workspace" | "project" | "asset" | "document" | "object";
  const objectType =
    input.objectType ??
    (input.documentId ? "document" : input.assetId ? "asset" : input.projectId ? "project" : null);
  const objectId = input.objectId ?? input.documentId ?? input.assetId ?? null;
  return {
    ok: true,
    publicScope: retrievalScope,
    retrievalScope,
    projectId: retrievalScope === "workspace" ? undefined : input.projectId ?? undefined,
    objectType,
    objectId,
  };
}

export function missingAskContextMessage(scope: "project" | "asset" | "document"): string {
  if (scope === "project") {
    return "No project is selected. Current Project stays in project-evidence mode and needs a selected project. The scope was not changed to All Engineering.";
  }
  if (scope === "asset") {
    return "No asset or object is selected. Current Asset/Object stays in asset-evidence mode and needs a selected asset or object. The scope was not changed.";
  }
  return "No document is selected. Current Document stays in document-evidence mode and needs a selected document. The scope was not changed.";
}
