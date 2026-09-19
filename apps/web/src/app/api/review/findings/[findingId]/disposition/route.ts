import { NextResponse } from "next/server";
import { withReviewApiParams } from "@/lib/review/with-review-api";
import { createTrustedReviewRuntime } from "@/lib/review/runtime";
import type { ReviewDispositionAction } from "@rtb/engineering-review";

export const POST = withReviewApiParams<{ findingId: string }>(async ({ ctx, actor }, request, params) => {
  const body = (await request.json()) as {
    action?: ReviewDispositionAction;
    reason?: string;
    assignedTo?: string;
  };
  const review = createTrustedReviewRuntime(ctx, actor);
  const data = await review.recordDisposition(actor, {
    findingId: params.findingId,
    action: body.action as ReviewDispositionAction,
    reason: body.reason,
    assignedTo: body.assignedTo,
  });
  return NextResponse.json({ data });
});
