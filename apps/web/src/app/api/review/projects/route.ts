import { NextResponse } from "next/server";
import { withReviewApi } from "@/lib/review/with-review-api";
import { createTrustedReviewRuntime } from "@/lib/review/runtime";

export const GET = withReviewApi(async ({ ctx, actor }) => {
  const review = createTrustedReviewRuntime(ctx, actor);
  const data = await review.listProjects(actor);
  return NextResponse.json({ data });
});
