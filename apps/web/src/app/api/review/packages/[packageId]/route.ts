import { NextResponse } from "next/server";
import { withReviewApiParams } from "@/lib/review/with-review-api";
import { createTrustedReviewRuntime } from "@/lib/review/runtime";

export const GET = withReviewApiParams<{ packageId: string }>(async ({ ctx, actor }, _request, params) => {
  const review = await createTrustedReviewRuntime(ctx, actor);
  const pkg = await review.getPackage(actor, params.packageId);
  const register = await review.getRegister(actor, params.packageId);
  return NextResponse.json({ data: { ...pkg, register } });
});
