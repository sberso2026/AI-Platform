/**
 * Safe API JSON parsing for Engineering OS / platform client fetches.
 * Never call Response.json() blindly — empty or non-JSON bodies must not throw raw SyntaxErrors.
 */

export type ParsedApiJson<T = unknown> = {
  ok: boolean;
  status: number;
  data: T | null;
  errorMessage: string | null;
  raw: unknown;
};

export function extractApiErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const payload = body as Record<string, unknown>;
  const err = payload.error;
  if (typeof err === "string" && err.trim()) return err;
  if (err && typeof err === "object") {
    const nested = err as Record<string, unknown>;
    if (typeof nested.message === "string" && nested.message.trim()) {
      return nested.message;
    }
    if (typeof nested.code === "string" && nested.code.trim()) {
      return nested.code;
    }
  }
  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }
  return fallback;
}

export async function parseApiJsonResponse<T = unknown>(
  response: Response,
): Promise<ParsedApiJson<T>> {
  const status = response.status;
  const contentType = response.headers.get("content-type") ?? "";
  let text = "";
  try {
    text = await response.text();
  } catch {
    return {
      ok: false,
      status,
      data: null,
      errorMessage: `Failed to read response body (${status})`,
      raw: null,
    };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    if (response.ok) {
      // Valid empty body for tolerant list consumers — callers should treat null data as [].
      return { ok: true, status, data: null, errorMessage: null, raw: null };
    }
    return {
      ok: false,
      status,
      data: null,
      errorMessage: `Request failed with status ${status} and empty response body`,
      raw: null,
    };
  }

  const looksJson =
    contentType.includes("application/json") ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("[");

  if (!looksJson) {
    const sizeHint =
      status === 413
        ? "This file is too large to send through the app server. Use a file within the 25 MB pilot limit, uploaded directly to storage."
        : "The server returned an unexpected response. Try again or use a smaller supported file.";
    return {
      ok: false,
      status,
      data: null,
      errorMessage: sizeHint,
      raw: trimmed.slice(0, 200),
    };
  }

  try {
    const raw = JSON.parse(trimmed) as unknown;
    if (!response.ok) {
      return {
        ok: false,
        status,
        data: null,
        errorMessage: extractApiErrorMessage(
          raw,
          `Request failed with status ${status}`,
        ),
        raw,
      };
    }

    if (raw && typeof raw === "object" && "error" in (raw as object)) {
      const msg = extractApiErrorMessage(raw, "");
      if (msg) {
        return { ok: false, status, data: null, errorMessage: msg, raw };
      }
    }

    const data =
      raw && typeof raw === "object" && "data" in (raw as object)
        ? (((raw as { data: T }).data as T) ?? null)
        : (raw as T);

    return { ok: true, status, data, errorMessage: null, raw };
  } catch {
    return {
      ok: false,
      status,
      data: null,
      errorMessage: `Malformed JSON response (${status})`,
      raw: trimmed.slice(0, 200),
    };
  }
}

export function asRecordArray(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item),
    );
  }
  return [];
}
