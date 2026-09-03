import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-TQ-UX-1R4 draft editing, hybrid asset, rich query", () => {
  it("replaces the closed asset dropdown with hybrid autocomplete plus free text", () => {
    const create = readApp("src/app/(platform)/engineering/technical-queries/new/page.tsx");
    const hybrid = readApp("src/components/engineering/tq-asset-hybrid-input.tsx");
    expect(create).toContain("TqAssetHybridInput");
    expect(create).toContain("assetEquipmentText");
    expect(create).not.toMatch(/Asset \/ Equipment[\s\S]*<select/);
    expect(hybrid).toContain("Clear");
    expect(hybrid).toContain("/api/engineering/assets");
    expect(hybrid).toContain("An Asset Register entry is not required");
  });

  it("edits and submits the same draft instead of creating another TQ", () => {
    const create = readApp("src/app/(platform)/engineering/technical-queries/new/page.tsx");
    expect(create).toContain("save_draft");
    expect(create).toContain("action: \"submit\"");
    expect(create).toContain("new?id=");
    expect(create).toContain("You have unsaved changes. Leave without saving?");
    expect(create).toContain("Wait for the image upload to complete.");
  });

  it("surfaces Draft as an editable record on detail and register", () => {
    const detail = readApp("src/app/(platform)/engineering/technical-queries/[id]/page.tsx");
    const register = readApp("src/app/(platform)/engineering/technical-queries/page.tsx");
    expect(detail).toContain("[DRAFT]");
    expect(detail).toContain("This technical query has not been submitted.");
    expect(detail).toContain("Edit Draft");
    expect(detail).toContain("Submit Technical Query");
    expect(register).toContain("Edit Draft");
    expect(register).toContain("relative z-10");
  });

  it("uses a large rich query editor with insert/paste image and canonical storage", () => {
    const editor = readApp("src/components/engineering/tq-query-editor.tsx");
    const css = readApp("src/components/engineering/tq-query.css");
    const upload = readApp("src/lib/engineering/tq-query-image-upload.ts");
    expect(editor).toContain("Insert Image");
    expect(editor).toContain("aria-label=\"Insert image\"");
    expect(editor).toContain("contentEditable");
    expect(editor).toContain("Uploading image...");
    expect(css).toContain("min-height: 360px");
    expect(css).toContain("max-height: 480px");
    expect(css).toContain("overflow-y: auto");
    expect(upload).toContain("/api/engineering/technical-queries/query-images/upload-session");
    expect(upload).not.toContain("createCanonicalDocumentUploadSession");
  });

  it("prints the persisted query with auto-expand and no editor scrollbar", () => {
    const print = readApp("src/app/(platform)/engineering/technical-queries/[id]/print/page.tsx");
    const css = readApp("src/app/(platform)/engineering/technical-queries/[id]/print/tq-print.css");
    const queryCss = readApp("src/components/engineering/tq-query.css");
    expect(print).toContain("TqQueryHtml");
    expect(print).toContain("tq-print-query");
    expect(print).toContain("window.print");
    expect(css).toContain("max-height: none !important");
    expect(css).toContain("overflow: visible !important");
    expect(css).toContain("page-break-inside: avoid");
    expect(queryCss).toContain("@media print");
    expect(queryCss).toContain(".tq-query-toolbar");
  });

  it("authorizes query images through the TQ route rather than a public storage path", () => {
    const getImage = readApp("src/app/api/engineering/technical-queries/[id]/query-images/[documentId]/route.ts");
    const complete = readApp("src/app/api/engineering/technical-queries/query-images/upload-complete/route.ts");
    expect(getImage).toContain("technicalQueries.getPresented");
    expect(getImage).toContain("query_image");
    expect(getImage).not.toContain("createSignedUrl");
    expect(complete).toContain("detectTqQueryImageMimeFromBytes");
    expect(complete).toContain("technical_query_attachment");
    expect(complete).toContain("authorizeEngineeringSegment");
    expect(getImage).toContain("authorizeEngineeringSegment");
    expect(complete).toContain("relationship: \"query_image\"");
    expect(complete).not.toContain("enqueueCanonicalDocumentIngestion");
  });
});
