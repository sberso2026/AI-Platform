import { createHash } from "node:crypto";
import { parseEngineeringStructure } from "@rtb/engineering-os";
import type { ParsedBlock, ParsedDocument } from "./parser";
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

function structureMetadata(content: string, sectionPath?: string, page?: number): Record<string, unknown> {
  const nodes = parseEngineeringStructure(`${sectionPath ?? ""}\n${content}`, page ?? null);
  const first = nodes.find((node) => node.marker || (node.clauseNumber && node.kind !== "paragraph")) ?? nodes[0];
  return {
    clauseId: first?.id ?? null,
    parentClauseId: first?.parentId ?? null,
    completeness: first?.completeness ?? null,
    listMarker: first?.marker ?? null,
  };
}

function toBlockType(type: string): DocumentBlockType {
  if (type === "heading" || type === "paragraph" || type === "table" || type === "list" || type === "caption" || type === "image") {
    return type;
  }
  return "other";
}

function isAtomicEngineeringBlock(block: ParsedBlock): boolean {
  if (block.type === "other" && /[=≈≤≥]/.test(block.text) && block.text.length <= 400) return true;
  if (/^(?:note|notes|nb)[:.\s]/i.test(block.text.trim()) && block.text.length <= 800) return true;
  return false;
}

function figureMetadata(block: ParsedBlock): { number: string; caption: string; extra: Record<string, unknown> } | null {
  const match = block.text.match(/(?:figure|fig\.?)\s*([0-9]+(?:\.[0-9]+)*)\s*[:.\-–—]?\s*(.*)$/im);
  if (!match && block.type !== "image" && block.type !== "caption") return null;
  const number = match?.[1] ?? String(block.sectionPath ?? "").replace(/^Figure\s+/i, "").split(" ")[0] ?? "";
  const caption = (match?.[2] ?? block.sectionPath ?? "").trim();
  return {
    number,
    caption,
    extra: {
      nearbyText: block.text,
      sourcePage: block.page,
      interpretation: "caption_and_nearby_text",
      authoritativeStructuredData: false,
    },
  };
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

        if (block.type === "table" || block.type === "image" || block.type === "caption" || isAtomicEngineeringBlock(block)) {
          const content = block.text;
          const contentHash = hashContent(content);
          const figureMeta = figureMetadata(block);
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
            blockType: block.type === "table" ? "table" : toBlockType(block.type),
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
            metadata: {
              lineage: block.type === "table" ? "table_block" : figureMeta ? "figure_block" : "atomic_block",
              parserProvider: parsed.parserProvider,
              tenantId: context.tenantId,
              workspaceId: context.workspaceId,
              documentId: context.engineeringDocumentId,
              chunkId: `chunk-${chunkIndex}`,
              figureNumber: figureMeta?.number,
              figureCaption: figureMeta?.caption,
              figureAuthoritative: false,
              ...figureMeta?.extra,
              ...structureMetadata(content, block.sectionPath ?? currentSection, block.page ?? page.pageNumber),
            },
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
            metadata: {
              lineage: "text_block",
              parserProvider: parsed.parserProvider,
              tenantId: context.tenantId,
              workspaceId: context.workspaceId,
              documentId: context.engineeringDocumentId,
              chunkId: `chunk-${chunkIndex}`,
              ...structureMetadata(part, block.sectionPath ?? currentSection, block.page ?? page.pageNumber),
            },
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
