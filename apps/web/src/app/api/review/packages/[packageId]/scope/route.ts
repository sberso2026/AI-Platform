import { NextResponse } from "next/server";
import { withReviewApiParams } from "@/lib/review/with-review-api";
import { createTrustedReviewRuntime } from "@/lib/review/runtime";
import type { MvpReviewType } from "@rtb/engineering-review";

export const POST = withReviewApiParams<{ packageId: string }>(async ({ ctx, actor }, request, params) => {
  const body = (await request.json()) as { reviewTypes?: MvpReviewType[] };
  const review = await createTrustedReviewRuntime(ctx, actor);
  const data = await review.setScope(actor, params.packageId, body.reviewTypes ?? []);
  return NextResponse.json({ data });
});
