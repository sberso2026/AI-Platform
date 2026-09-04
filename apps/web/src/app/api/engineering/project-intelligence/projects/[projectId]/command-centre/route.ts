import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { composeProjectCommandCentre } from "@/lib/project-intelligence/command-centre-service";
import { piProjectScopeResponse } from "@/lib/project-intelligence/pi-route";
import { lifecycleOkResponse } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams(
  "project-intelligence-command-centre",
  async (context, request, { projectId }) => {
    requireProjectIntelligenceRead(context);
    const denied = piProjectScopeResponse(context, projectId);
    if (denied) return denied;
    const started = Date.now();
    const { view, profile } = await composeProjectCommandCentre(context, projectId);
    if (request.headers.get("x-pi-command-centre-profile") === "1") {
      return NextResponse.json({
        ok: true,
        data: view,
        profile: {
          ...profile,
          handlerMs: Date.now() - started,
          authAndEntitlementOutsideCompose: true,
          sequentialIndependentIntelligenceLoads: false,
          parallelIndependentIntelligenceLoads: true,
          aiWait: false,
          connectorWait: false,
        },
      });
    }
    return lifecycleOkResponse(view);
  },
);
