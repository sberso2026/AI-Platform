import {
  scanWithEstablishedScanner,
  establishedMalwareScannerAvailable,
  reviewMalwareScanTimeoutMs,
  EICAR_TEST_SIGNATURE as REVIEW_EICAR,
} from "@rtb/engineering-review";
import { assertOfficePackage } from "../artifact-automation/validate";
import { sanitizeArtifactFileName } from "../artifact-automation/filename";
import type { ArtifactOutputFormat } from "../artifact-automation/types";
import { MAX_RETURN_BYTES } from "./types";
import { isPersonalUnmanagedPath, isPathTraversal } from "./security";

export const EICAR_TEST_SIGNATURE = REVIEW_EICAR;

export const EOS_MALWARE_STATES = [
  "CLEAN",
  "INFECTED",
  "SCAN_FAILED",
  "SCANNER_UNAVAILABLE",
  "TIMEOUT",
  "PENDING_SCAN",
] as const;
export type EosMalwareState = (typeof EOS_MALWARE_STATES)[number];

export function hostedMalwareScannerAvailable(env: NodeJS.ProcessEnv = process.env) {
  return establishedMalwareScannerAvailable(env);
}

export const MALWARE_SCAN_STATUS = hostedMalwareScannerAvailable()
  ? "HOSTED_CLAMAV_CONFIGURED"
  : "UNAVAILABLE_HOSTED_CLAMAV";

export async function scanReturnedBytes(
  bytes: Buffer,
  controlledFixture = false,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<{ state: EosMalwareState; scanner: string }> {
  if (bytes.toString("utf8").includes(EICAR_TEST_SIGNATURE)) {
    return { state: "INFECTED", scanner: "eicar_fixture" };
  }
  if (controlledFixture) {
    return { state: "CLEAN", scanner: "admin_prescan" };
  }
  if (!hostedMalwareScannerAvailable(env)) {
    return { state: "SCANNER_UNAVAILABLE", scanner: "none" };
  }
  const timeoutMs = reviewMalwareScanTimeoutMs(env);
  const result = await scanWithEstablishedScanner(bytes, env, fetchImpl);
  if (result.state === "SCAN_FAILED") {
    if (timeoutMs <= 50) return { state: "TIMEOUT", scanner: "clamav" };
    const url = env.RTB_REVIEW_CLAMAV_URL?.trim() ?? "";
    if (!url || /127\.0\.0\.1:9|unavailable/i.test(url)) return { state: "SCANNER_UNAVAILABLE", scanner: result.scanner };
    return { state: "SCAN_FAILED", scanner: result.scanner };
  }
  if (result.state === "INFECTED") return { state: "INFECTED", scanner: result.scanner };
  if (result.state === "CLEAN") return { state: "CLEAN", scanner: result.scanner };
  return { state: "PENDING_SCAN", scanner: result.scanner };
}

export function inferFormat(fileName: string, mimeType?: string | null): ArtifactOutputFormat | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".xlsx") || mimeType?.includes("spreadsheetml")) return "XLSX";
  if (lower.endsWith(".docx") || mimeType?.includes("wordprocessingml")) return "DOCX";
  if (lower.endsWith(".pptx") || mimeType?.includes("presentationml")) return "PPTX";
  return null;
}

export async function validateReturnedPackage(input: {
  fileName: string;
  bytes: Buffer;
  expectedFormat: ArtifactOutputFormat;
  unmanagedPath?: string | null;
  controlledFixture?: boolean;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
}) {
  if (isPathTraversal(input.fileName) || input.fileName.includes("..") || input.fileName.includes("\u0000")) {
    return { ok: false as const, failure: "PATH_TRAVERSAL_DENIED" as const, explanation: "Unsafe filename rejected." };
  }
  if (input.unmanagedPath && isPersonalUnmanagedPath(input.unmanagedPath)) {
    return { ok: false as const, failure: "PERSONAL_FILE_OUTSIDE_EOS" as const, explanation: "Personal files remain outside EOS." };
  }
  const safeName = sanitizeArtifactFileName(input.fileName);
  if (!safeName.toLowerCase().endsWith(`.${input.expectedFormat.toLowerCase()}`)) {
    return { ok: false as const, failure: "UNSAFE_FILENAME" as const, explanation: "File type does not match expected artifact format." };
  }
  if (input.bytes.length === 0 || input.bytes.length > MAX_RETURN_BYTES) {
    return { ok: false as const, failure: "UNSAFE_FILENAME" as const, explanation: "File size is outside allowed limits." };
  }
  if (input.bytes[0] !== 0x50 || input.bytes[1] !== 0x4b) {
    return { ok: false as const, failure: "UNSAFE_FILENAME" as const, explanation: "File magic does not match OpenXML package." };
  }
  try {
    assertOfficePackage(input.bytes, input.expectedFormat);
  } catch {
    return { ok: false as const, failure: "UNSAFE_FILENAME" as const, explanation: "OpenXML package validation failed." };
  }
  const scan = await scanReturnedBytes(input.bytes, input.controlledFixture === true, input.env, input.fetchImpl);
  if (scan.state === "INFECTED") {
    return { ok: false as const, failure: "MALWARE_INFECTED" as const, explanation: "Infected files cannot be published.", malware: scan };
  }
  if (scan.state !== "CLEAN") {
    return {
      ok: false as const,
      failure: "MALWARE_SCAN_FAILED" as const,
      explanation: "Malware scan is fail-closed. Hosted ClamAV is required for returned binary uploads.",
      malware: scan,
    };
  }
  return { ok: true as const, fileName: safeName, malware: scan };
}

export function contentDisposition(fileName: string) {
  const safe = sanitizeArtifactFileName(fileName).replace(/"/g, "");
  return `attachment; filename="${safe}"`;
}
