import { NextResponse } from "next/server";
import { withEos2Api } from "@/lib/commerce/engineering-api";
import { approveFreeze, createFreezeRegister } from "@rtb/engineering-os/design-freeze";
import { integratedSummary, runIntegratedDemonstration } from "@rtb/engineering-os/integrated-project";

export const GET = withEos2Api("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  return NextResponse.json({ data: integratedSummary(runIntegratedDemonstration()) });
});

export const POST = withEos2Api("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const created = createFreezeRegister({
    id: crypto.randomUUID(),
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "EOS-IPF-001",
    projectTitle: "EOS Integrated Process Facility Demonstration",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const reviewed = approveFreeze(created.register, {
    actorId: ctx.userId,
    actorRole: "ai",
    actingRole: "ai",
    at: new Date().toISOString(),
    workspaceId: ctx.workspaceId,
  }, "absent");
  return NextResponse.json({ data: { committed: reviewed.error === null, error: reviewed.error, approvalGranted: false } });
});
