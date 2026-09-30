import { NextResponse } from "next/server";
import { authorizeEngineeringSegment, withEngineeringApi } from "@/lib/commerce/engineering-api";

function statusFor(message: string): number {
  if (message.includes("denied") || message.includes("mismatch") || message.includes("broadening")) return 403;
  if (message === "workspace_required" || message === "caller_supplied_authority_rejected" || message === "project_required") return 400;
  return 400;
}

export const GET = withEngineeringApi("work", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "catalog";
  if (action === "catalog") {
    return NextResponse.json({ data: ctx.engineering.work.catalog() });
  }
  const projectId = url.searchParams.get("projectId") ?? "";
  if (action === "list" && projectId) {
    const data = await ctx.engineering.work.list(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "day" && projectId) {
    const since = url.searchParams.get("since") ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const data = await ctx.engineering.work.dayView(commerce, ctx.tenantId, projectId, since, ctx.userId);
    return NextResponse.json({ data });
  }
  if (action === "repositories") {
    const data = await ctx.engineering.work.listRepositories(commerce, ctx.tenantId, projectId || null);
    return NextResponse.json({ data });
  }
  if (action === "detail") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.work.get(commerce, ctx.tenantId, id);
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ data, explanation: ctx.engineering.work.explain(data) });
  }
  return NextResponse.json({ data: ctx.engineering.work.catalog() });
});

export const POST = withEngineeringApi("work", async ({ ctx, commerce, correlationId }, request) => {
  const body = (await request.json()) as Record<string, unknown>;
  const rejected = ctx.engineering.work.rejectCallerClaims(body);
  if (rejected) {
    return NextResponse.json({ error: rejected }, { status: 400 });
  }
  const action = String(body.action ?? "");
  try {
    if (action === "ingest") {
      const data = await ctx.engineering.work.ingest(commerce, ctx.tenantId, body.signal as never);
      return NextResponse.json({ data });
    }
    if (action === "confirm") {
      const data = await ctx.engineering.work.confirmCandidate(
        commerce,
        ctx.tenantId,
        String(body.id ?? ""),
        String(body.state ?? "") as never,
      );
      return NextResponse.json({ data });
    }
    if (action === "rebindProject") {
      const data = await ctx.engineering.work.rebindProject(commerce, ctx.tenantId, String(body.id ?? ""), String(body.projectId ?? ""));
      return NextResponse.json({ data });
    }
    if (action === "saveRepository") {
      const settingsCommerce = await authorizeEngineeringSegment(ctx, "settings", "POST", correlationId);
      if (!settingsCommerce) {
        return NextResponse.json({ error: "identity_assurance_required" }, { status: 403 });
      }
      const incoming = (body.repository ?? {}) as Record<string, unknown>;
      const data = await ctx.engineering.work.saveRepository(
        settingsCommerce,
        ctx.tenantId,
        {
          ...incoming,
          tenantId: ctx.tenantId,
          workspaceId: settingsCommerce.workspaceId,
        } as never,
        { actorProjectId: typeof incoming.actorProjectId === "string" ? incoming.actorProjectId : null },
      );
      return NextResponse.json({ data });
    }
    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "work_error";
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
});
