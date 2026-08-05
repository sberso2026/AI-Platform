import { NextResponse } from "next/server";
import {
  InstallationDependencyError,
  InstallationErrorCode,
  emitLifecycleObservation,
} from "@rtb/platform-commerce";

import {
  handleInstallationError,
  requireInstallationAdmin,
} from "@/lib/installations/with-installation-admin";

type Params = { params: Promise<{ installationId: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireInstallationAdmin(request);
  if ("error" in auth && auth.error) return auth.error;
  const { ctx, requestId } = auth;
  const { installationId } = await params;

  try {
    await ctx!.commerce.installationLifecycle.requestUninstall(
      ctx!.tenantId,
      installationId,
      ctx!.userId
    );
    await emitLifecycleObservation(ctx!.commerce.events, {
      eventType: "installation.uninstall.requested",
      tenantId: ctx!.tenantId,
      workspaceId: ctx!.workspaceId,
      installationId,
      actorUserId: ctx!.userId,
      actorRole: ctx!.roleSlug,
      operation: "installation.uninstall",
      result: "success",
      correlationId: requestId,
      aggregateType: "installation",
      aggregateId: installationId,
    });
    const data = await ctx!.commerce.installationLifecycle.uninstall(
      ctx!.tenantId,
      installationId,
      ctx!.userId
    );
    await emitLifecycleObservation(ctx!.commerce.events, {
      eventType: "installation.uninstalled",
      tenantId: ctx!.tenantId,
      workspaceId: ctx!.workspaceId,
      installationId,
      actorUserId: ctx!.userId,
      actorRole: ctx!.roleSlug,
      operation: "installation.uninstall",
      result: "success",
      correlationId: requestId,
      aggregateType: "installation",
      aggregateId: installationId,
      payload: {
        requestId,
        previousState: "uninstalling",
        nextState: "uninstalled",
        operatingSystemKey: data?.product_id ?? null,
        durationMs: 0,
      },
    });
    return NextResponse.json({ data, requestId });
  } catch (err) {
    if (err instanceof InstallationDependencyError) {
      await emitLifecycleObservation(ctx!.commerce.events, {
        eventType: "installation.uninstall.blocked_by_dependencies",
        tenantId: ctx!.tenantId,
        workspaceId: ctx!.workspaceId,
        installationId,
        actorUserId: ctx!.userId,
        actorRole: ctx!.roleSlug,
        operation: "installation.uninstall",
        result: "blocked",
        errorCode: InstallationErrorCode.ACTIVE_DEPENDENCIES_EXIST,
        correlationId: requestId,
        aggregateType: "installation",
        aggregateId: installationId,
      });
    }
    return handleInstallationError(err, requestId);
  }
}
