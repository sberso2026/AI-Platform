/**
 * Phase 13B — Production IFCModelAdapter (bounded STEP/IFC text extractor).
 *
 * Extracts federation metadata (GlobalId, IfcProject, storeys, structural types)
 * without geometry/viewer. Fail-closed on unsupported schema / malformed files.
 * Unsupported entity types are recorded as limitations (not silently discarded).
 */

import { createHash, randomUUID } from "node:crypto";
import {
  IFC_FEDERATION_ADAPTER_CAPABILITIES,
  type EngineeringModelAdapter,
} from "./engineering-model-adapter";
import type { EngineeringModelElementReference } from "./engineering-model-element-reference";
import type { EngineeringModelReference } from "./engineering-model-reference";
import {
  assertContentSizeSafe,
  assertElementCountSafe,
  assertEntityLineCountSafe,
  isParseTimedOut,
  LARGE_MODEL_SAFETY_LIMITS,
} from "./large-model-safety";
import {
  assertParserGovernance,
  getPinnedParserDeclaration,
  type IfcSchemaId,
} from "./parser-governance";

const INDEXED_ENTITY_TYPES = [
  "IFCPROJECT",
  "IFCSITE",
  "IFCBUILDING",
  "IFCBUILDINGSTOREY",
  "IFCSPACE",
  "IFCBEAM",
  "IFCCOLUMN",
  "IFCMEMBER",
  "IFCSLAB",
  "IFCWALL",
  "IFCWALLSTANDARDCASE",
  "IFCFOOTING",
  "IFCPILE",
  "IFCROOF",
  "IFCDOOR",
  "IFCWINDOW",
  "IFCPLATE",
  "IFCRAILING",
  "IFCSTAIR",
  "IFCFURNISHINGELEMENT",
  "IFCPROXY",
] as const;

export type IfcParseLimitation = {
  entityType: string;
  count: number;
  reason: "not_indexed_for_federation" | "truncated_sample";
};

export type IfcFederationParseResult = {
  ok: true;
  schemaId: IfcSchemaId;
  parser: ReturnType<typeof getPinnedParserDeclaration>;
  projectName?: string;
  storeys: string[];
  elements: Array<{
    externalElementId: string;
    globalId?: string;
    ifcEntityType: string;
    displayName?: string;
    storeyName?: string;
  }>;
  unsupportedEntities: IfcParseLimitation[];
  contentSha256: string;
  byteLength: number;
};

export type IfcFederationParseFailure = {
  ok: false;
  code: string;
  detail: string;
};

const ENTITY_LINE_RE =
  /^#(\d+)\s*=\s*([A-Z0-9_]+)\s*\((.*)\)\s*;?\s*$/i;

function extractQuotedStrings(args: string): string[] {
  const out: string[] = [];
  const re = /'([^']*)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(args)) !== null) out.push(m[1]);
  return out;
}

function looksLikeGlobalId(value: string | undefined): boolean {
  if (!value) return false;
  return /^[0-9A-Za-z_$]{22}$/.test(value);
}

export function parseIfcFederationContent(
  content: string,
): IfcFederationParseResult | IfcFederationParseFailure {
  const started = Date.now();
  const size = assertContentSizeSafe(content);
  if (!size.ok) {
    return { ok: false, code: size.code ?? "content_too_large", detail: size.detail ?? "" };
  }

  const gov = assertParserGovernance({ content });
  if (!gov.ok) {
    return { ok: false, code: gov.code, detail: gov.detail };
  }

  const lines = content.split(/\r?\n/);
  const lineCheck = assertEntityLineCountSafe(lines.length);
  if (!lineCheck.ok) {
    return {
      ok: false,
      code: lineCheck.code ?? "entity_line_count_exceeded",
      detail: lineCheck.detail ?? "",
    };
  }

  const indexed = new Set<string>(INDEXED_ENTITY_TYPES);
  const unsupportedCounts = new Map<string, number>();
  const elements: IfcFederationParseResult["elements"] = [];
  const storeys: string[] = [];
  let projectName: string | undefined;

  for (const rawLine of lines) {
    if (isParseTimedOut(started)) {
      return {
        ok: false,
        code: "parse_timeout",
        detail: `Exceeded ${LARGE_MODEL_SAFETY_LIMITS.maxParseDurationMs}ms`,
      };
    }
    const line = rawLine.trim();
    if (!line.startsWith("#")) continue;
    const m = line.match(ENTITY_LINE_RE);
    if (!m) continue;
    const entityId = m[1];
    const entityType = m[2].toUpperCase();
    const args = m[3];
    if (!indexed.has(entityType)) {
      if (
        entityType.startsWith("IFC") &&
        !entityType.includes("OWNERHISTORY") &&
        !entityType.includes("DIRECTION") &&
        !entityType.includes("CARTESIAN") &&
        !entityType.includes("PLACEMENT") &&
        !entityType.includes("REPRESENTATION") &&
        !entityType.includes("PROPERTY") &&
        !entityType.includes("REL")
      ) {
        unsupportedCounts.set(
          entityType,
          (unsupportedCounts.get(entityType) ?? 0) + 1,
        );
      }
      continue;
    }

    const quoted = extractQuotedStrings(args);
    const globalId = quoted.find(looksLikeGlobalId) ?? quoted[0];
    const name =
      quoted.find((q) => q && !looksLikeGlobalId(q) && q !== "$") ?? undefined;

    if (entityType === "IFCPROJECT") {
      projectName = name ?? projectName;
    }
    if (entityType === "IFCBUILDINGSTOREY" && name) {
      storeys.push(name);
    }

    elements.push({
      externalElementId: `ifc#${entityId}`,
      globalId: looksLikeGlobalId(globalId) ? globalId : undefined,
      ifcEntityType: entityType,
      displayName: name,
      storeyName:
        entityType === "IFCBUILDINGSTOREY" ? name : undefined,
    });
  }

  const countCheck = assertElementCountSafe(elements.length);
  if (!countCheck.ok) {
    return {
      ok: false,
      code: countCheck.code ?? "element_count_exceeded",
      detail: countCheck.detail ?? "",
    };
  }

  const unsupportedEntities: IfcParseLimitation[] = [...unsupportedCounts.entries()]
    .slice(0, LARGE_MODEL_SAFETY_LIMITS.maxUnsupportedEntitySamples)
    .map(([entityType, count]) => ({
      entityType,
      count,
      reason: "not_indexed_for_federation" as const,
    }));

  return {
    ok: true,
    schemaId: gov.schemaId,
    parser: getPinnedParserDeclaration(),
    projectName,
    storeys,
    elements,
    unsupportedEntities,
    contentSha256: createHash("sha256").update(content, "utf8").digest("hex"),
    byteLength: size.byteLength,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export type IFCModelAdapterOptions = {
  tenantId: string;
  workspaceId: string;
};

export class IFCModelAdapter implements EngineeringModelAdapter {
  readonly adapterId = "ifc_openbim_federation";
  readonly providerKey = "ifc_openbim";
  readonly displayName = "IFC / openBIM Federation Adapter";
  readonly adapterVersion = "0.2.0-ifc-federation";
  readonly status = "production" as const;
  readonly capabilities = IFC_FEDERATION_ADAPTER_CAPABILITIES;
  readonly solverExecutable = false as const;

  constructor(private readonly options: IFCModelAdapterOptions) {}

  async identifyModel(input: {
    locator: string;
    content?: string;
  }): Promise<EngineeringModelReference> {
    if (!input.content) {
      throw new Error("ifc_content_required");
    }
    const parsed = parseIfcFederationContent(input.content);
    if (!parsed.ok) {
      throw new Error(`${parsed.code}:${parsed.detail}`);
    }
    const ts = nowIso();
    return {
      kind: "engineering_model_reference",
      owner: "source_client_engineering_application",
      federationOwner: "engineering_model_interoperability",
      modelRefId: newId("emi_model"),
      tenantId: this.options.tenantId,
      workspaceId: this.options.workspaceId,
      providerKey: this.providerKey,
      externalModelId: input.locator,
      displayName: parsed.projectName ?? input.locator,
      formatFamily: "ifc",
      status: "ingested",
      platformFileRef: input.locator.startsWith("platform_files:")
        ? input.locator
        : undefined,
      schemaHint: parsed.schemaId,
      rtbOwned: false,
      federated: true,
      version: 1,
      createdAt: ts,
      updatedAt: ts,
    };
  }

  async probeVersion(input: {
    modelRef: EngineeringModelReference;
    content?: string;
  }): Promise<{ versionText: string; ok: boolean }> {
    if (!input.content) {
      return { versionText: input.modelRef.schemaHint ?? "unknown", ok: false };
    }
    const parsed = parseIfcFederationContent(input.content);
    if (!parsed.ok) return { versionText: parsed.code, ok: false };
    return { versionText: parsed.schemaId, ok: true };
  }

  async readMetadata(input: {
    modelRef: EngineeringModelReference;
    content?: string;
  }): Promise<Record<string, unknown>> {
    if (!input.content) throw new Error("ifc_content_required");
    const parsed = parseIfcFederationContent(input.content);
    if (!parsed.ok) throw new Error(`${parsed.code}:${parsed.detail}`);
    return {
      schemaId: parsed.schemaId,
      projectName: parsed.projectName,
      storeys: parsed.storeys,
      elementCount: parsed.elements.length,
      unsupportedEntities: parsed.unsupportedEntities,
      contentSha256: parsed.contentSha256,
      parser: parsed.parser,
      ownership: "source_client_engineering_application",
      rtbOwned: false,
      fullBimViewerImplemented: false,
      geometryExtracted: false,
    };
  }

  async listElements(input: {
    modelRef: EngineeringModelReference;
    content?: string;
  }): Promise<EngineeringModelElementReference[]> {
    if (!input.content) throw new Error("ifc_content_required");
    const parsed = parseIfcFederationContent(input.content);
    if (!parsed.ok) throw new Error(`${parsed.code}:${parsed.detail}`);
    const ts = nowIso();
    return parsed.elements.map((el) => ({
      kind: "engineering_model_element_reference" as const,
      owner: "source_client_engineering_application" as const,
      federationOwner: "engineering_model_interoperability" as const,
      elementRefId: newId("emi_el"),
      modelRefId: input.modelRef.modelRefId,
      tenantId: this.options.tenantId,
      workspaceId: this.options.workspaceId,
      externalElementId: el.externalElementId,
      globalId: el.globalId,
      elementKind: el.ifcEntityType,
      ifcEntityType: el.ifcEntityType,
      displayName: el.displayName,
      storeyName: el.storeyName,
      createdAt: ts,
      updatedAt: ts,
    }));
  }

  async readElement(input: {
    elementRef: EngineeringModelElementReference;
  }): Promise<Record<string, unknown>> {
    return {
      elementRefId: input.elementRef.elementRefId,
      externalElementId: input.elementRef.externalElementId,
      globalId: input.elementRef.globalId,
      ifcEntityType: input.elementRef.ifcEntityType,
      displayName: input.elementRef.displayName,
      ownership: "source_client_engineering_application",
      geometryAvailable: false,
    };
  }
}

export function createIFCModelAdapter(
  options: IFCModelAdapterOptions,
): IFCModelAdapter {
  return new IFCModelAdapter(options);
}
