export const TQ_QUERY_IMAGE_MAX_BYTES = 25 * 1024 * 1024;
export const TQ_QUERY_IMAGE_MIMES = ["image/png", "image/jpeg", "image/webp"] as const;

const PNG = [0x89, 0x50, 0x4e, 0x47];
const JPEG = [0xff, 0xd8, 0xff];
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
const UUID_GLOBAL_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
const API_PATH_RE = /\/api\/engineering\/[^\s<>"']+/gi;

export function inferTqQueryImageMime(fileName: string, reportedType?: string): string {
  const reported = (reportedType ?? "").trim().toLowerCase();
  if (reported === "image/jpg") return "image/jpeg";
  if (TQ_QUERY_IMAGE_MIMES.includes(reported as (typeof TQ_QUERY_IMAGE_MIMES)[number])) return reported;
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return reported || "application/octet-stream";
}

export function detectTqQueryImageMimeFromBytes(bytes: Uint8Array): string | null {
  if (bytes.length >= 4 && PNG.every((value, index) => bytes[index] === value)) return "image/png";
  if (bytes.length >= 3 && JPEG.every((value, index) => bytes[index] === value)) return "image/jpeg";
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export function validateTqQueryImagePolicy(input: {
  mimeType: string;
  fileName?: string;
  sizeBytes: number;
}): { ok: true; mimeType: string } {
  const mimeType = inferTqQueryImageMime(input.fileName ?? "", input.mimeType);
  if (!TQ_QUERY_IMAGE_MIMES.includes(mimeType as (typeof TQ_QUERY_IMAGE_MIMES)[number])) {
    throw new Error("This image type is not supported. Use PNG, JPEG, or WEBP.");
  }
  const name = (input.fileName ?? "").toLowerCase();
  if (name) {
    const okExt =
      (mimeType === "image/png" && name.endsWith(".png")) ||
      (mimeType === "image/jpeg" && (name.endsWith(".jpg") || name.endsWith(".jpeg"))) ||
      (mimeType === "image/webp" && name.endsWith(".webp"));
    if (!okExt) {
      throw new Error("This image type is not supported. Use PNG, JPEG, or WEBP.");
    }
  }
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes < 1) {
    throw new Error("Invalid image size");
  }
  if (input.sizeBytes > TQ_QUERY_IMAGE_MAX_BYTES) {
    throw new Error("This image exceeds the 25 MB upload limit.");
  }
  return { ok: true, mimeType };
}

export function tqQueryPlainText(html: string): string {
  return html
    .replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, " ")
    .replace(/<img[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTqQueryImageIds(html: string): string[] {
  const ids: string[] = [];
  const re = /data-document-id=["']([0-9a-f-]{36})["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    if (match[1] && !ids.includes(match[1])) ids.push(match[1]);
  }
  return ids;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function stripImplementationLeakage(text: string): string {
  return text
    .replace(API_PATH_RE, " ")
    .replace(UUID_GLOBAL_RE, " ")
    .replace(/\b(class|data-document-id|src|href)\s*=\s*("[^"]*"|'[^']*')/gi, " ")
    .replace(/<\/?[a-z][^>]*>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tqQueryRegisterSummary(html: string, maxLength = 180): string {
  const cleaned = stripImplementationLeakage(tqQueryPlainText(html));
  if (!cleaned) return "";
  if (cleaned.length <= maxLength) return cleaned;
  const clipped = cleaned.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return `${clipped || cleaned.slice(0, maxLength)}…`;
}

export function tqQuerySafeTitle(title: string | null | undefined, html: string, fallback = "Untitled technical query"): string {
  const candidate = typeof title === "string" ? title.trim() : "";
  if (candidate && !tqQueryLooksLikeHtml(candidate) && !UUID_RE.test(candidate) && !API_PATH_RE.test(candidate)) {
    return stripImplementationLeakage(candidate).slice(0, 160) || fallback;
  }
  const fromHtml = stripImplementationLeakage(tqQueryTitleFromHtml(html, ""));
  return (fromHtml || fallback).slice(0, 160);
}

export function tqQueryImageCount(html: string): number {
  return extractTqQueryImageIds(html).length;
}

export function sanitizeTqQueryHtml(html: string, tqId?: string): string {
  if (!html || typeof html !== "string") return "";
  let value = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/<link\b[^>]*>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/data:text\/html/gi, "");
  value = value.replace(/<img\b([^>]*)>/gi, (_all, attrs: string) => {
    const id = /data-document-id=["']([0-9a-f-]{36})["']/i.exec(attrs)?.[1];
    const alt = /alt=["']([^"']*)["']/i.exec(attrs)?.[1] ?? "";
    const existingSrc = /src=["']([^"']+)["']/i.exec(attrs)?.[1] ?? "";
    if (!id) return "";
    const fromSrc = /\/technical-queries\/([0-9a-f-]{36})\/query-images\//i.exec(existingSrc)?.[1];
    const resolvedTq = tqId || fromSrc;
    const src = resolvedTq
      ? `/api/engineering/technical-queries/${resolvedTq}/query-images/${id}`
      : existingSrc.startsWith("/api/engineering/technical-queries/") && existingSrc.includes("/query-images/")
        ? existingSrc
        : "";
    if (!src) return "";
    return `<img alt="${escapeAttr(alt)}" src="${src}" />`;
  });
  value = value.replace(/<(?!\/?(p|br|div|ul|ol|li|strong|b|em|i|figure|figcaption|img)\b)[^>]+>/gi, "");
  value = value.replace(/\sclass=(["'][^"']*["'])/gi, "");
  value = value.replace(/\sdata-document-id=(["'][^"']*["'])/gi, "");
  return value.trim();
}

export function tqQueryImageFigure(input: {
  tqId: string;
  documentId: string;
  caption?: string;
}): string {
  const src = `/api/engineering/technical-queries/${input.tqId}/query-images/${input.documentId}`;
  const caption = input.caption?.trim();
  return `<figure><img alt="${escapeAttr(caption ?? "")}" src="${src}" />${
    caption ? `<figcaption>${escapeAttr(caption)}</figcaption>` : ""
  }</figure>`;
}

export function tqQueryLooksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function tqQueryPrintTokens(html: string): {
  text: string;
  imageIds: string[];
  captions: string[];
} {
  const captions = [...html.matchAll(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi)]
    .map((match) => match[1].replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
  return {
    text: tqQueryPlainText(html),
    imageIds: extractTqQueryImageIds(html),
    captions,
  };
}

export function tqQueryTitleFromHtml(html: string, fallback = ""): string {
  const plain = tqQueryPlainText(html);
  return (plain || fallback).slice(0, 120);
}
