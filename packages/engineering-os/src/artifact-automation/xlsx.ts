import ExcelJS from "exceljs";
import { createHash } from "node:crypto";
import type { EngineeringArtifactTemplate, ArtifactProvenanceManifest, WorkPlanLike } from "./types";
import { escapeSpreadsheetText, normalizeGovernedFormula } from "./formulas";
import { BEARING_PRESSURE_FORMULA } from "./catalog";

function text(sheet: ExcelJS.Worksheet, cell: string, value: string) {
  const target = sheet.getCell(cell);
  target.value = escapeSpreadsheetText(value);
  target.numFmt = "@";
}

function titles(sheet: ExcelJS.Worksheet, rows: Array<[string, string]>) {
  rows.forEach(([cell, value], index) => {
    text(sheet, cell, value);
    if (index === 0) sheet.getCell(cell).font = { bold: true, size: 14 };
  });
}

function listSheet(wb: ExcelJS.Workbook, name: string, heading: string, lines: string[]) {
  const sheet = wb.addWorksheet(name);
  titles(sheet, [["A1", heading]]);
  if (lines.length === 0) text(sheet, "A2", "None recorded in this Work Plan.");
  lines.forEach((line, i) => text(sheet, `A${i + 2}`, line));
  return sheet;
}

export async function buildXlsx(input: {
  template: EngineeringArtifactTemplate;
  plan: WorkPlanLike;
  provenance: ArtifactProvenanceManifest;
  projectCode: string;
}): Promise<{ buffer: Buffer; sheetCount: number }> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "RTB Engineering OS";
  wb.calcProperties.fullCalcOnLoad = true;

  if (input.template.artifactType === "CALCULATION_WORKBOOK") {
    const cover = wb.addWorksheet("Cover");
    titles(cover, [
      ["A1", "DRAFT — ENGINEER REVIEW REQUIRED"],
      ["A2", "SYNTHETIC EXAMPLE_ONLY — NOT A CERTIFIED DESIGN TEMPLATE"],
      ["A3", input.template.name],
      ["A4", `Project: ${input.projectCode}`],
      ["A5", `Work plan: ${input.plan.templateCode}@${input.plan.templateVersion}`],
      ["A6", `Artifact template: ${input.template.code}@${input.template.version}`],
      ["A7", "Generation does not imply engineering approval, IFC issue, or Deliverable completion."],
    ]);

    const inputs = wb.addWorksheet("Inputs");
    titles(inputs, [["A1", "Inputs — units explicit; values are template synthetic unless sourced"]]);
    text(inputs, "A3", "Description");
    text(inputs, "B3", "Value");
    text(inputs, "C3", "Unit");
    text(inputs, "D3", "Source");
    text(inputs, "A4", "Synthetic vertical load");
    inputs.getCell("B4").value = 4500;
    text(inputs, "C4", "kN");
    text(inputs, "D4", "EAT-CALC-EXAMPLE-BEARING EXAMPLE_ONLY fixture");
    text(inputs, "A5", "Synthetic plan area");
    inputs.getCell("B5").value = 12.5;
    text(inputs, "C5", "m2");
    text(inputs, "D5", "EAT-CALC-EXAMPLE-BEARING EXAMPLE_ONLY fixture");
    text(inputs, "A7", "Do not mix N/kN, Pa/kPa/MPa, mm/m, kg/t. Units shown are template-defined.");

    const calc = wb.addWorksheet("Calculations");
    titles(calc, [["A1", "Governed formulas only — LLM-generated equations prohibited"]]);
    text(calc, "A3", "Bearing pressure");
    text(calc, "B3", "Formula");
    text(calc, "C3", "Unit");
    const formula = normalizeGovernedFormula(input.template.formulas[0]?.formula ?? BEARING_PRESSURE_FORMULA);
    calc.getCell("B6").value = { formula };
    text(calc, "A6", "q = V / A");
    text(calc, "C6", "kPa");
    text(calc, "A8", "Formula source: governed ArtifactTemplate. Excel recalculation expected on open.");

    const results = wb.addWorksheet("Results");
    titles(results, [["A1", "Results — formula cells; cached numeric results are not fabricated"]]);
    text(results, "A3", "Bearing pressure");
    results.getCell("B3").value = { formula: "Calculations!B6" };
    text(results, "C3", "kPa");
    text(results, "A5", "ENGINEER REVIEW REQUIRED. EXAMPLE_ONLY. Not a certified structural design.");

    listSheet(wb, "References", "Source register", input.provenance.information.map((row) => `${row.title}${row.revision ? ` Rev ${row.revision}` : ""}`));
    listSheet(wb, "Assumptions", "Assumptions", input.provenance.assumptions);
    const ctx = wb.addWorksheet("EOS Context");
    titles(ctx, [["A1", "EOS Context"]]);
    [
      ["A3", "Lifecycle"], ["B3", input.provenance.lifecycleStage],
      ["A4", "Discipline"], ["B4", input.provenance.discipline ?? ""],
      ["A5", "System"], ["B5", input.provenance.systemId ?? ""],
      ["A6", "Fingerprint"], ["B6", input.provenance.inputFingerprint],
      ["A7", "Generated at"], ["B7", input.provenance.generatedAt],
      ["A8", "Requirements"], ["B8", input.provenance.requirements.join("; ") || "None"],
      ["A9", "Interfaces"], ["B9", input.provenance.interfaces.join("; ") || "None"],
      ["A10", "Decisions"], ["B10", input.provenance.decisions.join("; ") || "None"],
      ["A11", "Analyses"], ["B11", input.provenance.analyses.join("; ") || "None"],
    ].forEach(([cell, value]) => text(ctx, cell, value));
    const rev = wb.addWorksheet("Revision History");
    titles(rev, [["A1", "Revision / Generation"]]);
    text(rev, "A3", "Generation run");
    text(rev, "B3", input.provenance.generationRunId);
    text(rev, "A4", "Status");
    text(rev, "B4", "GENERATED_DRAFT");
    text(rev, "A5", "Issued revision");
    text(rev, "B5", "None — draft only");
  } else {
    const context = wb.addWorksheet("Context");
    titles(context, [
      ["A1", "DRAFT — ENGINEER REVIEW REQUIRED"],
      ["A2", "Option study workbook — no automatic winner"],
      ["A3", `Project: ${input.projectCode}`],
      ["A4", `Work plan: ${input.plan.templateCode}`],
    ]);
    const options = wb.addWorksheet("Options");
    titles(options, [["A1", "Options remain separate"]]);
    text(options, "A3", "Option A — Rail haulage (synthetic)");
    text(options, "A4", "Option B — Conveyor (synthetic)");
    text(options, "A6", "No recommended option. No hidden ranking.");
    const criteria = wb.addWorksheet("Criteria");
    titles(criteria, [["A1", "Criteria"]]);
    text(criteria, "A3", "Capacity");
    text(criteria, "A4", "Constructability");
    text(criteria, "A5", "Information completeness");
    listSheet(wb, "Evidence", "Evidence / Inputs", input.provenance.information.map((row) => row.title));
    const comparison = wb.addWorksheet("Comparison");
    titles(comparison, [["A1", "Comparison — visible only; no winner selected"]]);
    text(comparison, "A3", "Criterion");
    text(comparison, "B3", "Option A");
    text(comparison, "C3", "Option B");
    text(comparison, "A4", "Capacity");
    text(comparison, "B4", "Referenced requirement — engineer assesses");
    text(comparison, "C4", "Referenced requirement — engineer assesses");
    text(comparison, "A6", "Weights (if provided by engineer) must remain visible. None configured.");
    listSheet(wb, "Assumptions", "Assumptions", input.provenance.assumptions);
    listSheet(wb, "Risks", "Risks / Constraints", input.plan.context.gaps.map((row) => `${row.kind}: ${row.title}`));
    listSheet(wb, "References", "Source register", input.provenance.information.map((row) => `${row.title}${row.revision ? ` Rev ${row.revision}` : ""}`));
  }

  const buffer = Buffer.from(await wb.xlsx.writeBuffer());
  createHash("sha256").update(buffer).digest("hex");
  return { buffer, sheetCount: wb.worksheets.length };
}
