import {
  DOCUMENT_METADATA_LOW_CONFIDENCE,
  proposeDocumentMetadataFromFilename,
  proposeDocumentMetadataFromText,
  type ProposedDocumentMetadata,
} from "@rtb/engineering-os";
import { NativeTextDocumentParser } from "./parser";
import { DocxDocumentParser, PdfDocumentParser } from "./native-parsers";

const EXTRACT_MAX_BYTES = 8 * 1024 * 1024;

export async function proposeDocumentMetadataFromSource(input: {
  fileName: string;
  mimeType: string;
  bytes?: Uint8Array;
}): Promise<ProposedDocumentMetadata> {
  const fromName = proposeDocumentMetadataFromFilename(input.fileName);
  if (!input.bytes || input.bytes.byteLength === 0) return fromName;
  if (input.bytes.byteLength > EXTRACT_MAX_BYTES) {
    return { ...fromName, provenance: "filename_size_limited" };
  }

  const parseInput = {
    engineeringDocumentId: "metadata-proposal",
    revision: "A",
    mimeType: input.mimeType,
    fileName: input.fileName,
    bytes: input.bytes,
  };

  try {
    if (input.mimeType === "text/plain") {
      const parsed = await new NativeTextDocumentParser().parse(parseInput);
      const text = parsed.pages.map((page) => page.text).join("\n");
      return proposeDocumentMetadataFromText(text, input.fileName);
    }
    if (input.mimeType === "application/pdf") {
      const parsed = await new PdfDocumentParser().parse(parseInput);
      const text = parsed.pages.map((page) => page.text).join("\n");
      if (parsed.confidence < DOCUMENT_METADATA_LOW_CONFIDENCE && !text.trim()) {
        return { ...fromName, confidence: parsed.confidence, lowConfidence: true, provenance: "pdf_low_text" };
      }
      const proposed = proposeDocumentMetadataFromText(text, input.fileName);
      return {
        ...proposed,
        confidence: Math.min(proposed.confidence, Math.max(parsed.confidence, proposed.confidence)),
        lowConfidence: proposed.lowConfidence || parsed.confidence < DOCUMENT_METADATA_LOW_CONFIDENCE,
      };
    }
    if (
      input.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const parsed = await new DocxDocumentParser().parse(parseInput);
      const text = parsed.pages.map((page) => page.text).join("\n");
      return proposeDocumentMetadataFromText(text, input.fileName);
    }
  } catch {
    return { ...fromName, provenance: "filename_parse_failed", lowConfidence: true };
  }

  return fromName;
}
