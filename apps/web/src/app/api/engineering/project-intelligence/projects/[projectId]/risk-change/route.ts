import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { composeProjectRiskChangeIntelligence } from "@/lib/project-intelligence/risk-change-intelligence-service";
import { piProjectScopeResponse } from "@/lib/project-intelligence/pi-route";
import { lifecycleOkResponse } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams(
  "project-intelligence-risk-change",
  async (context, _request, { projectId }) => {
    requireProjectIntelligenceRead(context);
    const denied = piProjectScopeResponse(context, projectId);
    if (denied) return denied;
    const data = await composeProjectRiskChangeIntelligence(context, projectId);
    return lifecycleOkResponse(data);
  },
);
