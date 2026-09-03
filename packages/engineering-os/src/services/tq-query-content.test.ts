import { describe, expect, it } from "vitest";
import {
  detectTqQueryImageMimeFromBytes,
  extractTqQueryImageIds,
  sanitizeTqQueryHtml,
  tqQueryPlainText,
  tqQueryPrintTokens,
  tqQueryTitleFromHtml,
  validateTqQueryImagePolicy,
} from "./tq-query-content";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const DOC_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const TQ_ID = "11111111-2222-4333-8444-555555555555";

describe("TQ query content", () => {
  it("strips scripts and requires a document id for images", () => {
    const html = `<p>Cracks</p><script>alert(1)</script><img src="javascript:alert(1)" /><img data-document-id="${DOC_ID}" alt="Figure 1" src="https://evil.example/x.png" />`;
    const sanitized = sanitizeTqQueryHtml(html, TQ_ID);
    expect(sanitized).not.toMatch(/script/i);
    expect(sanitized).not.toMatch(/javascript:/i);
    expect(sanitized).toContain(`/api/engineering/technical-queries/${TQ_ID}/query-images/${DOC_ID}`);
    expect(extractTqQueryImageIds(sanitized)).toEqual([DOC_ID]);
  });

  it("does not keep base64 images in query metadata", () => {
    const sanitized = sanitizeTqQueryHtml(`<img src="data:image/png;base64,iVBORw0KGgo=" />`, TQ_ID);
    expect(sanitized).not.toMatch(/data:image/);
    expect(extractTqQueryImageIds(sanitized)).toEqual([]);
  });

  it("extracts print tokens from long rich content", () => {
    const html = `<p>Paragraph one</p><p>Paragraph two with enough engineering detail to exceed a short box.</p><ul><li>Bullet A</li><li>Bullet B</li></ul><figure><img data-document-id="${DOC_ID}" src="/api/engineering/technical-queries/${TQ_ID}/query-images/${DOC_ID}" /><figcaption>Figure 1. Typical cracking</figcaption></figure>`;
    const tokens = tqQueryPrintTokens(html);
    expect(tokens.text).toMatch(/Paragraph one/);
    expect(tokens.text).toMatch(/Bullet A/);
    expect(tokens.imageIds).toEqual([DOC_ID]);
    expect(tokens.captions).toContain("Figure 1. Typical cracking");
    expect(tqQueryTitleFromHtml(html)).toMatch(/Paragraph one/);
    expect(tqQueryPlainText(html)).not.toMatch(/</);
  });

  it("validates PNG magic bytes and rejects mismatched extensions", () => {
    expect(detectTqQueryImageMimeFromBytes(PNG)).toBe("image/png");
    expect(validateTqQueryImagePolicy({ mimeType: "image/png", fileName: "crack.png", sizeBytes: 1200 }).ok).toBe(true);
    expect(() => validateTqQueryImagePolicy({ mimeType: "image/png", fileName: "crack.exe", sizeBytes: 1200 })).toThrow(/PNG, JPEG, or WEBP/);
    expect(() => validateTqQueryImagePolicy({ mimeType: "application/pdf", fileName: "note.pdf", sizeBytes: 1200 })).toThrow(/PNG, JPEG, or WEBP/);
  });
});
