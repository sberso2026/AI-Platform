import {
  asRecordArray,
  parseApiJsonResponse,
} from "../api/parse-json-response";

export async function loadEngineeringListItems(
  apiEndpoint: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ items: Record<string, unknown>[]; error: string | null }> {
  let response: Response;
  try {
    response = await fetchImpl(apiEndpoint);
  } catch {
    return { items: [], error: "Network failure while loading records" };
  }

  const parsed = await parseApiJsonResponse(response);
  if (!parsed.ok) {
    return {
      items: [],
      error: parsed.errorMessage ?? `Request failed with status ${parsed.status}`,
    };
  }

  return { items: asRecordArray(parsed.data), error: null };
}
