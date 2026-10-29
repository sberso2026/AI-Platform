/**
 * Phase 13C — Production SPACEGASSModelAdapter (fixture export federation).
 *
 * Federates SPACE GASS export fixtures (JSON) into EngineeringModelReference /
 * ElementReference / existing result references. No source-model mutation.
 * No analysis-model generation. Solver executable remains false at model layer.
 */

import { createHash, randomUUID } from "node:crypto";
import type { EngineeringModelAdapter } from "../engineering-model-adapter";
import type { EngineeringModelElementReference } from "../engineering-model-element-reference";
import type { EngineeringModelReference } from "../engineering-model-reference";
import type { EngineeringAnalysisResultReference } from "../result-reference";
import {
  SPACEGASS_ADAPTER_VERSION,
  SPACEGASS_DISPLAY_NAME,
  SPACEGASS_PROVIDER_KEY,
} from "./spacegass-version";

export const SPACEGASS_FEDERATION_ADAPTER_CAPABILITIES = {
  identifyModel: true,
  probeVersion: true,
  readMetadata: true,
  listElements: true,
  readElement: true,
  listAnalysisResults: true,
  readAnalysisResult: true,
  readGeometrySummary: false,
  readUnits: true,
  readMaterialsSummary: true,
  exportExchangeSnapshot: false,
  mutateModel: false,
  generateAnalysisModel: false,
} as const;

export type SpaceGassExportFixture = {
  format: string;
  formatVersion?: string;
  providerKey?: string;
  productVersionHint?: string;
  project: {
    externalModelId: string;
    displayName?: string;
    unitSystem?: string;
    unitCode?: string;
  };
  nodes?: Array<{ id: string; x: number; y: number; z: number }>;
  members?: Array<{
    id: string;
    nodeI: string;
    nodeJ: string;
    sectionId?: string;
    materialId?: string;
  }>;
  plates?: Array<{
    id: string;
    nodeIds: string[];
    thicknessMm?: number;
    materialId?: string;
  }>;
  supports?: Array<{ id: string; nodeId: string; restraint?: string }>;
  sections?: Array<{ id: string; name?: string; areaMm2?: number }>;
  materials?: Array<{
    id: string;
    name?: string;
    E?: number;
    nu?: number;
    density?: number;
  }>;
  memberGroups?: Array<{ id: string; name?: string; memberIds?: string[] }>;
  existingResults?: Array<{
    externalResultId: string;
    resultKind?: string;
    loadCase?: string;
    provenance?: string;
    summary?: Record<string, unknown>;
  }>;
};

export type SpaceGassParseResult =
  | {
      ok: true;
      fixture: SpaceGassExportFixture;
      contentSha256: string;
      byteLength: number;
    }
  | { ok: false; code: string; detail: string };

function nowIso() {
  return new Date().toISOString();
}

export function parseSpaceGassExportFixture(content: string): SpaceGassParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { ok: false, code: "invalid_spacegass_fixture_json", detail: "JSON parse failed" };
  }
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, code: "invalid_spacegass_fixture", detail: "Root must be object" };
  }
  const fixture = parsed as SpaceGassExportFixture;
  if (fixture.format !== "spacegass_export_fixture") {
    return {
      ok: false,
      code: "unsupported_spacegass_format",
      detail: `Expected spacegass_export_fixture, got ${String(fixture.format)}`,
    };
  }
  if (!fixture.project?.externalModelId) {
    return {
      ok: false,
      code: "missing_spacegass_external_model_id",
      detail: "project.externalModelId required",
    };
  }
  return {
    ok: true,
    fixture,
    contentSha256: createHash("sha256").update(content).digest("hex"),
    byteLength: Buffer.byteLength(content, "utf8"),
  };
}

function elementRef(input: {
  tenantId: string;
  workspaceId: string;
  modelRefId: string;
  externalElementId: string;
  elementKind: string;
  displayName?: string;
  sourceProperties?: Record<string, string | number | boolean | null>;
}): EngineeringModelElementReference {
  const ts = nowIso();
  return {
    kind: "engineering_model_element_reference",
    owner: "source_client_engineering_application",
    federationOwner: "engineering_model_interoperability",
    elementRefId: `emi_el_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    modelRefId: input.modelRefId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    externalElementId: input.externalElementId,
    elementKind: input.elementKind,
    displayName: input.displayName,
    sourceProperties: input.sourceProperties,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function listSpaceGassElementsFromFixture(input: {
  tenantId: string;
  workspaceId: string;
  modelRefId: string;
  fixture: SpaceGassExportFixture;
}): EngineeringModelElementReference[] {
  const out: EngineeringModelElementReference[] = [];
  for (const n of input.fixture.nodes ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: n.id,
        elementKind: "node",
        displayName: n.id,
        sourceProperties: { x: n.x, y: n.y, z: n.z },
      }),
    );
  }
  for (const m of input.fixture.members ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: m.id,
        elementKind: "member",
        displayName: m.id,
        sourceProperties: {
          nodeI: m.nodeI,
          nodeJ: m.nodeJ,
          sectionId: m.sectionId ?? null,
          materialId: m.materialId ?? null,
        },
      }),
    );
  }
  for (const p of input.fixture.plates ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: p.id,
        elementKind: "plate",
        displayName: p.id,
        sourceProperties: {
          nodeIds: p.nodeIds.join(","),
          thicknessMm: p.thicknessMm ?? null,
          materialId: p.materialId ?? null,
        },
      }),
    );
  }
  for (const s of input.fixture.supports ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: s.id,
        elementKind: "support",
        displayName: s.id,
        sourceProperties: { nodeId: s.nodeId, restraint: s.restraint ?? null },
      }),
    );
  }
  for (const sec of input.fixture.sections ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: sec.id,
        elementKind: "section",
        displayName: sec.name ?? sec.id,
        sourceProperties: { areaMm2: sec.areaMm2 ?? null },
      }),
    );
  }
  for (const mat of input.fixture.materials ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: mat.id,
        elementKind: "material",
        displayName: mat.name ?? mat.id,
        sourceProperties: {
          E: mat.E ?? null,
          nu: mat.nu ?? null,
          density: mat.density ?? null,
        },
      }),
    );
  }
  for (const g of input.fixture.memberGroups ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: g.id,
        elementKind: "member_group",
        displayName: g.name ?? g.id,
        sourceProperties: { memberIds: (g.memberIds ?? []).join(",") },
      }),
    );
  }
  return out;
}

export function listSpaceGassExistingResultsFromFixture(input: {
  tenantId: string;
  workspaceId: string;
  modelRefId: string;
  fixture: SpaceGassExportFixture;
}): EngineeringAnalysisResultReference[] {
  const ts = nowIso();
  return (input.fixture.existingResults ?? []).map((r) => ({
    kind: "engineering_analysis_result_reference" as const,
    owner: "source_client_engineering_application" as const,
    federationOwner: "engineering_model_interoperability" as const,
    resultRefId: `emi_res_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    modelRefId: input.modelRefId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    externalResultId: r.externalResultId,
    resultKind: r.resultKind,
    provenance: "external_existing" as const,
    rtbGenerated: false,
    trustClassification: "source_declared" as const,
    solverProviderId: SPACEGASS_PROVIDER_KEY,
    notes: r.loadCase ? `loadCase=${r.loadCase}` : undefined,
    createdAt: ts,
    updatedAt: ts,
  }));
}

export type SPACEGASSModelAdapter = EngineeringModelAdapter & {
  providerKey: typeof SPACEGASS_PROVIDER_KEY;
  status: "production";
  solverExecutable: false;
};

export function createSPACEGASSModelAdapter(input: {
  tenantId: string;
  workspaceId: string;
}): SPACEGASSModelAdapter {
  const { tenantId, workspaceId } = input;
  let lastFixture: SpaceGassExportFixture | undefined;
  let lastModelRefId: string | undefined;
  let cachedResults: EngineeringAnalysisResultReference[] = [];
  let cachedElements: EngineeringModelElementReference[] = [];

  const adapter: SPACEGASSModelAdapter = {
    adapterId: "spacegass_model_federation",
    providerKey: SPACEGASS_PROVIDER_KEY,
    displayName: SPACEGASS_DISPLAY_NAME,
    adapterVersion: SPACEGASS_ADAPTER_VERSION,
    status: "production",
    capabilities: SPACEGASS_FEDERATION_ADAPTER_CAPABILITIES,
    solverExecutable: false,
    async identifyModel({ locator, content }) {
      if (!content) throw new Error("spacegass_content_required");
      const parsed = parseSpaceGassExportFixture(content);
      if (!parsed.ok) throw new Error(`${parsed.code}:${parsed.detail}`);
      lastFixture = parsed.fixture;
      const ts = nowIso();
      const modelRefId = `emi_model_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
      lastModelRefId = modelRefId;
      cachedElements = listSpaceGassElementsFromFixture({
        tenantId,
        workspaceId,
        modelRefId,
        fixture: parsed.fixture,
      });
      cachedResults = listSpaceGassExistingResultsFromFixture({
        tenantId,
        workspaceId,
        modelRefId,
        fixture: parsed.fixture,
      });
      const model: EngineeringModelReference = {
        kind: "engineering_model_reference",
        owner: "source_client_engineering_application",
        federationOwner: "engineering_model_interoperability",
        modelRefId,
        tenantId,
        workspaceId,
        providerKey: SPACEGASS_PROVIDER_KEY,
        externalModelId: parsed.fixture.project.externalModelId,
        displayName: parsed.fixture.project.displayName,
        formatFamily: "native",
        status: "ingested",
        platformFileRef: locator,
        schemaHint: parsed.fixture.formatVersion ?? "spacegass_export_fixture",
        notes: "SPACE GASS export fixture federation — source-owned",
        rtbOwned: false,
        federated: true,
        version: 1,
        createdAt: ts,
        updatedAt: ts,
      };
      return model;
    },
    async probeVersion({ content }) {
      if (!content) return { versionText: "unknown", ok: false };
      const parsed = parseSpaceGassExportFixture(content);
      if (!parsed.ok) return { versionText: "invalid", ok: false };
      return {
        versionText: parsed.fixture.productVersionHint ?? "fixture",
        ok: true,
      };
    },
    async readMetadata({ content }) {
      const body = content;
      if (!body && !lastFixture) throw new Error("spacegass_content_required");
      const fixture =
        lastFixture ??
        (() => {
          const p = parseSpaceGassExportFixture(body!);
          if (!p.ok) throw new Error(`${p.code}:${p.detail}`);
          return p.fixture;
        })();
      return {
        providerKey: SPACEGASS_PROVIDER_KEY,
        externalModelId: fixture.project.externalModelId,
        unitSystem: fixture.project.unitSystem,
        unitCode: fixture.project.unitCode,
        nodeCount: fixture.nodes?.length ?? 0,
        memberCount: fixture.members?.length ?? 0,
        plateCount: fixture.plates?.length ?? 0,
        supportCount: fixture.supports?.length ?? 0,
        sectionCount: fixture.sections?.length ?? 0,
        materialCount: fixture.materials?.length ?? 0,
        memberGroupCount: fixture.memberGroups?.length ?? 0,
        existingResultCount: fixture.existingResults?.length ?? 0,
        federationFixture: true,
        hostedBinaryPresent: false,
      };
    },
    async listElements({ modelRef, content }) {
      if (cachedElements.length && modelRef.modelRefId === lastModelRefId) {
        return cachedElements;
      }
      if (!content) throw new Error("spacegass_content_required");
      const parsed = parseSpaceGassExportFixture(content);
      if (!parsed.ok) throw new Error(`${parsed.code}:${parsed.detail}`);
      return listSpaceGassElementsFromFixture({
        tenantId,
        workspaceId,
        modelRefId: modelRef.modelRefId,
        fixture: parsed.fixture,
      });
    },
    async readElement({ elementRef }) {
      return {
        externalElementId: elementRef.externalElementId,
        elementKind: elementRef.elementKind,
        displayName: elementRef.displayName,
        sourceProperties: elementRef.sourceProperties ?? {},
      };
    },
    async listAnalysisResults({ modelRef }) {
      if (cachedResults.length && modelRef.modelRefId === lastModelRefId) {
        return cachedResults;
      }
      return [];
    },
    async readAnalysisResult({ resultRef }) {
      if (
        resultRef.provenance === "external_existing" &&
        resultRef.trustClassification === "rtb_execution_certified"
      ) {
        throw new Error("spacegass_imported_result_cannot_be_rtb_execution_certified");
      }
      return {
        externalResultId: resultRef.externalResultId,
        resultKind: resultRef.resultKind,
        provenance: resultRef.provenance,
        trustClassification: resultRef.trustClassification,
        rtbGenerated: resultRef.rtbGenerated,
        existingExternalResult: resultRef.provenance === "external_existing",
      };
    },
  };
  return adapter;
}

/** Trust helper: SPACE GASS imported existing results never auto-claim RTB certification. */
export function trustForSpaceGassImportedResult(): "source_declared" {
  return "source_declared";
}

export function assertSpaceGassImportNotRtbCertified(
  trust: EngineeringAnalysisResultReference["trustClassification"],
): void {
  if (trust === "rtb_execution_certified") {
    throw new Error("spacegass_imported_result_cannot_be_rtb_execution_certified");
  }
}
