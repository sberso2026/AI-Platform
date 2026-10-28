const CORROSION_CAPACITY_CHECKS = [
  "original member section and dimensions",
  "material grade and properties",
  "remaining wall or section thickness",
  "location and extent of corrosion",
  "pitting versus general section loss",
  "connection condition",
  "base plate and anchor condition where relevant",
  "imposed and permanent loads",
  "load combinations",
  "restraint and support conditions",
  "effective lengths",
  "local and global stability",
  "section-loss mapping",
  "inspection accuracy and uncertainty",
  "deformation or distress evidence",
  "applicable design or check basis",
  "need for a qualified engineering assessment",
];

function asksForCollectionMethod(query: string): boolean {
  return /corrosion|capacity|section loss|pipe rack|what information|collect/i.test(query);
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
  const collection = asksForCollectionMethod(query);
  const categories = collection
    ? CORROSION_CAPACITY_CHECKS
    : [
        "the question being asked and the decision it would support",
        "the object, system, or arrangement being considered",
        "loads, restraints, and operating conditions",
        "material, geometry, and condition information",
        "applicable check basis",
        "uncertainty in inspection or input data",
        "what a qualified engineer still has to verify",
      ];
  const answer = [
    "General engineering methodology only. This is not a project-specific finding and it does not use authorised project evidence.",
    "",
    "Information an engineer would normally collect before assessing remaining structural capacity:",
    ...categories.map((item) => `- ${item}`),
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
  return "Insufficient authorised project evidence to provide a project-specific conclusion. No project facts, standards, revisions, approvals, calculations, or asset history were invented.";
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
