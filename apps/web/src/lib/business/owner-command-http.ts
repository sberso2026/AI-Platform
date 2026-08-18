import { NextResponse } from "next/server";
import type { AuthContext } from "@/lib/kernel";

export function ownerCommandScope(ctx: AuthContext):
  | { tenantId: string; workspaceId: string; userId: string }
  | NextResponse {
  if (!ctx.workspaceId) {
    return NextResponse.json(
      { error: "Workspace required", code: "workspace_not_assigned" },
      { status: 400 },
    );
  }
  return { tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, userId: ctx.userId };
}

export function ownerCommandError(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : "Owner Command request failed";
  if (message === "workspace_not_assigned") {
    return NextResponse.json({ error: "Workspace required", code: message }, { status: 400 });
  }
  if (
    message === "currency_mismatch" ||
    message === "currency_required" ||
    message === "invalid_period" ||
    message === "invalid_source_type" ||
    message === "invalid_scale" ||
    message === "monetary_value_not_integer" ||
    message === "scale_mismatch"
  ) {
    return NextResponse.json({ error: message, code: message }, { status: 400 });
  }
  if (message.includes("not found")) {
    return NextResponse.json({ error: message, code: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ error: message, code: "owner_command_failed" }, { status: 500 });
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
