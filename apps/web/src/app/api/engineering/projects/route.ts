import { NextResponse } from "next/server";
import type {
  EngineeringProjectPhase,
  EngineeringProjectStatus,
} from "@rtb/types";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";

export const GET = withEngineeringApi("projects", async ({ ctx, commerce, securityProfile }, request) => {
  const domainStarted = Date.now();
  const data = await ctx.engineering.projects.list(commerce, ctx.tenantId);
  const wantProfile = new URL(request.url).searchParams.get("profile") === "1";
  // Consistent JSON contract for zero/one/many projects (never an empty body).
  return NextResponse.json(
    wantProfile
      ? {
          data: Array.isArray(data) ? data : [],
          profile: { security: securityProfile, domainMs: Date.now() - domainStarted },
        }
      : { data: Array.isArray(data) ? data : [] },
    {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    },
  );
});

export const POST = withEngineeringApi(
  "projects",
  async ({ ctx, commerce, correlationId }, request) => {
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

    const data = await ctx.engineering.projects.create(commerce, {
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      projectCode: String(body.projectCode ?? ""),
      projectName: String(body.projectName ?? ""),
      clientName: body.clientName as string | undefined,
      siteName: body.siteName as string | undefined,
      location: body.location as string | undefined,
      industry: body.industry as string | undefined,
      projectType: body.projectType as string | undefined,
      projectPhase: body.projectPhase as EngineeringProjectPhase | undefined,
      status: body.status as EngineeringProjectStatus | undefined,
      startDate: body.startDate as string | undefined,
      endDate: body.endDate as string | undefined,
      metadata: body.metadata as Record<string, unknown> | undefined,
      createdBy: ctx.userId,
    });
    return NextResponse.json(
      { data },
      {
        status: 201,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      },
    );
  },
);
