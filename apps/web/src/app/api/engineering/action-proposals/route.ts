import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import {
  buildProposalInputFromAsk,
  type AskActionKind,
} from "@rtb/engineering-os";
import {
  engineeringActionProposalService,
  handoffCompletedProposalToMemory,
} from "@/lib/engineering/action-proposal-runtime";

export const GET = withEngineeringApi("ai", async ({ ctx }, request) => {
  const proposalId = new URL(request.url).searchParams.get("proposalId");
  if (!proposalId) {
    const list = await engineeringActionProposalService.getStore().list(ctx.tenantId, 20);
    return NextResponse.json({ data: list });
  }
  const data = await engineeringActionProposalService.getForReview(ctx.tenantId, proposalId);
  if (!data) {
    return NextResponse.json({ error: { message: "Proposal not found" } }, { status: 404 });
  }
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("ai", async ({ ctx }, request) => {
  const body = await request.json();
  const op = String(body.op ?? "create");

  try {
    if (op === "create") {
      const kind = (body.kind ?? "create_action") as AskActionKind;
      const input = buildProposalInputFromAsk({
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        projectId: body.projectId ?? null,
        userId: ctx.userId,
        kind,
        title: body.title,
        description: body.description,
        draftText: body.draftText,
        objectType: body.objectType ?? null,
        objectId: body.objectId ?? null,
        evidenceRefs: body.evidenceRefs ?? [],
        reasoningRef: body.reasoningRef ?? null,
        memoryRefs: body.memoryRefs ?? [],
        askQuery: body.askQuery ?? null,
        assigneeId: body.assigneeId ?? null,
      });
      const data = await engineeringActionProposalService.create(input);
      return NextResponse.json({ data }, { status: 201 });
    }

    if (op === "edit") {
      const data = await engineeringActionProposalService.edit({
        tenantId: ctx.tenantId,
        proposalId: body.proposalId,
        userId: ctx.userId,
        expectedPayloadHash: body.expectedPayloadHash,
        proposedPayload: body.proposedPayload ?? {},
      });
      return NextResponse.json({ data });
    }

    if (op === "reject") {
      const data = await engineeringActionProposalService.reject({
        tenantId: ctx.tenantId,
        proposalId: body.proposalId,
        userId: ctx.userId,
        note: body.note,
      });
      return NextResponse.json({ data });
    }

    if (op === "approve") {
      const data = await engineeringActionProposalService.approve({
        tenantId: ctx.tenantId,
        proposalId: body.proposalId,
        userId: ctx.userId,
        expectedPayloadHash: body.expectedPayloadHash,
        permissions: [
          "engineering_action.approve",
          "engineering_action.approve_safety",
          "engineering_action.execute",
        ],
        note: body.note,
      });
      return NextResponse.json({ data });
    }

    if (op === "execute") {
      const data = await engineeringActionProposalService.execute({
        tenantId: ctx.tenantId,
        proposalId: body.proposalId,
        userId: ctx.userId,
        permissions: ["engineering_action.execute"],
        idempotencyKey: body.idempotencyKey ?? body.proposalId,
        contextFreshnessToken: body.contextFreshnessToken,
        externalWritePolicyEnabled: Boolean(body.externalWritePolicyEnabled),
      });
      if (data.approvalState === "COMPLETED") {
        await handoffCompletedProposalToMemory(data);
      }
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: { message: `Unknown op: ${op}` } }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Proposal operation failed";
    const status =
      /unauthorized|cross_tenant|payload_tamper|not_approved|safety_critical/i.test(message)
        ? 403
        : /not_found/i.test(message)
          ? 404
          : 400;
    return NextResponse.json({ error: { message } }, { status });
  }
});
