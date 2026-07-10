import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await ctx.kernel.notifications.listForUser(ctx.userId);
  return NextResponse.json({ data: notifications });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const notification = await ctx.kernel.notifications.create({
    tenantId: ctx.tenantId,
    userId: body.userId ?? ctx.userId,
    type: body.type ?? "system.warning",
    title: body.title,
    body: body.body,
    priority: body.priority,
    linkTarget: body.linkTarget,
  });

  return NextResponse.json({ data: notification }, { status: 201 });
}
