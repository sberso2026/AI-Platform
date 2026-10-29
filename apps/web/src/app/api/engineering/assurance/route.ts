import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { createTrustedReviewRuntime } from "@/lib/review/runtime";

function linkErrorStatus(message: string): number {
  if (message === "review_package_not_found") return 404;
  if (message.includes("denied") || message === "unknown_assurance_rule") return 403;
  if (message === "documents_required" || message === "disposition_rationale_required") return 400;
  return 400;
}

export const GET = withEngineeringApi("assurance", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "list";
  if (action === "catalog") {
    return NextResponse.json({ data: ctx.engineering.assurance.catalog() });
  }
  if (action === "summary") {
    const data = await ctx.engineering.assurance.summary(commerce, ctx.tenantId);
    return NextResponse.json({ data });
  }
  if (action === "effective-rules") {
    const data = await ctx.engineering.assurance.effectiveRules(commerce, ctx.tenantId);
    return NextResponse.json({ data });
  }
  if (action === "evaluation-status") {
    const data = await ctx.engineering.assurance.latestEvaluation(commerce, ctx.tenantId);
    return NextResponse.json({ data });
  }
  if (action === "cited-conditions") {
    const reviewPackageId = url.searchParams.get("reviewPackageId");
    if (!reviewPackageId) return NextResponse.json({ error: "review_package_id_required" }, { status: 400 });
    const data = await ctx.engineering.assurance.citedConditions(commerce, ctx.tenantId, reviewPackageId);
    return NextResponse.json({ data });
  }
  if (action === "linked-reviews") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.assurance.linkedReviews(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  const id = url.searchParams.get("id");
  if (id) {
    const data = await ctx.engineering.assurance.get(commerce, ctx.tenantId, id);
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const linked = await ctx.engineering.assurance.linkedReviews(commerce, ctx.tenantId, id);
    return NextResponse.json({ data: { ...data, linkedReviews: linked } });
  }
  const data = await ctx.engineering.assurance.list(commerce, ctx.tenantId, {
    status: url.searchParams.get("status") ?? undefined,
    conditionType: url.searchParams.get("conditionType") ?? undefined,
    discipline: url.searchParams.get("discipline") ?? undefined,
    materiality: url.searchParams.get("materiality") ?? undefined,
    rootObjectType: url.searchParams.get("objectType") ?? undefined,
    rootObjectId: url.searchParams.get("objectId") ?? undefined,
    ruleId: url.searchParams.get("ruleId") ?? undefined,
  });
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("assurance", async ({ ctx, commerce }, request) => {
  const body = (await request.json()) as Record<string, unknown>;
  const action = String(body.action ?? "");
  try {
    if (action === "evaluate") {
      const data = await ctx.engineering.assurance.evaluateWorkspace(commerce, ctx.tenantId, {
        ruleId: typeof body.ruleId === "string" ? body.ruleId : undefined,
        objectType: typeof body.objectType === "string" ? body.objectType : undefined,
        objectId: typeof body.objectId === "string" ? body.objectId : undefined,
        triggeredBy: ctx.userId,
      });
      return NextResponse.json({ data });
    }
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    if (action === "acknowledge") {
      const data = await ctx.engineering.assurance.acknowledge(commerce, ctx.tenantId, id, ctx.userId);
      return NextResponse.json({ data });
    }
    if (action === "assign" && typeof body.ownerId === "string") {
      const data = await ctx.engineering.assurance.assign(commerce, ctx.tenantId, id, body.ownerId, ctx.userId);
      return NextResponse.json({ data });
    }
    if (action === "disposition" && typeof body.disposition === "string" && typeof body.rationale === "string") {
      const data = await ctx.engineering.assurance.disposition(commerce, ctx.tenantId, id, {
        disposition: body.disposition as
          | "ACCEPT"
          | "NOT_APPLICABLE"
          | "DEFER"
          | "CREATE_REVIEW"
          | "CREATE_ISSUE"
          | "RESOLVED_BY_ENGINEERING_CHANGE",
        rationale: body.rationale,
        actorId: ctx.userId,
        reviewPackageId: typeof body.reviewPackageId === "string" ? body.reviewPackageId : null,
        issueId: typeof body.issueId === "string" ? body.issueId : null,
      });
      return NextResponse.json({ data });
    }
    if (action === "create-review") {
      if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
      const projectId = typeof body.projectId === "string" ? body.projectId : "";
      const documentIds = Array.isArray(body.documentIds) ? body.documentIds.map(String).filter(Boolean) : [];
      if (!projectId || !documentIds.length) {
        return NextResponse.json({ error: "documents_required" }, { status: 400 });
      }
      const actor = { userId: ctx.userId, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId };
      const review = await createTrustedReviewRuntime(ctx, actor);
      const created = await review.createPackage(actor, {
        projectId,
        name: typeof body.name === "string" && body.name.trim() ? body.name : `Assurance review ${id}`,
        documentIds,
      });
      const condition = await ctx.engineering.assurance.linkReview(
        commerce,
        ctx.tenantId,
        id,
        created.pkg.id,
        ctx.userId,
      );
      return NextResponse.json({
        data: {
          condition,
          reviewPackage: created.pkg,
          automaticFinding: false,
          automaticApproval: false,
        },
      });
    }
    if (action === "link-review" && typeof body.reviewPackageId === "string") {
      const data = await ctx.engineering.assurance.linkReview(
        commerce,
        ctx.tenantId,
        id,
        body.reviewPackageId,
        ctx.userId,
      );
      return NextResponse.json({ data });
    }
    if (action === "link-issue" && typeof body.issueId === "string") {
      const data = await ctx.engineering.assurance.linkIssue(commerce, ctx.tenantId, id, body.issueId, ctx.userId);
      return NextResponse.json({ data });
    }
    return NextResponse.json({ error: "unsupported_action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "assurance_action_failed";
    return NextResponse.json({ error: message }, { status: linkErrorStatus(message) });
  }
});
