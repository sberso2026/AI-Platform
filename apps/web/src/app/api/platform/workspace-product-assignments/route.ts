import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { handleInstallationError, requireInstallationAdmin } from "@/lib/installations/with-installation-admin";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const installations = await ctx.commerce.installations.listByTenant(ctx.tenantId);
  const assignments = [];
  for (const inst of installations) {
    const rows = await ctx.commerce.installations.listWorkspaceAssignments(ctx.tenantId, inst.id);
    assignments.push(...rows);
  }
  return NextResponse.json({ data: assignments });
}

export async function POST(request: Request) {
  const auth = await requireInstallationAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const { ctx } = auth;

  const body = await request.json();
  try {
    const installation = await ctx!.commerce.installations.getById(
      ctx!.tenantId,
      body.installationId
    );
    if (!installation) {
      return NextResponse.json({ error: "Installation not found" }, { status: 404 });
    }
    const data = await ctx!.commerce.installationLifecycle.assignWorkspace({
      tenantId: ctx!.tenantId,
      workspaceId: body.workspaceId,
      installationId: body.installationId,
      productId: installation.product_id,
      assignedBy: ctx!.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return handleInstallationError(err);
  }
}

export async function DELETE(request: Request) {
  const auth = await requireInstallationAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const { ctx } = auth;

  const assignmentId = new URL(request.url).searchParams.get("assignmentId");
  if (!assignmentId) {
    return NextResponse.json({ error: "assignmentId required" }, { status: 422 });
  }

  try {
    await ctx!.commerce.installationLifecycle.removeWorkspaceAssignment(
      ctx!.tenantId,
      assignmentId
    );
    const { notifyTenantAdmins, AdminNotificationTypes } = await import(
      "@/lib/administration/customer-admin-notifications"
    );
    await notifyTenantAdmins(ctx!, {
      type: AdminNotificationTypes.workspaceAccessRemoved,
      title: "Workspace product access removed",
      body: "A workspace no longer has access to an installed product.",
      linkTarget: "/system/products",
      correlationId: assignmentId,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleInstallationError(err);
  }
}
