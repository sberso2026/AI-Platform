import ExcelJS from "exceljs";
import { readZip, zipHasUnsafeParts } from "./zip";

export function assertOfficePackage(buffer: Buffer, format: "XLSX" | "DOCX" | "PPTX") {
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    throw new Error("invalid_office_package");
  }
  const entries = readZip(buffer);
  if (zipHasUnsafeParts(entries)) throw new Error("unsafe_office_package");
  const names = new Set(entries.map((row) => row.name.replace(/\\/g, "/")));
  if (!names.has("[Content_Types].xml")) throw new Error("missing_content_types");
  if (format === "XLSX" && ![...names].some((name) => name.startsWith("xl/"))) throw new Error("missing_workbook_xml");
  if (format === "DOCX" && !names.has("word/document.xml")) throw new Error("missing_document_xml");
  if (format === "PPTX" && ![...names].some((name) => name.startsWith("ppt/slides/"))) throw new Error("missing_slide_xml");
  return entries;
}

export async function inspectXlsx(buffer: Buffer) {
  assertOfficePackage(buffer, "XLSX");
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(Uint8Array.from(buffer) as unknown as ExcelJS.Buffer);
  const sheets = wb.worksheets.map((sheet) => sheet.name);
  const formulas: string[] = [];
  const formulaCells: Array<{ sheet: string; cell: string; formula: string }> = [];
  const sheetTexts: Record<string, string> = {};
  wb.worksheets.forEach((sheet) => {
    const parts: string[] = [];
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        const value = cell.value as { formula?: string; result?: unknown } | string | number | null;
        if (value && typeof value === "object" && "formula" in value && value.formula) {
          formulas.push(String(value.formula));
          formulaCells.push({ sheet: sheet.name, cell: String(cell.address), formula: String(value.formula) });
        } else if (value != null) {
          parts.push(String(value));
        }
      });
    });
    sheetTexts[sheet.name] = parts.join("\n").slice(0, 20_000);
  });
  return { sheets, formulas, formulaCells, sheetTexts, sheetCount: sheets.length };
}

export function inspectXmlText(buffer: Buffer, path: string) {
  const entries = assertOfficePackage(buffer, path.endsWith("pptx") ? "PPTX" : path.includes("word") ? "DOCX" : "XLSX");
  const entry = entries.find((row) => row.name.replace(/\\/g, "/") === path);
  return entry ? entry.data.toString("utf8") : "";
}

export function inspectDocx(buffer: Buffer) {
  const entries = assertOfficePackage(buffer, "DOCX");
  const xml = entries.find((row) => row.name === "word/document.xml")?.data.toString("utf8") ?? "";
  return { xml, hasDocumentXml: xml.includes("w:document") || xml.includes("<w:t") };
}

export function inspectPptx(buffer: Buffer) {
  const entries = assertOfficePackage(buffer, "PPTX");
  const slides = entries.filter((row) => /^ppt\/slides\/slide\d+\.xml$/.test(row.name.replace(/\\/g, "/")));
  const text = slides.map((row) => row.data.toString("utf8")).join("\n");
  return { slideCount: slides.length, text };
}
