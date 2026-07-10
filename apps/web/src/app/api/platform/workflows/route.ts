import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [definitions, instances] = await Promise.all([
    ctx.kernel.workflow.listDefinitions(ctx.tenantId),
    ctx.kernel.workflow.listInstances(ctx.tenantId),
  ]);

  return NextResponse.json({ data: { definitions, instances } });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const instance = await ctx.kernel.workflow.start({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    definitionSlug: body.definitionSlug,
    context: body.context,
    startedBy: ctx.userId,
  });

  return NextResponse.json({ data: instance }, { status: 201 });
}
