import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import {
  PermissionService,
  resolveNavTier,
  shouldIncludePlatformSearchResults,
} from "@rtb/platform-core";

export const GET = withEngineeringApi("search", async ({ ctx, commerce }, request) => {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const type = (searchParams.get("type") as "project" | "asset" | "document" | "all") ?? "all";
  const status = searchParams.get("status") ?? undefined;
  if (!q.trim()) {
    return NextResponse.json({
      data: {
        projects: [],
        assets: [],
        documents: [],
        knowledgeNodes: [],
        decisions: [],
        actions: [],
        risks: [],
        issues: [],
        technicalQueries: [],
        lessons: [],
      },
    });
  }

  const permissionService = new PermissionService(ctx.supabase);
  const includePlatformInternals = shouldIncludePlatformSearchResults({
    roleSlug: ctx.roleSlug,
    tier: resolveNavTier(ctx.roleSlug),
    permissions: ctx.permissions,
    showAdvancedInSidebar: ctx.showAdvancedPlatformTools,
    hasPermission: (resource, action) =>
      permissionService.hasPermission(
        ctx.permissions,
        resource as Parameters<typeof permissionService.hasPermission>[1],
        action as Parameters<typeof permissionService.hasPermission>[2]
      ),
  });

  const data = await ctx.engineering.search.search(commerce, ctx.tenantId, q, {
    type,
    status,
    includeKnowledgeGraph: includePlatformInternals,
  });
  return NextResponse.json({ data });
});
