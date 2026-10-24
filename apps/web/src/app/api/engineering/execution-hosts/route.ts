/**
 * Phase 13D.1 — Execution host registry list/register.
 */
import { NextResponse } from "next/server";
import {
  createDurableExecutionHostMemoryStore,
  createExecutionHostRepository,
  EngineeringExecutionHostRegistry,
  type HostClass,
} from "@rtb/engineering-execution-host";
import {
  EXEC_HOST_GOVERNANCE,
  execHostErr,
  parseExecHostJsonBody,
  rejectForbiddenExecHostPayload,
  requireScope,
} from "./_assurance";

const store = createDurableExecutionHostMemoryStore();
const repo = createExecutionHostRepository({
  adapter: "memory",
  memoryStore: store,
  nodeEnv: "development",
});
const registry = new EngineeringExecutionHostRegistry(repo);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") ?? "";
  const workspaceId = url.searchParams.get("workspaceId") ?? "";
  const requestId = req.headers.get("x-request-id") ?? "exec-host-get";
  if (!tenantId || !workspaceId) {
    return execHostErr(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }
  const hosts = await registry.listHosts(tenantId, workspaceId);
  return NextResponse.json({
    accepted: true,
    requestId,
    hosts,
    ...EXEC_HOST_GOVERNANCE,
  });
}

export async function POST(req: Request) {
  const parsed = await parseExecHostJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const forbidden = rejectForbiddenExecHostPayload(parsed.body, parsed.requestId);
  if (forbidden) return forbidden;
  const scope = requireScope(parsed.body, parsed.requestId);
  if (scope instanceof NextResponse) return scope;

  const hostClass = (typeof parsed.body.hostClass === "string"
    ? parsed.body.hostClass
    : "dedicated_windows_vm") as HostClass;

  const host = await registry.registerHost({
    tenantId: scope.tenantId,
    workspaceId: scope.workspaceId,
    hostClass,
    correlationId: parsed.correlationId,
  });

  return NextResponse.json({
    accepted: true,
    requestId: parsed.requestId,
    correlationId: parsed.correlationId,
    host,
    ...EXEC_HOST_GOVERNANCE,
  });
}
