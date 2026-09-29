import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApiParams<{ id: string }>(
  "external-tools",
  async ({ ctx, commerce }, _request, params) => {
    const data = await ctx.engineering.externalTools.get(commerce, ctx.tenantId, params.id);
    const assignments = await ctx.engineering.externalToolAssignments.listForProfile(commerce, ctx.tenantId, params.id);
    return NextResponse.json({ data, assignments });
  },
);

export const PATCH = withEngineeringApiParams<{ id: string }>(
  "external-tools",
  async ({ ctx, commerce }, request, params) => {
    const body = await request.json();
    if (body.action === "validate") {
      const data = await ctx.engineering.externalTools.runValidation(commerce, ctx.tenantId, params.id, ctx.userId);
      return NextResponse.json({ data });
    }
    if (body.action === "assign") {
      const data = await ctx.engineering.externalToolAssignments.assign(
        commerce,
        ctx.tenantId,
        params.id,
        {
          workspaceId: body.workspaceId ?? ctx.workspaceId,
          projectId: body.projectId,
          allowed: body.allowed,
          permittedCapabilities: body.permittedCapabilities,
          designStandard: body.designStandard,
          unitSystem: body.unitSystem,
          analysisProfile: body.analysisProfile,
        },
        ctx.userId,
      );
      return NextResponse.json({ data });
    }
    const data = await ctx.engineering.externalTools.update(commerce, ctx.tenantId, params.id, body, ctx.userId);
    return NextResponse.json({ data });
  },
);
