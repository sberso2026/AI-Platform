/**
 * Failure taxonomy query API.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createFailureTaxonomyRegistry } from "@rtb/asset-intelligence";

function err(
  status: number,
  code: string,
  message: string,
  requestId: string,
  details: Record<string, unknown> = {},
) {
  return NextResponse.json(
    { error: { code, message, requestId, details } },
    { status },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") ?? undefined;
  const registry = createFailureTaxonomyRegistry();
  const entries = registry.list(
    kind as
      | "failure_mode"
      | "failure_mechanism"
      | "failure_cause"
      | "failure_effect"
      | "consequence"
      | "detection_method"
      | "mitigation"
      | undefined,
  );
  return NextResponse.json({
    requestId,
    operation: "query_failure_taxonomy",
    result: "ok",
    taxonomyVersion: registry.taxonomyVersion,
    count: entries.length,
    entries: entries.map((e) => ({
      taxonomyId: e.taxonomyId,
      kind: e.kind,
      code: e.code,
      name: e.name,
      status: e.status,
      packOwner: e.packOwner,
      taxonomyVersion: e.taxonomyVersion,
    })),
  });
}

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  return err(405, "method_not_allowed", "Use GET for taxonomy query", requestId);
}
