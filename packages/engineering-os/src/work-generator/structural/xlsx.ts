import ExcelJS from "exceljs";
import type { PersistedStructuralCalculation } from "./types";

const SHEETS = [
  "01_Summary",
  "02_Design_Basis",
  "03_Loads",
  "04_Load_Combinations",
  "05_Geometry",
  "06_Materials",
  "07_Calculation",
  "08_Results",
  "09_Assumptions",
  "10_Source_Register",
  "11_Revision_History",
] as const;

function writePairs(sheet: ExcelJS.Worksheet, rows: Array<[string, string | number | null]>) {
  rows.forEach((row, index) => {
    sheet.getCell(index + 1, 1).value = row[0];
    sheet.getCell(index + 1, 1).font = { bold: true };
    sheet.getCell(index + 1, 2).value = row[1] ?? "";
    sheet.getCell(index + 1, 2).numFmt = "@";
  });
}

function table(sheet: ExcelJS.Worksheet, headers: string[], rows: Array<Array<string | number | null>>) {
  headers.forEach((header, index) => {
    const cell = sheet.getCell(1, index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.numFmt = "@";
  });
  rows.forEach((row, r) => {
    row.forEach((value, c) => {
      const cell = sheet.getCell(r + 2, c + 1);
      if (typeof value === "number") cell.value = value;
      else {
        cell.value = value ?? "";
        cell.numFmt = "@";
      }
    });
  });
}

export async function exportStructuralCalculationWorkbook(row: PersistedStructuralCalculation) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "EOS-A15A-V5";
  const basis = row.designBasis;
  const result = row.result;
  const summary = wb.addWorksheet(SHEETS[0]);
  writePairs(summary, [
    ["Calculation id", row.id],
    ["Manifest id", row.manifest.id],
    ["Work kind", row.workKind],
    ["Status", row.status],
    ["Review status", row.reviewStatus],
    ["Engine", `${row.engineId} ${row.engineVersion}`],
    ["Input fingerprint", row.inputFingerprint],
    ["Data classification", "SYNTHETIC_DEMONSTRATION_DATA"],
    ["SPACE GASS executed", "NO"],
    ["Design approved", "NO"],
    ["Disclaimer", "Calculation success is not engineering approval, IFC, or DESIGN_APPROVED."],
  ]);
  const design = wb.addWorksheet(SHEETS[1]);
  table(design, ["Standard", "Edition", "Source", "Applicability", "Status"], basis.standards.map((row) => [
    row.identifier,
    row.editionYear,
    row.source,
    row.projectApplicability,
    row.status,
  ]));
  const loads = wb.addWorksheet(SHEETS[2]);
  table(
    loads,
    ["Key", "Class", "Value", "Unit", "Direction", "Load case", "Source", "Revision", "Status"],
    basis.inputs.filter((row) => row.inputClass === "LOAD").map((row) => [
      row.key,
      row.loadClass ?? "",
      row.value,
      row.unit,
      row.direction ?? "",
      row.loadCase ?? "",
      row.provenance.sourceId,
      row.provenance.revision,
      row.status,
    ]),
  );
  const combos = wb.addWorksheet(SHEETS[3]);
  table(
    combos,
    ["Key", "Value", "Source", "Revision", "Status"],
    basis.inputs.filter((row) => row.inputClass === "LOAD_COMBINATION").map((row) => [
      row.key,
      row.value,
      row.provenance.sourceId,
      row.provenance.revision,
      row.status,
    ]),
  );
  const geometry = wb.addWorksheet(SHEETS[4]);
  table(
    geometry,
    ["Key", "Value", "Unit", "Source", "Revision", "Status"],
    basis.inputs.filter((row) => row.inputClass === "GEOMETRY").map((row) => [
      row.key,
      row.value,
      row.unit,
      row.provenance.sourceId,
      row.provenance.revision,
      row.status,
    ]),
  );
  const materials = wb.addWorksheet(SHEETS[5]);
  table(
    materials,
    ["Key", "Value", "Unit", "Source", "Revision", "Status"],
    basis.inputs.filter((row) => row.inputClass === "MATERIAL").map((row) => [
      row.key,
      row.value,
      row.unit,
      row.provenance.sourceId,
      row.provenance.revision,
      row.status,
    ]),
  );
  const calc = wb.addWorksheet(SHEETS[6]);
  writePairs(calc, [
    ["Method", "SYNTHETIC_SS_BEAM_UDL_STATICS"],
    ["Equations", "V = wL/2 ; M = wL^2/8"],
    ["Classification", "SYNTHETIC_DEMONSTRATION_DATA"],
    ["Not AS 4100 capacity", "TRUE"],
    ["Not SPACE GASS", "TRUE"],
  ]);
  const results = wb.addWorksheet(SHEETS[7]);
  writePairs(results, [
    ["Demand shear kN", result?.results.demandShearKN ?? ""],
    ["Demand moment kN.m", result?.results.demandMomentKNm ?? ""],
    ["Capacity moment kN.m", result?.results.capacityMomentKNm ?? "CAPACITY_METHOD_NOT_CERTIFIED"],
    ["Utilization", result?.results.utilization ?? ""],
    ["Serviceability", result?.results.serviceability ?? "NOT_EVALUATED"],
    ["Connection", result?.results.connection ?? ""],
    ["Foundation", result?.results.foundation ?? ""],
    ["Status", row.status],
  ]);
  const assumptions = wb.addWorksheet(SHEETS[8]);
  table(assumptions, ["Assumption"], row.manifest.assumptions.map((row) => [row]));
  const sources = wb.addWorksheet(SHEETS[9]);
  table(
    sources,
    ["Title", "Source id", "Revision", "Status", "Classification"],
    basis.inputs.map((row) => [
      row.provenance.title,
      row.provenance.sourceId,
      row.provenance.revision,
      row.provenance.status,
      row.provenance.classification,
    ]),
  );
  const history = wb.addWorksheet(SHEETS[10]);
  writePairs(history, [
    ["Revision", row.revision],
    ["Supersedes", row.supersedesId],
    ["Created", row.createdAt],
    ["Executed", row.executedAt],
    ["Reviewed", row.reviewedAt],
  ]);
  const buffer = Buffer.from(await wb.xlsx.writeBuffer());
  return {
    buffer,
    fileName: `STRUCT-CALC-${row.revision}-${row.inputFingerprint.slice(0, 8)}.xlsx`,
    disclaimer: "Export does not imply engineering approval, IFC, or DESIGN_APPROVED.",
    sheets: [...SHEETS],
  };
}
