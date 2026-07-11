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
      eventType: "installation.upgrade.requested",
      tenantId: ctx!.tenantId,
      workspaceId: ctx!.workspaceId,
      installationId,
      actorUserId: ctx!.userId,
      actorRole: ctx!.roleSlug,
      operation: "installation.upgrade",
      result: "success",
      correlationId: requestId,
      aggregateType: "installation",
      aggregateId: installationId,
      payload: { targetVersion: body.targetVersion },
    });
    const data = await ctx!.commerce.installationLifecycle.requestUpgrade(
      ctx!.tenantId,
      installationId,
      body.targetVersion,
      ctx!.userId,
      requestId
    );
    await emitLifecycleObservation(ctx!.commerce.events, {
      eventType: "installation.upgraded",
      tenantId: ctx!.tenantId,
      workspaceId: ctx!.workspaceId,
      installationId,
      actorUserId: ctx!.userId,
      actorRole: ctx!.roleSlug,
      operation: "installation.upgrade",
      result: "success",
      correlationId: requestId,
      aggregateType: "installation",
      aggregateId: installationId,
      payload: { targetVersion: body.targetVersion },
    });
    return NextResponse.json({ data, requestId });
  } catch (err) {
    return handleInstallationError(err, requestId);
  }
}
