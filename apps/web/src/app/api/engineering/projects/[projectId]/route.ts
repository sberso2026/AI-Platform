import { NextResponse } from "next/server";
import {
  authorizeEngineeringSegment,
  withEngineeringApiParams,
} from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams(
  "projects",
  async ({ ctx, commerce, correlationId }, _request, { projectId }) => {
    const project = await ctx.engineering.projects.get(commerce, ctx.tenantId, projectId);
    if (!project) {
      return lifecycleErrorResponse(
        "not_found",
        "Project not found",
        404,
        correlationId,
      );
    }

    const [assetCommerce, documentCommerce] = await Promise.all([
      authorizeEngineeringSegment(ctx, "assets", "GET", correlationId),
      authorizeEngineeringSegment(ctx, "documents", "GET", correlationId),
    ]);

    const [assets, documents] = await Promise.all([
      assetCommerce
        ? ctx.engineering.assets.list(assetCommerce, ctx.tenantId, projectId)
        : Promise.resolve([]),
      documentCommerce
        ? ctx.engineering.documents.list(documentCommerce, ctx.tenantId, projectId)
        : Promise.resolve([]),
    ]);

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
