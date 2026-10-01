import { inspectDocx, inspectPptx, inspectXlsx, inspectXmlText } from "../artifact-automation/validate";
import { ARTIFACT_TEMPLATES } from "../artifact-automation/catalog";
import type { GeneratedEngineeringArtifact } from "../artifact-automation/types";
import { MAX_REVIEW_EXTRACT_BYTES } from "./types";

export type TransientOfficeInspection = {
  format: "XLSX" | "DOCX" | "PPTX";
  sheets: string[];
  formulas: string[];
  formulaCells: Array<{ sheet: string; cell: string; formula: string }>;
  sheetTexts: Record<string, string>;
  xmlSnippet: string;
  slideCount: number;
  slideText: string;
  requiredSheetsMissing: string[];
  governedFormulas: Array<{
    id: string;
    cell: string;
    expected: string;
    actual: string | null;
    sheet: string;
  }>;
  persisted: false;
};

function decode(artifact: GeneratedEngineeringArtifact) {
  return Buffer.from(artifact.contentBase64, "base64");
}

export async function inspectArtifactTransient(
  artifact: GeneratedEngineeringArtifact,
): Promise<{ inspection: TransientOfficeInspection | null; skipped: string | null; durationMs: number }> {
  const started = Date.now();
  if (artifact.byteSize > MAX_REVIEW_EXTRACT_BYTES) {
    return { inspection: null, skipped: "ARTIFACT_EXCEEDS_STAGING_SIZE_GUARD", durationMs: Date.now() - started };
  }
  const buffer = decode(artifact);
  if (buffer.length > MAX_REVIEW_EXTRACT_BYTES) {
    return { inspection: null, skipped: "ARTIFACT_EXCEEDS_STAGING_SIZE_GUARD", durationMs: Date.now() - started };
  }
  const template = ARTIFACT_TEMPLATES.find((row) => row.code === artifact.templateCode);
  if (artifact.outputFormat === "XLSX") {
    const xlsx = await inspectXlsx(buffer);
    const governedFormulas = (template?.formulas ?? []).map((formula) => {
      const actual = xlsx.formulaCells.find(
        (cell) => cell.cell === formula.cell && (cell.sheet === "Calculations" || cell.sheet === "Inputs" || true),
      );
      const match = xlsx.formulaCells.find((cell) => cell.cell === formula.cell && cell.sheet === "Calculations")
        ?? xlsx.formulaCells.find((cell) => cell.cell === formula.cell);
      return {
        id: formula.id,
        cell: formula.cell,
        expected: formula.formula,
        actual: match?.formula ?? actual?.formula ?? null,
        sheet: match?.sheet ?? "Calculations",
      };
    });
    return {
      inspection: {
        format: "XLSX",
        sheets: xlsx.sheets,
        formulas: xlsx.formulas,
        formulaCells: xlsx.formulaCells,
        sheetTexts: xlsx.sheetTexts,
        xmlSnippet: "",
        slideCount: 0,
        slideText: "",
        requiredSheetsMissing: (template?.sheetsOrSections ?? []).filter((name) => !xlsx.sheets.includes(name)),
        governedFormulas,
        persisted: false,
      },
      skipped: null,
      durationMs: Date.now() - started,
    };
  }
  if (artifact.outputFormat === "DOCX") {
    const docx = inspectDocx(buffer);
    const xml = inspectXmlText(buffer, "word/document.xml").slice(0, 30_000);
    return {
      inspection: {
        format: "DOCX",
        sheets: template?.sheetsOrSections ?? [],
        formulas: [],
        formulaCells: [],
        sheetTexts: {},
        xmlSnippet: xml || docx.xml.slice(0, 30_000),
        slideCount: 0,
        slideText: "",
        requiredSheetsMissing: [],
        governedFormulas: [],
        persisted: false,
      },
      skipped: null,
      durationMs: Date.now() - started,
    };
  }
  const pptx = inspectPptx(buffer);
  return {
    inspection: {
      format: "PPTX",
      sheets: [],
      formulas: [],
      formulaCells: [],
      sheetTexts: {},
      xmlSnippet: "",
      slideCount: pptx.slideCount,
      slideText: pptx.text.slice(0, 30_000),
      requiredSheetsMissing: [],
      governedFormulas: [],
      persisted: false,
    },
    skipped: null,
    durationMs: Date.now() - started,
  };
}

export function xmlHasHeading(xml: string, heading: string) {
  const compact = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  return compact.toLowerCase().includes(heading.toLowerCase());
}
