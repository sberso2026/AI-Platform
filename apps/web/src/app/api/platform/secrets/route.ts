import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [secrets, accessLogs] = await Promise.all([
    ctx.kernel.intelligence.secrets.listSecrets(ctx.tenantId),
    ctx.kernel.intelligence.secrets.listAccessLogs(ctx.tenantId),
  ]);
  return NextResponse.json({ data: { secrets, accessLogs } });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (body.action === "access") {
    const data = await ctx.kernel.intelligence.secrets.accessSecret({
      tenantId: ctx.tenantId,
      secretId: body.secretId,
      accessorId: ctx.userId,
      accessType: body.accessType ?? "read",
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  const data = await ctx.kernel.intelligence.secrets.createSecret({
    tenantId: ctx.tenantId,
    secretKey: body.secretKey,
    name: body.name,
    value: body.value ?? "placeholder",
    scope: body.scope ?? "tenant",
    scopeId: body.scopeId,
    description: body.description,
    createdBy: ctx.userId,
    externalRef: body.externalRef,
  });
  return NextResponse.json({ data }, { status: 201 });
}
