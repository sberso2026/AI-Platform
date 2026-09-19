import { NextResponse } from "next/server";
import { withReviewApiParams } from "@/lib/review/with-review-api";
import { createTrustedReviewRuntime } from "@/lib/review/runtime";

export const GET = withReviewApiParams<{ projectId: string }>(async ({ ctx, actor }, _request, params) => {
  const review = createTrustedReviewRuntime(ctx, actor);
  const data = await review.listPackages(actor, params.projectId);
  return NextResponse.json({ data });
});

export const POST = withReviewApiParams<{ projectId: string }>(async ({ ctx, actor }, request, params) => {
  const body = (await request.json()) as { name?: string; documentIds?: string[] };
  const review = createTrustedReviewRuntime(ctx, actor);
  const data = await review.createPackage(actor, {
    projectId: params.projectId,
    name: body.name ?? "Review package",
    documentIds: body.documentIds ?? [],
  });
  return NextResponse.json({ data }, { status: 201 });
});
