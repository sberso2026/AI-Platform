import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/kernel";
import { createServiceClient } from "@/lib/supabase/service";
import {
  COMMERCE_SCHEDULER_JOBS,
  CommerceDomainError,
  createPlatformCommerce,
  type CommerceSchedulerJob,
} from "@rtb/platform-commerce";

function correlationId(request: Request): string {
  return request.headers.get("x-correlation-id") ?? crypto.randomUUID();
}

function isAllowedJob(job: string): job is CommerceSchedulerJob {
  return (COMMERCE_SCHEDULER_JOBS as readonly string[]).includes(job);
}

export async function POST(request: Request) {
  const cid = correlationId(request);
  const schedulerSecret = request.headers.get("x-commerce-scheduler-secret");
  const expectedSecret = process.env.COMMERCE_SCHEDULER_SECRET;
  const hasValidSecret = Boolean(expectedSecret && schedulerSecret === expectedSecret);

  let commerce;
  if (hasValidSecret) {
    commerce = createPlatformCommerce(createServiceClient());
  } else {
    const ctx = await getAuthContext();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized", correlationId: cid }, { status: 401 });
    }
    if (ctx.roleSlug !== "owner") {
      return NextResponse.json({ error: "Forbidden", correlationId: cid }, { status: 403 });
    }
    commerce = ctx.commerce;
  }

  const body = await request.json().catch(() => ({}));
  const requestedJobs = Array.isArray(body.jobs) ? (body.jobs as string[]) : undefined;

  if (requestedJobs) {
    const invalid = requestedJobs.filter((job) => !isAllowedJob(job));
    if (invalid.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid job names",
          correlationId: cid,
          invalidJobs: invalid,
          allowedJobs: [...COMMERCE_SCHEDULER_JOBS],
        },
        { status: 400 }
      );
    }
  }

  try {
    if (!commerce.scheduler) {
      return NextResponse.json(
        { error: "Scheduler unavailable", correlationId: cid },
        { status: 503 }
      );
    }

    const results = requestedJobs
      ? await commerce.scheduler.runJobs(requestedJobs)
      : await commerce.scheduler.runAll();

    return NextResponse.json({ correlationId: cid, data: results });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json(
        { error: err.message, code: err.code, correlationId: cid },
        { status: err.statusCode }
      );
    }

    const message = err instanceof Error ? err.message : "Job execution failed";
    return NextResponse.json({ error: message, correlationId: cid }, { status: 500 });
  }
}
