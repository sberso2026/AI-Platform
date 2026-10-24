/**
 * Phase 13E — Production ETABSModelAdapter (fixture / export federation).
 *
 * Federates ETABS export fixtures (JSON) into EngineeringModelReference /
 * ElementReference / existing result references. Labeled export federation —
 * NOT live native COM. No source-model mutation. No analysis-model generation.
 */

import { createHash, randomUUID } from "node:crypto";
import type { EngineeringModelAdapter } from "../engineering-model-adapter";
import type { EngineeringModelElementReference } from "../engineering-model-element-reference";
import type { EngineeringModelReference } from "../engineering-model-reference";
import type { EngineeringAnalysisResultReference } from "../result-reference";
import {
  ETABS_ADAPTER_VERSION,
  ETABS_DISPLAY_NAME,
  ETABS_PROVIDER_KEY,
} from "./etabs-version";

export const ETABS_FEDERATION_ADAPTER_CAPABILITIES = {
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

export type EtabsExportFixture = {
  format: string;
  formatVersion?: string;
  providerKey?: string;
  productVersionHint?: string;
  federationPath?: string;
  project: {
    externalModelId: string;
    displayName?: string;
    unitSystem?: string;
    unitCode?: string;
  };
  joints?: Array<{ id: string; x: number; y: number; z: number }>;
  frames?: Array<{
    id: string;
    jointI: string;
    jointJ: string;
    sectionId?: string;
    materialId?: string;
  }>;
  areas?: Array<{
    id: string;
    jointIds: string[];
    thicknessMm?: number;
    materialId?: string;
  }>;
  links?: Array<{
    id: string;
    jointI: string;
    jointJ: string;
    linkPropertyId?: string;
  }>;
  stories?: Array<{ id: string; name?: string; elevationMm?: number }>;
  sections?: Array<{ id: string; name?: string; areaMm2?: number }>;
  materials?: Array<{
    id: string;
    name?: string;
    E?: number;
    nu?: number;
    density?: number;
  }>;
  groups?: Array<{ id: string; name?: string; memberIds?: string[] }>;
  loadPatterns?: Array<{ id: string; name?: string; type?: string }>;
  loadCases?: Array<{ id: string; name?: string; patternId?: string }>;
  combinations?: Array<{ id: string; name?: string; caseIds?: string[] }>;
  existingResults?: Array<{
    externalResultId: string;
    resultKind?: string;
    loadCase?: string;
    provenance?: string;
    summary?: Record<string, unknown>;
  }>;
};

export type EtabsParseResult =
  | {
      ok: true;
      fixture: EtabsExportFixture;
      contentSha256: string;
      byteLength: number;
    }
  | { ok: false; code: string; detail: string };

function nowIso() {
  return new Date().toISOString();
}

export function parseEtabsExportFixture(content: string): EtabsParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { ok: false, code: "invalid_etabs_fixture_json", detail: "JSON parse failed" };
  }
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, code: "invalid_etabs_fixture", detail: "Root must be object" };
  }
  const fixture = parsed as EtabsExportFixture;
  if (fixture.format !== "etabs_export_fixture") {
    return {
      ok: false,
      code: "unsupported_etabs_format",
      detail: `Expected etabs_export_fixture, got ${String(fixture.format)}`,
    };
  }
  if (!fixture.project?.externalModelId) {
    return {
      ok: false,
      code: "missing_etabs_external_model_id",
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

export function listEtabsElementsFromFixture(input: {
  tenantId: string;
  workspaceId: string;
  modelRefId: string;
  fixture: EtabsExportFixture;
}): EngineeringModelElementReference[] {
  const out: EngineeringModelElementReference[] = [];
  for (const j of input.fixture.joints ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: j.id,
        elementKind: "joint",
        displayName: j.id,
        sourceProperties: { x: j.x, y: j.y, z: j.z },
      }),
    );
  }
  for (const f of input.fixture.frames ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: f.id,
        elementKind: "frame",
        displayName: f.id,
        sourceProperties: {
          jointI: f.jointI,
          jointJ: f.jointJ,
          sectionId: f.sectionId ?? null,
          materialId: f.materialId ?? null,
        },
      }),
    );
  }
  for (const a of input.fixture.areas ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: a.id,
        elementKind: "area",
        displayName: a.id,
        sourceProperties: {
          jointIds: a.jointIds.join(","),
          thicknessMm: a.thicknessMm ?? null,
          materialId: a.materialId ?? null,
        },
      }),
    );
  }
  for (const l of input.fixture.links ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: l.id,
        elementKind: "link",
        displayName: l.id,
        sourceProperties: {
          jointI: l.jointI,
          jointJ: l.jointJ,
          linkPropertyId: l.linkPropertyId ?? null,
        },
      }),
    );
  }
  for (const s of input.fixture.stories ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: s.id,
        elementKind: "story",
        displayName: s.name ?? s.id,
        sourceProperties: { elevationMm: s.elevationMm ?? null },
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
  for (const g of input.fixture.groups ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: g.id,
        elementKind: "group",
        displayName: g.name ?? g.id,
        sourceProperties: { memberIds: (g.memberIds ?? []).join(",") },
      }),
    );
  }
  for (const lp of input.fixture.loadPatterns ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: lp.id,
        elementKind: "load_pattern",
        displayName: lp.name ?? lp.id,
        sourceProperties: { type: lp.type ?? null },
      }),
    );
  }
  for (const lc of input.fixture.loadCases ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: lc.id,
        elementKind: "load_case",
        displayName: lc.name ?? lc.id,
        sourceProperties: { patternId: lc.patternId ?? null },
      }),
    );
  }
  for (const c of input.fixture.combinations ?? []) {
    out.push(
      elementRef({
        ...input,
        externalElementId: c.id,
        elementKind: "combination",
        displayName: c.name ?? c.id,
        sourceProperties: { caseIds: (c.caseIds ?? []).join(",") },
      }),
    );
  }
  return out;
}

export function listEtabsExistingResultsFromFixture(input: {
  tenantId: string;
  workspaceId: string;
  modelRefId: string;
  fixture: EtabsExportFixture;
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
    solverProviderId: ETABS_PROVIDER_KEY,
    notes: r.loadCase
      ? `loadCase=${r.loadCase};export_federation=true;live_native_com=false`
      : "export_federation=true;live_native_com=false",
    createdAt: ts,
    updatedAt: ts,
  }));
}

export type ETABSModelAdapter = EngineeringModelAdapter & {
  providerKey: typeof ETABS_PROVIDER_KEY;
  status: "production";
  solverExecutable: false;
  federationPath: "export_fixture";
  liveNativeCom: false;
};

export function createETABSModelAdapter(input: {
  tenantId: string;
  workspaceId: string;
}): ETABSModelAdapter {
  const { tenantId, workspaceId } = input;
  let lastFixture: EtabsExportFixture | undefined;
  let lastModelRefId: string | undefined;
  let cachedResults: EngineeringAnalysisResultReference[] = [];
  let cachedElements: EngineeringModelElementReference[] = [];

  const adapter: ETABSModelAdapter = {
    adapterId: "etabs_model_federation",
    providerKey: ETABS_PROVIDER_KEY,
    displayName: ETABS_DISPLAY_NAME,
    adapterVersion: ETABS_ADAPTER_VERSION,
    status: "production",
    capabilities: ETABS_FEDERATION_ADAPTER_CAPABILITIES,
    solverExecutable: false,
    federationPath: "export_fixture",
    liveNativeCom: false,
    async identifyModel({ locator, content }) {
      if (!content) throw new Error("etabs_content_required");
      const parsed = parseEtabsExportFixture(content);
      if (!parsed.ok) throw new Error(`${parsed.code}:${parsed.detail}`);
      lastFixture = parsed.fixture;
      const ts = nowIso();
      const modelRefId = `emi_model_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
      lastModelRefId = modelRefId;
      cachedElements = listEtabsElementsFromFixture({
        tenantId,
        workspaceId,
        modelRefId,
        fixture: parsed.fixture,
      });
      cachedResults = listEtabsExistingResultsFromFixture({
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
        providerKey: ETABS_PROVIDER_KEY,
        externalModelId: parsed.fixture.project.externalModelId,
        displayName: parsed.fixture.project.displayName,
        formatFamily: "native",
        status: "ingested",
        platformFileRef: locator,
        schemaHint: parsed.fixture.formatVersion ?? "etabs_export_fixture",
        notes:
          "ETABS export fixture federation — source-owned; NOT live native COM",
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
      const parsed = parseEtabsExportFixture(content);
      if (!parsed.ok) return { versionText: "invalid", ok: false };
      return {
        versionText: parsed.fixture.productVersionHint ?? "fixture",
        ok: true,
      };
    },
    async readMetadata({ content }) {
      const body = content;
      if (!body && !lastFixture) throw new Error("etabs_content_required");
      const fixture =
        lastFixture ??
        (() => {
          const p = parseEtabsExportFixture(body!);
          if (!p.ok) throw new Error(`${p.code}:${p.detail}`);
          return p.fixture;
        })();
      return {
        providerKey: ETABS_PROVIDER_KEY,
        externalModelId: fixture.project.externalModelId,
        unitSystem: fixture.project.unitSystem,
        unitCode: fixture.project.unitCode,
        jointCount: fixture.joints?.length ?? 0,
        frameCount: fixture.frames?.length ?? 0,
        areaCount: fixture.areas?.length ?? 0,
        linkCount: fixture.links?.length ?? 0,
        storyCount: fixture.stories?.length ?? 0,
        sectionCount: fixture.sections?.length ?? 0,
        materialCount: fixture.materials?.length ?? 0,
        groupCount: fixture.groups?.length ?? 0,
        loadPatternCount: fixture.loadPatterns?.length ?? 0,
        loadCaseCount: fixture.loadCases?.length ?? 0,
        combinationCount: fixture.combinations?.length ?? 0,
        existingResultCount: fixture.existingResults?.length ?? 0,
        federationFixture: true,
        federationPath: "export_fixture",
        liveNativeCom: false,
        hostedBinaryPresent: false,
      };
    },
    async listElements({ modelRef, content }) {
      if (cachedElements.length && modelRef.modelRefId === lastModelRefId) {
        return cachedElements;
      }
      if (!content) throw new Error("etabs_content_required");
      const parsed = parseEtabsExportFixture(content);
      if (!parsed.ok) throw new Error(`${parsed.code}:${parsed.detail}`);
      return listEtabsElementsFromFixture({
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
        throw new Error("etabs_imported_result_cannot_be_rtb_execution_certified");
      }
      return {
        externalResultId: resultRef.externalResultId,
        resultKind: resultRef.resultKind,
        provenance: resultRef.provenance,
        trustClassification: resultRef.trustClassification,
        rtbGenerated: resultRef.rtbGenerated,
        existingExternalResult: resultRef.provenance === "external_existing",
        exportFederation: true,
        liveNativeCom: false,
      };
    },
  };
  return adapter;
}

export function trustForEtabsImportedResult(): "source_declared" {
  return "source_declared";
}

export function assertEtabsImportNotRtbCertified(
  trust: EngineeringAnalysisResultReference["trustClassification"],
): void {
  if (trust === "rtb_execution_certified") {
    throw new Error("etabs_imported_result_cannot_be_rtb_execution_certified");
  }
}
