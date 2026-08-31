import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { handleCommerceDomainError, lifecycleErrorResponse, resolveRequestId } from "@/lib/lifecycle-api";
import {
  DIGITAL_TWIN_VERSION,
  createPostgresDigitalTwinRepository,
  listUnavailableCapabilities,
} from "@rtb/digital-twin";

async function safeRead<T>(label: string, fn: () => Promise<T>) {
  try {
    const data = await fn();
    const present =
      data !== undefined && data !== null && !(Array.isArray(data) && data.length === 0);
    return { surface: label, present, data: data ?? null };
  } catch (error) {
    return {
      surface: label,
      present: false,
      data: null,
      error: error instanceof Error ? error.message : "read_failed",
    };
  }
}

/** Workspace twin inventory from hosted Digital Twin persistence. */
export const GET = withEngineeringApi(
  "digital-twin-workspace-snapshot",
  async (context, request) => {
    const requestId = resolveRequestId(request) ?? context.correlationId;
    try {
      if (!context.ctx.workspaceId) {
        return lifecycleErrorResponse("workspace_required", "workspaceId is required", 400, requestId);
      }
      const repo = createPostgresDigitalTwinRepository(context.ctx.supabase);
      const identities = await safeRead("identities", () =>
        repo.listIdentities(context.ctx.tenantId, context.ctx.workspaceId!),
      );
      const adapters = await safeRead("adapters", () =>
        repo.listSourceAdapters(context.ctx.tenantId, context.ctx.workspaceId!),
      );

      return NextResponse.json({
        data: {
          tenantId: context.ctx.tenantId,
          workspaceId: context.ctx.workspaceId,
          moduleVersion: DIGITAL_TWIN_VERSION,
          identities,
          adapters,
          unavailable: listUnavailableCapabilities().map((c) => c.capabilityId),
          boundaries: {
            physicalActuation: false,
            automaticControl: false,
            predictiveTwin: false,
            nativeEngineeringSolver: false,
            sharedSpatialDomainOwner: true,
          },
        },
        requestId,
      });
    } catch (error) {
      return handleCommerceDomainError(error, requestId);
    }
  },
);
