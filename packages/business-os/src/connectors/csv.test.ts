import { describe, expect, it } from "vitest";
import { previewCsv } from "./csv";
import { sanitizeSpreadsheetCell } from "./security";

describe("BOS-12 CSV/Excel safety", () => {
  it("validates schema and rejects unsupported entities", () => {
    const preview = previewCsv({
      filename: "customers.csv",
      entityType: "customer",
      content: "name,external_id\nAcme,ext-1\n",
    });
    expect(preview.validCount).toBe(1);
    expect(preview.displayRows[0]?.name).toBe("Acme");
    expect(() =>
      previewCsv({ filename: "customers.csv", entityType: "invoice", content: "name\nA\n" }),
    ).toThrow("unsupported_import_type");
  });

  it("rejects formulas, macros, and binary workbooks fail-closed", () => {
    expect(() =>
      previewCsv({
        filename: "customers.csv",
        entityType: "customer",
        content: "name\n=HYPERLINK(\"http://evil\")\n",
      }),
    ).toThrow("formula_injection_forbidden");
    expect(() =>
      previewCsv({
        filename: "macro.xlsm",
        entityType: "customer",
        content: "PK\nvbaProject.bin",
      }),
    ).toThrow("macro_content_forbidden");
    expect(() =>
      previewCsv({
        filename: "customers.xlsx",
        entityType: "customer",
        content: "PK\nxl/workbook.xml",
      }),
    ).toThrow("macro_content_forbidden");
  });

  it("sanitizes spreadsheet formula injection on display/export", () => {
    expect(sanitizeSpreadsheetCell("=cmd")).toBe("'=cmd");
    expect(sanitizeSpreadsheetCell("+1")).toBe("'+1");
    expect(sanitizeSpreadsheetCell("-1")).toBe("'-1");
    expect(sanitizeSpreadsheetCell("@sum")).toBe("'@sum");
    expect(sanitizeSpreadsheetCell("Acme")).toBe("Acme");
  });
});
