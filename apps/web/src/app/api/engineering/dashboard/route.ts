import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleOkResponse } from "@/lib/lifecycle-api";

export const GET = withEngineeringApi("dashboard", async ({ ctx, commerce }, request) => {
  const projectId = new URL(request.url).searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.dashboard.getDashboard(commerce, ctx.tenantId, {
    projectId,
  });
  return lifecycleOkResponse(data);
});
