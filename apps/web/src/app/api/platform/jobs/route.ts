import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await ctx.kernel.jobs.list(ctx.tenantId);
  return NextResponse.json({ data: jobs });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const job = await ctx.kernel.jobs.create({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    jobType: body.jobType,
    payload: body.payload,
    createdBy: ctx.userId,
  });

  return NextResponse.json({ data: job }, { status: 201 });
}
