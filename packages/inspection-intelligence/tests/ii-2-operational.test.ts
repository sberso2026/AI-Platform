import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  INSPECTION_INTELLIGENCE_II_2_IMPLEMENTED,
  INSPECTION_INTELLIGENCE_II_3_READY,
  II_COMMAND_CENTRE_IMPLEMENTED,
  II_2_IMPLEMENTED,
  MemoryInspectionDb,
  PLAN_UPDATE_STATUSES,
  SCHEMA_CHANGED,
  createHostedInspectionRepository,
  memoryActor,
  nextInspectionSessionStates,
  type HostedInspectionContext,
} from "../src";

const tenantA = randomUUID();
const workspaceA = randomUUID();
const projectA = randomUUID();
const actorA = randomUUID();

function ctx(projectId?: string): HostedInspectionContext {
  return { tenantId: tenantA, workspaceId: workspaceA, actorUserId: actorA, projectId };
}

describe("II-2 operational hosted listing", () => {
  it("marks planning/execution implemented without Command Centre or schema change", () => {
    expect(INSPECTION_INTELLIGENCE_II_2_IMPLEMENTED).toBe(true);
    expect(II_2_IMPLEMENTED).toBe(true);
    expect(INSPECTION_INTELLIGENCE_II_3_READY).toBe(true);
    expect(II_COMMAND_CENTRE_IMPLEMENTED).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(PLAN_UPDATE_STATUSES.has("planned")).toBe(true);
    expect(nextInspectionSessionStates("started")).toEqual(["paused", "completed", "cancelled"]);
  });

  it("lists plans and sessions from hosted inspection_* rows and reuses templates", async () => {
    const db = new MemoryInspectionDb();
    db.seed("engineering_projects", [{ id: projectA, tenant_id: tenantA, workspace_id: workspaceA }]);
    const repo = createHostedInspectionRepository(ctx(projectA), db.clientFor(memoryActor(ctx(projectA))));
    const created = await repo.createPlan({
      title: "Visual A",
      targets: [{ id: randomUUID(), kind: "project", canonicalId: projectA, snapshot: { capturedAt: new Date().toISOString(), label: "A" } }],
    });
    const reused = await repo.createPlan({
      title: "Visual A follow-up",
      templateId: String(created.template.id),
      targets: [{ id: randomUUID(), kind: "project", canonicalId: projectA, snapshot: { capturedAt: new Date().toISOString(), label: "A" } }],
    });
    expect(reused.plan.template_id).toBe(created.template.id);
    const listed = await repo.listPlans();
    expect(listed).toHaveLength(2);
    const overview = await repo.getOverview();
    expect(overview.planned).toHaveLength(2);
    const session = await repo.startSession({ planId: String(created.plan.id) });
    await repo.recordObservation({ sessionId: String(session.id), checklistItemType: "visual", body: "note" });
    const workspace = await repo.getSessionWorkspace(String(session.id));
    expect(workspace.observations).toHaveLength(1);
    expect(workspace.session.status).toBe("started");
    const inProgress = await repo.getOverview();
    expect(inProgress.inProgress).toHaveLength(1);
  });
});
