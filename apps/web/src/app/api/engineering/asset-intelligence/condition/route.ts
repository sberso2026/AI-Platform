import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { handleCommerceDomainError, lifecycleErrorResponse, resolveRequestId } from "@/lib/lifecycle-api";
import {
  AssetIntelligenceService,
  createAssetIntelligenceEngine,
  createInMemorySharedDomainIdentityPort,
  createInProcessAssetIntelligenceEventPipeline,
  createPostgresAssetIntelligenceRepository,
  assertOwnershipLock,
} from "@rtb/asset-intelligence";

export const POST = withEngineeringApi("asset-intelligence-condition", async (context, request) => {
  const requestId = resolveRequestId(request) ?? context.correlationId;
  try {
    assertOwnershipLock();
    if (!context.ctx.workspaceId) {
      return lifecycleErrorResponse(
        "workspace_required",
        "workspaceId is required",
        400,
        requestId,
      );
    }
    const body = await request.json();
    if (!body?.assetId || !body?.ii?.assetReference?.identity?.assetId) {
      return lifecycleErrorResponse(
        "invalid_condition_assess",
        "assetId and ii.assetReference are required",
        400,
        requestId,
        {},
      );
    }
    const identity = {
      tenantId: context.ctx.tenantId,
      workspaceId: context.ctx.workspaceId,
      assetId: String(body.assetId),
      owner: "engineering_os_shared_domain" as const,
    };
    const repository = createPostgresAssetIntelligenceRepository(context.ctx.supabase);
    const engine = createAssetIntelligenceEngine({
      identityPort: createInMemorySharedDomainIdentityPort([identity]),
      repository,
      events: createInProcessAssetIntelligenceEventPipeline(),
    });
    const service = new AssetIntelligenceService(engine);
    const result = await service.assessConditionFromInspection({
      tenantId: context.ctx.tenantId,
      workspaceId: context.ctx.workspaceId,
      assetId: String(body.assetId),
      ii: body.ii,
      idempotencyKey: body.idempotencyKey ?? request.headers.get("idempotency-key") ?? undefined,
      correlationId: context.correlationId,
      createdBy: context.ctx.userId,
      expectedVersion: body.expectedVersion,
      status: body.status,
    });
    return NextResponse.json(
      {
        data: {
          conditionStateId: result.condition.stateId,
          snapshotId: result.snapshotId,
          version: result.condition.version,
          status: result.condition.status,
          healthStatus: result.healthIndex.status,
          identityMutated: false,
          idempotentReplay: result.idempotentReplay ?? false,
        },
        requestId,
      },
      { status: result.idempotentReplay ? 200 : 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "condition_assess_failed";
    if (message.startsWith("optimistic_lock_conflict")) {
      return lifecycleErrorResponse("optimistic_lock_conflict", message, 409, requestId);
    }
    if (message.includes("shared_domain_identity_not_found")) {
      return lifecycleErrorResponse("asset_not_found", message, 404, requestId);
    }
    return handleCommerceDomainError(error, requestId);
  }
});

export const GET = withEngineeringApi("asset-intelligence-condition", async (context, request) => {
  const requestId = resolveRequestId(request) ?? context.correlationId;
  try {
    if (!context.ctx.workspaceId) {
      return lifecycleErrorResponse("workspace_required", "workspaceId is required", 400, requestId);
    }
    const url = new URL(request.url);
    const assetId = url.searchParams.get("assetId");
    if (!assetId) {
      return lifecycleErrorResponse("invalid_condition_read", "assetId is required", 400, requestId);
    }
    const repository = createPostgresAssetIntelligenceRepository(context.ctx.supabase);
    const latest = await repository.latestCondition(
      context.ctx.tenantId,
      context.ctx.workspaceId,
      assetId,
    );
    if (!latest) {
      return lifecycleErrorResponse("condition_not_found", "No condition state for asset", 404, requestId);
    }
    return NextResponse.json({
      data: {
        conditionStateId: latest.stateId,
        assetId: latest.assetId,
        version: latest.version,
        status: latest.status,
        conditionRating: latest.conditionRating,
        recordedAt: latest.recordedAt,
      },
      requestId,
    });
  } catch (error) {
    return handleCommerceDomainError(error, requestId);
  }
});
