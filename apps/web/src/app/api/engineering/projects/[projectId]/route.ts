import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams(
  "projects",
  async ({ ctx, commerce, correlationId }, _request, { projectId }) => {
    const [project, assets, documents] = await Promise.all([
      ctx.engineering.projects.get(commerce, ctx.tenantId, projectId),
      ctx.engineering.assets.list(commerce, ctx.tenantId, projectId),
      ctx.engineering.documents.list(commerce, ctx.tenantId, projectId),
    ]);
    if (!project) {
      return lifecycleErrorResponse(
        "not_found",
        "Project not found",
        404,
        correlationId,
      );
    }

    return NextResponse.json(
      { data: { project, assets, documents } },
      {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      },
    );
  },
);

export const PATCH = withEngineeringApiParams(
  "projects",
  async ({ ctx, commerce, correlationId }, request, { projectId }) => {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return lifecycleErrorResponse(
        "invalid_json",
        "Request body must be valid JSON",
        400,
        correlationId,
      );
    }
    const data = await ctx.engineering.projects.update(
      commerce,
      ctx.tenantId,
      projectId,
      body,
    );
    return NextResponse.json(
      { data },
      {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      },
    );
  },
);
