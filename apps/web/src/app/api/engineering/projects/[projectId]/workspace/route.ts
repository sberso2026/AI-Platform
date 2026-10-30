import { NextResponse } from "next/server";
import {
  authorizeEngineeringSegment,
  withEngineeringApiParams,
  type CommerceHandlerContext,
} from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import type { Eos3ObjectType } from "@/lib/engineering/eos3-canonical-objects";
import type { Eos3RelationshipType } from "@/lib/engineering/eos3-relationships";
import type { ProjectSetupProfile } from "@/lib/engineering/eos3-project-workspace-service";
import {
  addPilotFeedback,
  applyChangeMassPilot,
  createWorkspaceObject,
  digitalThreadFrom,
  evaluateGate,
  findByStableId,
  getWorkspaceObject,
  hydrateProjectSetupFromRecord,
  impactForChange,
  listWorkspaceObjects,
  relateWorkspaceObjects,
  reviseWorkspaceObject,
  seedPilot001,
  snapshotProjectWorkspace,
  transitionLifecycle,
  updateProjectSetup,
} from "@/lib/engineering/eos3-project-workspace-service";
import {
  acceptGuidedProposal,
  bulkAcceptSafeProposals,
  captureNaturalEngineeringChange,
  generateGuidedProjectState,
  getGuidedWorkspaceView,
  measureTimeToFirstValue,
  type GuidedProposal,
} from "@/lib/engineering/eos3-guided-engineering";
import {
  EOS_FIELD_NECESSITY_AUDIT,
  unjustifiedRequiredFieldCount,
} from "@/lib/engineering/eos3-field-necessity-audit";

/**
 * PILOT-BUG-001 root cause:
 * POST /workspace was authorized as projects.write → project.create, then called
 * projects.get(commerce) which asserts project.read → Action mismatch: expected project.read.
 *
 * Fix: keep write commerce for mutations; authorize a distinct project.read commerce
 * for existence checks / revalidation. No bypass, no RLS weakening.
 */
async function requireProjectRead(
  ctx: CommerceHandlerContext["ctx"],
  correlationId: string,
  projectId: string,
) {
  const readCommerce = await authorizeEngineeringSegment(
    ctx,
    "projects",
    "GET",
    correlationId,
  );
  if (!readCommerce) {
    return {
      error: lifecycleErrorResponse(
        "forbidden",
        "Project setup could not be loaded. You are not authorized to read this project in the current context.",
        403,
        correlationId,
        { expectedAction: "project.read" },
      ),
      project: null as null,
      readCommerce: null as null,
    };
  }
  const project = await ctx.engineering.projects.get(
    readCommerce,
    ctx.tenantId,
    projectId,
  );
  if (!project) {
    return {
      error: lifecycleErrorResponse(
        "not_found",
        "Project not found",
        404,
        correlationId,
      ),
      project: null as null,
      readCommerce: null as null,
    };
  }
  return { error: null, project, readCommerce };
}

export const GET = withEngineeringApiParams(
  "projects",
  async ({ ctx, commerce, correlationId }, request, { projectId }) => {
    // GET route commerce is already project.read — use it directly.
    const project = await ctx.engineering.projects.get(commerce, ctx.tenantId, projectId);
    if (!project) {
      return lifecycleErrorResponse("not_found", "Project not found", 404, correlationId);
    }

    hydrateProjectSetupFromRecord(projectId, project as Record<string, unknown>);

    const url = new URL(request.url);
    const view = url.searchParams.get("view") ?? "snapshot";
    const objectType = url.searchParams.get("objectType") as Eos3ObjectType | null;
    const objectId = url.searchParams.get("objectId");
    const stableId = url.searchParams.get("stableId");
    const changeId = url.searchParams.get("changeId");
    const gateKey = url.searchParams.get("gateKey");

    if (view === "objects") {
      return NextResponse.json({ data: listWorkspaceObjects(projectId, objectType ?? undefined) });
    }
    if (view === "object" && objectId) {
      const obj = getWorkspaceObject(projectId, objectId);
      if (!obj) return lifecycleErrorResponse("not_found", "Object not found", 404, correlationId);
      return NextResponse.json({ data: obj });
    }
    if (view === "object" && stableId) {
      const obj = findByStableId(projectId, stableId);
      if (!obj) return lifecycleErrorResponse("not_found", "Object not found", 404, correlationId);
      return NextResponse.json({ data: obj });
    }
    if (view === "thread" && objectId) {
      return NextResponse.json({ data: digitalThreadFrom(projectId, objectId) });
    }
    if (view === "impact" && changeId) {
      return NextResponse.json({ data: impactForChange(projectId, changeId) });
    }
    if (view === "gate" && gateKey) {
      return NextResponse.json({ data: evaluateGate(projectId, gateKey) });
    }
    if (view === "guided") {
      return NextResponse.json({ data: getGuidedWorkspaceView(projectId) });
    }
    if (view === "field-audit") {
      return NextResponse.json({
        data: {
          rows: EOS_FIELD_NECESSITY_AUDIT,
          unjustifiedRequiredFieldCount: unjustifiedRequiredFieldCount(),
        },
      });
    }

    return NextResponse.json({ data: snapshotProjectWorkspace(projectId) });
  },
);

export const POST = withEngineeringApiParams(
  "projects",
  async ({ ctx, commerce, correlationId }, request, { projectId }) => {
    // Write path: route guard is projects.write → project.create (established update permission).
    // Never pass write commerce into projects.get.
    const scoped = await requireProjectRead(ctx, correlationId, projectId);
    if (scoped.error || !scoped.project) return scoped.error!;

    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");

    try {
      if (action === "update_setup") {
        const setupInput = body.setup as Partial<ProjectSetupProfile>;
        const data = updateProjectSetup(projectId, setupInput as never);

        // Persist editable fields via established project update (asserts project.create).
        const priorMeta =
          scoped.project.metadata && typeof scoped.project.metadata === "object"
            ? (scoped.project.metadata as Record<string, unknown>)
            : {};
        await ctx.engineering.projects.update(commerce, ctx.tenantId, projectId, {
          projectName: data.setup.projectName || undefined,
          clientName: data.setup.client,
          siteName: data.setup.site,
          location: data.setup.location,
          industry: data.setup.industry,
          projectType: data.setup.projectType,
          metadata: {
            ...priorMeta,
            eos_project_setup: data.setup,
          },
        });

        // Post-save revalidation uses project.read — never leak write action into read.
        const revalidated = await requireProjectRead(ctx, correlationId, projectId);
        if (revalidated.error || !revalidated.project) return revalidated.error!;
        hydrateProjectSetupFromRecord(
          projectId,
          revalidated.project as Record<string, unknown>,
        );
        return NextResponse.json({
          data: snapshotProjectWorkspace(projectId),
          message: "Project setup saved",
        });
      }
      if (action === "create_object") {
        const data = createWorkspaceObject(projectId, {
          objectType: body.objectType as Eos3ObjectType,
          stableObjectId: String(body.stableObjectId ?? ""),
          displayName: String(body.displayName ?? ""),
          payload: (body.payload as Record<string, unknown>) ?? {},
          actorId: ctx.userId,
          authority: "project_engineer",
          disciplineType: body.disciplineType ? String(body.disciplineType) : null,
        });
        return NextResponse.json({ data }, { status: 201 });
      }
      if (action === "relate") {
        const data = relateWorkspaceObjects(projectId, {
          relationshipType: body.relationshipType as Eos3RelationshipType,
          fromObjectId: String(body.fromObjectId),
          toObjectId: String(body.toObjectId),
          metadata: (body.metadata as Record<string, unknown>) ?? {},
        });
        return NextResponse.json({ data }, { status: 201 });
      }
      if (action === "revise") {
        const data = reviseWorkspaceObject(
          projectId,
          String(body.objectId),
          (body.payload as Record<string, unknown>) ?? {},
          ctx.userId,
        );
        return NextResponse.json({ data });
      }
      if (action === "evaluate_gate") {
        const data = evaluateGate(projectId, String(body.gateKey), {
          actorId: ctx.userId,
          authority: String(body.authority ?? "project_lead"),
        });
        return NextResponse.json({ data });
      }
      if (action === "transition_lifecycle") {
        const result = transitionLifecycle(projectId, String(body.toKey), {
          actorId: ctx.userId,
          authority: String(body.authority ?? ""),
          gateResult: body.gateResult as never,
          rationale: body.rationale ? String(body.rationale) : undefined,
        });
        if (!result.ok) {
          return NextResponse.json(
            { error: "invalid_state_transition", message: result.error, data: result.lifecycle },
            { status: 422 },
          );
        }
        return NextResponse.json({ data: result.lifecycle });
      }
      if (action === "seed_pilot_001") {
        const data = seedPilot001(projectId);
        return NextResponse.json({ data });
      }
      if (action === "apply_mass_change") {
        const data = applyChangeMassPilot(
          projectId,
          String(body.changeStableId ?? "CHG-001"),
          String(body.fromMass ?? "12 t"),
          String(body.toMass ?? "15 t"),
        );
        return NextResponse.json({ data });
      }
      if (action === "feedback") {
        const data = addPilotFeedback(projectId, {
          page: String(body.page ?? ""),
          objectRef: String(body.objectRef ?? ""),
          category: body.category as never,
          description: String(body.description ?? ""),
          severity: String(body.severity ?? "medium"),
          reference: String(body.reference ?? ""),
          actorId: ctx.userId,
        });
        return NextResponse.json({ data }, { status: 201 });
      }
      if (action === "thread") {
        return NextResponse.json({
          data: digitalThreadFrom(projectId, String(body.objectId)),
        });
      }
      if (action === "impact") {
        return NextResponse.json({
          data: impactForChange(projectId, String(body.changeId)),
        });
      }
      if (action === "guided_generate") {
        const objective = String(body.objective ?? "").trim();
        if (!objective) {
          return NextResponse.json(
            { error: "objective_required", message: "Tell EOS what you are trying to do." },
            { status: 422 },
          );
        }
        const result = generateGuidedProjectState(projectId, {
          objective,
          whyNeeded: body.whyNeeded ? String(body.whyNeeded) : undefined,
          ownerId: ctx.userId,
          ownerName: body.ownerName ? String(body.ownerName) : null,
          documentNames: Array.isArray(body.documentNames)
            ? (body.documentNames as string[]).map(String)
            : [],
        });
        // Persist setup metadata using write commerce (established project.create).
        const priorMeta =
          scoped.project.metadata && typeof scoped.project.metadata === "object"
            ? (scoped.project.metadata as Record<string, unknown>)
            : {};
        await ctx.engineering.projects.update(commerce, ctx.tenantId, projectId, {
          projectName: result.setup.projectName || undefined,
          clientName: result.setup.client || undefined,
          siteName: result.setup.site || undefined,
          location: result.setup.location || undefined,
          industry: result.setup.industry || undefined,
          projectType: result.setup.projectType || undefined,
          metadata: {
            ...priorMeta,
            eos_project_setup: result.setup,
            eos_guided_generation: {
              generatedAt: result.finishedAt,
              durationMs: result.durationMs,
              timeToFirstValue: measureTimeToFirstValue(result),
              initialRequiredInputCount: result.initialRequiredInputCount,
              manualInputReductionPercent: result.manualInputReductionPercent,
            },
          },
        });
        return NextResponse.json({
          data: {
            ...result,
            timeToFirstValue: measureTimeToFirstValue(result),
            guidedView: getGuidedWorkspaceView(projectId),
          },
        });
      }
      if (action === "guided_accept_proposal") {
        const data = acceptGuidedProposal(
          projectId,
          String(body.stableObjectId),
          body.decision === "REJECTED" ? "REJECTED" : "CONFIRMED",
          ctx.userId,
        );
        return NextResponse.json({ data, guidedView: getGuidedWorkspaceView(projectId) });
      }
      if (action === "guided_bulk_accept_safe") {
        const proposals = (body.proposals as GuidedProposal[] | undefined) ?? [];
        const data = bulkAcceptSafeProposals(projectId, proposals, ctx.userId);
        return NextResponse.json({ data, guidedView: getGuidedWorkspaceView(projectId) });
      }
      if (action === "guided_natural_change") {
        const data = captureNaturalEngineeringChange(
          projectId,
          String(body.utterance ?? ""),
          ctx.userId,
        );
        return NextResponse.json({ data, guidedView: getGuidedWorkspaceView(projectId) });
      }
      if (action === "contextual_assumption") {
        const statement = String(body.statement ?? "");
        const data = createWorkspaceObject(projectId, {
          objectType: "Assumption",
          stableObjectId: String(body.stableObjectId ?? `ASM-${Date.now()}`),
          displayName: String(body.title ?? "Contextual assumption"),
          payload: {
            statement,
            status: "PROPOSED",
            approvalState: "NOT_APPROVED",
            verificationRequirement: body.verificationRequirement ?? "pending confirmation",
            generated: true,
            contextual: true,
          },
          actorId: ctx.userId,
          authority: "project_engineer",
        });
        return NextResponse.json({ data }, { status: 201 });
      }
      if (action === "contextual_review") {
        const data = createWorkspaceObject(projectId, {
          objectType: "Review",
          stableObjectId: String(body.stableObjectId ?? `REV-${Date.now()}`),
          displayName: String(body.title ?? "Contextual engineering review"),
          payload: {
            objectUnderReview: body.objectUnderReview ?? null,
            reviewType: body.reviewType ?? "engineering",
            status: "PROPOSED",
            aiMayApprove: false,
            approvalState: "NOT_APPROVED",
          },
          actorId: ctx.userId,
          authority: "project_engineer",
        });
        if (body.relatedObjectId) {
          try {
            relateWorkspaceObjects(projectId, {
              relationshipType: "REVIEW_OF_OBJECT",
              fromObjectId: data.id,
              toObjectId: String(body.relatedObjectId),
              metadata: { contextual: true },
            });
          } catch {
            /* ignore */
          }
        }
        return NextResponse.json({ data }, { status: 201 });
      }
      return NextResponse.json({ error: "unknown_action" }, { status: 422 });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "workspace_action_failed";
      const status =
        message.includes("Action mismatch") ||
        message.includes("authority") ||
        message.includes("forbidden") ||
        message.includes("Commerce")
          ? 403
          : message.includes("not_found")
            ? 404
            : 422;
      console.error("[eos-pilot-ui-hotfix-1] workspace POST failed", {
        action,
        projectId,
        message,
        correlationId,
      });
      const userMessage =
        action === "update_setup"
          ? "Project setup could not be saved. Your changes have been preserved."
          : message;
      return NextResponse.json(
        {
          error: userMessage,
          message: userMessage,
          diagnostic: message,
        },
        { status },
      );
    }
  },
);
