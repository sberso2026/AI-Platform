import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { runTeamsWorkerOnce } from "@/lib/project-intelligence/meetings-service";
import { MeetingIntelligenceError } from "@rtb/project-intelligence/server";

function correlationId(request: Request): string {
  return request.headers.get("x-correlation-id") ?? crypto.randomUUID();
}

/**
 * Independent Teams job worker drain (scheduler secret or tenant owner).
 */
export async function POST(request: Request) {
  const cid = correlationId(request);
  try {
    const schedulerSecret = request.headers.get("x-commerce-scheduler-secret");
    const expectedSecret = process.env.COMMERCE_SCHEDULER_SECRET;
    const hasValidSecret = Boolean(expectedSecret && schedulerSecret === expectedSecret);

    if (!hasValidSecret) {
      const ctx = await getAuthContext();
      if (!ctx) {
        return NextResponse.json(
          { error: { code: "unauthenticated", message: "Unauthorized", requestId: cid } },
          { status: 401 },
        );
      }
      if (ctx.roleSlug !== "owner") {
        return NextResponse.json(
          { error: { code: "forbidden", message: "Forbidden", requestId: cid } },
          { status: 403 },
        );
      }
    }

    const body = await request.json().catch(() => ({}));
    const loops = Math.min(Math.max(Number(body.loops ?? 1), 1), 20);
    const batchSize = Math.min(Math.max(Number(body.batchSize ?? 25), 1), 50);

    const results = [];
    for (let i = 0; i < loops; i += 1) {
      results.push(
        await runTeamsWorkerOnce({
          batchSize,
          correlationId: `${cid}-${i}`,
        }),
      );
    }
    return NextResponse.json({ data: { workerResults: results, correlationId: cid } });
  } catch (error) {
    if (error instanceof MeetingIntelligenceError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            requestId: cid,
            details: error.details,
          },
        },
        { status: error.statusCode },
      );
    }
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: {
          code: "teams_worker_failed",
          message,
          requestId: cid,
        },
      },
      { status: 500 },
    );
  }
}
