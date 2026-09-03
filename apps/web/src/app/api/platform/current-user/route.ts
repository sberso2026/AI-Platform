import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Load profile to get full_name for the current authenticated user.
  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("id, full_name, email, metadata")
    .eq("id", ctx.userId)
    .maybeSingle();

  const metadata = (profile?.metadata ?? {}) as Record<string, unknown>;
  const company =
    typeof metadata.company === "string"
      ? metadata.company
      : typeof metadata.company_name === "string"
        ? metadata.company_name
        : null;

  return NextResponse.json({
    data: {
      id: ctx.userId,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? null,
      company,
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId ?? null,
      roleSlug: ctx.roleSlug,
    },
  });
}
