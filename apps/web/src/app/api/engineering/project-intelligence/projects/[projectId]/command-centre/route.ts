import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { composeProjectCommandCentre } from "@/lib/project-intelligence/command-centre-service";
import { handleCommerceDomainError, lifecycleErrorResponse } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams(
  "project-intelligence-command-centre",
  async (context, request, { projectId }) => {
    try {
      requireProjectIntelligenceRead(context);
      if (!context.ctx.workspaceId) {
        return lifecycleErrorResponse(
          "workspace_not_assigned",
          "An assigned workspace is required",
          403,
          context.correlationId,
        );
      }
      const started = Date.now();
      const { view, profile } = await composeProjectCommandCentre(context, projectId);
      if (request.headers.get("x-pi-command-centre-profile") === "1") {
        return NextResponse.json({
          data: view,
          profile: {
            ...profile,
            security: context.securityProfile,
            handlerMs: Date.now() - started,
            authAndEntitlementOutsideCompose: true,
            sequentialIndependentIntelligenceLoads: false,
            parallelIndependentIntelligenceLoads: true,
            aiWait: false,
            connectorWait: false,
          },
        });
      }
      return NextResponse.json({ data: view });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
