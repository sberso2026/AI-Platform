import { NextResponse } from "next/server";
import { authorizeEngineeringSegment, withEngineeringApi } from "@/lib/commerce/engineering-api";

function statusFor(message: string): number {
  if (message.includes("denied") || message.includes("mismatch")) return 403;
  if (message === "workspace_required" || message === "caller_supplied_authority_rejected") return 400;
  return 400;
}

export const GET = withEngineeringApi("information", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "catalog";
  if (action === "catalog") {
    return NextResponse.json({ data: ctx.engineering.information.catalog() });
  }
  const projectId = url.searchParams.get("projectId") ?? "";
  if (action === "list" && projectId) {
    const data = await ctx.engineering.information.list(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "detail") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.information.get(commerce, ctx.tenantId, id);
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ data });
  }
  if (action === "policies") {
    const data = await ctx.engineering.information.listPolicies(commerce, ctx.tenantId, projectId || null);
    return NextResponse.json({ data });
  }
  if (action === "resolutions" && projectId) {
    const data = await ctx.engineering.information.listResolutions(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "resolution") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.information.getResolution(commerce, ctx.tenantId, id);
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ data });
  }
  return NextResponse.json({ data: ctx.engineering.information.catalog() });
});

export const POST = withEngineeringApi("information", async ({ ctx, commerce, correlationId }, request) => {
  const body = (await request.json()) as Record<string, unknown>;
  const rejected = ctx.engineering.information.rejectCallerClaims(body);
  if (rejected) {
    return NextResponse.json({ error: rejected }, { status: 400 });
  }
  const action = String(body.action ?? "");
  try {
    if (action === "resolve") {
      const data = await ctx.engineering.information.resolve(commerce, ctx.tenantId, {
        projectId: String(body.projectId ?? ""),
        informationType: String(body.informationType ?? "") as never,
        purpose: String(body.purpose ?? "") as never,
        discipline: typeof body.discipline === "string" ? body.discipline : undefined,
        lifecycleStage: typeof body.lifecycleStage === "string" ? body.lifecycleStage : undefined,
        systemId: typeof body.systemId === "string" ? body.systemId : undefined,
        policyVersion: typeof body.policyVersion === "string" ? body.policyVersion : undefined,
        actorId: ctx.userId,
      });
      return NextResponse.json({ data });
    }
    if (action === "register") {
      const data = await ctx.engineering.information.register(commerce, ctx.tenantId, body.ref as never);
      return NextResponse.json({ data });
    }
    if (action === "savePolicy") {
      const settingsCommerce = await authorizeEngineeringSegment(ctx, "settings", "POST", correlationId);
      if (!settingsCommerce) {
        return NextResponse.json({ error: "information_authority_required" }, { status: 403 });
      }
      const incoming = (body.policy ?? {}) as Record<string, unknown>;
      const data = await ctx.engineering.information.savePolicy(settingsCommerce, ctx.tenantId, {
        ...incoming,
        tenantId: ctx.tenantId,
        workspaceId: settingsCommerce.workspaceId,
      } as never);
      return NextResponse.json({ data });
    }
    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "information_error";
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
});
