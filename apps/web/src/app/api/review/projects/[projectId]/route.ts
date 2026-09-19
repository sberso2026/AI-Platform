import { NextResponse } from "next/server";
import { withReviewApiParams } from "@/lib/review/with-review-api";
import { createTrustedReviewRuntime } from "@/lib/review/runtime";

export const GET = withReviewApiParams<{ projectId: string }>(async ({ ctx, actor }, _request, params) => {
  const review = createTrustedReviewRuntime(ctx, actor);
  const project = await review.getProject(actor, params.projectId);
  const documents = await review.listDocuments(actor, params.projectId);
  const packages = await review.listPackages(actor, params.projectId);
  return NextResponse.json({ data: { project, documents, packages } });
});
