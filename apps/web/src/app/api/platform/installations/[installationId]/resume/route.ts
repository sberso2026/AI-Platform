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

  try {
    const data = await ctx!.commerce.installationLifecycle.resume(
      ctx!.tenantId,
      installationId,
      ctx!.userId
    );
    await emitLifecycleObservation(ctx!.commerce.events, {
      eventType: "installation.resumed",
      tenantId: ctx!.tenantId,
      workspaceId: ctx!.workspaceId,
      installationId,
      actorUserId: ctx!.userId,
      actorRole: ctx!.roleSlug,
      operation: "installation.resume",
      result: "success",
      correlationId: requestId,
      aggregateType: "installation",
      aggregateId: installationId,
      payload: {
        requestId,
        previousState: "suspended",
        nextState: "active",
        operatingSystemKey: data?.product_id ?? null,
        durationMs: 0,
      },
    });
    return NextResponse.json({ data, requestId });
  } catch (err) {
    return handleInstallationError(err, requestId);
  }
}
