import { NextResponse } from "next/server";
import type { AuthContext } from "@/lib/kernel";

export function ownerCommandScope(ctx: AuthContext):
  | { tenantId: string; workspaceId: string; userId: string }
  | NextResponse {
  if (!ctx.workspaceId) {
    return NextResponse.json(
      { error: "Workspace required", code: "workspace_not_assigned" },
      { status: 400 },
    );
  }
  return { tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, userId: ctx.userId };
}

export function ownerCommandError(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : "Owner Command request failed";
  if (message === "workspace_not_assigned") {
    return NextResponse.json({ error: "Workspace required", code: message }, { status: 400 });
  }
  if (
    message === "currency_mismatch" ||
    message === "currency_required" ||
    message === "invalid_period" ||
    message === "invalid_source_type" ||
    message === "invalid_scale" ||
    message === "monetary_value_not_integer" ||
    message === "scale_mismatch" ||
    message === "invalid_qualification" ||
    message === "invalid_stage" ||
    message === "invalid_probability_bps" ||
    message === "organisation_name_required" ||
    message === "opportunity_name_required" ||
    message === "segment_name_required" ||
    message === "objective_required" ||
    message === "opportunity_id_required" ||
    message === "draft_content_required" ||
    message === "lead_suppressed" ||
    message === "proposal_title_required" ||
    message === "proposal_number_required" ||
    message === "requirement_text_required" ||
    message === "requirement_evidence_required" ||
    message === "ai_cannot_mark_requirement_satisfied" ||
    message === "scenario_name_required" ||
    message === "invalid_discount_bps" ||
    message === "invalid_engagement_status" ||
    message === "invalid_draft_type" ||
    message === "invalid_approval_status" ||
    message === "invalid_proposal_status" ||
    message === "invalid_compliance_status" ||
    message === "invalid_target_margin_bps" ||
    message === "conversion_ambiguous" ||
    message === "customer_id_required" ||
    message === "contact_name_required" ||
    message === "invalid_customer_status" ||
    message === "external_crm_write_forbidden" ||
    message === "external_customer_communication_forbidden" ||
    message === "credit_decision_forbidden" ||
    message === "autonomous_reprice_forbidden" ||
    message === "autonomous_customer_action_forbidden" ||
    message === "autonomous_assignment_forbidden" ||
    message === "external_project_write_forbidden" ||
    message === "autonomous_completion_forbidden" ||
    message === "invalid_work_status" ||
    message === "invalid_work_type" ||
    message === "work_name_required" ||
    message === "work_id_required" ||
    message === "invalid_milestone_status" ||
    message === "invalid_cost_type" ||
    message === "invalid_progress_bps" ||
    message === "invalid_profit_dimension" ||
    message === "invalid_value_state" ||
    message === "invalid_attribution_method" ||
    message === "dimension_name_required" ||
    message === "external_send_forbidden" ||
    message === "external_submit_forbidden" ||
    message === "autonomous_approval_forbidden" ||
    message === "agent_disabled" ||
    message.startsWith("agent_authority_denied") ||
    message.startsWith("agent_action_prohibited")
  ) {
    return NextResponse.json({ error: message, code: message }, { status: 400 });
  }
  if (message.includes("not found")) {
    return NextResponse.json({ error: message, code: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ error: message, code: "owner_command_failed" }, { status: 500 });
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
