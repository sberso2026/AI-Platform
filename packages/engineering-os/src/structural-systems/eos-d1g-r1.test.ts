import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_PROVIDER_OBJECT_MAPPING_CAN_GOVERN,
  C10_VALIDATION_LANE_STATUS,
  COMMERCIAL_PROVIDER_CONNECTOR_COUNT,
  D1F_GENERAL_STEEL_SYSTEM_ORCHESTRATION_IMPLEMENTED,
  D1F_R3_STEEL_SYSTEM_DISPATCH_SCOPE,
  D1G_R1_ADAPTER_CAN_BYPASS_D1F_NORMALIZATION,
  D1G_R1_ADAPTER_CAN_BYPASS_D1F_RESULT_AUTHORITY,
  D1G_R1_ADAPTER_CAN_CREATE_DESIGN_INPUT_DIRECTLY,
  D1G_R1_ADAPTER_INGESTION_AUTO_PROMOTES_VERIFIED_GOVERNED,
  D1G_R1_COMMERCIAL_SOLVER_INTEGRATED,
  D1G_R1_ETABS_CONNECTOR_IMPLEMENTED,
  D1G_R1_EXTERNAL_NETWORK_CALL_IMPLEMENTED,
  D1G_R1_FIXTURE_PROVIDER_STRUCTURAL_SOLVER,
  D1G_R1_MATURITY_STATE,
  D1G_R1_MEMBER_DESIGN_EXECUTION_ADDED,
  D1G_R1_MEMBER_FORCE_CALCULATED,
  D1G_R1_NAN_CAN_GOVERN,
  D1G_R1_PROVIDER_NAME_DEFINES_UNITS,
  D1G_R1_QUANTITY_NAME_ALONE_DEFINES_SEMANTICS,
  D1G_R1_ROBOT_CONNECTOR_IMPLEMENTED,
  D1G_R1_SAP2000_CONNECTOR_IMPLEMENTED,
  D1G_R1_SPACEGASS_CONNECTOR_IMPLEMENTED,
  D1G_R1_STAAD_CONNECTOR_IMPLEMENTED,
  D1G_R1_SUPPORT_REACTION_CALCULATED,
  D1G_R2_HANDOFF_READY,
  FIXTURE_PROVIDER_COUNT,
  PROVIDER_NEUTRAL_ADAPTER_RUNTIME_COUNT,
  SOLVER_ADAPTER_EQUALS_RESULT_AUTHORITY,
  STRUCTURAL_SOLVER_EXECUTION_COUNT,
  type D1gR1AdapterRequest,
  type D1gR1ProviderResult,
} from "@rtb/types";
import {
  assessAdapterConformance,
  createD1gFixtureSolverRequest,
  executeProviderNeutralAdapter,
  negotiateAdapterCapabilities,
  recordSuccessorAdapterExecution,
} from "./index";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

function request(): D1gR1AdapterRequest {
  return structuredClone(createD1gFixtureSolverRequest());
}

function run(next: D1gR1AdapterRequest = request()) {
  return executeProviderNeutralAdapter(next);
}

function member(execution: ReturnType<typeof run>, designMemberId: string) {
  return execution.handoffs.find((row) => row.input.designMemberId === designMemberId);
}

function canonical(execution: ReturnType<typeof run>, designMemberId: string, quantity: string) {
  return member(execution, designMemberId)?.binding.canonicalActions.find((row) => row.quantity === quantity);
}

function providerResult(partial: Partial<D1gR1ProviderResult> & Pick<D1gR1ProviderResult, "providerResultId" | "providerObjectId">): D1gR1ProviderResult {
  return {
    providerCategory: "MEMBER_END_ACTION",
    providerQuantityName: "P_AX",
    value: 1,
    explicitZero: false,
    unit: "kN",
    coordinateSystemRef: "FIXTURE_GLOBAL_V1",
    signConventionRef: "FIXTURE_SIGN_V1",
    location: "START",
    stationValue: null,
    stationUnit: null,
    stationOrigin: null,
    stationOrientation: null,
    providerCaseId: null,
    providerCombinationId: "COM-1",
    ...partial,
  };
}

describe("EOS-D1G-R1 provider-neutral solver adapter", () => {
  it("transports a deterministic fixture through D1F normalization without solving or promoting maturity", () => {
    const source = request();
    const snapshot = JSON.stringify(source.source);
    const execution = run(source);
    expect(JSON.stringify(source.source)).toBe(snapshot);
    expect(execution.rawSourceMutated).toBe(false);
    expect(execution.canGovern).toBe(true);
    expect(execution.completeness).toBe("COMPLETE_FOR_DECLARED_ADAPTER_SCOPE");
    expect(execution.governedTopologyCreated).toBe(false);
    expect(execution.memberForceCalculated).toBe(D1G_R1_MEMBER_FORCE_CALCULATED);
    expect(execution.supportReactionCalculated).toBe(D1G_R1_SUPPORT_REACTION_CALCULATED);
    expect(execution.autoPromotedVerifiedGoverned).toBe(false);
    expect(canonical(execution, "design-1", "N")?.value).toBe(-12500);
    expect(canonical(execution, "design-1", "V_MAJOR")?.value).toBe(-3000);
    expect(canonical(execution, "design-1", "M_MAJOR")?.value).toBe(4000);
    expect(canonical(execution, "design-1", "T")?.explicitZero).toBe(true);
    expect(canonical(execution, "design-1", "T")?.value).toBe(0);
    expect(canonical(execution, "design-1", "V_MINOR")?.locationKind).toBe("STATION");
    const rawAxial = member(execution, "design-1")?.input.rawResults.find((row) => row.providerMetadata?.startsWith("r-n|"));
    expect(rawAxial?.value).toBe(12.5);
    expect(rawAxial?.unit).toBe("kN");
    expect(rawAxial?.value).not.toBe(canonical(execution, "design-1", "N")?.value);
    expect(execution.supportReactions[0]?.value).toBe(8.25);
    expect(execution.supportReactions[0]?.unit).toBe("kN");
    expect(execution.warnings.map((row) => row.text)).toContain("fixture warning retained");
    expect(member(execution, "design-1")?.input.combinationIds).toEqual(["ULS-1"]);
    expect(member(execution, "design-1")?.input.loadCaseIds).toEqual(["LC1"]);
    expect(member(execution, "design-1")?.binding.designPass).toBe(false);
    expect(member(execution, "design-1")?.binding.steelChecksExecuted).toBe(0);
    expect(member(execution, "design-1")?.binding.steelDemand).toBeNull();
    expect(member(execution, "design-2")?.input.rawResults.find((row) => row.providerMetadata?.startsWith("r-rev|"))?.locationKind).toBe("MEMBER_START");
    expect(canonical(execution, "design-2", "N")?.locationKind).toBe("MEMBER_END");
    expect(canonical(execution, "design-2", "N")?.value).toBe(-1000);
    expect(assessAdapterConformance(execution).pass).toBe(true);
    expect(execution.provenance.map((row) => row.stage)).toEqual(expect.arrayContaining(["SOURCE_PAYLOAD", "PROVIDER_RUN", "NORMALIZED_RESULT"]));
    expect(D1G_R1_MATURITY_STATE).toBe("PROVIDER_NEUTRAL_SOLVER_ADAPTER_FOUNDATION_IMPLEMENTED");
    expect(PROVIDER_NEUTRAL_ADAPTER_RUNTIME_COUNT).toBe(1);
    expect(FIXTURE_PROVIDER_COUNT).toBe(1);
    expect(COMMERCIAL_PROVIDER_CONNECTOR_COUNT).toBe(0);
    expect(STRUCTURAL_SOLVER_EXECUTION_COUNT).toBe(0);
    expect(D1G_R1_FIXTURE_PROVIDER_STRUCTURAL_SOLVER).toBe(false);
    expect(D1G_R1_COMMERCIAL_SOLVER_INTEGRATED).toBe(false);
    expect(D1G_R1_ETABS_CONNECTOR_IMPLEMENTED).toBe(false);
    expect(D1G_R1_SAP2000_CONNECTOR_IMPLEMENTED).toBe(false);
    expect(D1G_R1_STAAD_CONNECTOR_IMPLEMENTED).toBe(false);
    expect(D1G_R1_ROBOT_CONNECTOR_IMPLEMENTED).toBe(false);
    expect(D1G_R1_SPACEGASS_CONNECTOR_IMPLEMENTED).toBe(false);
    expect(D1G_R1_EXTERNAL_NETWORK_CALL_IMPLEMENTED).toBe(false);
    expect(D1G_R1_ADAPTER_CAN_BYPASS_D1F_NORMALIZATION).toBe(false);
    expect(D1G_R1_ADAPTER_CAN_BYPASS_D1F_RESULT_AUTHORITY).toBe(false);
    expect(D1G_R1_ADAPTER_CAN_CREATE_DESIGN_INPUT_DIRECTLY).toBe(false);
    expect(D1G_R1_MEMBER_DESIGN_EXECUTION_ADDED).toBe(false);
    expect(D1G_R1_ADAPTER_INGESTION_AUTO_PROMOTES_VERIFIED_GOVERNED).toBe(false);
    expect(SOLVER_ADAPTER_EQUALS_RESULT_AUTHORITY).toBe(false);
    expect(AI_PROVIDER_OBJECT_MAPPING_CAN_GOVERN).toBe(false);
    expect(D1G_R1_PROVIDER_NAME_DEFINES_UNITS).toBe(false);
    expect(D1G_R1_QUANTITY_NAME_ALONE_DEFINES_SEMANTICS).toBe(false);
    expect(D1G_R1_NAN_CAN_GOVERN).toBe(false);
    expect(D1F_R3_STEEL_SYSTEM_DISPATCH_SCOPE).toBe("D1D_EU_TENSION only");
    expect(D1F_GENERAL_STEEL_SYSTEM_ORCHESTRATION_IMPLEMENTED).toBe(false);
    expect(C10_VALIDATION_LANE_STATUS).toBe("PENDING_QUALIFIED_HUMAN_REVIEW");
    expect(D1G_R2_HANDOFF_READY).toBe(true);
  });

  it("keeps provider identity, capabilities, fingerprints, and replay deterministic", () => {
    const first = run();
    const second = run();
    expect(first.executionFingerprint).toBe(second.executionFingerprint);
    expect(first.sourceFingerprint).toBe(second.sourceFingerprint);
    expect(first.handoffs[0]?.binding.resultSetFingerprint).toBe(second.handoffs[0]?.binding.resultSetFingerprint);
    expect(negotiateAdapterCapabilities({ providerName: "ETABS", declared: ["WARNINGS"] })).toEqual(["WARNINGS"]);
    const renamed = request();
    renamed.source.providerName = "ETABS";
    expect(canonical(run(renamed), "design-1", "N")?.value).toBe(-12500);
    const version = request();
    version.source.providerVersion = "1.0.1";
    version.adapter.supportedProviderVersions = ["1.0.0", "1.0.1"];
    const versioned = run(version);
    expect(versioned.executionFingerprint).not.toBe(first.executionFingerprint);
    expect(versioned.sourceFingerprint).not.toBe(first.sourceFingerprint);
    const adapterVersion = request();
    adapterVersion.adapter.adapterVersion = "1.0.1";
    expect(run(adapterVersion).executionFingerprint).not.toBe(first.executionFingerprint);
    expect(run(adapterVersion).sourceFingerprint).toBe(first.sourceFingerprint);
    const manifest = request();
    manifest.mappingManifest.manifestVersion = "2";
    expect(run(manifest).mappingManifestFingerprint).not.toBe(first.mappingManifestFingerprint);
    expect(run(manifest).executionFingerprint).not.toBe(first.executionFingerprint);
    const mapping = request();
    mapping.objectMapping.mappingVersion = "2";
    const mapped = mapping.objectMapping.entries[0];
    if (mapped) mapped.analyticalElementId = "ae-changed";
    expect(run(mapping).objectMappingFingerprint).not.toBe(first.objectMappingFingerprint);
    const value = request();
    const axial = value.source.results[0];
    if (axial) axial.value = 13;
    expect(run(value).sourceFingerprint).not.toBe(first.sourceFingerprint);
  });

  it("fails closed for authority, stale identity, nonconverged runs, and failed runs", () => {
    const pending = request();
    pending.governed.explicitResultAuthority = "IMPORTED_PENDING_VERIFICATION";
    const pendingExecution = run(pending);
    expect(pendingExecution.canGovern).toBe(false);
    expect(pendingExecution.autoPromotedVerifiedGoverned).toBe(false);
    expect(pendingExecution.handoffs.every((row) => row.binding.authority !== "VERIFIED_GOVERNED")).toBe(true);
    const stale = request();
    stale.governed.currentTopologyFingerprint = "topo-2";
    const staleExecution = run(stale);
    expect(staleExecution.completeness).toBe("STALE");
    expect(staleExecution.canGovern).toBe(false);
    expect(staleExecution.handoffs.every((row) => row.binding.completenessState === "STALE")).toBe(true);
    const pinned = request();
    pinned.governed.currentMappingFingerprint = "previous-mapping";
    expect(run(pinned).completeness).toBe("STALE");
    const diverged = request();
    diverged.source.providerRunState = "PROVIDER_DIVERGED";
    diverged.source.providerConvergenceState = "PROVIDER_NOT_CONVERGED";
    expect(run(diverged).canGovern).toBe(false);
    const failed = request();
    failed.source.providerRunState = "PROVIDER_FAILED";
    expect(run(failed).canGovern).toBe(false);
    expect(run(failed).handoffs[0]?.input.runStatus).toBe("FAILED");
    const unknownRun = request();
    unknownRun.source.providerRunState = "SUCCESS";
    expect(run(unknownRun).canGovern).toBe(false);
    const ai = request();
    ai.objectMapping.authority = "AI";
    expect(run(ai).canGovern).toBe(false);
  });

  it("rejects unknown semantics, unmapped objects, absent values, and partial scope", () => {
    const unit = request();
    const shear = unit.source.results.find((row) => row.providerResultId === "r-v");
    if (shear) shear.unit = null;
    expect(run(unit).canGovern).toBe(false);
    expect(run(unit).rejectedResults.some((row) => row.reason === "MISSING_PROVIDER_UNIT")).toBe(true);
    const axis = request();
    axis.source.coordinateSystemRef = null;
    expect(run(axis).canGovern).toBe(false);
    const quantity = request();
    quantity.source.results = [...quantity.source.results, providerResult({ providerResultId: "r-name", providerObjectId: "e-1", providerQuantityName: "N" })];
    expect(run(quantity).rejectedResults.some((row) => row.reason === "UNKNOWN_QUANTITY")).toBe(true);
    expect(run(quantity).canGovern).toBe(false);
    const category = request();
    category.source.results = [...category.source.results, providerResult({ providerResultId: "r-modal", providerObjectId: "e-1", providerCategory: "MODAL_SHAPE" })];
    expect(run(category).rejectedResults.some((row) => row.reason === "UNKNOWN_RESULT_CATEGORY")).toBe(true);
    const unmapped = request();
    unmapped.source.results = [...unmapped.source.results, providerResult({ providerResultId: "r-missing", providerObjectId: "e-missing" })];
    const unmappedExecution = run(unmapped);
    expect(unmappedExecution.unmappedResults.map((row) => row.providerResultId)).toContain("r-missing");
    expect(JSON.stringify(unmappedExecution.unmappedResults)).toContain("r-missing");
    expect(unmappedExecution.canGovern).toBe(false);
    expect(unmappedExecution.completeness).not.toBe("COMPLETE_FOR_DECLARED_ADAPTER_SCOPE");
    const location = request();
    const located = location.source.results.find((row) => row.providerResultId === "r-v");
    if (located) located.location = null;
    expect(run(location).rejectedResults.some((row) => row.reason === "MISSING_RESULT_LOCATION")).toBe(true);
    const absent = request();
    absent.source.results = absent.source.results.map((row) => row.providerResultId === "r-v" ? { ...row, value: null, explicitZero: false } : row);
    const absentExecution = run(absent);
    expect(canonical(absentExecution, "design-1", "V_MAJOR")?.absent).toBe(true);
    expect(canonical(absentExecution, "design-1", "V_MAJOR")?.value).toBeNull();
    const bareZero = request();
    bareZero.source.results = bareZero.source.results.map((row) => row.providerResultId === "r-t" ? { ...row, explicitZero: false } : row);
    expect(run(bareZero).canGovern).toBe(false);
    expect(canonical(run(bareZero), "design-1", "T")?.value).toBeNull();
    const partial = request();
    partial.source.results = partial.source.results.filter((row) => row.providerObjectId !== "s-1");
    const partialExecution = run(partial);
    expect(partialExecution.completeness).toBe("PARTIAL");
    expect(partialExecution.canGovern).toBe(false);
    expect(partialExecution.completeness).not.toBe("COMPLETE_FOR_DECLARED_ADAPTER_SCOPE");
    const duplicate = request();
    const first = duplicate.source.results[0];
    if (first) duplicate.source.results = [...duplicate.source.results, { ...first }];
    expect(run(duplicate).duplicateDetected).toBe(true);
    expect(run(duplicate).canGovern).toBe(false);
    const generic = request();
    generic.source.combinations = [{ providerCombinationId: "ULTIMATE", label: "ULTIMATE" }];
    generic.mappingManifest.combinations = { ULTIMATE: "ULS-1" };
    expect(run(generic).canGovern).toBe(false);
  });

  it("maps an explicit provider axis without a parallel transform engine", () => {
    const next = request();
    next.source.coordinateSystemRef = "PROVIDER_LOCAL_V1";
    next.source.results = next.source.results.map((row) => ({ ...row, coordinateSystemRef: "PROVIDER_LOCAL_V1" }));
    expect(run(next).canGovern).toBe(false);
    next.transform = {
      transformId: "xf-1",
      fromSystem: "PROVIDER_LOCAL_V1",
      toSystem: "FIXTURE_GLOBAL_V1",
      methodRef: "EXPLICIT_AXIS_MAP",
      version: "1",
      componentMap: { P_AX: "N", V2_LOCAL: "V_MAJOR", M3_LOCAL: "M_MAJOR", T_LOCAL: "T", V_STATION: "V_MINOR" },
      authority: "EXPLICIT_GOVERNED",
      provenanceRef: "prov-xf",
    };
    const execution = run(next);
    expect(execution.canGovern).toBe(true);
    expect(member(execution, "design-1")?.binding.canonicalActions[0]?.transformRef).toBe("xf-1");
    expect(canonical(execution, "design-1", "N")?.value).toBe(-12500);
  });

  it("preserves history and rejects cross-project and cross-tenant binding", () => {
    const prior = run();
    const next = request();
    const axial = next.source.results[0];
    if (axial) axial.value = 20;
    const successor = recordSuccessorAdapterExecution(prior, next);
    expect(prior.revision).toBe("CURRENT");
    expect(successor.prior.revision).toBe("SUPERSEDED");
    expect(successor.history[0]?.executionFingerprint).toBe(prior.executionFingerprint);
    expect(successor.current.executionFingerprint).not.toBe(prior.executionFingerprint);
    expect(successor.history[1]?.sourceFingerprint).toBe(successor.current.sourceFingerprint);
    const otherProject = request();
    otherProject.governed.projectId = "project-2";
    expect(run(otherProject).canGovern).toBe(false);
    expect(run(otherProject).findings.some((row) => row.code === "CROSS_PROJECT")).toBe(true);
    const otherTenant = request();
    otherTenant.governed.tenantId = "tenant-2";
    expect(run(otherTenant).findings.some((row) => row.code === "CROSS_TENANT")).toBe(true);
    const otherModel = request();
    otherModel.source.providerModelId = "fixture-model-2";
    const sameObject = run(otherModel);
    expect(sameObject.canGovern).toBe(false);
    expect(sameObject.unmappedResults.length).toBeGreaterThan(0);
  });

  it("blocks unsafe provider payloads", () => {
    const path = request();
    path.source.sourceName = "../secret.txt";
    expect(run(path).canGovern).toBe(false);
    expect(run(path).findings.some((row) => row.code === "UNSAFE_SOURCE_REF")).toBe(true);
    const script = request();
    script.source.unknownFields = { script: "eval(process.exit(1))" };
    expect(canonical(run(script), "design-1", "N")?.value).toBe(-12500);
    const nan = request();
    const nanRow = nan.source.results[0];
    if (nanRow) nanRow.value = Number.NaN;
    expect(run(nan).canGovern).toBe(false);
    expect(run(nan).rejectedResults.some((row) => row.reason === "NON_FINITE_OR_NON_NUMERIC")).toBe(true);
    const infinite = request();
    const infiniteRow = infinite.source.results[0];
    if (infiniteRow) infiniteRow.value = Number.POSITIVE_INFINITY;
    expect(run(infinite).canGovern).toBe(false);
    const text = request();
    const textRow = text.source.results[0];
    if (textRow) textRow.value = "12" as never;
    expect(run(text).rejectedResults.some((row) => row.reason === "NON_FINITE_OR_NON_NUMERIC")).toBe(true);
    const nested = request();
    let cursor: Record<string, unknown> = {};
    nested.source.unknownFields = cursor;
    for (let index = 0; index < 12; index += 1) {
      const next: Record<string, unknown> = {};
      cursor.child = next;
      cursor = next;
    }
    expect(run(nested).findings.some((row) => row.code === "RESOURCE_LIMIT")).toBe(true);
    const oversized = request();
    oversized.limits = { maxResultCount: 1 };
    expect(run(oversized).findings.some((row) => row.code === "RESOURCE_LIMIT")).toBe(true);
    const malformed = request();
    malformed.source = null as never;
    expect(run(malformed).findings.some((row) => row.code === "MALFORMED_PAYLOAD")).toBe(true);
    const unknownWarning = request();
    unknownWarning.source.warnings = [...unknownWarning.source.warnings, { warningId: "warn-2", code: "UNLISTED", text: "keep this warning" }];
    expect(run(unknownWarning).warnings.map((row) => row.text)).toContain("keep this warning");
    expect(run(unknownWarning).warnings.find((row) => row.code === "UNLISTED")?.transportCategory).toBe("UNCLASSIFIED");
    const implementation = readFileSync(join(ROOT, "packages/engineering-os/src/structural-systems/solver-adapter.ts"), "utf8");
    expect(implementation.includes("fetch(")).toBe(false);
    expect(implementation.includes("eval(")).toBe(false);
    expect(implementation.includes("child_process")).toBe(false);
    expect(implementation.includes("new Function")).toBe(false);
  });
});
