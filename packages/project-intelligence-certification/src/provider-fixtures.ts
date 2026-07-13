import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** Minimal one-page PDF with extractable text (digital). */
export function buildDigitalEngineeringPdf(lines: string[]): Uint8Array {
  const textOps = lines
    .map((line, index) => {
      const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
      const y = 720 - index * 18;
      return `BT /F1 12 Tf 72 ${y} Td (${escaped}) Tj ET`;
    })
    .join("\n");
  const stream = `${textOps}\n`;
  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n",
    `4 0 obj<< /Length ${Buffer.byteLength(stream)} >>stream\n${stream}endstream\nendobj\n`,
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += object;
  }
  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

/** Image-only-style PDF: empty content stream triggers OCR-required density path. */
export function buildScannedLikePdfPlaceholder(): Uint8Array {
  // Minimal valid PDF with no text operators — lightweight extract yields insufficient text.
  const stream = "\n";
  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>endobj\n",
    `4 0 obj<< /Length ${Buffer.byteLength(stream)} >>stream\n${stream}endstream\nendobj\n`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += object;
  }
  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

/** Tiny PNG used for Azure OCR smoke when PDF has no raster layer. */
export function buildOcrSmokePng(): Uint8Array {
  // 1x1 white PNG
  return Uint8Array.from(Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  ));
}

export function writeProviderFixtures(packageDir: string): {
  digitalPdf: string;
  scannedPdf: string;
  ocrPng: string;
  checksum: string;
} {
  const dir = resolve(packageDir, "fixtures/providers");
  mkdirSync(dir, { recursive: true });
  const digital = buildDigitalEngineeringPdf([
    "SPEC-2002 Revision B",
    "Table 1 Nozzle Schedule",
    "Tag V-101-N1 Size 6 in Rating 150# Service Inlet",
    "Design pressure 16 bar g",
  ]);
  const scanned = buildScannedLikePdfPlaceholder();
  const ocrPngBytes = buildOcrSmokePng();
  const digitalPdf = resolve(dir, "table-heavy-digital.pdf");
  const scannedPdf = resolve(dir, "scanned-empty-text.pdf");
  const ocrPng = resolve(dir, "ocr-smoke.png");
  writeFileSync(digitalPdf, digital);
  writeFileSync(scannedPdf, scanned);
  writeFileSync(ocrPng, ocrPngBytes);
  const checksum = createHash("sha256")
    .update(Buffer.concat([Buffer.from(digital), Buffer.from(scanned), Buffer.from(ocrPngBytes)]))
    .digest("hex");
  return { digitalPdf, scannedPdf, ocrPng, checksum };
}
