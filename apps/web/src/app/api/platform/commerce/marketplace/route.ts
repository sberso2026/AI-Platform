import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [publishers, listings] = await Promise.all([
    ctx.commerce.marketplace.listPublishers(),
    ctx.commerce.marketplace.listPublishedProducts(),
  ]);

  return NextResponse.json({ data: { publishers, listings } });
}
