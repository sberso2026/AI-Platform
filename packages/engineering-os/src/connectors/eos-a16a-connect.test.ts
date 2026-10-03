import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PUBLIC_BUCKET_FORBIDDEN, PUBLIC_BUCKET_REQUIRED, assertSignedDownload, serverObjectKey } from "../artifact-automation/binary-store";
import { CANONICAL_CONNECTOR_CERTIFICATION_MATRIX, DEFAULT_CONNECTOR_WRITE_POLICY } from "./core/types";
import { classifyConnectorFailure, observabilitySafe, rejectArbitraryUrlFetch, rejectCallerConnectorCoreClaims } from "./core/security";
import { INFORMATION_AI_BOUNDARY, INFORMATION_FRESHNESS_STATES, INFORMATION_RESOLUTION_OUTCOMES } from "../information-intelligence/types";
import { WORK_EVENT_TYPES } from "../work-context/types";
import {
  A16A_ARCHITECTURAL_PRINCIPLE,
  A16A_CONNECTIVITY_INVENTORY,
  A16A_MALWARE_AUTH_MODEL,
  A16A_MALWARE_PUBLIC_ENDPOINT,
  A16A_OFFICE_INSPECTION_GAP,
  A16A_PHASE,
  A16A_PILOT_OPTIONAL_DEFERRED,
  A16A_PILOT_REQUIRED_BLOCKED,
  A16A_PILOT_REQUIRED_READY,
  A16A_PROFILE_A_MINIMUM_CONNECTION_SET,
  A16A_V5B_REOPEN,
  a16aConnectAssertions,
  hostedMalwareScannerProcessState,
  liveSharePointTestState,
} from "./a16a-connect";

const here = dirname(fileURLToPath(import.meta.url));

function readRepo(relativeFromConnectors: string) {
  return readFileSync(join(here, relativeFromConnectors), "utf8");
}

describe("EOS-A16A CONNECT inventory", () => {
  it("does not reopen V5B Structural work and stays CONNECT-only", () => {
    expect(A16A_PHASE).toBe("CONNECT");
    expect(A16A_V5B_REOPEN).toBe(false);
    const wiring = readRepo("../engineering-os.ts");
    expect(wiring).toContain("preIssueReview.bindQuantityMto((planId) => quantityMto.loadCompositionContext(planId))");
    expect(wiring).toContain("artifactAutomation.bindQuantityMto((planId) => quantityMto.loadCompositionContext(planId))");
  });

  it("keeps the architectural principle and existing Event Bus source events", () => {
    expect(A16A_ARCHITECTURAL_PRINCIPLE.eosDoesNotDuplicateRepositoryAuthority).toBe(true);
    expect(INFORMATION_AI_BOUNDARY.maySelectAuthoritativeSource).toBe(false);
    expect(INFORMATION_AI_BOUNDARY.mayApproveInformation).toBe(false);
    expect(WORK_EVENT_TYPES).toContain("SOURCE_CREATED");
    expect(WORK_EVENT_TYPES).toContain("SOURCE_REVISED");
    expect(WORK_EVENT_TYPES).toContain("SOURCE_PUBLISHED");
    expect(WORK_EVENT_TYPES).toContain("INFORMATION_ACCEPTED");
    expect((WORK_EVENT_TYPES as readonly string[]).includes("SOURCE_DISCOVERED")).toBe(false);
  });

  it("reports factual connector statuses without inferring live capability", () => {
    const byName = Object.fromEntries(A16A_CONNECTIVITY_INVENTORY.map((row) => [row.connector, row]));
    expect(byName.SHAREPOINT_M365.implemented).toBe("IMPLEMENTED");
    expect(byName.SHAREPOINT_M365.tested).toBe("TESTED");
    expect(byName.SHAREPOINT_M365.liveTested).toBe("NOT_AVAILABLE");
    expect(byName.SHAREPOINT_M365.pilotClass).toBe("PILOT_REQUIRED_BLOCKED");
    expect(byName.GENERIC_EDMS.liveTested).toBe("NOT_AVAILABLE");
    expect(byName.BIM.liveTested).toBe("NOT_AVAILABLE");
    expect(byName.PLANNING.liveTested).toBe("NOT_AVAILABLE");
    expect(byName.OBJECT_STORAGE.pilotClass).toBe("PILOT_REQUIRED_AND_READY");
    expect(byName.OBJECT_STORAGE.certified).toBe("CERTIFIED");
    expect(byName.MANAGED_REPOSITORY.pilotClass).toBe("PILOT_REQUIRED_AND_READY");
    expect(byName.INTERNALLY_GENERATED_ARTIFACT_FLOW.pilotClass).toBe("PILOT_REQUIRED_AND_READY");
    expect(byName.HOSTED_MALWARE_SCANNER.deferred).toBe("DEFERRED");
    expect(byName.RETURNED_EXTERNAL_ARTIFACT_FLOW.pilotClass).toBe("PILOT_OPTIONAL_DEFERRED");
    expect(byName.SPACE_GASS_SOLVER.pilotClass).toBe("OUT_OF_SCOPE");
    expect(CANONICAL_CONNECTOR_CERTIFICATION_MATRIX.every((row) => row.liveRead === "NOT_TESTED")).toBe(true);
    expect(liveSharePointTestState()).toBe("BLOCKED_EXTERNAL_CONFIGURATION");
  });

  it("defines the smallest Profile A connection set without making every connector mandatory", () => {
    expect(A16A_PROFILE_A_MINIMUM_CONNECTION_SET.mandatoryForPilot).toContain("OBJECT_STORAGE");
    expect(A16A_PROFILE_A_MINIMUM_CONNECTION_SET.mandatoryForPilot).toContain("SHAREPOINT_M365_READ_PATH");
    expect(A16A_PROFILE_A_MINIMUM_CONNECTION_SET.optionalForPilot).toContain("GENERIC_EDMS");
    expect(A16A_PROFILE_A_MINIMUM_CONNECTION_SET.optionalForPilot).toContain("BIM");
    expect(A16A_PROFILE_A_MINIMUM_CONNECTION_SET.optionalForPilot).toContain("PLANNING");
    expect(A16A_PROFILE_A_MINIMUM_CONNECTION_SET.deferred).toContain("RETURNED_EXTERNAL_ARTIFACT_FLOW");
    expect(A16A_PILOT_REQUIRED_READY).toContain("OBJECT_STORAGE");
    expect(A16A_PILOT_REQUIRED_BLOCKED).toEqual(["LIVE_SHAREPOINT_READ"]);
    expect(A16A_PILOT_OPTIONAL_DEFERRED).toContain("HOSTED_MALWARE_SCANNER");
    expect(a16aConnectAssertions().writePolicy).toBe("READ_ONLY");
    expect(DEFAULT_CONNECTOR_WRITE_POLICY).toBe("READ_ONLY");
  });

  it("keeps SharePoint read-first and fails closed on caller-supplied URLs and claims", () => {
    expect(rejectArbitraryUrlFetch("https://example.com/drive")).toBe("ARBITRARY_URL_FETCH_PROHIBITED");
    expect(rejectCallerConnectorCoreClaims({ tenantId: "x" })).toBe("caller_supplied_authority_rejected");
    expect(rejectCallerConnectorCoreClaims({ accessToken: "t" })).toBe("caller_supplied_authority_rejected");
    expect(classifyConnectorFailure("AUTH")).toBe("AUTHENTICATION_REQUIRED");
    expect(classifyConnectorFailure("THROTTLE")).toBe("RATE_LIMITED");
    const sharepoint = CANONICAL_CONNECTOR_CERTIFICATION_MATRIX.find((row) => row.connector === "SHAREPOINT_LIBRARY");
    expect(sharepoint?.capabilities.READ_CONTENT).toBe("FIXTURE_CERTIFIED");
    expect(sharepoint?.liveWrite).toBe("NOT_TESTED");
  });

  it("keeps private object storage scoped and non-public", () => {
    expect(PUBLIC_BUCKET_REQUIRED).toBe(false);
    expect(PUBLIC_BUCKET_FORBIDDEN).toBe(true);
    const key = serverObjectKey({
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      projectId: "project-a",
      artifactId: "artifact-a",
    });
    expect(key.startsWith("eos/artifacts/tenant-a/workspace-a/project-a/")).toBe(true);
    expect(() =>
      assertSignedDownload({
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        objectKey: key,
        expectedObjectKey: key,
        tenantId: "tenant-a",
        workspaceId: "workspace-a",
        projectId: "project-a",
        auth: { tenantId: "tenant-b", workspaceId: "workspace-a", projectId: "project-a" },
      }),
    ).toThrow(/OBJECT_KEY_SCOPE_DENIED/);
  });

  it("records the Office inspection gap without implementing a duplicate store", () => {
    const inspect = readRepo("../pre-issue-review/inspect.ts");
    expect(inspect).toContain("artifact.contentBase64");
    expect(inspect).not.toContain("openRead");
    expect(A16A_OFFICE_INSPECTION_GAP.boundedAdapterPossible).toBe(true);
    expect(A16A_OFFICE_INSPECTION_GAP.boundedAdapterImplemented).toBe(false);
    expect(A16A_OFFICE_INSPECTION_GAP.requiredForMinimumPilotPath).toBe(false);
    expect(A16A_OFFICE_INSPECTION_GAP.duplicatesStorage).toBe(false);
  });

  it("preserves fail-closed malware contract and does not allow a public scanner", () => {
    const scan = readRepo("../../../engineering-review/src/malware-scan.ts");
    expect(scan).toContain("RTB_REVIEW_CLAMAV_URL");
    expect(scan).toContain("application/octet-stream");
    expect(scan).toContain('headers: { "content-type": "application/octet-stream" }');
    expect(scan).not.toContain("Authorization");
    expect(A16A_MALWARE_AUTH_MODEL).toBe("UNAUTHENTICATED_HTTP_POST_PRIVATE_NETWORK_REQUIRED");
    expect(A16A_MALWARE_PUBLIC_ENDPOINT).toBe("PROHIBITED");
    expect(hostedMalwareScannerProcessState({} as NodeJS.ProcessEnv)).toBe("DEFERRED_EXTERNAL_DEPENDENCY");
  });

  it("redacts secrets and document bytes from connector observability", () => {
    const safe = observabilitySafe({
      connectorType: "SHAREPOINT",
      sourceSystem: "SHAREPOINT",
      status: "DEGRADED",
      latencyMs: 12,
      tenantId: "t",
      workspaceId: "w",
      projectId: "p",
      accessToken: "secret",
      clientSecret: "secret",
      contentBase64: "AAAA",
      bytes: "AAAA",
    });
    expect(safe.accessToken).toBeUndefined();
    expect(safe.clientSecret).toBeUndefined();
    expect(safe.contentBase64).toBeUndefined();
    expect(safe.bytes).toBeUndefined();
    expect(safe.connectorType).toBe("SHAREPOINT");
  });

  it("keeps Pre-Issue source freshness distinct from human accept-for-purpose", () => {
    expect(INFORMATION_FRESHNESS_STATES).toEqual(expect.arrayContaining(["CURRENT", "STALE", "SUPERSEDED"]));
    expect(INFORMATION_RESOLUTION_OUTCOMES).toEqual(
      expect.arrayContaining(["NO_SOURCE", "SOURCE_STALE", "SOURCE_SUPERSEDED", "NO_ELIGIBLE_SOURCE"]),
    );
    const checks = readRepo("../pre-issue-review/checks.ts");
    expect(checks).toContain("STALE_SOURCE_REFERENCE");
    expect(checks).toContain("SOURCE_SUPERSEDED");
    expect(checks).toContain("REQUIRED_INFORMATION_EVIDENCE_MISSING");
    expect(checks).toContain("REQUIRED_INFORMATION_UNACCEPTED");
  });
});
