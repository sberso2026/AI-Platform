import { createHash } from "node:crypto";
import type { D1gR1AdapterExecution } from "./solver-adapter";
import type {
  D1gR1AdapterIdentity,
  D1gR1AdapterRequest,
  D1gR1GovernedContext,
  D1gR1MappingManifest,
  D1gR1ObjectMapping,
  D1gR1ProviderResult,
  D1gR1ProviderSource,
  D1gR2PackageDocument,
  D1gR2PackageResult,
  D1gR2PackageValidationState,
  D1gR2ResourceLimits,
} from "@rtb/types";
import {
  D1G_R2_DEFAULT_RESOURCE_LIMITS,
  D1G_R2_PACKAGE_FORMAT,
  D1G_R2_SCHEMA_VERSION,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { executeProviderNeutralAdapter } from "./solver-adapter";

export type D1gR2Finding = {
  code: string;
  severity: "INFO" | "WARNING" | "BLOCKING";
  subjectId: string;
  message: string;
};

export type D1gR2IngestionInput = {
  bytes: Uint8Array;
  filename?: string | null;
  mimeType?: string | null;
  authorized: D1gR1GovernedContext;
  profileId: string;
  registry: {
    adapters: readonly D1gR1AdapterIdentity[];
    mappingManifests: readonly D1gR1MappingManifest[];
    objectMappings: readonly D1gR1ObjectMapping[];
  };
  transform?: D1gR1AdapterRequest["transform"];
  limits?: Partial<D1gR2ResourceLimits>;
};

export type D1gR2IngestionResult = {
  ingestionId: string;
  revision: "CURRENT" | "SUPERSEDED";
  supersedesIngestionId: string | null;
  packageId: string | null;
  rawFileFingerprint: string;
  semanticPackageFingerprint: string | null;
  schemaVersion: string | null;
  providerId: string | null;
  providerVersion: string | null;
  adapterId: string | null;
  adapterVersion: string | null;
  mappingManifestId: string | null;
  mappingManifestVersion: string | null;
  mappingManifestFingerprint: string | null;
  objectMappingId: string | null;
  objectMappingFingerprint: string | null;
  projectId: string | null;
  tenantId: string | null;
  workspaceId: string | null;
  profileId: string | null;
  packageCompleteness: string | null;
  ingestionCompleteness: string | null;
  adapterExecutionFingerprint: string | null;
  sourcePayloadId: string | null;
  analysisModelId: string | null;
  analysisRunId: string | null;
  resultSetId: string | null;
  warnings: readonly { warningId: string; code: string; text: string }[];
  findings: readonly D1gR2Finding[];
  blockingFindings: readonly D1gR2Finding[];
  status: "INGESTED" | "PARTIAL" | "STALE" | "UNSUPPORTED" | "REJECTED";
  packageValidationState: D1gR2PackageValidationState;
  authorityState: string;
  canGovern: boolean;
  schemaValid: boolean;
  parsed: boolean;
  filename: string | null;
  mimeType: string | null;
  preservedBytes: Uint8Array;
  rawPackageMutated: false;
  packageAuthorityApplied: false;
  packageSelectedMapping: false;
  packageSelectedProject: false;
  packageSelectedProfile: false;
  ignoredPackageDeclarations: Readonly<Record<string, unknown>>;
  provenance: readonly { stage: string; subjectId: string; provenanceRef: string }[];
  fingerprint: string;
  pipeline: readonly string[];
  adapterExecution: D1gR1AdapterExecution | null;
};

type Resolved = {
  adapter: D1gR1AdapterIdentity | null;
  manifest: D1gR1MappingManifest | null;
  objectMapping: D1gR1ObjectMapping | null;
  mappingFingerprint: string | null;
  objectFingerprint: string | null;
};

const TOP_LEVEL = [
  "packageFormat", "schemaVersion", "packageId", "createdAt", "completeness", "producer", "provider", "source", "model", "run",
  "capabilities", "mappingExpectation", "objectMappingExpectation", "loadCases", "loadCombinations", "providerObjects", "results", "warnings", "extensions",
] as const;

export function inspectStructuralPackageText(text: string, maxDepth: number): { duplicateKey: string | null; tooDeep: boolean } {
  let index = 0;
  let duplicateKey: string | null = null;
  let tooDeep = false;
  const length = text.length;

  function ws() {
    while (index < length) {
      const ch = text[index];
      if (ch !== " " && ch !== "\n" && ch !== "\r" && ch !== "\t") break;
      index += 1;
    }
  }

  function parseString(): string | null {
    if (text[index] !== "\"") return null;
    index += 1;
    let out = "";
    while (index < length) {
      const ch = text[index];
      if (ch === "\"") {
        index += 1;
        return out;
      }
      if (ch === "\\") {
        index += 1;
        const esc = text[index];
        if (esc === undefined) return null;
        if (esc === "u") {
          out += text.slice(index, Math.min(length, index + 5));
          index += 5;
        } else {
          out += esc;
          index += 1;
        }
        continue;
      }
      out += ch;
      index += 1;
    }
    return null;
  }

  function skipLiteral() {
    while (index < length) {
      const ch = text[index]!;
      if (" \t\r\n,]}".includes(ch)) break;
      index += 1;
    }
  }

  function parseValue(depth: number): boolean {
    ws();
    const ch = text[index];
    if (ch === "{") return parseObject(depth);
    if (ch === "[") return parseArray(depth);
    if (ch === "\"") return parseString() !== null;
    if (ch === undefined) return false;
    skipLiteral();
    return true;
  }

  function parseObject(depth: number): boolean {
    if (depth > maxDepth) {
      tooDeep = true;
      return false;
    }
    index += 1;
    const seen = new Set<string>();
    ws();
    if (text[index] === "}") {
      index += 1;
      return true;
    }
    while (index < length) {
      ws();
      const key = parseString();
      if (key == null) return false;
      if (seen.has(key)) {
        duplicateKey = key;
        return false;
      }
      seen.add(key);
      ws();
      if (text[index] !== ":") return false;
      index += 1;
      if (!parseValue(depth + 1)) return false;
      ws();
      if (text[index] === "}") {
        index += 1;
        return true;
      }
      if (text[index] !== ",") return false;
      index += 1;
    }
    return false;
  }

  function parseArray(depth: number): boolean {
    if (depth > maxDepth) {
      tooDeep = true;
      return false;
    }
    index += 1;
    ws();
    if (text[index] === "]") {
      index += 1;
      return true;
    }
    while (index < length) {
      if (!parseValue(depth + 1)) return false;
      ws();
      if (text[index] === "]") {
        index += 1;
        return true;
      }
      if (text[index] !== ",") return false;
      index += 1;
    }
    return false;
  }

  ws();
  parseValue(1);
  return { duplicateKey, tooDeep };
}

export function ingestStructuralResultPackage(input: D1gR2IngestionInput): D1gR2IngestionResult {
  const limits = { ...D1G_R2_DEFAULT_RESOURCE_LIMITS, ...input.limits };
  const preserved = Uint8Array.from(input.bytes);
  const rawFileFingerprint = createHash("sha256").update(preserved).digest("hex");
  const findings: D1gR2Finding[] = [];
  const pipeline: string[] = ["FILE_RECEIVED", "RAW_BYTE_FINGERPRINT"];
  const add = (code: string, subjectId: string, message: string, severity: D1gR2Finding["severity"] = "BLOCKING") => {
    findings.push({ code, severity, subjectId, message });
  };

  const finish = (partial: Partial<D1gR2IngestionResult> & Pick<D1gR2IngestionResult, "packageValidationState" | "status" | "parsed" | "schemaValid">): D1gR2IngestionResult => {
    const blockingFindings = findings.filter((row) => row.severity === "BLOCKING");
    const projectId = partial.projectId ?? null;
    const fingerprint = fingerprintCanonical({
      subject: "RESULT_PACKAGE_INGESTION",
      identity: {
        rawFileFingerprint,
        semanticPackageFingerprint: partial.semanticPackageFingerprint ?? null,
        schemaVersion: partial.schemaVersion ?? null,
        adapterVersion: partial.adapterVersion ?? null,
        mappingManifestFingerprint: partial.mappingManifestFingerprint ?? null,
        objectMappingFingerprint: partial.objectMappingFingerprint ?? null,
        projectId,
        tenantId: partial.tenantId ?? null,
        workspaceId: partial.workspaceId ?? null,
        profileId: partial.profileId ?? null,
        topologyFingerprint: input.authorized.currentTopologyFingerprint,
        explicitResultAuthority: input.authorized.explicitResultAuthority,
        modelValidationEvidenceRef: input.authorized.modelValidationEvidenceRef,
        limits,
      },
    });
    return {
      ingestionId: `pkg-ingest:${rawFileFingerprint.slice(0, 16)}`,
      revision: "CURRENT",
      supersedesIngestionId: null,
      packageId: partial.packageId ?? null,
      rawFileFingerprint,
      semanticPackageFingerprint: partial.semanticPackageFingerprint ?? null,
      schemaVersion: partial.schemaVersion ?? null,
      providerId: partial.providerId ?? null,
      providerVersion: partial.providerVersion ?? null,
      adapterId: partial.adapterId ?? null,
      adapterVersion: partial.adapterVersion ?? null,
      mappingManifestId: partial.mappingManifestId ?? null,
      mappingManifestVersion: partial.mappingManifestVersion ?? null,
      mappingManifestFingerprint: partial.mappingManifestFingerprint ?? null,
      objectMappingId: partial.objectMappingId ?? null,
      objectMappingFingerprint: partial.objectMappingFingerprint ?? null,
      projectId,
      tenantId: partial.tenantId ?? null,
      workspaceId: partial.workspaceId ?? null,
      profileId: partial.profileId ?? null,
      packageCompleteness: partial.packageCompleteness ?? null,
      ingestionCompleteness: partial.ingestionCompleteness ?? null,
      adapterExecutionFingerprint: partial.adapterExecutionFingerprint ?? null,
      sourcePayloadId: partial.sourcePayloadId ?? null,
      analysisModelId: partial.analysisModelId ?? null,
      analysisRunId: partial.analysisRunId ?? null,
      resultSetId: partial.resultSetId ?? null,
      warnings: partial.warnings ?? [],
      findings: [...findings],
      blockingFindings,
      status: partial.status,
      packageValidationState: partial.packageValidationState,
      authorityState: partial.authorityState ?? "NOT_ADMITTED",
      canGovern: partial.canGovern ?? false,
      schemaValid: partial.schemaValid,
      parsed: partial.parsed,
      filename: input.filename ?? null,
      mimeType: input.mimeType ?? null,
      preservedBytes: preserved,
      rawPackageMutated: false,
      packageAuthorityApplied: false,
      packageSelectedMapping: false,
      packageSelectedProject: false,
      packageSelectedProfile: false,
      ignoredPackageDeclarations: partial.ignoredPackageDeclarations ?? {},
      provenance: partial.provenance ?? [{ stage: "RAW_FILE", subjectId: rawFileFingerprint, provenanceRef: rawFileFingerprint }],
      fingerprint,
      pipeline,
      adapterExecution: partial.adapterExecution ?? null,
    };
  };

  if (preserved.byteLength > limits.maxFileBytes) {
    add("FILE_SIZE_LIMIT", "package", "the package exceeds the maximum file size");
    return finish({ packageValidationState: "INVALID", status: "REJECTED", parsed: false, schemaValid: false });
  }
  pipeline.push("ENCODING_VALIDATION");
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(preserved);
  } catch {
    add("INVALID_UTF8", "package", "the package is not valid UTF-8");
    return finish({ packageValidationState: "INVALID", status: "REJECTED", parsed: false, schemaValid: false });
  }
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  pipeline.push("DUPLICATE_KEY_VALIDATION");
  const inspected = inspectStructuralPackageText(text, limits.maxNestingDepth);
  if (inspected.duplicateKey) {
    add("DUPLICATE_JSON_KEY", inspected.duplicateKey, "duplicate JSON object keys are rejected");
    return finish({ packageValidationState: "INVALID", status: "REJECTED", parsed: false, schemaValid: false });
  }
  if (inspected.tooDeep) {
    add("DEPTH_LIMIT", "package", "the package exceeds the nesting depth limit");
    return finish({ packageValidationState: "INVALID", status: "REJECTED", parsed: false, schemaValid: false });
  }
  pipeline.push("JSON_PARSE");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    add("MALFORMED_JSON", "package", "the package is not a JSON value");
    return finish({ packageValidationState: "INVALID", status: "REJECTED", parsed: false, schemaValid: false });
  }
  pipeline.push("RESOURCE_LIMIT_VALIDATION");
  const resource = inspectResources(parsed, limits);
  if (resource) {
    add(resource, "package", "the package exceeds a resource limit or contains a non-finite number");
    return finish({ packageValidationState: "INVALID", status: "REJECTED", parsed: true, schemaValid: false });
  }
  pipeline.push("SCHEMA_VALIDATION");
  const schema = readPackage(parsed, limits, add);
  if (!schema) {
    return finish({ packageValidationState: "INVALID", status: "REJECTED", parsed: true, schemaValid: false });
  }
  const semanticPackageFingerprint = fingerprintCanonical({ subject: "RESULT_PACKAGE", identity: semanticView(schema) });
  pipeline.push("REFERENTIAL_VALIDATION");
  if (!referential(schema, add)) {
    return finish({
      packageValidationState: "INVALID",
      status: "REJECTED",
      parsed: true,
      schemaValid: true,
      semanticPackageFingerprint,
      packageId: schema.packageId,
      schemaVersion: schema.schemaVersion,
      providerId: schema.provider.providerId,
      providerVersion: schema.provider.providerVersion,
      packageCompleteness: schema.completeness,
      warnings: schema.warnings.map((row) => ({ warningId: row.warningId, code: row.code, text: row.text })),
      ignoredPackageDeclarations: ignoredDeclarations(schema),
    });
  }
  pipeline.push("AUTHORIZED_CONTEXT_RESOLUTION");
  if (!input.authorized.projectId || !input.authorized.tenantId || !input.authorized.workspaceId || !input.profileId) {
    add("AUTHORIZED_CONTEXT_REQUIRED", schema.packageId, "ingestion requires an authorized tenant, workspace, project, and profile");
    return finish(basePartial(schema, semanticPackageFingerprint, "INVALID", "REJECTED"));
  }
  pipeline.push("ADAPTER_RESOLUTION", "MAPPING_MANIFEST_RESOLUTION", "OBJECT_MAPPING_RESOLUTION");
  const resolved = resolveGoverned(schema, input, add);
  if (findings.some((row) => row.severity === "BLOCKING")) {
    const unsupported = findings.some((row) => row.code === "UNKNOWN_PROVIDER" || row.code === "UNSUPPORTED_PROVIDER_VERSION");
    return finish({
      ...basePartial(schema, semanticPackageFingerprint, unsupported ? "UNSUPPORTED" : "INVALID", unsupported ? "UNSUPPORTED" : "REJECTED"),
      adapterId: resolved.adapter?.adapterId ?? null,
      adapterVersion: resolved.adapter?.adapterVersion ?? null,
      mappingManifestId: resolved.manifest?.manifestId ?? null,
      mappingManifestVersion: resolved.manifest?.manifestVersion ?? null,
      mappingManifestFingerprint: resolved.mappingFingerprint,
      objectMappingId: resolved.objectMapping?.mappingId ?? null,
      objectMappingFingerprint: resolved.objectFingerprint,
      projectId: input.authorized.projectId,
      tenantId: input.authorized.tenantId,
      workspaceId: input.authorized.workspaceId,
      profileId: input.profileId,
    });
  }
  const adapter = resolved.adapter!;
  const manifest = resolved.manifest!;
  const objectMapping = resolved.objectMapping!;
  pipeline.push("R1_ADAPTER_EXECUTION", "D1F_RAW_HANDOFF", "D1F_NORMALIZATION");
  const source = toSource(schema, input.authorized);
  const execution = executeProviderNeutralAdapter({
    adapter,
    source,
    mappingManifest: manifest,
    objectMapping,
    governed: input.authorized,
    transform: input.transform ?? null,
  });
  for (const finding of execution.findings) add(finding.code, finding.subjectId, finding.message, finding.severity);
  pipeline.push("INGESTION_RESULT");
  const binding = execution.handoffs[0]?.binding;
  const packageClaimsComplete = schema.completeness === "COMPLETE";
  const adapterComplete = execution.completeness === "COMPLETE_FOR_DECLARED_ADAPTER_SCOPE";
  const ingestionCompleteness = adapterComplete && packageClaimsComplete ? "COMPLETE" : execution.completeness === "STALE" ? "STALE" : "PARTIAL";
  const canGovern = execution.canGovern && ingestionCompleteness === "COMPLETE";
  const status = execution.completeness === "STALE" ? "STALE" : canGovern ? "INGESTED" : execution.completeness === "UNSUPPORTED" ? "UNSUPPORTED" : "PARTIAL";
  const packageValidationState: D1gR2PackageValidationState = execution.completeness === "STALE"
    ? "STALE"
    : canGovern
      ? "SEMANTICALLY_VALID"
      : ingestionCompleteness === "PARTIAL"
        ? "PARTIAL"
        : "SCHEMA_VALID";
  return finish({
    ...basePartial(schema, semanticPackageFingerprint, packageValidationState, status),
    adapterId: adapter.adapterId,
    adapterVersion: adapter.adapterVersion,
    mappingManifestId: manifest.manifestId,
    mappingManifestVersion: manifest.manifestVersion,
    mappingManifestFingerprint: resolved.mappingFingerprint,
    objectMappingId: objectMapping.mappingId,
    objectMappingFingerprint: resolved.objectFingerprint,
    projectId: input.authorized.projectId,
    tenantId: input.authorized.tenantId,
    workspaceId: input.authorized.workspaceId,
    profileId: input.profileId,
    ingestionCompleteness,
    adapterExecutionFingerprint: execution.executionFingerprint,
    sourcePayloadId: source.sourcePayloadId,
    analysisModelId: binding?.analysisModelId ?? input.authorized.analysisModelId,
    analysisRunId: binding?.analysisRunId ?? null,
    resultSetId: binding?.resultSetId ?? null,
    authorityState: binding?.authority ?? input.authorized.explicitResultAuthority,
    canGovern,
    adapterExecution: execution,
    provenance: [
      { stage: "RAW_FILE", subjectId: schema.packageId, provenanceRef: rawFileFingerprint },
      { stage: "SEMANTIC_PACKAGE", subjectId: schema.packageId, provenanceRef: semanticPackageFingerprint },
      { stage: "INGESTION", subjectId: schema.packageId, provenanceRef: adapter.adapterVersion },
      { stage: "OBJECT_MAPPING", subjectId: objectMapping.mappingId, provenanceRef: resolved.objectFingerprint ?? objectMapping.mappingVersion },
      ...execution.provenance,
    ],
  });
}

export function recordSuccessorPackageIngestion(prior: D1gR2IngestionResult, input: D1gR2IngestionInput): { prior: D1gR2IngestionResult; current: D1gR2IngestionResult; history: readonly D1gR2IngestionResult[] } {
  const current = ingestStructuralResultPackage(input);
  return {
    prior: { ...prior, revision: "SUPERSEDED" },
    current: { ...current, supersedesIngestionId: prior.ingestionId },
    history: [prior, current],
  };
}

export function semanticPackageFingerprint(pkg: D1gR2PackageDocument): string {
  return fingerprintCanonical({ subject: "RESULT_PACKAGE", identity: semanticView(pkg) });
}

function basePartial(schema: D1gR2PackageDocument, semanticPackageFingerprint: string, packageValidationState: D1gR2PackageValidationState, status: D1gR2IngestionResult["status"]): Partial<D1gR2IngestionResult> & Pick<D1gR2IngestionResult, "packageValidationState" | "status" | "parsed" | "schemaValid"> {
  return {
    packageValidationState,
    status,
    parsed: true,
    schemaValid: true,
    semanticPackageFingerprint,
    packageId: schema.packageId,
    schemaVersion: schema.schemaVersion,
    providerId: schema.provider.providerId,
    providerVersion: schema.provider.providerVersion,
    packageCompleteness: schema.completeness,
    warnings: schema.warnings.map((row) => ({ warningId: row.warningId, code: row.code, text: row.text })),
    ignoredPackageDeclarations: ignoredDeclarations(schema),
  };
}

function ignoredDeclarations(schema: D1gR2PackageDocument): Record<string, unknown> {
  const extensions = schema.extensions;
  return {
    declaredProjectId: extensions.declaredProjectId ?? null,
    declaredTenantId: extensions.declaredTenantId ?? null,
    declaredProfileId: extensions.declaredProfileId ?? null,
    declaredAuthority: extensions.declaredAuthority ?? null,
    declaredModelValidated: extensions.declaredModelValidated ?? null,
  };
}

function resolveGoverned(schema: D1gR2PackageDocument, input: D1gR2IngestionInput, add: (code: string, subjectId: string, message: string, severity?: D1gR2Finding["severity"]) => void): Resolved {
  const matches = input.registry.adapters.filter((row) => row.providerId === schema.provider.providerId);
  const adapter = matches.find((row) => row.supportedProviderVersions.includes(schema.provider.providerVersion)) ?? null;
  if (matches.length === 0) add("UNKNOWN_PROVIDER", schema.provider.providerId, "no governed adapter is installed for the declared provider");
  else if (!adapter) add("UNSUPPORTED_PROVIDER_VERSION", schema.provider.providerVersion, "the declared provider version is outside the governed adapter range");
  const manifest = input.registry.mappingManifests.find((row) => row.manifestId === schema.mappingExpectation.mappingManifestId && row.manifestVersion === schema.mappingExpectation.mappingManifestVersion && row.authority === "EXPLICIT_GOVERNED") ?? null;
  if (!manifest) add("UNRESOLVED_MAPPING_MANIFEST", schema.mappingExpectation.mappingManifestId, "the governed mapping manifest is resolved from EOS configuration");
  const mappingFingerprint = manifest ? fingerprintCanonical({ subject: "MAPPING_MANIFEST", identity: manifest }) : null;
  if (manifest && schema.mappingExpectation.mappingManifestFingerprint && schema.mappingExpectation.mappingManifestFingerprint !== mappingFingerprint) {
    add("MAPPING_FINGERPRINT_MISMATCH", manifest.manifestId, "a package mapping fingerprint that differs from the governed manifest cannot govern");
  }
  const objectMapping = input.registry.objectMappings.find((row) => row.mappingId === schema.objectMappingExpectation.objectMappingId && row.mappingVersion === schema.objectMappingExpectation.objectMappingVersion && row.authority === "EXPLICIT_GOVERNED") ?? null;
  if (!objectMapping) add("UNRESOLVED_OBJECT_MAPPING", schema.objectMappingExpectation.objectMappingId, "the package cannot approve its own object mapping");
  if (objectMapping && objectMapping.tenantId !== input.authorized.tenantId) add("CROSS_TENANT", objectMapping.mappingId, "a result package cannot bind across the authorized tenant");
  else if (objectMapping && objectMapping.projectId !== input.authorized.projectId) add("CROSS_PROJECT", objectMapping.mappingId, "a result package cannot bind across the authorized project");
  else if (objectMapping && objectMapping.workspaceId !== input.authorized.workspaceId) add("CROSS_WORKSPACE", objectMapping.mappingId, "a result package cannot bind across the authorized workspace");
  const declared = new Set<string>(adapter?.declaredCapabilities ?? []);
  for (const capability of schema.capabilities) {
    if (adapter && !declared.has(capability)) add("CAPABILITY_MISMATCH", capability, "a package capability the adapter does not declare cannot govern");
  }
  const objectFingerprint = objectMapping ? fingerprintCanonical({ subject: "OBJECT_MAPPING", identity: { mapping: objectMapping, providerVersion: schema.provider.providerVersion } }) : null;
  return { adapter, manifest, objectMapping, mappingFingerprint, objectFingerprint };
}

function toSource(schema: D1gR2PackageDocument, authorized: D1gR1GovernedContext): D1gR1ProviderSource {
  const results = [...schema.results].sort((left, right) => left.providerResultId.localeCompare(right.providerResultId)).map(toResult);
  return {
    sourcePayloadId: schema.packageId,
    providerId: schema.provider.providerId,
    providerName: schema.provider.providerName,
    providerVersion: schema.provider.providerVersion,
    providerModelVersion: schema.model.modelVersion,
    providerRunVersion: schema.run.runVersion,
    sourceType: "RESULT_PACKAGE_V1",
    sourceName: schema.source.sourceName,
    sourceVersion: schema.source.sourceVersion,
    sourceTimestamp: schema.source.sourceTimestamp,
    projectId: authorized.projectId,
    tenantId: authorized.tenantId,
    workspaceId: authorized.workspaceId,
    providerModelId: schema.model.providerModelId,
    analysisType: schema.model.analysisType,
    unitContextRef: schema.model.unitContextRef,
    coordinateSystemRef: schema.model.coordinateSystemRef,
    signConventionRef: schema.model.signConventionRef,
    providerRunId: schema.run.providerRunId,
    providerRunState: schema.run.providerRunState,
    providerConvergenceState: schema.run.providerConvergenceState,
    warnings: [...schema.warnings].sort((left, right) => left.warningId.localeCompare(right.warningId)).map((row) => ({ warningId: row.warningId, code: row.code, text: row.text })),
    cases: [...schema.loadCases].sort((left, right) => left.providerCaseId.localeCompare(right.providerCaseId)).map((row) => ({ providerCaseId: row.providerCaseId, label: row.providerCaseName })),
    combinations: [...schema.loadCombinations].sort((left, right) => left.providerCombinationId.localeCompare(right.providerCombinationId)).map((row) => ({ providerCombinationId: row.providerCombinationId, label: row.providerCombinationName })),
    results,
    unknownFields: { ...schema.extensions },
  };
}

function toResult(result: D1gR2PackageResult): D1gR1ProviderResult {
  return {
    providerResultId: result.providerResultId,
    providerObjectId: result.providerObjectId,
    providerCategory: result.resultCategory,
    providerQuantityName: result.providerQuantityName,
    value: result.rawValue,
    explicitZero: result.explicitZero,
    unit: result.rawUnit,
    coordinateSystemRef: result.coordinateSystem,
    signConventionRef: result.signConvention,
    location: result.resultLocation,
    stationValue: result.station?.value ?? null,
    stationUnit: result.station?.unit ?? null,
    stationOrigin: result.station?.origin ?? null,
    stationOrientation: result.station?.orientation ?? null,
    providerCaseId: result.providerCaseId,
    providerCombinationId: result.providerCombinationId,
  };
}

function referential(schema: D1gR2PackageDocument, add: (code: string, subjectId: string, message: string, severity?: D1gR2Finding["severity"]) => void): boolean {
  const objects = new Set(schema.providerObjects.map((row) => row.providerObjectId));
  const cases = new Set(schema.loadCases.map((row) => row.providerCaseId));
  const combinations = new Set(schema.loadCombinations.map((row) => row.providerCombinationId));
  const results = new Set<string>();
  const warnings = new Set(schema.warnings.map((row) => row.warningId));
  let ok = true;
  const fail = (code: string, subjectId: string, message: string) => {
    ok = false;
    add(code, subjectId, message);
  };
  for (const result of schema.results) {
    if (results.has(result.providerResultId)) fail("DUPLICATE_RESULT_ID", result.providerResultId, "provider result identity must be unique within the package run");
    results.add(result.providerResultId);
    if (!objects.has(result.providerObjectId)) fail("BROKEN_OBJECT_REFERENCE", result.providerResultId, "a result references an unknown provider object");
    if (result.providerRunId !== schema.run.providerRunId) fail("BROKEN_RUN_REFERENCE", result.providerResultId, "a result references an unknown run");
    if (result.providerCaseId && !cases.has(result.providerCaseId)) fail("BROKEN_CASE_REFERENCE", result.providerResultId, "a result references an unknown load case");
    if (result.providerCombinationId && !combinations.has(result.providerCombinationId)) fail("BROKEN_COMBINATION_REFERENCE", result.providerResultId, "a result references an unknown load combination");
    for (const warningId of result.warningIds) {
      if (!warnings.has(warningId)) fail("BROKEN_WARNING_REFERENCE", result.providerResultId, "a result references an unknown warning");
    }
  }
  for (const warning of schema.warnings) {
    if (warning.resultId && !results.has(warning.resultId)) fail("BROKEN_WARNING_RESULT_REFERENCE", warning.warningId, "a warning references an unknown result");
  }
  return ok;
}

function semanticView(schema: D1gR2PackageDocument): D1gR2PackageDocument {
  return {
    ...schema,
    capabilities: [...schema.capabilities].sort(),
    loadCases: [...schema.loadCases].sort((left, right) => left.providerCaseId.localeCompare(right.providerCaseId)),
    loadCombinations: [...schema.loadCombinations].sort((left, right) => left.providerCombinationId.localeCompare(right.providerCombinationId)),
    providerObjects: [...schema.providerObjects].sort((left, right) => left.providerObjectId.localeCompare(right.providerObjectId)),
    results: [...schema.results].sort((left, right) => left.providerResultId.localeCompare(right.providerResultId)),
    warnings: [...schema.warnings].sort((left, right) => left.warningId.localeCompare(right.warningId)),
  };
}

function inspectResources(value: unknown, limits: D1gR2ResourceLimits): string | null {
  const stack: { value: unknown; depth: number }[] = [{ value, depth: 1 }];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current.depth > limits.maxNestingDepth) return "DEPTH_LIMIT";
    if (typeof current.value === "number" && !Number.isFinite(current.value)) return "NON_FINITE_NUMBER";
    if (typeof current.value === "string" && current.value.length > limits.maxStringLength) return "STRING_LENGTH_LIMIT";
    if (Array.isArray(current.value)) {
      if (current.value.length > limits.maxArrayLength) return "ARRAY_LENGTH_LIMIT";
      for (const item of current.value) stack.push({ value: item, depth: current.depth + 1 });
      continue;
    }
    if (current.value && typeof current.value === "object") {
      for (const nested of Object.values(current.value)) stack.push({ value: nested, depth: current.depth + 1 });
    }
  }
  return null;
}

function readPackage(value: unknown, limits: D1gR2ResourceLimits, add: (code: string, subjectId: string, message: string, severity?: D1gR2Finding["severity"]) => void): D1gR2PackageDocument | null {
  if (!isRecord(value)) {
    add("SCHEMA_INVALID", "package", "the package root must be an object");
    return null;
  }
  const extra = Object.keys(value).filter((key) => !TOP_LEVEL.includes(key as never));
  if (extra.length > 0) {
    add("UNKNOWN_FIELD", extra[0]!, "an unknown engineering field is rejected");
    return null;
  }
  if (value.packageFormat !== D1G_R2_PACKAGE_FORMAT) {
    add("UNKNOWN_PACKAGE_FORMAT", "packageFormat", "the package format marker is required");
    return null;
  }
  if (value.schemaVersion !== D1G_R2_SCHEMA_VERSION) {
    add("UNKNOWN_SCHEMA_VERSION", "schemaVersion", "only result package schema version 1 is accepted");
    return null;
  }
  const completeness = value.completeness === "COMPLETE" || value.completeness === "PARTIAL" ? value.completeness : null;
  const producer = readPair(value.producer, ["producerId", "producerName"]);
  const provider = readPair(value.provider, ["providerId", "providerName", "providerVersion"]);
  const source = readPair(value.source, ["sourceName", "sourceVersion", "sourceTimestamp"]);
  const model = readModel(value.model);
  const run = readPair(value.run, ["providerRunId", "providerRunState", "providerConvergenceState", "runVersion", "runTimestamp"]);
  const mapping = readMapping(value.mappingExpectation);
  const objectsExpectation = readPair(value.objectMappingExpectation, ["objectMappingId", "objectMappingVersion"]);
  if (!completeness || !producer || !provider || !source || !model || !run || !mapping || !objectsExpectation || typeof value.packageId !== "string" || typeof value.createdAt !== "string" || !Array.isArray(value.capabilities)) {
    add("SCHEMA_INVALID", "package", "the package is missing a required version 1 field");
    return null;
  }
  if (!identifier(value.packageId, limits) || value.createdAt.length > limits.maxStringLength || !value.capabilities.every((item) => typeof item === "string" && identifier(item, limits))) {
    add("IDENTIFIER_LENGTH_LIMIT", value.packageId, "an identifier exceeds the package limit");
    return null;
  }
  const loadCases = readRows(value.loadCases, ["providerCaseId", "providerCaseName"], ["providerCaseType"]);
  const loadCombinations = readRows(value.loadCombinations, ["providerCombinationId", "providerCombinationName"], ["providerCombinationType"]);
  const providerObjects = readRows(value.providerObjects, ["providerObjectId", "providerObjectType", "providerModelId"], []);
  const warnings = readWarnings(value.warnings);
  const results = readResults(value.results);
  const extensions = value.extensions === undefined ? {} : value.extensions;
  if (!loadCases || !loadCombinations || !providerObjects || !warnings || !results || !isRecord(extensions)) {
    add("SCHEMA_INVALID", "package", "a package collection or result record is outside the version 1 schema");
    return null;
  }
  if (results.length > limits.maxResultCount) {
    add("RESULT_COUNT_LIMIT", "results", "the result count exceeds the package limit");
    return null;
  }
  if (providerObjects.length > limits.maxObjectCount || warnings.length > limits.maxWarningCount || loadCases.length > limits.maxCaseCount || loadCombinations.length > limits.maxCombinationCount) {
    add("COLLECTION_COUNT_LIMIT", "package", "a package collection exceeds its limit");
    return null;
  }
  const ids = [value.packageId, producer.producerId, provider.providerId, provider.providerVersion, source.sourceName, model.providerModelId, run.providerRunId, mapping.mappingManifestId, objectsExpectation.objectMappingId];
  if (ids.some((item) => !identifier(String(item), limits))) {
    add("IDENTIFIER_LENGTH_LIMIT", "package", "an identifier exceeds the package limit");
    return null;
  }
  return {
    packageFormat: D1G_R2_PACKAGE_FORMAT,
    schemaVersion: D1G_R2_SCHEMA_VERSION,
    packageId: value.packageId,
    createdAt: value.createdAt,
    completeness,
    producer: { producerId: String(producer.producerId), producerName: String(producer.producerName) },
    provider: { providerId: String(provider.providerId), providerName: String(provider.providerName), providerVersion: String(provider.providerVersion) },
    source: { sourceName: String(source.sourceName), sourceVersion: String(source.sourceVersion), sourceTimestamp: String(source.sourceTimestamp) },
    model,
    run: {
      providerRunId: String(run.providerRunId),
      providerRunState: String(run.providerRunState),
      providerConvergenceState: String(run.providerConvergenceState),
      runVersion: String(run.runVersion),
      runTimestamp: String(run.runTimestamp),
    },
    capabilities: value.capabilities.map(String),
    mappingExpectation: {
      mappingManifestId: String(mapping.mappingManifestId),
      mappingManifestVersion: String(mapping.mappingManifestVersion),
      mappingManifestFingerprint: mapping.mappingManifestFingerprint == null ? null : String(mapping.mappingManifestFingerprint),
    },
    objectMappingExpectation: { objectMappingId: String(objectsExpectation.objectMappingId), objectMappingVersion: String(objectsExpectation.objectMappingVersion) },
    loadCases: loadCases.map((row) => ({ providerCaseId: String(row.providerCaseId), providerCaseName: String(row.providerCaseName), providerCaseType: row.providerCaseType == null ? null : String(row.providerCaseType) })),
    loadCombinations: loadCombinations.map((row) => ({ providerCombinationId: String(row.providerCombinationId), providerCombinationName: String(row.providerCombinationName), providerCombinationType: row.providerCombinationType == null ? null : String(row.providerCombinationType) })),
    providerObjects: providerObjects.map((row) => ({ providerObjectId: String(row.providerObjectId), providerObjectType: String(row.providerObjectType), providerModelId: String(row.providerModelId) })),
    results,
    warnings: warnings.map((row) => ({ warningId: String(row.warningId), code: String(row.code), text: String(row.text), resultId: row.resultId == null ? null : String(row.resultId) })),
    extensions,
  };
}

function readResults(value: unknown): D1gR2PackageResult[] | null {
  if (!Array.isArray(value)) return null;
  const results: D1gR2PackageResult[] = [];
  for (const row of value) {
    if (!isRecord(row)) return null;
    const allowed = ["providerResultId", "providerObjectId", "providerRunId", "resultCategory", "providerQuantityName", "rawValue", "explicitZero", "rawUnit", "coordinateSystem", "signConvention", "resultLocation", "station", "providerCaseId", "providerCombinationId", "warningIds"];
    if (Object.keys(row).some((key) => !allowed.includes(key))) return null;
    if (typeof row.providerResultId !== "string" || typeof row.providerObjectId !== "string" || typeof row.providerRunId !== "string" || typeof row.resultCategory !== "string" || typeof row.providerQuantityName !== "string" || typeof row.explicitZero !== "boolean") return null;
    if (!(row.rawValue === null || (typeof row.rawValue === "number" && Number.isFinite(row.rawValue)))) return null;
    if (row.explicitZero && row.rawValue === null) return null;
    const station = row.station == null ? null : readStation(row.station);
    if (row.station != null && !station) return null;
    if (!Array.isArray(row.warningIds) || row.warningIds.some((item) => typeof item !== "string")) return null;
    results.push({
      providerResultId: row.providerResultId,
      providerObjectId: row.providerObjectId,
      providerRunId: row.providerRunId,
      resultCategory: row.resultCategory,
      providerQuantityName: row.providerQuantityName,
      rawValue: row.rawValue,
      explicitZero: row.explicitZero,
      rawUnit: nullableString(row.rawUnit),
      coordinateSystem: nullableString(row.coordinateSystem),
      signConvention: nullableString(row.signConvention),
      resultLocation: nullableString(row.resultLocation),
      station,
      providerCaseId: nullableString(row.providerCaseId),
      providerCombinationId: nullableString(row.providerCombinationId),
      warningIds: row.warningIds.map(String),
    });
  }
  return results;
}

function readStation(value: unknown): D1gR2PackageResult["station"] {
  if (!isRecord(value)) return null;
  if (typeof value.value !== "number" || !Number.isFinite(value.value) || typeof value.unit !== "string" || typeof value.origin !== "string" || typeof value.orientation !== "string") return null;
  if (Object.keys(value).some((key) => !["value", "unit", "origin", "orientation"].includes(key))) return null;
  return { value: value.value, unit: value.unit, origin: value.origin, orientation: value.orientation };
}

function readWarnings(value: unknown): Record<string, unknown>[] | null {
  if (!Array.isArray(value)) return null;
  const rows: Record<string, unknown>[] = [];
  for (const row of value) {
    if (!isRecord(row)) return null;
    if (Object.keys(row).some((key) => !["warningId", "code", "text", "resultId"].includes(key))) return null;
    if (typeof row.warningId !== "string" || typeof row.code !== "string" || typeof row.text !== "string") return null;
    if (!(row.resultId == null || typeof row.resultId === "string")) return null;
    rows.push(row);
  }
  return rows;
}

function readRows(value: unknown, required: readonly string[], optional: readonly string[]): Record<string, unknown>[] | null {
  if (!Array.isArray(value)) return null;
  const rows: Record<string, unknown>[] = [];
  for (const row of value) {
    if (!isRecord(row)) return null;
    const allowed = [...required, ...optional];
    if (Object.keys(row).some((key) => !allowed.includes(key))) return null;
    if (required.some((key) => typeof row[key] !== "string")) return null;
    rows.push(row);
  }
  return rows;
}

function readModel(value: unknown): D1gR2PackageDocument["model"] | null {
  if (!isRecord(value)) return null;
  const allowed = ["providerModelId", "modelVersion", "analysisType", "unitContextRef", "coordinateSystemRef", "signConventionRef"];
  if (Object.keys(value).some((key) => !allowed.includes(key))) return null;
  if (typeof value.providerModelId !== "string" || typeof value.modelVersion !== "string" || typeof value.analysisType !== "string") return null;
  return {
    providerModelId: value.providerModelId,
    modelVersion: value.modelVersion,
    analysisType: value.analysisType,
    unitContextRef: nullableString(value.unitContextRef),
    coordinateSystemRef: nullableString(value.coordinateSystemRef),
    signConventionRef: nullableString(value.signConventionRef),
  };
}

function readMapping(value: unknown): { mappingManifestId: string; mappingManifestVersion: string; mappingManifestFingerprint: string | null } | null {
  if (!isRecord(value)) return null;
  if (Object.keys(value).some((key) => !["mappingManifestId", "mappingManifestVersion", "mappingManifestFingerprint"].includes(key))) return null;
  if (typeof value.mappingManifestId !== "string" || typeof value.mappingManifestVersion !== "string") return null;
  if (!(value.mappingManifestFingerprint == null || typeof value.mappingManifestFingerprint === "string")) return null;
  return { mappingManifestId: value.mappingManifestId, mappingManifestVersion: value.mappingManifestVersion, mappingManifestFingerprint: value.mappingManifestFingerprint ?? null };
}

function readPair(value: unknown, keys: readonly string[]): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  if (Object.keys(value).some((key) => !keys.includes(key))) return null;
  if (keys.some((key) => typeof value[key] !== "string" || value[key] === "")) return null;
  return value;
}

function identifier(value: string, limits: D1gR2ResourceLimits): boolean {
  return value.length > 0 && value.length <= limits.maxIdentifierLength;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
