import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { generateEngineeringWorkPlan } from "../work-generator/generator";
import { templateFor } from "../work-generator/catalog";
import {
  A11A_SYSTEM_ID,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  detailedDesignReadySnapshot,
  WORKFLOW_READINESS,
} from "../work-generator/fixture";
import { createMemoryWorkPlanStore } from "../work-generator/memory-store";
import { createMemoryArtifactStore } from "./memory-store";
import { createTestArtifactService } from "./service";
import { LegacyRelationalArtifactBinaryStore, MemoryObjectArtifactBinaryStore, RoutingArtifactBinaryStore } from "./binary-adapters";
import { migrateLegacyArtifact, rollbackPointer } from "./binary-migration";
import {
  ARTIFACT_SIZE_POLICY,
  ENGINEERING_ARTIFACT_BUCKET,
  OBJECT_STORAGE_BACKEND,
  OBJECT_STORAGE_PROVIDER,
  PILOT_LIMITS,
  PUBLIC_BUCKET_REQUIRED,
  assertObjectKeyAuthorization,
  assertSignedDownload,
  hashBytes,
  pointerFromArtifact,
  serverObjectKey,
} from "./binary-store";
import { SupabaseArtifactBinaryStore } from "./supabase-binary-store";
import { sanitizeArtifactFileName } from "./filename";
import { assertOfficePackage } from "./validate";
import { writeZip, zipHasUnsafeParts } from "./zip";
import { createTestOrchestrationService } from "../tool-orchestration/service";
import {
  EICAR_TEST_SIGNATURE,
  contentDisposition,
  scanReturnedBytes,
  validateReturnedPackage,
} from "../tool-orchestration/return-validation";
import { rejectArbitraryUrlFetch } from "../connectors/core/security";
import {
  A14A_KILL_SWITCH,
  A14A_NAMED_PILOT_USERS,
  A14A_PILOT_PROFILE,
  A14A_PILOT_SCOPE,
  SURVEILLANCE_PROHIBITIONS,
  controlledPilotEnabled,
  returnedBinaryUploadsInPilot,
} from "../pilot/a14a-profile";

function commerce(action: "analysis.read" | "analysis.write" = "analysis.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

async function desk(binaryStore?: RoutingArtifactBinaryStore) {
  const plan = generateEngineeringWorkPlan({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    workType: "DESIGN_CALCULATION",
    template: templateFor("DESIGN_CALCULATION", "DETAILED_DESIGN")!,
    snapshot: detailedDesignReadySnapshot(),
    readiness: WORKFLOW_READINESS.detailedReady,
    discipline: "STRUCTURAL",
    systemId: A11A_SYSTEM_ID,
    generatedBy: "cert-a14a",
  });
  const plans = createMemoryWorkPlanStore();
  await plans.savePlan(plan);
  const artifacts = createMemoryArtifactStore();
  const artifactSvc = createTestArtifactService(artifacts, (id) => plans.getPlan(id), undefined, undefined, binaryStore);
  const orch = createTestOrchestrationService({
    artifacts,
    loadPlan: (id) => plans.getPlan(id),
    binaryStore,
  });
  return { plan, artifactSvc, orch };
}

function fakeStorage() {
  const objects = new Map<string, Uint8Array>();
  return {
    objects,
    storage: {
      from(bucket: string) {
        return {
          async upload(path: string, body: Buffer | Uint8Array, options?: { upsert?: boolean }) {
            const key = `${bucket}:${path}`;
            if (objects.has(key) && options?.upsert === false) return { error: { message: "The resource already exists" } };
            objects.set(key, Uint8Array.from(body));
            return { error: null };
          },
          async download(path: string) {
            const data = objects.get(`${bucket}:${path}`);
            if (!data) return { data: null, error: { message: "not found" } };
            return { data, error: null };
          },
          async createSignedUrl(path: string, expiresIn: number) {
            if (!objects.has(`${bucket}:${path}`)) return { data: null, error: { message: "missing" } };
            return { data: { signedUrl: `https://storage.example/${bucket}/${path}?ttl=${expiresIn}` }, error: null };
          },
        };
      },
    },
  };
}

describe("EOS-A14A object storage, malware, and security hardening", () => {
  it("selects a private dedicated generated-artifact bucket and controlled-pilot limits", () => {
    expect(OBJECT_STORAGE_BACKEND).toBe("EXISTING_IMPLEMENTED");
    expect(OBJECT_STORAGE_PROVIDER).toBe("SUPABASE_STORAGE");
    expect(ENGINEERING_ARTIFACT_BUCKET).toBe("engineering-artifacts");
    expect(PUBLIC_BUCKET_REQUIRED).toBe(false);
    expect(ARTIFACT_SIZE_POLICY.configurationScope).toBe("CONTROLLED_PILOT");
    expect(PILOT_LIMITS.notUniversalEosLimit).toBe(true);
    expect(PILOT_LIMITS.signedUrlTtlSeconds).toBe(300);
    expect(A14A_PILOT_PROFILE).toBe("PROFILE_A_CORE_EOS");
    expect(A14A_PILOT_SCOPE.excluded).toContain("returned binary uploads until hosted malware PASS");
    expect(A14A_NAMED_PILOT_USERS).toContain("cert-er-a1@rtb-cert.test");
    expect(A14A_KILL_SWITCH.newInfrastructure).toBe(false);
    expect(controlledPilotEnabled({ EOS_CONTROLLED_PILOT_ENABLED: "0" })).toBe(false);
    expect(returnedBinaryUploadsInPilot({})).toBe(false);
    expect(SURVEILLANCE_PROHIBITIONS.productivityScoring).toBe(false);
    expect(SURVEILLANCE_PROHIBITIONS.keystrokeMonitoring).toBe(false);
  });

  it("writes new generated artifacts to object storage without dual-write and still reads legacy rows", async () => {
    const routing = new RoutingArtifactBinaryStore(new LegacyRelationalArtifactBinaryStore(), new MemoryObjectArtifactBinaryStore());
    const { plan, artifactSvc } = await desk(routing);
    const generated = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactType: "CALCULATION_WORKBOOK",
      projectCode: "ER-A1",
    });
    expect(generated.ok).toBe(true);
    if (!generated.ok) return;
    expect(generated.artifact.storageKind).toBe("OBJECT_STORAGE");
    expect(generated.artifact.contentBase64).toBe("");
    expect(generated.artifact.objectKey).toContain(`/${generated.artifact.projectId}/`);
    expect(generated.artifact.objectKey).not.toContain("..");
    const opened = await artifactSvc.openBinary(commerce("analysis.read"), CRUSHER_FEED_TENANT, generated.artifact.id);
    expect(opened?.bytes.byteLength).toBeGreaterThan(32);
    expect(hashBytes(opened!.bytes)).toBe(generated.artifact.contentSha256 ?? generated.artifact.sha256);

    const legacy = new LegacyRelationalArtifactBinaryStore();
    const legacyBytes = Uint8Array.from(Buffer.from("PK\u0003\u0004legacy-xlsx"));
    const pointer = pointerFromArtifact({
      ...generated.artifact,
      id: "legacy-compat",
      storageKind: "LEGACY_RELATIONAL",
      sha256: hashBytes(legacyBytes),
      byteSize: legacyBytes.byteLength,
    });
    legacy.loadFromBase64(pointer, Buffer.from(legacyBytes).toString("base64"));
    const mixed = new RoutingArtifactBinaryStore(legacy, new MemoryObjectArtifactBinaryStore());
    const readLegacy = await mixed.openRead(pointer, {
      tenantId: generated.artifact.tenantId,
      workspaceId: generated.artifact.workspaceId,
      projectId: generated.artifact.projectId,
    });
    expect(Buffer.from(readLegacy).toString("utf8")).toContain("legacy-xlsx");
  });

  it("stores returned artifacts through the same ArtifactBinaryStore", async () => {
    const routing = new RoutingArtifactBinaryStore(new LegacyRelationalArtifactBinaryStore(), new MemoryObjectArtifactBinaryStore());
    const { plan, artifactSvc, orch } = await desk(routing);
    const generated = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactType: "DESIGN_REPORT",
      projectCode: "ER-A1",
    });
    expect(generated.ok).toBe(true);
    if (!generated.ok) return;
    const originBytes = (await artifactSvc.openBinary(commerce("analysis.read"), CRUSHER_FEED_TENANT, generated.artifact.id))!.bytes;
    const published = await orch.publishUpdatedArtifact(commerce(), CRUSHER_FEED_TENANT, {
      originArtifactId: generated.artifact.id,
      fileName: generated.artifact.fileName,
      contentBase64: Buffer.from(originBytes).toString("base64"),
      controlledFixture: true,
    });
    expect(published.returned.storageKind).toBe("OBJECT_STORAGE");
    expect(published.returned.contentBase64).toBe("");
    expect(published.returned.originArtifactId).toBe(generated.artifact.id);
    expect(published.returned.sha256).not.toBe("");
    const origin = await artifactSvc.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, generated.artifact.id);
    expect(origin?.id).toBe(generated.artifact.id);
  });

  it("migrates XLSX/DOCX/PPTX fixtures, is idempotent, fail-closes, and rolls back without purge", async () => {
    const { plan, artifactSvc } = await desk();
    for (const artifactType of ["CALCULATION_WORKBOOK", "DESIGN_REPORT", "OPTION_STUDY_PRESENTATION"] as const) {
      const generated = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType, projectCode: "ER-A1" });
      expect(generated.ok).toBe(true);
      if (!generated.ok) continue;
      const bytes = Uint8Array.from(Buffer.from(generated.artifact.contentBase64, "base64"));
      const legacy = new LegacyRelationalArtifactBinaryStore();
      const objectStore = new MemoryObjectArtifactBinaryStore();
      const source = await legacy.put(pointerFromArtifact(generated.artifact), bytes);
      const first = await migrateLegacyArtifact({
        legacy,
        objectStore,
        pointer: source,
        auth: { tenantId: generated.artifact.tenantId, workspaceId: generated.artifact.workspaceId, projectId: generated.artifact.projectId },
      });
      expect(first.ok).toBe(true);
      expect(first.pointer.storageKind).toBe("OBJECT_STORAGE");
      const second = await migrateLegacyArtifact({
        legacy,
        objectStore,
        pointer: source,
        auth: { tenantId: generated.artifact.tenantId, workspaceId: generated.artifact.workspaceId, projectId: generated.artifact.projectId },
      });
      expect(second.ok).toBe(true);
      const rolled = rollbackPointer(first.pointer, source);
      expect(rolled.storageKind).toBe("LEGACY_RELATIONAL");
      expect(await legacy.exists(source)).toBe(true);
    }

    const legacy = new LegacyRelationalArtifactBinaryStore();
    const objectStore = new MemoryObjectArtifactBinaryStore();
    const bytes = Uint8Array.from(Buffer.from("PK\u0003\u0004fail"));
    const source = await legacy.put(pointerFromArtifact({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      id: "mig-fail",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      sha256: hashBytes(bytes),
      byteSize: bytes.byteLength,
    }), bytes);
    objectStore.put = async () => {
      throw new Error("OBJECT_WRITE_INJECTED_FAILURE");
    };
    const failed = await migrateLegacyArtifact({
      legacy,
      objectStore,
      pointer: source,
      auth: { tenantId: CRUSHER_FEED_TENANT, workspaceId: CRUSHER_FEED_WORKSPACE, projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID },
    });
    expect(failed.ok).toBe(false);
    expect(failed.switched).toBe(false);
    expect(failed.pointer.storageKind).toBe("LEGACY_RELATIONAL");
  });

  it("denies cross-project object keys, caller-supplied storage identity, and expired signed URLs", async () => {
    const store = new MemoryObjectArtifactBinaryStore();
    const bytes = Uint8Array.from([1, 2, 3, 4]);
    const pointer = pointerFromArtifact({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      id: "art-idor",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      sha256: hashBytes(bytes),
      byteSize: 4,
    });
    await store.put(pointer, bytes);
    await expect(
      store.openRead(pointer, { tenantId: CRUSHER_FEED_TENANT, workspaceId: CRUSHER_FEED_WORKSPACE, projectId: "other-project" }),
    ).rejects.toThrow("OBJECT_KEY_SCOPE_DENIED");
    expect(() =>
      assertObjectKeyAuthorization(pointer, { tenantId: "other-tenant", workspaceId: CRUSHER_FEED_WORKSPACE, projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID }),
    ).toThrow("OBJECT_KEY_SCOPE_DENIED");
    const { artifactSvc } = await desk();
    expect(artifactSvc.rejectCallerClaims({ tenantId: "spoof" })).toBe("caller_supplied_authority_rejected");
    expect(artifactSvc.rejectCallerClaims({ objectKey: "eos/artifacts/x" })).toBe("caller_supplied_authority_rejected");
    const signed = await store.generateAuthorizedDownload(pointer, {
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    expect(signed.permanentLink).toBe(false);
    expect(signed.kind).toBe("signed_url");
    expect(() =>
      assertSignedDownload({
        expiresAt: "2000-01-01T00:00:00.000Z",
        objectKey: pointer.objectKey,
        expectedObjectKey: pointer.objectKey,
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
        auth: { tenantId: CRUSHER_FEED_TENANT, workspaceId: CRUSHER_FEED_WORKSPACE, projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID },
      }),
    ).toThrow("SIGNED_URL_EXPIRED");
  });

  it("implements private Supabase storage adapter with hash verification and no public bucket", async () => {
    const fake = fakeStorage();
    const store = new SupabaseArtifactBinaryStore(fake);
    const pointer = pointerFromArtifact({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      id: "sb-1",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      sha256: "",
      byteSize: 8,
    });
    const bytes = Uint8Array.from(Buffer.alloc(8, 9));
    const stored = await store.put(pointer, bytes);
    expect(stored.storageKind).toBe("OBJECT_STORAGE");
    expect(fake.objects.size).toBe(1);
    const read = await store.openRead(stored, {
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    expect(hashBytes(read)).toBe(stored.contentSha256);
    const download = await store.generateAuthorizedDownload(stored, {
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    expect(download.kind).toBe("signed_url");
    expect(download.permanentLink).toBe(false);
    if (download.kind === "signed_url") expect(download.href).toContain(ENGINEERING_ARTIFACT_BUCKET);
    await expect(
      store.generateAuthorizedDownload(stored, {
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        projectId: "other",
      }),
    ).rejects.toThrow("OBJECT_KEY_SCOPE_DENIED");
  });

  it("fail-closes malware: CLEAN, EICAR, unavailable, and timeout", async () => {
    const { plan, artifactSvc } = await desk();
    const generated = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactType: "CALCULATION_WORKBOOK",
      projectCode: "ER-A1",
    });
    expect(generated.ok).toBe(true);
    if (!generated.ok) return;
    const cleanBytes = Buffer.from(generated.artifact.contentBase64, "base64");
    const clean = await validateReturnedPackage({
      fileName: generated.artifact.fileName,
      bytes: cleanBytes,
      expectedFormat: "XLSX",
      controlledFixture: true,
    });
    expect(clean.ok).toBe(true);
    if (clean.ok) expect(clean.malware.state).toBe("CLEAN");

    const eicar = await scanReturnedBytes(Buffer.from(EICAR_TEST_SIGNATURE));
    expect(eicar.state).toBe("INFECTED");
    const eicarPackage = await validateReturnedPackage({
      fileName: "infected.xlsx",
      bytes: Buffer.from(EICAR_TEST_SIGNATURE),
      expectedFormat: "XLSX",
    });
    expect(eicarPackage.ok).toBe(false);

    const unavailable = await validateReturnedPackage({
      fileName: generated.artifact.fileName,
      bytes: cleanBytes,
      expectedFormat: "XLSX",
      env: {},
    });
    expect(unavailable.ok).toBe(false);
    if (!unavailable.ok) {
      expect(unavailable.failure).toBe("MALWARE_SCAN_FAILED");
      expect(unavailable.malware?.state).toBe("SCANNER_UNAVAILABLE");
    }

    const hangingFetch = ((_url: string | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      })) as typeof fetch;
    const timeout = await scanReturnedBytes(cleanBytes, false, {
      RTB_REVIEW_CLAMAV_URL: "http://127.0.0.1:9/scan",
      RTB_REVIEW_CLAMAV_TIMEOUT_MS: "1",
    }, hangingFetch);
    expect(timeout.state).toBe("TIMEOUT");
  });

  it("routes private bucket writes through the server-mediated storage client, not the caller JWT", () => {
    const os = readFileSync(new URL("../engineering-os.ts", import.meta.url), "utf8");
    const kernel = readFileSync(
      new URL("../../../../apps/web/src/lib/kernel.ts", import.meta.url),
      "utf8",
    );
    const sql = readFileSync(
      new URL("../../../../supabase/migrations/20261001210000_eos_a14a_artifact_object_storage.sql", import.meta.url),
      "utf8",
    );
    expect(os).toContain("artifactStorageClient");
    expect(os).toContain("options?.artifactStorageClient ?? supabase");
    expect(kernel).toContain("artifactStorageClient: serviceClient");
    expect(sql).toContain("AS RESTRICTIVE");
    expect(sql).toContain("FOR ALL TO anon, authenticated");
    expect(sql).toContain("bucket_id <> 'engineering-artifacts'");
  });

  it("rejects path traversal, macros, formula-injection names, and unsafe Content-Disposition", () => {
    expect(sanitizeArtifactFileName("../etc/passwd.xlsx")).not.toContain("..");
    expect(sanitizeArtifactFileName("C:\\\\Windows\\\\evil.xlsx")).not.toMatch(/\\|\//);
    expect(contentDisposition('report".xlsx')).not.toContain('"report"');
    expect(contentDisposition("=cmd|' /C calc'!A0.xlsx")).toMatch(/^attachment; filename="/);
    expect(() => writeZip([{ name: "../xl/workbook.xml", data: Buffer.from("x") }])).toThrow("zip_path_traversal");
    const macroZip = writeZip([
      { name: "[Content_Types].xml", data: Buffer.from("<Types/>") },
      { name: "xl/workbook.xml", data: Buffer.from("<workbook/>") },
      { name: "xl/vbaProject.bin", data: Buffer.from("macro") },
    ]);
    expect(zipHasUnsafeParts([{ name: "xl/vbaProject.bin", data: Buffer.from("macro") }])).toBe(true);
    expect(() => assertOfficePackage(macroZip, "XLSX")).toThrow("unsafe_office_package");
    expect(serverObjectKey({ tenantId: "t", workspaceId: "w", projectId: "p", artifactId: "a" })).toBe("eos/artifacts/t/w/p/a/v1");
    expect(rejectArbitraryUrlFetch("https://evil.example")).toBe("ARBITRARY_URL_FETCH_PROHIBITED");
  });
});
