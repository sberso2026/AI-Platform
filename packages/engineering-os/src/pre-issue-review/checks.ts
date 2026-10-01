import { randomUUID } from "node:crypto";
import type { GeneratedEngineeringArtifact } from "../artifact-automation/types";
import type { EngineeringWorkPlan } from "../work-generator/types";
import { xmlHasHeading, type TransientOfficeInspection } from "./inspect";
import {
  type PreIssueAction,
  type PreIssueCheckType,
  type PreIssueCondition,
  type PreIssueConditionCode,
  type PreIssueEvidence,
  type PreIssueMateriality,
} from "./types";

function condition(input: {
  id: string;
  checkType: PreIssueCondition["checkType"];
  code: PreIssueConditionCode;
  title: string;
  explanation: string;
  materiality: PreIssueMateriality;
  category: PreIssueCondition["category"];
  evidence: PreIssueEvidence[];
  actions: PreIssueAction[];
  origin?: PreIssueCondition["origin"];
}): PreIssueCondition {
  return {
    ...input,
    findingId: input.id,
    origin: input.origin ?? "DETERMINISTIC",
    status: "candidate",
    engineeringVerdict: null,
  };
}

function normalizeFormula(value: string) {
  return value.trim().replace(/^=/, "").replace(/\s+/g, "").toUpperCase();
}

function registerText(inspection: TransientOfficeInspection | null) {
  if (!inspection) return "";
  return `${inspection.sheetTexts.References ?? ""}\n${inspection.sheetTexts["EOS Context"] ?? ""}\n${inspection.xmlSnippet}\n${inspection.slideText}`;
}

export type DeterministicCheckOutput = {
  conditions: PreIssueCondition[];
  passedChecks: Array<{ checkType: PreIssueCheckType; title: string }>;
  notEvaluated: Array<{ checkType: PreIssueCheckType; reason: string }>;
};

export function runDeterministicPreIssueChecks(input: {
  plan: EngineeringWorkPlan;
  target: GeneratedEngineeringArtifact;
  artifacts: GeneratedEngineeringArtifact[];
  inspection: TransientOfficeInspection | null;
  extractionSkipped: string | null;
}): DeterministicCheckOutput {
  const conditions: PreIssueCondition[] = [];
  const passedChecks: Array<{ checkType: PreIssueCheckType; title: string }> = [];
  const notEvaluated: Array<{ checkType: PreIssueCheckType; reason: string }> = [];
  const { plan, target, artifacts, inspection } = input;
  const extracted = registerText(inspection);
  const nextId = () => randomUUID();

  const pass = (checkType: PreIssueCheckType, title: string) => {
    passedChecks.push({ checkType, title });
  };

  if (target.provenance?.projectId === plan.projectId && target.sha256) {
    pass("ARTIFACT_PROVENANCE_CHECK", "Artifact provenance present");
  } else {
    conditions.push(condition({
      id: nextId(),
      checkType: "ARTIFACT_PROVENANCE_CHECK",
      code: "ARTIFACT_PROVENANCE_MISSING",
      title: "Artifact provenance missing or project mismatch",
      explanation: "Returned/generated artifact must carry governed provenance for the Work Plan project. No engineering correctness verdict.",
      materiality: "REQUIRES_ATTENTION",
      category: "missing_engineering_evidence",
      evidence: [{ artifactId: target.id, statement: `projectId=${target.projectId}; hash=${target.sha256}` }],
      actions: [{ code: "OPEN_ARTIFACT", label: "Open Affected Artifact", objectId: target.id, href: `/engineering/work/plans/${plan.id}` }],
    }));
  }

  if (target.provenance.inputFingerprint === plan.inputFingerprint) {
    pass("WORK_PLAN_FINGERPRINT_CHECK", "Work Plan fingerprint matches review target");
  } else {
    conditions.push(condition({
      id: nextId(),
      checkType: "WORK_PLAN_FINGERPRINT_CHECK",
      code: "WORK_PLAN_FINGERPRINT_CHANGED",
      title: "Work Plan context changed since this artifact was produced",
      explanation: `Artifact fingerprint ${target.provenance.inputFingerprint} differs from current Work Plan fingerprint ${plan.inputFingerprint}. Historical review stays immutable; rerun may be required.`,
      materiality: "STALE_CONTEXT",
      category: "revision_inconsistency",
      evidence: [
        { artifactId: target.id, statement: `Artifact fingerprint: ${target.provenance.inputFingerprint}` },
        { sourceId: plan.id, statement: `Current Work Plan fingerprint: ${plan.inputFingerprint}` },
      ],
      actions: [
        { code: "REFRESH_WORK_CONTEXT", label: "Refresh Work Context", href: `/engineering/work/plans/${plan.id}` },
        { code: "RERUN_REVIEW", label: "Rerun Review" },
      ],
    }));
  }

  const authoritative = plan.context.information.filter((row) => row.authorityOutcome === "AUTHORITATIVE_FOR_PURPOSE" || row.freshness === "CURRENT");
  let staleSource = false;
  for (const cited of target.provenance.information) {
    const current = authoritative.find((row) => row.title === cited.title)
      ?? plan.context.information.find((row) => row.title === cited.title);
    if (!current || !cited.revision || !current.revision) continue;
    if (cited.revision !== current.revision) {
      staleSource = true;
      const code = current.authorityOutcome === "SUPERSEDED" || current.freshness === "STALE" ? "SOURCE_SUPERSEDED" : "STALE_SOURCE_REFERENCE";
      conditions.push(condition({
        id: nextId(),
        checkType: "CURRENT_INFORMATION_CHECK",
        code,
        title: `Calculation/report uses superseded ${cited.title} Rev ${cited.revision}`,
        explanation: `Artifact references ${cited.title} Rev ${cited.revision}. Current authoritative source is Rev ${current.revision}. This does not conclude the engineering result is technically incorrect.`,
        materiality: "STALE_CONTEXT",
        category: "revision_inconsistency",
        evidence: [
          { artifactId: target.id, location: "Source register / provenance", statement: `${cited.title} Rev ${cited.revision}` },
          { sourceId: current.sourceObjectId ?? current.title, statement: `A10A authoritative source: ${current.title} Rev ${current.revision} (${current.authorityOutcome ?? current.freshness})` },
        ],
        actions: [
          { code: "OPEN_GOVERNING_SOURCE", label: "Open Governing Source", objectId: current.sourceObjectId ?? current.title, href: "/engineering/information" },
          { code: "OPEN_ARTIFACT", label: "Open Affected Artifact", objectId: target.id },
        ],
      }));
    }
  }
  if (!staleSource) pass("CURRENT_INFORMATION_CHECK", "Cited sources match current A10A authority");
  if (!staleSource) pass("REVISION_AUTHORITY_CHECK", "No superseded source citations detected");
  if (!staleSource) pass("SOURCE_SUPERSESSION_CHECK", "No superseded governing sources cited");

  const sourceBlob = `${extracted}\n${target.provenance.information.map((row) => row.title).join("\n")}`;
  for (const gap of plan.context.gaps) {
    const represented = sourceBlob.toLowerCase().includes(gap.title.toLowerCase());
    if (gap.kind === "missing" || !represented) {
      conditions.push(condition({
        id: nextId(),
        checkType: "INFORMATION_REQUIREMENT_CHECK",
        code: "REQUIRED_INFORMATION_EVIDENCE_MISSING",
        title: `${gap.title} required by the Work Plan is not linked to returned evidence`,
        explanation: `A10C information requirement remains ${gap.kind}. Artifact/source register does not represent required evidence. Not a second readiness engine.`,
        materiality: "INFORMATION_GAP",
        category: "missing_engineering_evidence",
        evidence: [
          { artifactId: target.id, location: "Source register", statement: represented ? `Title mentioned without accepted evidence` : `no ${gap.title} source` },
          { sourceId: gap.title, statement: `A10C requirement: ${gap.title} (${gap.kind})` },
        ],
        actions: [
          { code: "REQUEST_INFORMATION", label: "Request Information", href: "/engineering/information-requirements" },
          { code: "OPEN_ARTIFACT", label: "Open Affected Artifact", objectId: target.id },
        ],
      }));
    } else if (gap.kind === "stale") {
      conditions.push(condition({
        id: nextId(),
        checkType: "INFORMATION_REQUIREMENT_CHECK",
        code: "REQUIRED_INFORMATION_STALE",
        title: `Required input ${gap.title} is stale`,
        explanation: "A10C required input is stale. Review does not invent a replacement value.",
        materiality: "STALE_CONTEXT",
        category: "missing_information",
        evidence: [{ sourceId: gap.title, statement: `A10C stale: ${gap.title}` }],
        actions: [{ code: "REFRESH_WORK_CONTEXT", label: "Refresh Work Context" }],
      }));
    } else if (gap.kind === "unaccepted") {
      conditions.push(condition({
        id: nextId(),
        checkType: "INFORMATION_REQUIREMENT_CHECK",
        code: "REQUIRED_INFORMATION_UNACCEPTED",
        title: `Required input ${gap.title} received but unaccepted`,
        explanation: "A10C required information is not accepted for purpose.",
        materiality: "INFORMATION_GAP",
        category: "missing_information",
        evidence: [{ sourceId: gap.title, statement: `A10C unaccepted: ${gap.title}` }],
        actions: [{ code: "OPEN_GOVERNING_SOURCE", label: "Open Governing Source", href: "/engineering/information" }],
      }));
    }
  }
  if (!plan.context.gaps.length) pass("INFORMATION_REQUIREMENT_CHECK", "No outstanding A10C information gaps");

  for (const requirement of plan.context.requirements) {
    const traced = target.provenance.requirements.includes(requirement.objectId)
      || target.provenance.requirements.includes(requirement.title)
      || extracted.includes(requirement.title)
      || extracted.includes(requirement.objectId);
    if (!traced) {
      conditions.push(condition({
        id: nextId(),
        checkType: "REQUIREMENT_TRACEABILITY_CHECK",
        code: "REQUIREMENT_TRACEABILITY_INCOMPLETE",
        title: `Requirement ${requirement.title} is not traced in review evidence`,
        explanation: "A link would not prove the Requirement is technically satisfied. Trace/evidence is missing where policy requires it.",
        materiality: "TRACEABILITY_GAP",
        category: "requirement_traceability_gap",
        evidence: [
          { sourceId: requirement.objectId, statement: `Work Plan Requirement: ${requirement.title}` },
          { artifactId: target.id, statement: "Requirement id/title not present in artifact provenance or extracted register" },
        ],
        actions: [{ code: "OPEN_REQUIREMENT", label: "Open Requirement", objectId: requirement.objectId, href: "/engineering/requirements" }],
      }));
    }
  }
  if (plan.context.requirements.length && !conditions.some((row) => row.code === "REQUIREMENT_TRACEABILITY_INCOMPLETE")) {
    pass("REQUIREMENT_TRACEABILITY_CHECK", "Requirement traceability present");
  } else if (!plan.context.requirements.length) {
    pass("REQUIREMENT_TRACEABILITY_CHECK", "No Work Plan Requirements to trace");
  }

  for (const assumption of plan.context.assumptions) {
    const supported = extracted.toLowerCase().includes(assumption.title.toLowerCase())
      && !assumption.stale
      && !/unsupported|pending|without evidence/i.test(assumption.whyIncluded);
    if (assumption.stale || /unsupported|pending|without evidence|invalidated|expired/i.test(assumption.whyIncluded) || !supported) {
      conditions.push(condition({
        id: nextId(),
        checkType: "ASSUMPTION_EVIDENCE_CHECK",
        code: "UNSUPPORTED_ASSUMPTION",
        title: `Assumption ${assumption.title} lacks required evidence`,
        explanation: "Active/unsupported/expired assumption identified. EOS does not autonomously resolve assumptions.",
        materiality: "REVIEW_CANDIDATE",
        category: "unsupported_assumption",
        evidence: [
          { sourceId: assumption.objectId, statement: `${assumption.title} — ${assumption.whyIncluded}` },
          { artifactId: target.id, statement: supported ? "Mentioned without supporting evidence" : "Assumption not evidenced in artifact" },
        ],
        actions: [{ code: "OPEN_ASSUMPTION", label: "Open Assumption", objectId: assumption.objectId, href: "/engineering/assumptions" }],
      }));
    }
  }
  if (!plan.context.assumptions.length) pass("ASSUMPTION_EVIDENCE_CHECK", "No active Work Plan assumptions requiring evidence");
  else if (!conditions.some((row) => row.code === "UNSUPPORTED_ASSUMPTION")) pass("ASSUMPTION_EVIDENCE_CHECK", "Assumptions have referenced evidence");

  for (const iface of plan.context.interfaces) {
    if (iface.stale || /open|unaccepted|changed/i.test(iface.whyIncluded)) {
      conditions.push(condition({
        id: nextId(),
        checkType: "INTERFACE_STATUS_CHECK",
        code: iface.stale ? "UNACCEPTED_INTERFACE_INFORMATION" : "OPEN_REQUIRED_INTERFACE",
        title: `Interface ${iface.title} is open or unaccepted`,
        explanation: "Interface agreement is not inferred. Review reports Interface status from canonical records only.",
        materiality: "REQUIRES_ATTENTION",
        category: "missing_information",
        evidence: [{ sourceId: iface.objectId, statement: `${iface.title} — ${iface.whyIncluded}` }],
        actions: [{ code: "OPEN_INTERFACE", label: "Open Interface", objectId: iface.objectId, href: "/engineering/interfaces" }],
      }));
    }
  }
  if (!conditions.some((row) => row.checkType === "INTERFACE_STATUS_CHECK")) {
    pass("INTERFACE_STATUS_CHECK", plan.context.interfaces.length ? "Required interfaces are recorded" : "No required interfaces on this Work Plan");
  }

  for (const analysis of plan.context.analyses) {
    if (analysis.stale || /stale|superseded/i.test(analysis.whyIncluded)) {
      conditions.push(condition({
        id: nextId(),
        checkType: "ANALYSIS_STALENESS_CHECK",
        code: "STALE_ANALYSIS_REFERENCE",
        title: `Analysis Result ${analysis.title} is stale`,
        explanation: "Referenced Analysis Result is stale. SPACE GASS remains unexecuted. No numerical re-solve.",
        materiality: "STALE_CONTEXT",
        category: "revision_inconsistency",
        evidence: [
          { sourceId: analysis.objectId, statement: `Analysis ${analysis.title} (${analysis.objectType})` },
          { artifactId: target.id, statement: `Artifact provenance analyses: ${target.provenance.analyses.join(", ") || "none"}` },
        ],
        actions: [{ code: "OPEN_ANALYSIS", label: "Open Analysis", objectId: analysis.objectId, href: "/engineering/analysis" }],
      }));
    }
  }
  if (plan.context.analyses.length && !conditions.some((row) => row.code === "STALE_ANALYSIS_REFERENCE")) {
    pass("ANALYSIS_STALENESS_CHECK", "Current analysis result linked");
  } else if (!plan.context.analyses.length) {
    pass("ANALYSIS_STALENESS_CHECK", "No Analysis Result required on this Work Plan");
  }

  if (target.projectId === plan.projectId && target.provenance.lifecycleStage === plan.lifecycleStage) {
    pass("CONFIGURATION_CONTEXT_CHECK", "Artifact configuration context matches Work Plan");
  } else {
    conditions.push(condition({
      id: nextId(),
      checkType: "CONFIGURATION_CONTEXT_CHECK",
      code: "CONFIGURATION_CONTEXT_MISMATCH",
      title: "Artifact configuration context differs from current baseline",
      explanation: "Latest revision is not assumed correct. Configuration mismatch is reported for human review.",
      materiality: "STALE_CONTEXT",
      category: "revision_inconsistency",
      evidence: [
        { artifactId: target.id, statement: `artifact project=${target.projectId} lifecycle=${target.provenance.lifecycleStage}` },
        { sourceId: plan.id, statement: `plan project=${plan.projectId} lifecycle=${plan.lifecycleStage}` },
      ],
      actions: [{ code: "OPEN_ARTIFACT", label: "Open Affected Artifact", objectId: target.id }],
    }));
  }

  const expected = plan.context.expectedOutputs.filter((row) => row.outputType !== "REVIEW_PACKAGE" && row.outputType !== "ANALYSIS_REQUEST" && row.outputType !== "DRAWING_INPUT");
  const missingOutputs = expected.filter((row) => !artifacts.some((item) => item.artifactType === row.outputType || (row.outputType === "OPTION_STUDY" && item.artifactType === "OPTION_STUDY_PRESENTATION")));
  if (missingOutputs.length) {
    conditions.push(condition({
      id: nextId(),
      checkType: "DELIVERABLE_EVIDENCE_CHECK",
      code: "DELIVERABLE_EVIDENCE_MISSING",
      title: "Expected artifact or deliverable evidence is missing",
      explanation: `Expected outputs not present: ${missingOutputs.map((row) => row.outputType).join(", ")}. Review does not change Deliverable maturity.`,
      materiality: "INFORMATION_GAP",
      category: "missing_engineering_evidence",
      evidence: missingOutputs.map((row) => ({ statement: `Expected ${row.outputType} not present` })),
      actions: [{ code: "CREATE_REVIEW_PACKAGE", label: "Create Review Package", href: `/engineering/work/plans/${plan.id}` }],
    }));
  } else {
    pass("DELIVERABLE_EVIDENCE_CHECK", "Expected artifact present");
  }

  if (input.extractionSkipped) {
    notEvaluated.push({ checkType: "XLSX_STRUCTURE_CHECK", reason: input.extractionSkipped });
    notEvaluated.push({ checkType: "GOVERNED_FORMULA_CHECK", reason: input.extractionSkipped });
    notEvaluated.push({ checkType: "DOCX_STRUCTURE_CHECK", reason: input.extractionSkipped });
    notEvaluated.push({ checkType: "PPTX_CONTEXT_CHECK", reason: input.extractionSkipped });
  } else if (inspection?.format === "XLSX") {
    if (inspection.requiredSheetsMissing.length) {
      conditions.push(condition({
        id: nextId(),
        checkType: "XLSX_STRUCTURE_CHECK",
        code: "REQUIRED_SHEET_MISSING",
        title: "Governed workbook sheet missing",
        explanation: `Required governed sheets missing: ${inspection.requiredSheetsMissing.join(", ")}. Editable areas are not flagged.`,
        materiality: "REQUIRES_ATTENTION",
        category: "missing_engineering_evidence",
        evidence: inspection.requiredSheetsMissing.map((sheet) => ({ artifactId: target.id, location: sheet, statement: `sheet missing: ${sheet}` })),
        actions: [{ code: "OPEN_ARTIFACT", label: "Open Affected Artifact", objectId: target.id }],
      }));
    } else {
      pass("XLSX_STRUCTURE_CHECK", "Governed workbook sheets present");
    }
    if (!inspection.sheets.includes("References") && !extracted.toLowerCase().includes("source register")) {
      conditions.push(condition({
        id: nextId(),
        checkType: "XLSX_STRUCTURE_CHECK",
        code: "SOURCE_REGISTER_MISSING",
        title: "Source register missing",
        explanation: "Governed source register sheet/text is not present.",
        materiality: "TRACEABILITY_GAP",
        category: "missing_engineering_evidence",
        evidence: [{ artifactId: target.id, statement: `sheets=${inspection.sheets.join(",")}` }],
        actions: [{ code: "OPEN_ARTIFACT", label: "Open Affected Artifact", objectId: target.id }],
      }));
    }
    if (!extracted.includes("kPa") && !extracted.includes("kN") && target.artifactType === "CALCULATION_WORKBOOK") {
      conditions.push(condition({
        id: nextId(),
        checkType: "XLSX_STRUCTURE_CHECK",
        code: "UNIT_METADATA_MISSING",
        title: "Unit metadata missing from governed input area",
        explanation: "Governed unit metadata was not found in inspected cells.",
        materiality: "INFORMATION_GAP",
        category: "missing_information",
        evidence: [{ artifactId: target.id, statement: "Governed unit labels not found" }],
        actions: [{ code: "OPEN_ARTIFACT", label: "Open Affected Artifact", objectId: target.id }],
      }));
    }
    for (const formula of inspection.governedFormulas) {
      if (!formula.actual) {
        conditions.push(condition({
          id: nextId(),
          checkType: "GOVERNED_FORMULA_CHECK",
          code: "GOVERNED_FORMULA_REMOVED",
          title: `Governed formula removed at ${formula.cell}`,
          explanation: `Governed formula ${formula.expected} is absent from ${formula.sheet}!${formula.cell}. This is not an automatic calculation-wrong verdict.`,
          materiality: "REQUIRES_ATTENTION",
          category: "other_observation",
          evidence: [{ artifactId: target.id, location: `${formula.sheet}!${formula.cell}`, statement: `governed=${formula.expected}; returned=missing` }],
          actions: [{ code: "OPEN_ARTIFACT", label: "Open Affected Artifact", objectId: target.id }, { code: "DISPOSITION", label: "Disposition" }],
        }));
      } else if (normalizeFormula(formula.actual) !== normalizeFormula(formula.expected)) {
        conditions.push(condition({
          id: nextId(),
          checkType: "GOVERNED_FORMULA_CHECK",
          code: "GOVERNED_FORMULA_CHANGED",
          title: `Governed formula changed at ${formula.sheet}!${formula.cell}`,
          explanation: `Governed formula ${formula.expected} was returned as ${formula.actual}. Engineer/checker decides; EOS does not issue a calculation-incorrect verdict.`,
          materiality: "REQUIRES_ATTENTION",
          category: "other_observation",
          evidence: [{ artifactId: target.id, location: `${formula.sheet}!${formula.cell}`, statement: `governed=${formula.expected}; returned=${formula.actual}` }],
          actions: [{ code: "OPEN_ARTIFACT", label: "Open Affected Artifact", objectId: target.id }, { code: "DISPOSITION", label: "Disposition" }],
        }));
      }
    }
    if (!conditions.some((row) => row.checkType === "GOVERNED_FORMULA_CHECK")) {
      pass("GOVERNED_FORMULA_CHECK", "Governed formulas unchanged");
    }
  } else if (inspection?.format === "DOCX") {
    const required = target.artifactType === "RFI_RESPONSE" || target.artifactType === "TQ_RESPONSE"
      ? ["Draft", "drawing", "Affected"]
      : ["Document Control", "Assumptions", "Limitations", "Revision"];
    const missing = required.filter((heading) => !xmlHasHeading(inspection.xmlSnippet, heading) && !xmlHasHeading(inspection.xmlSnippet, heading.replace(" ", "")));
    if (missing.length) {
      conditions.push(condition({
        id: nextId(),
        checkType: "DOCX_STRUCTURE_CHECK",
        code: "DOCX_STRUCTURE_GAP",
        title: "Required document-control structure is incomplete",
        explanation: `Deterministic headings/sections not found: ${missing.join(", ")}. Exact prose is not required.`,
        materiality: "TRACEABILITY_GAP",
        category: "missing_engineering_evidence",
        evidence: missing.map((heading) => ({ artifactId: target.id, location: heading, statement: `heading not found: ${heading}` })),
        actions: [{ code: "OPEN_ARTIFACT", label: "Open Affected Artifact", objectId: target.id }],
      }));
    } else {
      pass("DOCX_STRUCTURE_CHECK", "Required document-control structure present");
    }
    if (target.artifactType === "RFI_RESPONSE" || target.artifactType === "TQ_RESPONSE") {
      const drawing = plan.context.information.find((row) => /DRAWING/i.test(row.informationType));
      const draft = xmlHasHeading(inspection.xmlSnippet, "DRAFT");
      const affected = xmlHasHeading(inspection.xmlSnippet, "Affected");
      if (!draft || !drawing || !affected) {
        conditions.push(condition({
          id: nextId(),
          checkType: "RFI_TQ_CHECK",
          code: "RFI_TQ_DRAFT_CONTEXT_INCOMPLETE",
          title: "RFI/TQ draft is missing current drawing, affected objects, or draft status",
          explanation: "Correspondence remains draft until a human issue workflow. A draft does not mark the RFI/TQ answered.",
          materiality: "REQUIRES_ATTENTION",
          category: "missing_engineering_evidence",
          evidence: [
            { artifactId: target.id, statement: `draft=${draft}; affected=${affected}` },
            { sourceId: drawing?.sourceObjectId ?? drawing?.title ?? "drawing", statement: drawing ? `${drawing.title} Rev ${drawing.revision ?? "?"}` : "No current drawing on Work Plan" },
          ],
          actions: [
            { code: "OPEN_ARTIFACT", label: "Open Affected Artifact", objectId: target.id },
            { code: "OPEN_GOVERNING_SOURCE", label: "Open Current Drawing", href: "/engineering/information" },
            { code: "OPEN_DECISION", label: "Open Decision", href: "/engineering/decisions" },
          ],
        }));
      } else {
        pass("RFI_TQ_CHECK", "RFI/TQ draft retains query context and remains unissued");
      }
    } else {
      notEvaluated.push({ checkType: "RFI_TQ_CHECK", reason: "not_rfi_tq_artifact" });
    }
  } else if (inspection?.format === "PPTX") {
    const text = inspection.slideText.replace(/<[^>]+>/g, " ");
    if (!/project/i.test(text)) {
      conditions.push(condition({
        id: nextId(),
        checkType: "PPTX_CONTEXT_CHECK",
        code: "PPTX_CONTEXT_GAP",
        title: "Presentation is missing project context",
        explanation: "Formatting uniformity is not an engineering defect. Project identity/provenance should be present.",
        materiality: "TRACEABILITY_GAP",
        category: "missing_information",
        evidence: [{ artifactId: target.id, statement: "Project context not found in inspected slide XML" }],
        actions: [{ code: "OPEN_ARTIFACT", label: "Open Affected Artifact", objectId: target.id }],
      }));
    } else {
      pass("PPTX_CONTEXT_CHECK", "Presentation project context present");
    }
    if (/recommended option|automatic winner|selected winner/i.test(text) && !/no automatic winner|does not select|no recommended option/i.test(text)) {
      conditions.push(condition({
        id: nextId(),
        checkType: "PPTX_CONTEXT_CHECK",
        code: "AUTOMATIC_WINNER_PROHIBITED",
        title: "Presentation appears to select an option winner",
        explanation: "Option studies must not auto-select a winner. Candidate only; not a technical verdict.",
        materiality: "REVIEW_CANDIDATE",
        category: "other_observation",
        evidence: [{ artifactId: target.id, statement: "Winner-selection language detected without prohibition clause" }],
        actions: [{ code: "OPEN_ARTIFACT", label: "Open Affected Artifact", objectId: target.id }],
      }));
    }
  }

  const drawingRefs = artifacts.flatMap((artifact) =>
    artifact.provenance.information
      .filter((row) => /drawing/i.test(row.title))
      .map((row) => ({ artifact, title: row.title, revision: row.revision ?? null })),
  );
  const byTitle = new Map<string, typeof drawingRefs>();
  for (const row of drawingRefs) {
    const list = byTitle.get(row.title) ?? [];
    list.push(row);
    byTitle.set(row.title, list);
  }
  let cross = false;
  for (const [title, rows] of byTitle) {
    const revisions = [...new Set(rows.map((row) => row.revision).filter(Boolean))];
    if (revisions.length > 1) {
      cross = true;
      const current = plan.context.information.find((row) => row.title === title);
      conditions.push(condition({
        id: nextId(),
        checkType: "CROSS_ARTIFACT_REVISION_CHECK",
        code: "CROSS_ARTIFACT_REVISION_INCONSISTENCY",
        title: `Artifacts cite different revisions of ${title}`,
        explanation: `Package artifacts cite ${revisions.join(" vs ")}. Current governed source is Rev ${current?.revision ?? "unknown"}. Deterministic inconsistency only; not a design-incorrect conclusion.`,
        materiality: "REQUIRES_ATTENTION",
        category: "cross_document_inconsistency",
        evidence: rows.map((row) => ({
          artifactId: row.artifact.id,
          statement: `${row.artifact.fileName} references ${title} Rev ${row.revision}`,
        })),
        actions: rows.map((row) => ({ code: "OPEN_ARTIFACT" as const, label: "Open Affected Artifact", objectId: row.artifact.id })),
      }));
    }
  }
  if (!cross) {
    if (artifacts.length > 1) pass("CROSS_ARTIFACT_REVISION_CHECK", "No cross-artifact revision conflict");
    else notEvaluated.push({ checkType: "CROSS_ARTIFACT_REVISION_CHECK", reason: "single_artifact_package" });
  }

  if (target.outputFormat !== "XLSX" && !input.extractionSkipped) {
    notEvaluated.push({ checkType: "XLSX_STRUCTURE_CHECK", reason: "not_xlsx" });
    notEvaluated.push({ checkType: "GOVERNED_FORMULA_CHECK", reason: "not_xlsx" });
  }
  if (target.outputFormat !== "DOCX" && !input.extractionSkipped) {
    notEvaluated.push({ checkType: "DOCX_STRUCTURE_CHECK", reason: "not_docx" });
  }
  if (target.outputFormat !== "PPTX" && !input.extractionSkipped) {
    notEvaluated.push({ checkType: "PPTX_CONTEXT_CHECK", reason: "not_pptx" });
  }
  if (target.artifactType !== "RFI_RESPONSE" && target.artifactType !== "TQ_RESPONSE") {
    if (!notEvaluated.some((row) => row.checkType === "RFI_TQ_CHECK")) {
      notEvaluated.push({ checkType: "RFI_TQ_CHECK", reason: "not_rfi_tq_artifact" });
    }
  }

  return { conditions, passedChecks, notEvaluated };
}

export function summarizeResult(input: {
  conditions: PreIssueCondition[];
  extractionSkipped: string | null;
  fingerprintChanged: boolean;
}): import("./types").PreIssueResultState {
  if (input.extractionSkipped === "REVIEW_FAILED") return "REVIEW_FAILED";
  if (input.conditions.some((row) => row.materiality === "STALE_CONTEXT") || input.fingerprintChanged) {
    if (input.conditions.some((row) => row.materiality === "REQUIRES_ATTENTION" || row.materiality === "INFORMATION_GAP" || row.materiality === "TRACEABILITY_GAP")) {
      return input.conditions.some((row) => row.materiality === "STALE_CONTEXT") ? "CONTEXT_STALE" : "ATTENTION_REQUIRED";
    }
    return "CONTEXT_STALE";
  }
  if (input.extractionSkipped) return "REVIEW_INCOMPLETE";
  if (input.conditions.some((row) => row.materiality === "REQUIRES_ATTENTION" || row.materiality === "INFORMATION_GAP" || row.materiality === "TRACEABILITY_GAP" || row.materiality === "REVIEW_CANDIDATE")) {
    return "ATTENTION_REQUIRED";
  }
  return "NO_BLOCKING_CONDITIONS_IDENTIFIED";
}
