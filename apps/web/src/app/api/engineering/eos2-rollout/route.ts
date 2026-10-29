import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { readEos2Access } from "@/lib/commerce/eos2-rollout-server";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ allowed: false }, { status: 401 });
  const decision = await readEos2Access(ctx);
  return NextResponse.json({ allowed: decision.allowed });
}
