import { NextResponse } from "next/server";
import { emitLifecycleObservation } from "@rtb/platform-commerce";

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
  const body = await request.json().catch(() => ({}));

  try {
    await emitLifecycleObservation(ctx!.commerce.events, {
      eventType: "installation.rollback.requested",
      tenantId: ctx!.tenantId,
      workspaceId: ctx!.workspaceId,
      installationId,
      actorUserId: ctx!.userId,
      actorRole: ctx!.roleSlug,
      operation: "installation.rollback",
      result: "success",
      correlationId: requestId,
      aggregateType: "installation",
      aggregateId: installationId,
      payload: { targetVersion: body.targetVersion ?? null },
    });
    const data = await ctx!.commerce.installationLifecycle.requestRollback(
      ctx!.tenantId,
      installationId,
      body.targetVersion,
      body.reason ?? "operator_requested",
      ctx!.userId,
      requestId
    );
    await emitLifecycleObservation(ctx!.commerce.events, {
      eventType: "installation.rollback_pending",
      tenantId: ctx!.tenantId,
      workspaceId: ctx!.workspaceId,
      installationId,
      actorUserId: ctx!.userId,
      actorRole: ctx!.roleSlug,
      operation: "installation.rollback",
      result: "success",
      correlationId: requestId,
      aggregateType: "installation",
      aggregateId: installationId,
    });
    return NextResponse.json({ data, requestId });
  } catch (err) {
    return handleInstallationError(err, requestId);
  }
}
