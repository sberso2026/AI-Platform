import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseApiJsonResponse } from "../lib/api/parse-json-response";
import { ENGINEERING_DOCUMENT_TYPES } from "@rtb/engineering-os/browser";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS document upload-first registration", () => {
  it("keeps a controlled document type list", () => {
    expect(ENGINEERING_DOCUMENT_TYPES.map((row) => row.label)).toEqual(
      expect.arrayContaining(["Drawing", "Specification", "Data Sheet", "Other"]),
    );
  });

  it("does not post the source file through the Next.js API body", () => {
    const uploadPage = readApp("src/app/(platform)/engineering/documents/upload/page.tsx");
    const fileRoute = readApp("src/app/api/engineering/documents/[documentId]/file/route.ts");
    const nextConfig = readApp("next.config.ts");
    expect(uploadPage).toContain("createCanonicalDocumentUploadSession");
    expect(uploadPage).toContain("putFileToSignedUpload");
    expect(uploadPage).not.toMatch(/Project ID/);
    expect(uploadPage).toContain("LabeledSelectField");
    expect(uploadPage).toContain("document-source-file");
    expect(fileRoute).toContain("multipart/form-data");
    expect(fileRoute).toContain("document_direct_upload_required");
    expect(nextConfig).toContain("serverExternalPackages");
    expect(nextConfig).toContain("pdf-parse");
    expect(nextConfig).toContain("pdfjs-dist");
    expect(nextConfig).toContain("outputFileTracingIncludes");
    const webPkg = JSON.parse(readApp("package.json"));
    expect(webPkg.dependencies["pdf-parse"]).toBe("2.4.5");
  });

  it("maps proxy 413 bodies to a size message instead of Unexpected non-JSON", async () => {
    const response = new Response("<html>Request Entity Too Large</html>", {
      status: 413,
      headers: { "content-type": "text/html" },
    });
    const parsed = await parseApiJsonResponse(response);
    expect(parsed.ok).toBe(false);
    expect(parsed.errorMessage).not.toMatch(/Unexpected non-JSON/i);
    expect(parsed.errorMessage).toMatch(/too large/i);
  });

  it("does not look up documents with a read action during write upload routes", () => {
    const sessionRoute = readApp("src/app/api/engineering/documents/upload-session/route.ts");
    const completeRoute = readApp("src/app/api/engineering/documents/upload-complete/route.ts");
    expect(sessionRoute).not.toMatch(/documents\.get\(/);
    expect(completeRoute).not.toMatch(/documents\.get\(/);
    expect(completeRoute).toContain("attachOnly");
    expect(completeRoute).toContain("attachFile");
    expect(completeRoute).toContain("enqueueCanonicalDocumentIngestion");
    expect(completeRoute).toContain("document-ingestion");
    expect(completeRoute).not.toContain("documents-service");
    expect(completeRoute).not.toContain("@rtb/project-intelligence/server");
    const ingestRoute = readApp("src/app/api/engineering/documents/[documentId]/ingest/route.ts");
    expect(ingestRoute).toContain("authorizeEngineeringSegment");
    expect(ingestRoute).not.toMatch(/documents\.get\(commerce/);
  });

  it("maps duplicate document registration to 409", () => {
    const documentsRoute = readApp("src/app/api/engineering/documents/route.ts");
    expect(documentsRoute).toContain("document_duplicate");
    expect(documentsRoute).toContain("already exists");
  });

  it("registers checksum identity and reuses instead of timestamp revisions", () => {
    const completeRoute = readApp("src/app/api/engineering/documents/upload-complete/route.ts");
    const uploadPage = readApp("src/app/(platform)/engineering/documents/upload/page.tsx");
    const identity = readFileSync(
      resolve(WEB_ROOT, "../../packages/engineering-os/src/services/document-identity.ts"),
      "utf8",
    );
    expect(completeRoute).toContain("sourceChecksum");
    expect(completeRoute).toContain("sha256");
    expect(completeRoute).toContain("reused");
    expect(uploadPage).toContain("isTimestampRevisionArtifact");
    expect(identity).toContain("TIMESTAMP_REVISION");
    expect(identity).toContain("resolveCanonicalDocumentRegistration");
  });

  it("keeps operator reconciliation instead of deleting register rows", () => {
    const reconcile = readApp("src/app/api/engineering/documents/reconcile/route.ts");
    expect(reconcile).toContain("supersedeIdentityArtifacts");
    expect(reconcile).not.toMatch(/DELETE FROM engineering_documents/i);
  });
});
