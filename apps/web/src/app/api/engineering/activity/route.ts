import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleOkResponse } from "@/lib/lifecycle-api";

export const GET = withEngineeringApi("activity", async ({ ctx, commerce }, request) => {
  const projectId = new URL(request.url).searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.activity.list(commerce, ctx.tenantId, 100, projectId);
  return lifecycleOkResponse(data);
});
