import { assertOfficePackage } from "../artifact-automation/validate";
import { sanitizeArtifactFileName } from "../artifact-automation/filename";
import type { ArtifactOutputFormat } from "../artifact-automation/types";
import { MAX_RETURN_BYTES } from "./types";
import { isPersonalUnmanagedPath, isPathTraversal } from "./security";

export const EICAR_TEST_SIGNATURE =
  "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";

export const MALWARE_SCAN_STATUS = process.env.RTB_REVIEW_CLAMAV_URL?.trim()
  ? "HOSTED_CLAMAV_CONFIGURED"
  : "UNAVAILABLE_HOSTED_CLAMAV";

export function hostedMalwareScannerAvailable() {
  return Boolean(process.env.RTB_REVIEW_CLAMAV_URL?.trim());
}

export function scanReturnedBytes(bytes: Buffer, controlledFixture = false) {
  if (bytes.toString("utf8").includes(EICAR_TEST_SIGNATURE)) {
    return { state: "INFECTED" as const, scanner: "eicar_fixture" as const };
  }
  if (controlledFixture) {
    return { state: "CLEAN" as const, scanner: "admin_prescan" as const };
  }
  if (!hostedMalwareScannerAvailable()) {
    return { state: "SCAN_FAILED" as const, scanner: "none" as const };
  }
  return { state: "PENDING_SCAN" as const, scanner: "clamav" as const };
}

export function inferFormat(fileName: string, mimeType?: string | null): ArtifactOutputFormat | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".xlsx") || mimeType?.includes("spreadsheetml")) return "XLSX";
  if (lower.endsWith(".docx") || mimeType?.includes("wordprocessingml")) return "DOCX";
  if (lower.endsWith(".pptx") || mimeType?.includes("presentationml")) return "PPTX";
  return null;
}

export function validateReturnedPackage(input: {
  fileName: string;
  bytes: Buffer;
  expectedFormat: ArtifactOutputFormat;
  unmanagedPath?: string | null;
  controlledFixture?: boolean;
}) {
  if (isPathTraversal(input.fileName) || input.fileName.includes("..")) {
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
  const scan = scanReturnedBytes(input.bytes, input.controlledFixture === true);
  if (scan.state === "INFECTED") {
    return { ok: false as const, failure: "MALWARE_INFECTED" as const, explanation: "Infected files cannot be published.", malware: scan };
  }
  if (scan.state !== "CLEAN") {
    return {
      ok: false as const,
      failure: "MALWARE_SCAN_FAILED" as const,
      explanation: "Malware scan is fail-closed. Hosted ClamAV is required for production returns.",
      malware: scan,
    };
  }
  return { ok: true as const, fileName: safeName, malware: scan };
}
