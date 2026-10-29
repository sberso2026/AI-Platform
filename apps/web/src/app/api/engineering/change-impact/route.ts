import { NextResponse } from "next/server";
import { withEos2Api } from "@/lib/commerce/engineering-api";
import {
  changeHome,
  createChangeRegister,
  disciplineChangeSummary,
  progressChange,
} from "@rtb/engineering-os/change-impact";

const DISCIPLINES = [
  "process",
  "mechanical",
  "piping",
  "structural",
  "civil",
  "geotechnical",
  "electrical",
  "instrumentation_and_control",
] as const;

export const GET = withEos2Api("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const created = createChangeRegister({
    id: "unpersisted",
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified change impact intelligence",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const { data } = await ctx.supabase
    .from("engineering_change_impact_cases")
    .select("id, project_id, case_key, status, criticality, initiating_discipline")
    .eq("tenant_id", ctx.tenantId)
    .eq("workspace_id", ctx.workspaceId)
    .limit(20);
  const summaries = Object.fromEntries(DISCIPLINES.map((discipline) => [discipline, disciplineChangeSummary(created.register, discipline)]));
  return NextResponse.json({
    data: {
      view: changeHome(created.register),
      summaries,
      rows: data ?? [],
      approvalGranted: false,
      recalculated: false,
    },
  });
});

export const POST = withEos2Api("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const created = createChangeRegister({
    id: crypto.randomUUID(),
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified change impact intelligence",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const reviewed = progressChange(created.register, {
    actorId: ctx.userId,
    actorRole: "ai",
    actingRole: "ai",
    at: new Date().toISOString(),
    workspaceId: ctx.workspaceId,
  }, "absent", "approved_for_implementation");
  return NextResponse.json({ data: { committed: reviewed.error === null, error: reviewed.error, approvalGranted: false } });
});
