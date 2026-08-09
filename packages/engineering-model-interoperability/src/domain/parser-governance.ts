/**
 * Phase 13B — IFC parser governance (pin version, schemas, fail-closed, limits).
 */

import {
  IFC_PARSER_IMPLEMENTATION,
  IFC_PARSER_VERSION,
  IFC_SUPPORTED_SCHEMAS,
} from "../version";

export const PINNED_IFC_PARSER = {
  implementation: IFC_PARSER_IMPLEMENTATION,
  version: IFC_PARSER_VERSION,
  supportedSchemas: IFC_SUPPORTED_SCHEMAS,
  failClosed: true as const,
  geometryExtractionEnabled: false as const,
  viewerEnabled: false as const,
} as const;

export type IfcSchemaId = (typeof IFC_SUPPORTED_SCHEMAS)[number];

export type ParserGovernanceDecision =
  | { ok: true; schemaId: IfcSchemaId }
  | {
      ok: false;
      code:
        | "unsupported_schema"
        | "missing_schema"
        | "malformed_header"
        | "empty_content"
        | "limit_exceeded";
      detail: string;
    };

const SCHEMA_ALIASES: Record<string, IfcSchemaId> = {
  IFC2X3: "IFC2X3",
  "IFC2X3 TC1": "IFC2X3",
  IFC4: "IFC4",
  "IFC4 ADD2": "IFC4",
  "IFC4 ADD2 TC1": "IFC4",
  IFC4X3: "IFC4X3",
  "IFC4X3 ADD2": "IFC4X3",
};

export function normalizeIfcSchemaId(raw: string): IfcSchemaId | null {
  const cleaned = raw.replace(/['"]/g, "").trim().toUpperCase();
  if ((IFC_SUPPORTED_SCHEMAS as readonly string[]).includes(cleaned)) {
    return cleaned as IfcSchemaId;
  }
  for (const [alias, id] of Object.entries(SCHEMA_ALIASES)) {
    if (cleaned === alias.toUpperCase() || cleaned.startsWith(alias.toUpperCase())) {
      return id;
    }
  }
  return null;
}

export function assertParserGovernance(input: {
  content: string;
  declaredSchema?: string;
}): ParserGovernanceDecision {
  if (!input.content || !input.content.trim()) {
    return { ok: false, code: "empty_content", detail: "IFC content is empty" };
  }
  if (!/ISO-10303-21\s*;/i.test(input.content) && !/HEADER\s*;/i.test(input.content)) {
    return {
      ok: false,
      code: "malformed_header",
      detail: "Missing STEP/IFC HEADER (ISO-10303-21)",
    };
  }

  const schemaMatch =
    input.content.match(/FILE_SCHEMA\s*\(\s*\(\s*'([^']+)'/i) ??
    input.content.match(/FILE_SCHEMA\s*\(\s*\(\s*"([^"]+)"/i);
  const rawSchema = input.declaredSchema ?? schemaMatch?.[1];
  if (!rawSchema) {
    return {
      ok: false,
      code: "missing_schema",
      detail: "FILE_SCHEMA not found; fail-closed",
    };
  }
  const schemaId = normalizeIfcSchemaId(rawSchema);
  if (!schemaId) {
    return {
      ok: false,
      code: "unsupported_schema",
      detail: `Unsupported IFC schema: ${rawSchema}`,
    };
  }
  return { ok: true, schemaId };
}

export function getPinnedParserDeclaration() {
  return { ...PINNED_IFC_PARSER };
}
