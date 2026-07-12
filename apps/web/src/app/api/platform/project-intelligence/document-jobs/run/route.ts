import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { runDocumentWorkerOnce } from "@/lib/project-intelligence/documents-service";

function correlationId(request: Request): string {
  return request.headers.get("x-correlation-id") ?? crypto.randomUUID();
}

/**
 * Independent worker drain endpoint (scheduler secret or tenant owner).
 * Does not process documents inside ordinary document API handlers.
 */
export async function POST(request: Request) {
  const cid = correlationId(request);
  const schedulerSecret = request.headers.get("x-commerce-scheduler-secret");
  const expectedSecret = process.env.COMMERCE_SCHEDULER_SECRET;
  const hasValidSecret = Boolean(expectedSecret && schedulerSecret === expectedSecret);

  if (!hasValidSecret) {
    const ctx = await getAuthContext();
    if (!ctx) {
      return NextResponse.json({ error: { code: "unauthenticated", message: "Unauthorized", requestId: cid } }, { status: 401 });
    }
    if (ctx.roleSlug !== "owner") {
      return NextResponse.json({ error: { code: "forbidden", message: "Forbidden", requestId: cid } }, { status: 403 });
    }
  }

  const body = await request.json().catch(() => ({}));
  const workerId = typeof body.workerId === "string" ? body.workerId : undefined;
  const loops = Math.min(Math.max(Number(body.loops ?? 1), 1), 20);
  const results = [];
  for (let i = 0; i < loops; i += 1) {
    results.push(await runDocumentWorkerOnce(workerId ? `${workerId}-${i}` : undefined));
  }
  return NextResponse.json({ data: { workerResults: results, correlationId: cid } });
}
