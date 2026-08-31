import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { loadCanonicalEngineeringAccess } from "@/lib/commerce/canonical-access";
import { unauthenticatedResponse } from "@/lib/lifecycle-api";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(crypto.randomUUID());
  const snapshot = await loadCanonicalEngineeringAccess(ctx);
  return NextResponse.json({ data: snapshot });
}
