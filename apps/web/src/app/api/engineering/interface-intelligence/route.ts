import { NextResponse } from "next/server";
import { withEos2Api } from "@/lib/commerce/engineering-api";
import {
  createInterfaceRegister,
  disciplineInterfaceSummary,
  interfaceHome,
  recordReceiver,
} from "@rtb/engineering-os/interface-intelligence";

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
  const created = createInterfaceRegister({
    id: "unpersisted",
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified interface intelligence",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const { data } = await ctx.supabase
    .from("engineering_interface_handoffs")
    .select("id, project_id, handoff_key, status, revision, source_discipline")
    .eq("tenant_id", ctx.tenantId)
    .eq("workspace_id", ctx.workspaceId)
    .limit(20);
  const summaries = Object.fromEntries(DISCIPLINES.map((discipline) => [discipline, disciplineInterfaceSummary(created.register, discipline)]));
  return NextResponse.json({
    data: {
      view: interfaceHome(created.register, new Date().toISOString()),
      summaries,
      rows: data ?? [],
      approvalGranted: false,
      recalculated: false,
    },
  });
});

export const POST = withEos2Api("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const created = createInterfaceRegister({
    id: crypto.randomUUID(),
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified interface intelligence",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const reviewed = recordReceiver(created.register, {
    actorId: ctx.userId,
    actorRole: "ai",
    actingRole: "ai",
    at: new Date().toISOString(),
    workspaceId: ctx.workspaceId,
  }, "absent", "mechanical", "accepted");
  return NextResponse.json({ data: { committed: reviewed.error === null, error: reviewed.error, approvalGranted: false } });
});
