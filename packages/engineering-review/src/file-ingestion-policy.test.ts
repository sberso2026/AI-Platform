import { describe, expect, it } from "vitest";
import {
  assertReviewFileIngestionAllowed,
  defaultReviewFileIngestionPolicy,
  REVIEW_MALWARE_SCANNING_AVAILABLE,
} from "./file-ingestion-policy";
import { expectCode } from "./expect-code";

describe("Review file ingestion policy", () => {
  it("records that malware scanning is not available", () => {
    expect(REVIEW_MALWARE_SCANNING_AVAILABLE).toBe(false);
  });

  it("allows internal fixtures in internal_test mode including unclassified gold-set docs", () => {
    expect(() =>
      assertReviewFileIngestionAllowed(
        { mode: "internal_test", malwareScanningAvailable: false, allowExternalCustomerUpload: false },
        [{ documentId: "doc-1", ingestionSource: "unknown" }],
      ),
    ).not.toThrow();
  });

  it("rejects archives", () => {
    expectCode(
      () =>
        assertReviewFileIngestionAllowed(
          { mode: "internal_test", malwareScanningAvailable: false, allowExternalCustomerUpload: false },
          [{ documentId: "zip-1", fileName: "bundle.zip" }],
        ),
      "archive_ingest_forbidden",
    );
  });

  it("fail-closes external customer files in pilot when malware scanning is absent", () => {
    expectCode(
      () =>
        assertReviewFileIngestionAllowed(
          { mode: "pilot", malwareScanningAvailable: false, allowExternalCustomerUpload: false },
          [{ documentId: "customer-1", ingestionSource: "external_customer" }],
        ),
      "external_upload_disabled",
    );
  });

  it("allows controlled fixtures in pilot without malware scanning", () => {
    expect(() =>
      assertReviewFileIngestionAllowed(
        { mode: "pilot", malwareScanningAvailable: false, allowExternalCustomerUpload: false },
        [{ documentId: "fix-1", controlledFixture: true, fileName: "spec.pdf" }],
      ),
    ).not.toThrow();
  });

  it("defaults production/pilot env to fail-closed external upload", () => {
    const policy = defaultReviewFileIngestionPolicy({
      NODE_ENV: "production",
      RTB_REVIEW_ALLOW_EXTERNAL_UPLOAD: undefined,
    } as NodeJS.ProcessEnv);
    expect(policy.mode).toBe("pilot");
    expect(policy.allowExternalCustomerUpload).toBe(false);
    expect(policy.malwareScanningAvailable).toBe(false);
  });
});
