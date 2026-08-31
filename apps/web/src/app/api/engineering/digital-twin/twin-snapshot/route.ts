import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { handleCommerceDomainError, lifecycleErrorResponse, resolveRequestId } from "@/lib/lifecycle-api";
import { createPostgresDigitalTwinRepository } from "@rtb/digital-twin";

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

/** Operational twin detail: identity, state, history, bindings, representations, thread. */
export const GET = withEngineeringApi("digital-twin-twin-snapshot", async (context, request) => {
  const requestId = resolveRequestId(request) ?? context.correlationId;
  try {
    if (!context.ctx.workspaceId) {
      return lifecycleErrorResponse("workspace_required", "workspaceId is required", 400, requestId);
    }
    const twinId = new URL(request.url).searchParams.get("twinId");
    if (!twinId) {
      return lifecycleErrorResponse("invalid_twin_snapshot", "twinId is required", 400, requestId);
    }

    const tenantId = context.ctx.tenantId;
    const workspaceId = context.ctx.workspaceId;
    const repo = createPostgresDigitalTwinRepository(context.ctx.supabase);

    const identity = await safeRead("identity", () =>
      repo.getIdentityById(tenantId, workspaceId, twinId),
    );
    if (!identity.present || !identity.data) {
      return lifecycleErrorResponse("twin_not_found", "Twin identity not found", 404, requestId, {
        twinId,
        readError: identity.error,
      });
    }

    const [state, snapshots, stateVersions, bindings, representations, thread, spatial] =
      await Promise.all([
        safeRead("state", () => repo.listStates(tenantId, workspaceId, twinId)),
        safeRead("snapshot_history", () => repo.listSnapshots(tenantId, workspaceId, twinId)),
        safeRead("state_versions", () =>
          repo.listStateVersionsForTwin(tenantId, workspaceId, twinId),
        ),
        safeRead("telemetry_bindings", () =>
          repo.listTelemetryBindings(tenantId, workspaceId, twinId),
        ),
        safeRead("representations", () =>
          repo.listRepresentations(tenantId, workspaceId, twinId),
        ),
        safeRead("digital_thread", () => repo.listThreadLinks(tenantId, workspaceId, twinId)),
        safeRead("spatial_references", () =>
          repo.listSpatialReferences(tenantId, workspaceId, twinId),
        ),
      ]);

    return NextResponse.json({
      data: {
        twinId,
        tenantId,
        workspaceId,
        identity: { surface: "identity", present: true, data: identity.data },
        surfaces: {
          state,
          snapshot_history: snapshots,
          state_versions: stateVersions,
          telemetry_bindings: bindings,
          representations,
          digital_thread: thread,
          spatial_references: spatial,
          simulation_governance: {
            surface: "simulation_governance",
            present: true,
            data: {
              note: "Simulation governance/assurance APIs are available; native solver execution remains unavailable.",
              nativeSolverEnabled: false,
              physicalActuationEnabled: false,
            },
          },
        },
      },
      requestId,
    });
  } catch (error) {
    return handleCommerceDomainError(error, requestId);
  }
});
