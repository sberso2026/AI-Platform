import { createHash } from "node:crypto";
import type { ParsedDocument } from "./parser";
import type { DocumentBlockType, DocumentChunk } from "./types";
import { DocumentIntelligenceError } from "./errors";

export interface ChunkingContext {
  tenantId: string;
  workspaceId: string;
  engineeringProjectId?: string;
  engineeringDocumentId: string;
  revision: string;
  processingVersion: string;
  maxChars?: number;
  overlapChars?: number;
}

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function stableId(documentId: string, revision: string, processingVersion: string, index: number, contentHash: string): string {
  return createHash("sha256")
    .update(`${documentId}|${revision}|${processingVersion}|${index}|${contentHash}`)
    .digest("hex")
    .slice(0, 32);
}

function toBlockType(type: string): DocumentBlockType {
  if (type === "heading" || type === "paragraph" || type === "table" || type === "list" || type === "caption" || type === "image") {
    return type;
  }
  return "other";
}

function splitWithOverlap(text: string, maxChars: number, overlapChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const parts: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(text.length, start + maxChars);
    parts.push(text.slice(start, end));
    if (end >= text.length) break;
    start = Math.max(0, end - overlapChars);
  }
  return parts;
}

/**
 * Deterministic section/page-aware chunker. Table blocks are never split.
 */
export function chunkParsedDocument(parsed: ParsedDocument, context: ChunkingContext): DocumentChunk[] {
  const maxChars = context.maxChars ?? 1200;
  const overlapChars = context.overlapChars ?? 120;
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;
  let currentSection: string | undefined;

  try {
    for (const page of parsed.pages) {
      for (const block of page.blocks) {
        if (block.type === "heading" && block.text.trim()) {
          currentSection = block.text.trim();
        }

        if (block.type === "table") {
          const content = block.text;
          const contentHash = hashContent(content);
          chunks.push({
            id: `chunk-${chunkIndex}`,
            engineeringDocumentId: context.engineeringDocumentId,
            revision: context.revision,
            processingVersion: context.processingVersion,
            chunkIndex,
            stableChunkId: stableId(context.engineeringDocumentId, context.revision, context.processingVersion, chunkIndex, contentHash),
            content,
            contentHash,
            sectionPath: block.sectionPath ?? currentSection,
            pageStart: block.page ?? page.pageNumber,
            pageEnd: block.page ?? page.pageNumber,
            blockType: "table",
            tablePayload: block.table
              ? {
                  title: block.table.title,
                  headers: [...block.table.headers],
                  rows: block.table.rows.map((row) => [...row]),
                  footnotes: block.table.footnotes ? [...block.table.footnotes] : undefined,
                }
              : undefined,
            tenantId: context.tenantId,
            workspaceId: context.workspaceId,
            engineeringProjectId: context.engineeringProjectId,
            metadata: { lineage: "table_block", parserProvider: parsed.parserProvider },
          });
          chunkIndex += 1;
          continue;
        }

        const parts = splitWithOverlap(block.text, maxChars, overlapChars);
        for (const part of parts) {
          const contentHash = hashContent(part);
          chunks.push({
            id: `chunk-${chunkIndex}`,
            engineeringDocumentId: context.engineeringDocumentId,
            revision: context.revision,
            processingVersion: context.processingVersion,
            chunkIndex,
            stableChunkId: stableId(context.engineeringDocumentId, context.revision, context.processingVersion, chunkIndex, contentHash),
            content: part,
            contentHash,
            sectionPath: block.sectionPath ?? currentSection,
            pageStart: block.page ?? page.pageNumber,
            pageEnd: block.page ?? page.pageNumber,
            blockType: toBlockType(block.type),
            tenantId: context.tenantId,
            workspaceId: context.workspaceId,
            engineeringProjectId: context.engineeringProjectId,
            metadata: { lineage: "text_block", parserProvider: parsed.parserProvider },
          });
          chunkIndex += 1;
        }
      }
    }
  } catch (error) {
    throw new DocumentIntelligenceError(
      "document_chunking_failed",
      "Failed to chunk parsed document",
      500,
      { cause: error instanceof Error ? error.message : String(error) },
    );
  }

  return chunks;
}
