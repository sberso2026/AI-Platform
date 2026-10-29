import ExcelJS from "exceljs";
import type { ApprovedEmissionFactor, ApprovedRate, DerivedCarbon, DerivedCost, MtoItemDelta, MtoSnapshot, QuantityItem } from "./quantity-mto";
import { acceptGovernedQuantity, deriveCarbon, deriveCost } from "./quantity-mto";
import type { ProjectValuePolicy } from "./cross-lifecycle-value";

const ITEM_HEADERS = [
  "Item Code",
  "Description",
  "Discipline",
  "System",
  "Asset/Tag",
  "Category",
  "Material",
  "Specification",
  "Quantity",
  "Unit",
  "Quantity Origin",
  "Quantity Maturity",
  "Source",
  "Source Revision",
  "Derivation Method",
  "Assumption",
  "Verification Status",
  "Lifecycle",
  "Status",
];

function writeHeader(sheet: ExcelJS.Worksheet, headers: string[]) {
  headers.forEach((header, index) => {
    const cell = sheet.getCell(1, index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.numFmt = "@";
  });
}

function writeItems(sheet: ExcelJS.Worksheet, items: QuantityItem[]) {
  writeHeader(sheet, ITEM_HEADERS);
  items.forEach((item, i) => {
    const row = i + 2;
    const values = [
      item.itemCode,
      item.description,
      item.discipline,
      item.systemId ?? "",
      item.tag ?? item.assetId ?? "",
      item.category,
      item.material ?? "",
      item.specification ?? item.grade ?? "",
      item.quantity == null ? "" : item.quantity,
      item.unit ?? "",
      item.quantityOrigin,
      item.quantityMaturity,
      item.basis.sourceRef ?? "",
      item.basis.sourceRevision ?? "",
      item.basis.derivationMethod ?? item.basis.formula ?? "",
      item.basis.assumptions.join("; "),
      item.verificationStatus,
      item.lifecycleStage,
      item.status,
    ];
    values.forEach((value, col) => {
      const cell = sheet.getCell(row, col + 1);
      if (typeof value === "number") cell.value = value;
      else {
        cell.value = value;
        cell.numFmt = "@";
      }
    });
  });
}

export async function exportMtoWorkbook(input: {
  snapshot: MtoSnapshot;
  policy: ProjectValuePolicy;
  deltas?: MtoItemDelta[];
  ratesByItemCode?: Record<string, ApprovedRate | null>;
  factorsByItemCode?: Record<string, ApprovedEmissionFactor | null>;
  provenance?: {
    projectId: string;
    revision: string;
    fingerprint: string;
    lifecycle: string;
    generatedAt: string;
    verificationState: string;
    disclaimer: string;
  };
}): Promise<{ buffer: Buffer; sheets: string[]; costSheet: boolean; carbonSheet: boolean }> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "RTB Engineering OS";
  const byDiscipline = (code: string) => input.snapshot.items.filter((row) => row.discipline === code);

  const summary = wb.addWorksheet("01_Summary");
  summary.getCell("A1").value = "Governed multidisciplinary MTO";
  summary.getCell("A1").font = { bold: true, size: 14 };
  summary.getCell("A2").value = `Revision ${input.snapshot.revision} · ${input.snapshot.disciplineScope} · ${input.snapshot.lifecycleStage}`;
  summary.getCell("A3").value = `Items ${input.snapshot.itemCount} · fingerprint ${input.snapshot.fingerprint.slice(0, 16)}`;
  summary.getCell("A4").value = "MTO is the primary quantitative output. Cost and carbon are optional and fail closed without approved basis.";
  summary.getCell("A5").value = "SYNTHETIC DEMONSTRATION DATA unless otherwise classified. Not a certified commercial BOQ.";
  if (input.provenance) {
    summary.getCell("A6").value = `Project ${input.provenance.projectId} · snapshot revision ${input.provenance.revision} · fingerprint ${input.provenance.fingerprint} · lifecycle ${input.provenance.lifecycle} · generated ${input.provenance.generatedAt} · verification ${input.provenance.verificationState}`;
    summary.getCell("A7").value = input.provenance.disclaimer;
  }

  writeItems(wb.addWorksheet("02_Process"), byDiscipline("PROCESS"));
  writeItems(wb.addWorksheet("03_Mechanical"), byDiscipline("MECHANICAL"));
  writeItems(wb.addWorksheet("04_Piping"), byDiscipline("PIPING"));
  writeItems(wb.addWorksheet("05_Structural"), byDiscipline("STRUCTURAL"));
  writeItems(wb.addWorksheet("06_Civil"), byDiscipline("CIVIL"));
  writeItems(wb.addWorksheet("07_Geotechnical"), byDiscipline("GEOTECHNICAL"));
  writeItems(wb.addWorksheet("08_Electrical"), byDiscipline("ELECTRICAL"));
  writeItems(wb.addWorksheet("09_Instrumentation"), byDiscipline("INSTRUMENTATION_CONTROL"));
  writeItems(wb.addWorksheet("10_Materials"), input.snapshot.items.filter((row) => row.semantics === "materials_enrichment" || row.discipline === "MATERIALS"));

  const assumptions = wb.addWorksheet("11_Assumptions");
  writeHeader(assumptions, ["Item Code", "Origin", "Assumptions", "Exclusions"]);
  input.snapshot.items.forEach((item, i) => {
    assumptions.getCell(i + 2, 1).value = item.itemCode;
    assumptions.getCell(i + 2, 2).value = item.quantityOrigin;
    assumptions.getCell(i + 2, 3).value = item.basis.assumptions.join("; ") || "";
    assumptions.getCell(i + 2, 4).value = item.basis.exclusions.join("; ") || "";
  });

  const sources = wb.addWorksheet("12_Source_Register");
  writeHeader(sources, ["Item Code", "Source", "Revision", "Origin", "Derivation"]);
  input.snapshot.items.forEach((item, i) => {
    sources.getCell(i + 2, 1).value = item.itemCode;
    sources.getCell(i + 2, 2).value = item.basis.sourceRef ?? "";
    sources.getCell(i + 2, 3).value = item.basis.sourceRevision ?? "";
    sources.getCell(i + 2, 4).value = item.quantityOrigin;
    sources.getCell(i + 2, 5).value = item.basis.formula ?? item.basis.derivationMethod ?? "";
  });

  const changes = wb.addWorksheet("13_Revision_Changes");
  writeHeader(changes, ["Item Code", "Kind", "Prior", "Current", "Delta", "Unit"]);
  (input.deltas ?? []).forEach((row, i) => {
    changes.getCell(i + 2, 1).value = row.itemCode;
    changes.getCell(i + 2, 2).value = row.kind;
    changes.getCell(i + 2, 3).value = row.priorQuantity ?? "";
    changes.getCell(i + 2, 4).value = row.currentQuantity ?? "";
    changes.getCell(i + 2, 5).value = row.delta ?? "";
    changes.getCell(i + 2, 6).value = row.unit ?? "";
  });

  const costRows: Array<{ item: QuantityItem; cost: DerivedCost }> = [];
  for (const item of input.snapshot.items) {
    const rate = input.ratesByItemCode?.[item.itemCode];
    if (rate === undefined) continue;
    costRows.push({ item, cost: deriveCost(acceptGovernedQuantity(item), rate) });
  }
  const includeCost = costRows.length > 0;
  if (includeCost) {
    const cost = wb.addWorksheet("14_Cost");
    writeHeader(cost, ["Item Code", "Quantity", "Rate", "Rate unit", "Currency", "Base date", "Source", "Derived amount", "Status"]);
    costRows.forEach((row, i) => {
      cost.getCell(i + 2, 1).value = row.item.itemCode;
      cost.getCell(i + 2, 2).value = row.item.quantity ?? "";
      if (row.cost.state === "DERIVED") {
        cost.getCell(i + 2, 3).value = row.cost.rate.rateValue;
        cost.getCell(i + 2, 4).value = row.cost.rate.rateUnit;
        cost.getCell(i + 2, 5).value = row.cost.currency;
        cost.getCell(i + 2, 6).value = row.cost.rate.baseDate;
        cost.getCell(i + 2, 7).value = row.cost.rate.source;
        cost.getCell(i + 2, 8).value = row.cost.amount;
        cost.getCell(i + 2, 9).value = "DERIVED";
      } else {
        cost.getCell(i + 2, 9).value = "COST BASIS NOT AVAILABLE";
      }
    });
  }

  const carbonRows: Array<{ item: QuantityItem; carbon: DerivedCarbon }> = [];
  if (input.policy.carbon !== "NOT_APPLICABLE") {
    for (const item of input.snapshot.items) {
      const factor = input.factorsByItemCode?.[item.itemCode];
      if (factor === undefined) continue;
      carbonRows.push({ item, carbon: deriveCarbon({ policy: input.policy, quantity: acceptGovernedQuantity(item), factor }) });
    }
  }
  const includeCarbon = carbonRows.length > 0;
  if (includeCarbon) {
    const carbon = wb.addWorksheet("15_Carbon");
    writeHeader(carbon, ["Item Code", "Quantity", "Status", "Value", "Unit"]);
    carbonRows.forEach((row, i) => {
      carbon.getCell(i + 2, 1).value = row.item.itemCode;
      carbon.getCell(i + 2, 2).value = row.item.quantity ?? "";
      carbon.getCell(i + 2, 3).value = row.carbon.state;
      carbon.getCell(i + 2, 4).value = row.carbon.state === "DERIVED" ? row.carbon.value : "";
      carbon.getCell(i + 2, 5).value = row.carbon.state === "DERIVED" ? row.carbon.unit : "";
    });
  }

  const buffer = Buffer.from(await wb.xlsx.writeBuffer());
  return { buffer, sheets: wb.worksheets.map((sheet) => sheet.name), costSheet: includeCost, carbonSheet: includeCarbon };
}
