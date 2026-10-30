import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import type { Eos3ObjectType } from "@/lib/engineering/eos3-canonical-objects";
import type { Eos3RelationshipType } from "@/lib/engineering/eos3-relationships";
import {
  addPilotFeedback,
  applyChangeMassPilot,
  createWorkspaceObject,
  digitalThreadFrom,
  evaluateGate,
  findByStableId,
  getWorkspaceObject,
  impactForChange,
  listWorkspaceObjects,
  relateWorkspaceObjects,
  reviseWorkspaceObject,
  seedPilot001,
  snapshotProjectWorkspace,
  transitionLifecycle,
  updateProjectSetup,
} from "@/lib/engineering/eos3-project-workspace-service";

export const GET = withEngineeringApiParams(
  "projects",
  async ({ ctx, commerce, correlationId }, request, { projectId }) => {
    const project = await ctx.engineering.projects.get(commerce, ctx.tenantId, projectId);
    if (!project) {
      return lifecycleErrorResponse("not_found", "Project not found", 404, correlationId);
    }

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

    const snap = snapshotProjectWorkspace(projectId);
    // Seed setup identity from project record when empty
    if (!snap.setup.projectCode && project.project_code) {
      updateProjectSetup(projectId, {
        projectCode: String(project.project_code ?? ""),
        projectName: String(project.project_name ?? ""),
        client: String(project.client_name ?? ""),
        site: String(project.site_name ?? ""),
        location: String(project.location ?? ""),
        industry: String(project.industry ?? ""),
        projectType: String(project.project_type ?? ""),
      });
    }
    return NextResponse.json({ data: snapshotProjectWorkspace(projectId) });
  },
);

export const POST = withEngineeringApiParams(
  "projects",
  async ({ ctx, commerce, correlationId }, request, { projectId }) => {
    const project = await ctx.engineering.projects.get(commerce, ctx.tenantId, projectId);
    if (!project) {
      return lifecycleErrorResponse("not_found", "Project not found", 404, correlationId);
    }

    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");

    try {
      if (action === "update_setup") {
        const data = updateProjectSetup(projectId, body.setup as never);
        return NextResponse.json({ data });
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
      return NextResponse.json({ error: "unknown_action" }, { status: 422 });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "workspace_action_failed";
      const status =
        message.includes("authority") || message.includes("forbidden")
          ? 403
          : message.includes("not_found")
            ? 404
            : 422;
      return NextResponse.json({ error: message, message }, { status });
    }
  },
);
