import { NextResponse } from "next/server";
import { withReviewApiParams } from "@/lib/review/with-review-api";
import { createTrustedReviewRuntime } from "@/lib/review/runtime";

export const GET = withReviewApiParams<{ packageId: string }>(async ({ ctx, actor }, _request, params) => {
  const review = createTrustedReviewRuntime(ctx, actor);
  const data = await review.getRegister(actor, params.packageId);
  return NextResponse.json({ data });
});
