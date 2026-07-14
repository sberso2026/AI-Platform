import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import {
  parseMeetingJobTypeFilter,
  runMeetingWorkerOnce,
} from "@/lib/project-intelligence/meetings-service";
import { MeetingIntelligenceError } from "@rtb/project-intelligence/server";

function correlationId(request: Request): string {
  return request.headers.get("x-correlation-id") ?? crypto.randomUUID();
}

/**
 * Independent meeting worker drain endpoint (scheduler secret or tenant owner).
 * Does not process meetings inside ordinary meeting API handlers.
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
    const workerId = typeof body.workerId === "string" ? body.workerId : undefined;
    const loops = Math.min(Math.max(Number(body.loops ?? 1), 1), 20);
    const batchSize = Math.min(Math.max(Number(body.batchSize ?? 5), 1), 20);
    const jobTypes = parseMeetingJobTypeFilter(body.jobTypes ?? body.jobType);

    const results = [];
    for (let i = 0; i < loops; i += 1) {
      results.push(
        await runMeetingWorkerOnce({
          workerId: workerId ? `${workerId}-${i}` : undefined,
          jobTypes,
          batchSize,
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
          code: "meeting_worker_failed",
          message,
          requestId: cid,
        },
      },
      { status: 500 },
    );
  }
}
