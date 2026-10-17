import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  C10_VALIDATION_LANE_STATUS,
  D1F_GENERAL_STEEL_SYSTEM_ORCHESTRATION_IMPLEMENTED,
  D1F_R3_STEEL_SYSTEM_DISPATCH_SCOPE,
  D1G_R2_ABSENT_VALUE_EQUALS_ZERO,
  D1G_R2_ARCHIVE_FORMAT_SUPPORTED,
  D1G_R2_CALLER_MIME_TYPE_DEFINES_TRUST,
  D1G_R2_COMMERCIAL_PROVIDER_CONNECTOR_COUNT,
  D1G_R2_DUPLICATE_JSON_KEY_REJECTED,
  D1G_R2_ETABS_CONNECTOR_IMPLEMENTED,
  D1G_R2_EXAMPLE_PACKAGE_PATH,
  D1G_R2_EXTENSION_METADATA_CAN_GOVERN,
  D1G_R2_FILE_EXTENSION_DEFINES_PACKAGE_VALIDITY,
  D1G_R2_FILENAME_DEFINES_PROVIDER,
  D1G_R2_FUTURE_SCHEMA_AUTO_INTERPRETED,
  D1G_R2_INGESTION_PIPELINE,
  D1G_R2_INGESTION_ROUNDS_ENGINEERING_VALUES,
  D1G_R2_INGESTION_SUCCESS_EQUALS_VERIFIED_GOVERNED,
  D1G_R2_MACHINE_READABLE_SCHEMA_PATH,
  D1G_R2_MATURITY_STATE,
  D1G_R2_NEW_ENGINEERING_FORMULA_COUNT,
  D1G_R2_PACKAGE_CAN_SELF_PROMOTE_RESULT_AUTHORITY,
  D1G_R2_PACKAGE_CAN_SELF_SELECT_DESIGN_PROFILE,
  D1G_R2_PACKAGE_CAN_SELF_SELECT_GOVERNED_MAPPING,
  D1G_R2_PACKAGE_CAN_SELF_SELECT_PROJECT_CONTEXT,
  D1G_R2_PACKAGE_CAN_TRIGGER_NETWORK_FETCH,
  D1G_R2_PACKAGE_FORMAT,
  D1G_R2_PACKAGE_PROJECT_ID_GRANTS_ACCESS,
  D1G_R2_PACKAGE_V1_CONTAINER,
  D1G_R2_PARTIAL_PACKAGE_CAN_IMPLY_COMPLETE,
  D1G_R2_PROVIDER_DECLARATION_AUTO_TRUSTED,
  D1G_R2_PROVIDER_OBJECT_GLOBAL_UNIQUENESS_ASSUMED,
  D1G_R2_R3_MEMBER_DESIGN_EXECUTION_ADDED,
  D1G_R2_RESULT_PACKAGE_RUNTIME_COUNT,
  D1G_R2_ROBOT_CONNECTOR_IMPLEMENTED,
  D1G_R2_SAP2000_CONNECTOR_IMPLEMENTED,
  D1G_R2_SCHEMA_VERSION,
  D1G_R2_SECURE_INGESTION_PIPELINE_COUNT,
  D1G_R2_SPACEGASS_CONNECTOR_IMPLEMENTED,
  D1G_R2_STAAD_CONNECTOR_IMPLEMENTED,
  D1G_R2_STRUCTURAL_SOLVER_IMPLEMENTED,
  D1G_R2_UNKNOWN_FIELD_POLICY,
  D1G_R2_UNKNOWN_SCHEMA_VERSION_ACCEPTED,
  D1G_R2_UTF8_BOM_POLICY,
} from "@rtb/types";
import { createD1gFixtureSolverRequest } from "./index";
import {
  ingestStructuralResultPackage,
  inspectStructuralPackageText,
  recordSuccessorPackageIngestion,
  type D1gR2IngestionInput,
  type D1gR2IngestionResult,
} from "./result-package";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE = join(HERE, "eos-structural-result-package-v1.example.json");
const SCHEMA = join(HERE, "eos-structural-result-package-v1.schema.json");
const IMPLEMENTATION = join(HERE, "result-package.ts");

type PackageResult = {
  providerResultId: string;
  providerObjectId: string;
  resultCategory: string;
  providerQuantityName: string;
  rawValue: number | string | null;
  explicitZero: boolean;
  rawUnit: string | null;
  coordinateSystem: string | null;
  signConvention: string | null;
  resultLocation: string | null;
  station: { value: number; unit: string; origin: string; orientation: string } | null;
  providerCombinationId: string | null;
  providerCaseId: string | null;
  warningIds: string[];
};

type PackageFile = {
  packageFormat: string;
  schemaVersion: string;
  packageId: string;
  completeness: string;
  provider: { providerId: string; providerName: string; providerVersion: string };
  source: { sourceName: string; sourceVersion: string; sourceTimestamp: string };
  capabilities: string[];
  mappingExpectation: { mappingManifestId: string; mappingManifestVersion: string; mappingManifestFingerprint: string | null; quantities?: unknown };
  objectMappingExpectation: { objectMappingId: string; objectMappingVersion: string; entries?: unknown };
  providerObjects: { providerObjectId: string; providerObjectType: string; providerModelId: string }[];
  results: PackageResult[];
  warnings: { warningId: string; code: string; text: string; resultId: string | null }[];
  extensions: Record<string, unknown>;
  resultAuthority?: string;
};

function fileBytes(): Uint8Array {
  return new Uint8Array(readFileSync(EXAMPLE));
}

function parsed(): PackageFile {
  return JSON.parse(readFileSync(EXAMPLE, "utf8")) as PackageFile;
}

function encode(value: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(value));
}

function governedInput(bytes: Uint8Array, patch: Partial<D1gR2IngestionInput> = {}): D1gR2IngestionInput {
  const request = createD1gFixtureSolverRequest();
  return {
    bytes,
    filename: "synthetic-results.txt",
    mimeType: "text/plain",
    authorized: request.governed,
    profileId: "governed-profile",
    registry: {
      adapters: [request.adapter],
      mappingManifests: [request.mappingManifest],
      objectMappings: [request.objectMapping],
    },
    transform: null,
    ...patch,
  };
}

function ingestBytes(bytes: Uint8Array, patch: Partial<D1gR2IngestionInput> = {}): D1gR2IngestionResult {
  return ingestStructuralResultPackage(governedInput(bytes, patch));
}

function ingestMutated(change: (pkg: PackageFile) => void, patch: Partial<D1gR2IngestionInput> = {}): D1gR2IngestionResult {
  const pkg = parsed();
  change(pkg);
  return ingestBytes(encode(pkg), patch);
}

function codes(result: D1gR2IngestionResult): string[] {
  return result.findings.map((row) => row.code);
}

function axial(result: D1gR2IngestionResult, designMemberId: string) {
  return result.adapterExecution?.handoffs.find((row) => row.input.designMemberId === designMemberId)?.binding.canonicalActions.find((row) => row.quantity === "N");
}

describe("EOS-D1G-R2 provider-neutral result package ingestion", () => {
  it("ingests the synthetic version 1 package through the R1 adapter and D1F normalization", () => {
    const bytes = fileBytes();
    const result = ingestBytes(bytes, { filename: "ETABS.JSON", mimeType: "application/x-etabs" });
    expect(result.canGovern).toBe(true);
    expect(result.status).toBe("INGESTED");
    expect(result.status).not.toBe("VERIFIED_GOVERNED");
    expect(result.packageValidationState).toBe("SEMANTICALLY_VALID");
    expect(result.schemaValid).toBe(true);
    expect(result.authorityState).toBe("VERIFIED_GOVERNED");
    expect(result.packageAuthorityApplied).toBe(false);
    expect(result.packageSelectedMapping).toBe(false);
    expect(result.packageSelectedProject).toBe(false);
    expect(result.packageSelectedProfile).toBe(false);
    expect(result.projectId).toBe("project-1");
    expect(result.tenantId).toBe("tenant-1");
    expect(result.profileId).toBe("governed-profile");
    expect(result.ignoredPackageDeclarations.declaredProjectId).toBe("project-spoof");
    expect(result.ignoredPackageDeclarations.declaredProfileId).toBe("spoof-profile");
    expect(result.ignoredPackageDeclarations.declaredAuthority).toBe("VERIFIED_GOVERNED");
    expect(result.providerId).toBe("d1g-fixture-solver");
    expect(result.adapterId).toBe("d1g-provider-neutral-adapter");
    expect(result.adapterVersion).toBe("1.0.0");
    expect(result.mappingManifestId).toBe("map-d1g-r1");
    expect(result.rawFileFingerprint).not.toBe(result.semanticPackageFingerprint);
    expect(result.rawPackageMutated).toBe(false);
    expect(result.preservedBytes).toEqual(bytes);
    bytes[0] = 0;
    expect(result.preservedBytes[0]).toBe(0x7b);
    expect(axial(result, "design-1")?.value).toBe(-12500);
    const rawAxial = result.adapterExecution?.handoffs.find((row) => row.input.designMemberId === "design-1")?.input.rawResults.find((row) => row.providerMetadata?.startsWith("r-n|"));
    expect(rawAxial?.value).toBe(12.5);
    expect(rawAxial?.unit).toBe("kN");
    expect(result.adapterExecution?.supportReactions[0]?.value).toBe(8.25);
    expect(result.adapterExecution?.handoffs.every((row) => row.binding.steelChecksExecuted === 0)).toBe(true);
    expect(result.adapterExecution?.handoffs.every((row) => row.binding.steelDemand == null)).toBe(true);
    expect(result.adapterExecution?.handoffs.every((row) => row.input.designTarget == null)).toBe(true);
    expect(axial(result, "design-1")?.value).not.toBe(0);
    const torsion = result.adapterExecution?.handoffs.find((row) => row.input.designMemberId === "design-1")?.binding.canonicalActions.find((row) => row.quantity === "T");
    expect(torsion?.explicitZero).toBe(true);
    expect(torsion?.value).toBe(0);
    expect(result.adapterExecution?.handoffs.find((row) => row.input.designMemberId === "design-2")?.binding.canonicalActions.find((row) => row.quantity === "N")?.locationKind).toBe("MEMBER_END");
    expect(result.adapterExecution?.handoffs.find((row) => row.input.designMemberId === "design-1")?.binding.canonicalActions.find((row) => row.quantity === "V_MINOR")?.locationKind).toBe("STATION");
    expect(result.warnings.map((row) => row.text)).toContain("fixture warning retained");
    expect(result.adapterExecution?.warnings.map((row) => row.text)).toContain("fixture warning retained");
    expect(result.adapterExecution?.preservedSource.unknownFields.url).toBe("https://example.invalid/package");
    expect(result.provenance.map((row) => row.stage)).toEqual(expect.arrayContaining(["RAW_FILE", "SEMANTIC_PACKAGE", "INGESTION", "MAPPING_MANIFEST", "OBJECT_MAPPING", "RAW_RESULT", "NORMALIZED_RESULT"]));
    expect(result.pipeline).toEqual(expect.arrayContaining([...D1G_R2_INGESTION_PIPELINE]));
    expect(result.adapterExecution?.memberForceCalculated).toBe(false);
    expect(result.adapterExecution?.supportReactionCalculated).toBe(false);
    const replay = ingestBytes(fileBytes(), { filename: "other-name.json", mimeType: "application/octet-stream" });
    expect(replay.fingerprint).toBe(result.fingerprint);
    expect(replay.ingestionId).toBe(result.ingestionId);
    expect(axial(replay, "design-1")?.value).toBe(-12500);
  });

  it("keeps semantic fingerprints stable across canonical equivalents and rejects unsafe encodings", () => {
    const original = ingestBytes(fileBytes());
    const compact = ingestBytes(encode(parsed()));
    expect(compact.semanticPackageFingerprint).toBe(original.semanticPackageFingerprint);
    expect(compact.rawFileFingerprint).not.toBe(original.rawFileFingerprint);
    expect(compact.fingerprint).not.toBe(original.fingerprint);
    expect(axial(compact, "design-1")?.value).toBe(-12500);
    const numeric = readFileSync(EXAMPLE, "utf8").replace("12.5", "12.50");
    const numericResult = ingestBytes(new TextEncoder().encode(numeric));
    expect(numericResult.semanticPackageFingerprint).toBe(original.semanticPackageFingerprint);
    expect(numericResult.rawFileFingerprint).not.toBe(original.rawFileFingerprint);
    expect(axial(numericResult, "design-1")?.value).toBe(-12500);
    const reordered = ingestMutated((pkg) => {
      const [first, second] = pkg.results;
      pkg.results[0] = second!;
      pkg.results[1] = first!;
    });
    expect(reordered.semanticPackageFingerprint).toBe(original.semanticPackageFingerprint);
    expect(reordered.rawFileFingerprint).not.toBe(original.rawFileFingerprint);
    const bom = new Uint8Array(fileBytes().length + 3);
    bom.set([0xef, 0xbb, 0xbf], 0);
    bom.set(fileBytes(), 3);
    const bomResult = ingestBytes(bom);
    expect(bomResult.canGovern).toBe(true);
    expect(bomResult.semanticPackageFingerprint).toBe(original.semanticPackageFingerprint);
    expect(bomResult.rawFileFingerprint).not.toBe(original.rawFileFingerprint);
    expect(inspectStructuralPackageText('{"a":1,"a":2}', 8).duplicateKey).toBe("a");
    expect(inspectStructuralPackageText('{"a":{"b":1,"b":2}}', 8).duplicateKey).toBe("b");
    expect(inspectStructuralPackageText('{"a":{"b":1},"c":{"b":2}}', 8).duplicateKey).toBeNull();
    expect(codes(ingestBytes(new TextEncoder().encode("{")))).toContain("MALFORMED_JSON");
    expect(ingestBytes(new TextEncoder().encode('{"packageFormat":"EOS_STRUCTURAL_RESULT_PACKAGE","packageFormat":"OTHER"}')).parsed).toBe(false);
    expect(codes(ingestBytes(new TextEncoder().encode('{"a":1,"a":2}')))).toContain("DUPLICATE_JSON_KEY");
    expect(codes(ingestBytes(Uint8Array.of(0xff)))).toContain("INVALID_UTF8");
    expect(codes(ingestBytes(fileBytes(), { limits: { maxFileBytes: 32 } }))).toContain("FILE_SIZE_LIMIT");
    expect(codes(ingestMutated((pkg) => {
      let node: Record<string, unknown> = { leaf: true };
      for (let depth = 0; depth < 12; depth += 1) node = { child: node };
      pkg.extensions = node;
    }))).toContain("DEPTH_LIMIT");
    expect(codes(ingestBytes(fileBytes(), { limits: { maxIdentifierLength: 4 } }))).toContain("IDENTIFIER_LENGTH_LIMIT");
    expect(codes(ingestBytes(fileBytes(), { limits: { maxResultCount: 1 } }))).toContain("RESULT_COUNT_LIMIT");
    expect(codes(ingestBytes(fileBytes(), { limits: { maxArrayLength: 1 } }))).toContain("ARRAY_LENGTH_LIMIT");
    expect(codes(ingestBytes(new TextEncoder().encode(readFileSync(EXAMPLE, "utf8").replace("12.5", "1e309"))))).toContain("NON_FINITE_NUMBER");
    expect(codes(ingestBytes(new TextEncoder().encode(readFileSync(EXAMPLE, "utf8").replace("12.5", "NaN"))))).toContain("MALFORMED_JSON");
    const nonNumeric = ingestMutated((pkg) => {
      pkg.results[0]!.rawValue = "NaN";
    });
    expect(nonNumeric.canGovern).toBe(false);
    expect(codes(nonNumeric)).toContain("SCHEMA_INVALID");
  });

  it("treats code, paths, and urls as inert data and keeps trust outside the file", () => {
    const source = readFileSync(IMPLEMENTATION, "utf8");
    for (const token of ["fetch(", "eval(", "new Function", "child_process", "readFile", "writeFile"]) {
      expect(source.includes(token), token).toBe(false);
    }
    const injected = "<script>alert(1)</script>; rm -rf /; ${7}; SELECT * FROM users";
    const code = ingestMutated((pkg) => {
      pkg.warnings[0]!.text = injected;
    });
    expect(code.canGovern).toBe(true);
    expect(code.warnings[0]?.text).toBe(injected);
    const pathInWarning = ingestMutated((pkg) => {
      pkg.warnings[0]!.text = "../../secret";
    });
    expect(pathInWarning.canGovern).toBe(true);
    expect(pathInWarning.warnings.map((row) => row.text)).toContain("../../secret");
    const path = ingestMutated((pkg) => {
      pkg.source.sourceName = "../../secret";
    });
    expect(path.canGovern).toBe(false);
    expect(codes(path)).toContain("UNSAFE_SOURCE_REF");
    expect(path.adapterExecution?.handoffs).toEqual([]);
    const unknownProvider = ingestMutated((pkg) => {
      pkg.provider.providerId = "unknown-solver";
    });
    expect(unknownProvider.status).toBe("UNSUPPORTED");
    expect(unknownProvider.canGovern).toBe(false);
    expect(unknownProvider.adapterExecution).toBeNull();
    const version = ingestMutated((pkg) => {
      pkg.provider.providerVersion = "9.9.9";
    });
    expect(version.canGovern).toBe(false);
    expect(codes(version)).toContain("UNSUPPORTED_PROVIDER_VERSION");
    expect(version.adapterExecution).toBeNull();
    const mismatch = ingestMutated((pkg) => {
      pkg.mappingExpectation.mappingManifestFingerprint = "deadbeef";
    });
    expect(mismatch.canGovern).toBe(false);
    expect(codes(mismatch)).toContain("MAPPING_FINGERPRINT_MISMATCH");
    expect(mismatch.adapterExecution).toBeNull();
    const logic = ingestMutated((pkg) => {
      pkg.objectMappingExpectation.entries = [{ providerObjectId: "e-missing", approved: true }];
    });
    expect(logic.canGovern).toBe(false);
    expect(logic.packageSelectedMapping).toBe(false);
    const request = createD1gFixtureSolverRequest();
    const otherProject = ingestBytes(fileBytes(), { authorized: { ...request.governed, projectId: "project-2" } });
    expect(otherProject.canGovern).toBe(false);
    expect(codes(otherProject)).toContain("CROSS_PROJECT");
    expect(otherProject.projectId).toBe("project-2");
    expect(otherProject.adapterExecution).toBeNull();
    const otherTenant = ingestBytes(fileBytes(), { authorized: { ...request.governed, tenantId: "tenant-2" } });
    expect(codes(otherTenant)).toContain("CROSS_TENANT");
    expect(otherTenant.canGovern).toBe(false);
    const pending = ingestBytes(fileBytes(), { authorized: { ...request.governed, explicitResultAuthority: "IMPORTED_PENDING_VERIFICATION" } });
    expect(pending.schemaValid).toBe(true);
    expect(pending.canGovern).toBe(false);
    expect(pending.adapterExecution?.handoffs[0]?.input.runAuthority).toBe("IMPORTED_PENDING_VERIFICATION");
    expect(pending.authorityState).not.toBe("VERIFIED_GOVERNED");
    expect(pending.ignoredPackageDeclarations.declaredAuthority).toBe("VERIFIED_GOVERNED");
    expect(pending.status).not.toBe("VERIFIED_GOVERNED");
    const spoofedAuthority = ingestMutated((pkg) => {
      pkg.resultAuthority = "VERIFIED_GOVERNED";
    });
    expect(spoofedAuthority.canGovern).toBe(false);
    expect(codes(spoofedAuthority)).toContain("UNKNOWN_FIELD");
    const unvalidated = ingestBytes(fileBytes(), { authorized: { ...request.governed, modelValidationEvidenceRef: "" } });
    expect(unvalidated.ignoredPackageDeclarations.declaredModelValidated).toBe(true);
    expect(unvalidated.canGovern).toBe(false);
    const profile = ingestBytes(fileBytes());
    expect(profile.profileId).toBe("governed-profile");
    expect(profile.profileId).not.toBe(profile.ignoredPackageDeclarations.declaredProfileId);
    const capability = ingestMutated((pkg) => {
      pkg.capabilities.push("MODAL_RESULTS");
    });
    expect(capability.canGovern).toBe(false);
    expect(codes(capability)).toContain("CAPABILITY_MISMATCH");
    const format = ingestMutated((pkg) => {
      pkg.packageFormat = "VENDOR_PACKAGE";
    });
    expect(codes(format)).toContain("UNKNOWN_PACKAGE_FORMAT");
    const future = ingestMutated((pkg) => {
      pkg.schemaVersion = "2";
    });
    expect(codes(future)).toContain("UNKNOWN_SCHEMA_VERSION");
    expect(future.adapterExecution).toBeNull();
  });

  it("fails closed on unknown semantics, broken references, and partial scope", () => {
    const unknownObject = ingestMutated((pkg) => {
      pkg.providerObjects.push({ providerObjectId: "e-missing", providerObjectType: "ELEMENT", providerModelId: "fixture-model-1" });
      pkg.results.push({ ...pkg.results[0]!, providerResultId: "r-missing", providerObjectId: "e-missing" });
      pkg.extensions.approvedObjectIds = ["e-missing"];
    });
    expect(unknownObject.canGovern).toBe(false);
    expect(unknownObject.adapterExecution?.unmappedResults.map((row) => row.providerResultId)).toContain("r-missing");
    const category = ingestMutated((pkg) => {
      pkg.results[0]!.resultCategory = "MODAL_SHAPE";
    });
    expect(category.adapterExecution?.rejectedResults.some((row) => row.reason === "UNKNOWN_RESULT_CATEGORY")).toBe(true);
    const quantity = ingestMutated((pkg) => {
      pkg.results[0]!.providerQuantityName = "AXIAL_LABEL";
    });
    expect(quantity.adapterExecution?.rejectedResults.some((row) => row.reason === "UNKNOWN_QUANTITY")).toBe(true);
    const unit = ingestMutated((pkg) => {
      pkg.results[0]!.rawUnit = null;
    });
    expect(unit.adapterExecution?.rejectedResults.some((row) => row.reason === "MISSING_PROVIDER_UNIT")).toBe(true);
    const axis = ingestMutated((pkg) => {
      pkg.results[0]!.coordinateSystem = null;
    });
    expect(axis.adapterExecution?.rejectedResults.some((row) => row.reason === "MISSING_RESULT_COORDINATE")).toBe(true);
    const sign = ingestMutated((pkg) => {
      pkg.results[0]!.signConvention = null;
    });
    expect(sign.adapterExecution?.rejectedResults.some((row) => row.reason === "MISSING_SIGN_CONVENTION")).toBe(true);
    const location = ingestMutated((pkg) => {
      pkg.results[0]!.resultLocation = null;
    });
    expect(location.canGovern).toBe(false);
    expect(location.adapterExecution?.rejectedResults.some((row) => row.reason === "MISSING_RESULT_LOCATION")).toBe(true);
    const station = ingestMutated((pkg) => {
      const row = pkg.results.find((item) => item.providerResultId === "r-station");
      if (row) row.station = null;
    });
    expect(station.adapterExecution?.rejectedResults.some((row) => row.reason === "AMBIGUOUS_STATION")).toBe(true);
    const broken = ingestMutated((pkg) => {
      pkg.results[0]!.providerCombinationId = "COM-MISSING";
    });
    expect(codes(broken)).toContain("BROKEN_COMBINATION_REFERENCE");
    expect(broken.adapterExecution).toBeNull();
    const duplicate = ingestMutated((pkg) => {
      pkg.results.push({ ...pkg.results[0]! });
    });
    expect(codes(duplicate)).toContain("DUPLICATE_RESULT_ID");
    const absent = ingestMutated((pkg) => {
      const shear = pkg.results.find((item) => item.providerResultId === "r-v");
      if (shear) {
        shear.rawValue = null;
        shear.explicitZero = false;
      }
    });
    const shear = absent.adapterExecution?.handoffs.find((row) => row.input.designMemberId === "design-1")?.binding.canonicalActions.find((row) => row.quantity === "V_MAJOR");
    expect(shear?.value).toBeNull();
    expect(shear?.absent).toBe(true);
    const torsion = absent.adapterExecution?.handoffs.find((row) => row.input.designMemberId === "design-1")?.binding.canonicalActions.find((row) => row.quantity === "T");
    expect(torsion?.explicitZero).toBe(true);
    expect(torsion?.value).toBe(0);
    const unknownWarning = ingestMutated((pkg) => {
      pkg.warnings.push({ warningId: "warn-2", code: "UNHEARD", text: "retain unknown warning", resultId: null });
    });
    expect(unknownWarning.warnings.map((row) => row.text)).toContain("retain unknown warning");
    expect(unknownWarning.adapterExecution?.warnings.map((row) => row.text)).toContain("retain unknown warning");
    const partial = ingestMutated((pkg) => {
      pkg.results = pkg.results.filter((row) => row.providerObjectId !== "s-1");
      pkg.completeness = "COMPLETE";
    });
    expect(partial.canGovern).toBe(false);
    expect(partial.packageCompleteness).toBe("COMPLETE");
    expect(partial.ingestionCompleteness).not.toBe("COMPLETE");
    expect(partial.status).toBe("PARTIAL");
  });

  it("replays historically, propagates staleness, and preserves maturity boundaries", () => {
    const first = ingestBytes(fileBytes());
    const fingerprint = first.fingerprint;
    const history = recordSuccessorPackageIngestion(first, governedInput(encode(parsed())));
    expect(first.revision).toBe("CURRENT");
    expect(first.fingerprint).toBe(fingerprint);
    expect(history.prior.revision).toBe("SUPERSEDED");
    expect(history.current.supersedesIngestionId).toBe(first.ingestionId);
    const changed = ingestMutated((pkg) => {
      pkg.results[0]!.rawValue = 13;
    });
    const successor = recordSuccessorPackageIngestion(first, governedInput(encode(parsed())));
    expect(successor.current.fingerprint).toBe(history.current.fingerprint);
    expect(changed.fingerprint).not.toBe(first.fingerprint);
    expect(axial(changed, "design-1")?.value).not.toBe(-12500);
    const request = createD1gFixtureSolverRequest();
    const stale = ingestBytes(fileBytes(), { authorized: { ...request.governed, currentTopologyFingerprint: "topo-2" } });
    expect(stale.canGovern).toBe(false);
    expect(stale.status).toBe("STALE");
    expect(stale.adapterExecution?.completeness).toBe("STALE");
    const schema = readFileSync(SCHEMA, "utf8");
    expect(schema).toContain("\"EOS_STRUCTURAL_RESULT_PACKAGE\"");
    expect(schema).toContain("\"additionalProperties\": false");
    expect(readFileSync(EXAMPLE, "utf8")).toContain("TEST_ONLY");
    expect(D1G_R2_MACHINE_READABLE_SCHEMA_PATH).toBe("packages/engineering-os/src/structural-systems/eos-structural-result-package-v1.schema.json");
    expect(D1G_R2_EXAMPLE_PACKAGE_PATH.endsWith("eos-structural-result-package-v1.example.json")).toBe(true);
    expect(D1G_R2_PACKAGE_V1_CONTAINER).toBe("SINGLE_UTF8_JSON_FILE");
    expect(D1G_R2_PACKAGE_FORMAT).toBe("EOS_STRUCTURAL_RESULT_PACKAGE");
    expect(D1G_R2_SCHEMA_VERSION).toBe("1");
    expect(D1G_R2_ARCHIVE_FORMAT_SUPPORTED).toBe(false);
    expect(D1G_R2_UNKNOWN_SCHEMA_VERSION_ACCEPTED).toBe(false);
    expect(D1G_R2_FUTURE_SCHEMA_AUTO_INTERPRETED).toBe(false);
    expect(D1G_R2_DUPLICATE_JSON_KEY_REJECTED).toBe(true);
    expect(D1G_R2_UTF8_BOM_POLICY).toContain("BOM");
    expect(D1G_R2_INGESTION_ROUNDS_ENGINEERING_VALUES).toBe(false);
    expect(D1G_R2_PROVIDER_DECLARATION_AUTO_TRUSTED).toBe(false);
    expect(D1G_R2_PACKAGE_CAN_SELF_PROMOTE_RESULT_AUTHORITY).toBe(false);
    expect(D1G_R2_PACKAGE_CAN_SELF_SELECT_GOVERNED_MAPPING).toBe(false);
    expect(D1G_R2_PACKAGE_CAN_SELF_SELECT_PROJECT_CONTEXT).toBe(false);
    expect(D1G_R2_PACKAGE_CAN_SELF_SELECT_DESIGN_PROFILE).toBe(false);
    expect(D1G_R2_PACKAGE_PROJECT_ID_GRANTS_ACCESS).toBe(false);
    expect(D1G_R2_EXTENSION_METADATA_CAN_GOVERN).toBe(false);
    expect(D1G_R2_UNKNOWN_FIELD_POLICY).toContain("PRESERVE_EXTENSIONS");
    expect(D1G_R2_PARTIAL_PACKAGE_CAN_IMPLY_COMPLETE).toBe(false);
    expect(D1G_R2_ABSENT_VALUE_EQUALS_ZERO).toBe(false);
    expect(D1G_R2_PROVIDER_OBJECT_GLOBAL_UNIQUENESS_ASSUMED).toBe(false);
    expect(D1G_R2_INGESTION_SUCCESS_EQUALS_VERIFIED_GOVERNED).toBe(false);
    expect(D1G_R2_FILENAME_DEFINES_PROVIDER).toBe(false);
    expect(D1G_R2_FILE_EXTENSION_DEFINES_PACKAGE_VALIDITY).toBe(false);
    expect(D1G_R2_CALLER_MIME_TYPE_DEFINES_TRUST).toBe(false);
    expect(D1G_R2_PACKAGE_CAN_TRIGGER_NETWORK_FETCH).toBe(false);
    expect(D1G_R2_RESULT_PACKAGE_RUNTIME_COUNT).toBe(1);
    expect(D1G_R2_SECURE_INGESTION_PIPELINE_COUNT).toBe(1);
    expect(D1G_R2_COMMERCIAL_PROVIDER_CONNECTOR_COUNT).toBe(0);
    expect(D1G_R2_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1G_R2_MATURITY_STATE).toBe("PROVIDER_NEUTRAL_RESULT_PACKAGE_INGESTION_IMPLEMENTED");
    expect(D1G_R2_STRUCTURAL_SOLVER_IMPLEMENTED).toBe(false);
    expect(D1G_R2_R3_MEMBER_DESIGN_EXECUTION_ADDED).toBe(false);
    expect(D1G_R2_ETABS_CONNECTOR_IMPLEMENTED).toBe(false);
    expect(D1G_R2_SAP2000_CONNECTOR_IMPLEMENTED).toBe(false);
    expect(D1G_R2_STAAD_CONNECTOR_IMPLEMENTED).toBe(false);
    expect(D1G_R2_ROBOT_CONNECTOR_IMPLEMENTED).toBe(false);
    expect(D1G_R2_SPACEGASS_CONNECTOR_IMPLEMENTED).toBe(false);
    expect(D1F_R3_STEEL_SYSTEM_DISPATCH_SCOPE).toBe("D1D_EU_TENSION only");
    expect(D1F_GENERAL_STEEL_SYSTEM_ORCHESTRATION_IMPLEMENTED).toBe(false);
    expect(C10_VALIDATION_LANE_STATUS).toBe("PENDING_QUALIFIED_HUMAN_REVIEW");
    expect(readFileSync(IMPLEMENTATION, "utf8").includes("Math.round")).toBe(false);
  });
});
