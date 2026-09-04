/**
 * Safe API JSON parsing for Engineering OS / platform client fetches.
 * Never call Response.json() blindly — empty or non-JSON bodies must not throw raw SyntaxErrors.
 */

export type ParsedApiJson<T = unknown> = {
  ok: boolean;
  status: number;
  data: T | null;
  errorMessage: string | null;
  errorCode: string | null;
  requestId: string | null;
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

export function extractApiErrorCode(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const payload = body as Record<string, unknown>;
  const err = payload.error;
  if (err && typeof err === "object") {
    const code = (err as Record<string, unknown>).code;
    if (typeof code === "string" && code.trim()) return code;
  }
  if (typeof payload.code === "string" && payload.code.trim()) return payload.code;
  return null;
}

export function extractApiErrorRequestId(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const payload = body as Record<string, unknown>;
  const err = payload.error;
  if (err && typeof err === "object") {
    const id = (err as Record<string, unknown>).requestId;
    if (typeof id === "string" && id.trim()) return id;
  }
  if (typeof payload.requestId === "string" && payload.requestId.trim()) {
    return payload.requestId;
  }
  return null;
}

function headerRequestId(response: Response): string | null {
  return response.headers.get("x-request-id") ?? response.headers.get("x-correlation-id");
}

export async function parseApiJsonResponse<T = unknown>(
  response: Response,
): Promise<ParsedApiJson<T>> {
  const status = response.status;
  const contentType = response.headers.get("content-type") ?? "";
  const headerId = headerRequestId(response);
  let text = "";
  try {
    text = await response.text();
  } catch {
    return {
      ok: false,
      status,
      data: null,
      errorMessage: `Failed to read response body (${status})`,
      errorCode: null,
      requestId: headerId,
      raw: null,
    };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    if (response.ok) {
      return {
        ok: true,
        status,
        data: null,
        errorMessage: null,
        errorCode: null,
        requestId: headerId,
        raw: null,
      };
    }
    return {
      ok: false,
      status,
      data: null,
      errorMessage: `Request failed with status ${status} and empty response body`,
      errorCode: null,
      requestId: headerId,
      raw: null,
    };
  }

  const looksJson =
    contentType.includes("application/json") ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("[");

  if (!looksJson) {
    return {
      ok: false,
      status,
      data: null,
      errorMessage: `Unexpected non-JSON response (${status})`,
      errorCode: "NON_JSON_RESPONSE",
      requestId: headerId,
      raw: trimmed.slice(0, 200),
    };
  }

  try {
    const raw = JSON.parse(trimmed) as unknown;
    const requestId = extractApiErrorRequestId(raw) ?? headerId;
    const errorCode = extractApiErrorCode(raw);
    if (!response.ok) {
      return {
        ok: false,
        status,
        data: null,
        errorMessage: extractApiErrorMessage(
          raw,
          `Request failed with status ${status}`,
        ),
        errorCode,
        requestId,
        raw,
      };
    }

    if (raw && typeof raw === "object" && "error" in (raw as object)) {
      const msg = extractApiErrorMessage(raw, "");
      if (msg) {
        return {
          ok: false,
          status,
          data: null,
          errorMessage: msg,
          errorCode,
          requestId,
          raw,
        };
      }
    }

    const data =
      raw && typeof raw === "object" && "data" in (raw as object)
        ? (((raw as { data: T }).data as T) ?? null)
        : (raw as T);

    return {
      ok: true,
      status,
      data,
      errorMessage: null,
      errorCode: null,
      requestId,
      raw,
    };
  } catch {
    return {
      ok: false,
      status,
      data: null,
      errorMessage: `Malformed JSON response (${status})`,
      errorCode: "MALFORMED_JSON",
      requestId: headerId,
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
