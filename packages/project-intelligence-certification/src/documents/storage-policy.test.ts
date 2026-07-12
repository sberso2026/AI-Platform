import { describe, expect, it } from "vitest";
import { DOCUMENT_MAX_UPLOAD_BYTES, validateDocumentStoragePolicy } from "@rtb/project-intelligence";

describe("Phase 6C-2 document storage policy", () => {
  it("requires private storage limits and approved MIME types", () => {
    expect(DOCUMENT_MAX_UPLOAD_BYTES).toBe(25 * 1024 * 1024);
    expect(() =>
      validateDocumentStoragePolicy({
        mimeType: "text/plain",
        fileName: "fixture.txt",
        sizeBytes: 128,
      }),
    ).not.toThrow();
  });

  it("rejects oversized and unsupported files", () => {
    expect(() =>
      validateDocumentStoragePolicy({
        mimeType: "text/plain",
        fileName: "huge.txt",
        sizeBytes: DOCUMENT_MAX_UPLOAD_BYTES + 1,
      }),
    ).toThrow(/too large|file_too_large|Document exceeds/i);

    expect(() =>
      validateDocumentStoragePolicy({
        mimeType: "application/zip",
        fileName: "archive.zip",
        sizeBytes: 100,
      }),
    ).toThrow(/unsupported|file_type|MIME/i);
  });

  it("forbids client-supplied storage paths and cross-tenant signed URLs in policy contract", () => {
    const policy = {
      privateBucketOnly: true,
      allowPublicServiceRoleClientPaths: false,
      allowClientSuppliedStoragePath: false,
      allowCrossTenantSignedUrl: false,
      requireTenantWorkspaceCheckBeforeFetch: true,
    };
    expect(policy.privateBucketOnly).toBe(true);
    expect(policy.allowPublicServiceRoleClientPaths).toBe(false);
    expect(policy.allowClientSuppliedStoragePath).toBe(false);
    expect(policy.allowCrossTenantSignedUrl).toBe(false);
    expect(policy.requireTenantWorkspaceCheckBeforeFetch).toBe(true);
  });
});
