import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import {
  addChange,
  addDependency,
  assessMateriality,
  createChangeRegister,
  discoverImpacts,
  type ChangeRegister,
} from "@rtb/engineering-os/change-impact";
import {
  addDeliverable,
  addFreeze,
  approveDeliverable,
  approveFreeze,
  createFreezeRegister,
  markUpstreamRevision,
  releaseDeliverable,
  setDisposition,
  type FreezeRegister,
} from "@rtb/engineering-os/design-freeze";
import {
  addInterface,
  createInterfaceRegister,
  progressInterface,
  recordReceiver,
  reviseInterface,
  type InterfaceRegister,
} from "@rtb/engineering-os/interface-intelligence";

const PROJECT_ID = "EOS-QA-001";
const BLOCKED = new Set(["ai", "owner", "admin", "pilot-engineer", "pilot_engineer"]);

function denied(role: string | null | undefined): boolean {
  return BLOCKED.has(String(role ?? ""));
}

function chain<R>(
  start: { register: R; error: string | null },
  steps: Array<(register: R) => { register: R; error: string | null }>,
): { register: R; error: string | null } {
  let current = start;
  for (const step of steps) {
    if (current.error) return current;
    current = step(current.register);
  }
  return current;
}

export const GET = withEngineeringApi("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const [lifecycles, handoffs, changes, impacts, deliverables, freezes, audits] = await Promise.all([
    ctx.supabase.from("engineering_delivery_lifecycles").select("project_id, stage, state").eq("workspace_id", ctx.workspaceId),
    ctx.supabase.from("engineering_interface_handoffs").select("id, handoff_key, revision, status, value_text, unit, source_discipline, current_revision").eq("workspace_id", ctx.workspaceId).eq("project_id", PROJECT_ID),
    ctx.supabase.from("engineering_change_impact_cases").select("id, case_key, previous_value, new_value, unit, status").eq("workspace_id", ctx.workspaceId).eq("project_id", PROJECT_ID),
    ctx.supabase.from("engineering_change_candidate_impacts").select("object_key, discipline, materiality, required_action, action_confirmed, recalculated, freshness").eq("workspace_id", ctx.workspaceId),
    ctx.supabase.from("engineering_governed_deliverables").select("deliverable_key, revision, freshness, release_status, approval_status").eq("workspace_id", ctx.workspaceId).eq("project_id", PROJECT_ID),
    ctx.supabase.from("engineering_design_freezes").select("freeze_key, fingerprint, frozen").eq("workspace_id", ctx.workspaceId).eq("project_id", PROJECT_ID),
    ctx.supabase.from("engineering_delivery_audit").select("action, actor_id, detail, created_at").eq("workspace_id", ctx.workspaceId).order("created_at", { ascending: false }).limit(20),
  ]);
  const projectIds = [...new Set((lifecycles.data ?? []).map((row) => String(row.project_id)))];
  const runtimeChanges = (changes.data ?? []).filter((row) => row.case_key === "chg-p101-runtime");
  const stale = (deliverables.data ?? []).filter((row) => row.freshness === "potentially_stale").map((row) => row.deliverable_key);
  const runtime = runtimeChanges[0] ?? null;
  return NextResponse.json({
    data: {
      projectIds,
      qualificationProjectVisible: projectIds.includes(PROJECT_ID),
      label: "SYNTHETIC_QUALIFICATION_PROJECT",
      handoffs: handoffs.data ?? [],
      changes: changes.data ?? [],
      impacts: impacts.data ?? [],
      deliverables: deliverables.data ?? [],
      freezes: freezes.data ?? [],
      audits: audits.data ?? [],
      approvalGranted: false,
      answers: runtime
        ? [
            { question: "What changed for P-101?", label: "DETERMINISTIC_RECORD", answer: `Operating mass changed from ${runtime.previous_value} ${runtime.unit} to ${runtime.new_value} ${runtime.unit}. Motor power changed from 75 kW to 110 kW.`, approvalGranted: false },
            { question: "Which disciplines are affected?", label: "DETERMINISTIC_DEPENDENCY", answer: "Structural and electrical candidate impacts were discovered from explicit edges. Candidate impact is not material until a human assesses it.", approvalGranted: false },
            { question: "Which deliverables are potentially stale?", label: "DETERMINISTIC_RECORD", answer: stale.length ? stale.join(", ") : "None recorded.", approvalGranted: false },
            { question: "Why is this package not ready for release?", label: "HUMAN_DECISION_REQUIRED", answer: "A deliverable is potentially stale, receiver acceptance of the new revision is a human action, and release remains blocked. AI did not approve or release it.", approvalGranted: false },
          ]
        : [],
    },
  });
});

export const POST = withEngineeringApi("lifecycle", async ({ ctx }, request) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const body = (await request.json().catch(() => null)) as { action?: string; actingRole?: string; discipline?: string } | null;
  const action = body?.action ?? "";
  const actingRole = body?.actingRole ?? "";
  if (denied(ctx.roleSlug) || denied(actingRole)) {
    return NextResponse.json({ data: { committed: false, approvalGranted: false, error: "authority_denied" } }, { status: 403 });
  }
  const at = new Date().toISOString();
  const actor = (role: string) => ({
    actorId: ctx.userId,
    actorRole: ctx.roleSlug ?? "engineer",
    actingRole: role,
    at,
    workspaceId: ctx.workspaceId,
  }) as never;

  if (action === "vendor-revision") {
    if (actingRole !== "mechanical") {
      return NextResponse.json({ data: { committed: false, approvalGranted: false, error: "source_owner_required" } }, { status: 403 });
    }
    const existing = await ctx.supabase.from("engineering_interface_handoffs").select("id").eq("workspace_id", ctx.workspaceId).eq("handoff_key", "p101-mass-runtime-r2").maybeSingle();
    if (existing.data?.id) {
      return NextResponse.json({ data: { committed: true, alreadyExecuted: true, approvalGranted: false } });
    }
    const created = createInterfaceRegister({
      id: "qa-runtime", tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, projectId: PROJECT_ID,
      projectTitle: "SYNTHETIC_QUALIFICATION_PROJECT", actorId: ctx.userId, at,
    });
    const base = {
      revision: 1, stage: "detailed_engineering" as const, maturity: "controlled" as const, sourceDiscipline: "mechanical" as const,
      sourceObjectType: "equipment", sourceObjectId: "P-101", sourceRevision: "1", receiverObjectType: null, receiverObjectId: null,
      canonicalParameterId: null, coordinateSystem: null, axisConvention: null, datum: null, transformationId: null,
      criticality: "MEDIUM" as const, dueDate: null, packageId: null, assumption: null, provenance: "SYNTHETIC_VALIDATION_FIXTURE" as const,
    };
    const drafted = chain<InterfaceRegister>(created, [
      (register) => addInterface(register, actor("mechanical"), { ...base, id: "p101-mass-runtime", category: "EQUIPMENT_DATA", parameter: "operating_mass", value: "12000", unit: "kg", receivers: ["structural"] }),
      (register) => addInterface(register, actor("mechanical"), { ...base, id: "p101-power-runtime", category: "MECHANICAL_DUTY", parameter: "motor_power", value: "75", unit: "kW", receivers: ["electrical"] }),
      (register) => progressInterface(register, actor("mechanical"), "p101-mass-runtime", "ready_for_issue"),
      (register) => progressInterface(register, actor("mechanical"), "p101-mass-runtime", "issued"),
      (register) => progressInterface(register, actor("mechanical"), "p101-power-runtime", "ready_for_issue"),
      (register) => progressInterface(register, actor("mechanical"), "p101-power-runtime", "issued"),
      (register) => recordReceiver(register, actor("structural"), "p101-mass-runtime", "structural", "received"),
      (register) => recordReceiver(register, actor("structural"), "p101-mass-runtime", "structural", "under_review"),
      (register) => recordReceiver(register, actor("structural"), "p101-mass-runtime", "structural", "accepted"),
      (register) => recordReceiver(register, actor("electrical"), "p101-power-runtime", "electrical", "received"),
      (register) => recordReceiver(register, actor("electrical"), "p101-power-runtime", "electrical", "under_review"),
      (register) => recordReceiver(register, actor("electrical"), "p101-power-runtime", "electrical", "accepted"),
      (register) => reviseInterface(register, actor("mechanical"), "p101-mass-runtime", "14000", "kg"),
      (register) => reviseInterface(register, actor("mechanical"), "p101-power-runtime", "110", "kW"),
    ]);
    if (drafted.error || !drafted.register) {
      return NextResponse.json({ data: { committed: false, approvalGranted: false, error: drafted.error } }, { status: 422 });
    }
    const beforeFreeze = await ctx.supabase.from("engineering_design_freezes").select("fingerprint").eq("workspace_id", ctx.workspaceId).eq("project_id", PROJECT_ID);
    const beforeDeliverable = await ctx.supabase.from("engineering_governed_deliverables").select("revision").eq("workspace_id", ctx.workspaceId).eq("deliverable_key", "str-dwg").maybeSingle();
    const equipment = await ctx.supabase.from("engineering_mechanical_equipment").select("id, delivery_id").eq("workspace_id", ctx.workspaceId).eq("equipment_tag", "P-101").maybeSingle();
    const persisted = [];
    for (const item of drafted.register.interfaces) {
      const inserted = await ctx.supabase.from("engineering_interface_handoffs").insert({
        tenant_id: ctx.tenantId,
        workspace_id: ctx.workspaceId,
        project_id: PROJECT_ID,
        handoff_key: item.id,
        source_discipline: item.sourceDiscipline,
        parameter_name: item.parameter,
        revision: item.revision,
        source_object_type: item.sourceObjectType,
        source_object_id: item.sourceObjectId,
        source_revision: item.sourceRevision,
        value_text: item.value,
        unit: item.unit,
        status: item.status,
        current_revision: item.current,
        provenance: "SYNTHETIC_QUALIFICATION_PROJECT",
        recalculated: false,
      }).select("id").single();
      if (inserted.error || !inserted.data) {
        return NextResponse.json({ data: { committed: false, approvalGranted: false, error: inserted.error?.message ?? "handoff_insert_failed" } }, { status: 422 });
      }
      persisted.push({ id: inserted.data.id, item });
      for (const receiver of item.receivers) {
        const receiverInsert = await ctx.supabase.from("engineering_interface_receivers").insert({
          tenant_id: ctx.tenantId,
          workspace_id: ctx.workspaceId,
          handoff_id: inserted.data.id,
          receiving_discipline: receiver.discipline,
          acceptance_status: receiver.status,
          acting_role: receiver.status === "pending" ? null : receiver.discipline,
        });
        if (receiverInsert.error) {
          return NextResponse.json({ data: { committed: false, approvalGranted: false, error: receiverInsert.error.message } }, { status: 422 });
        }
      }
    }
    const changeSeed = createChangeRegister({
      id: "qa-change", tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, projectId: PROJECT_ID,
      projectTitle: "SYNTHETIC_QUALIFICATION_PROJECT", actorId: ctx.userId, at,
    });
    const changed = chain<ChangeRegister>(changeSeed, [
      (register) => addChange(register, actor("mechanical"), {
        id: "chg-p101-runtime", title: "P-101 vendor revision", description: "Synthetic qualification vendor revision",
        origin: "vendor", initiatingDiscipline: "mechanical", stage: "detailed_engineering", category: "vendor", driver: "vendor",
        sourceObjectType: "equipment", sourceObjectId: "P-101", previousRevision: "1", newRevision: "2", changedField: "operating_mass",
        previousValue: "12000", newValue: "14000", unit: "kg", reason: "Controlled vendor revision", owner: "mechanical",
        criticality: "MEDIUM", baselineId: null, provenance: "SYNTHETIC_QUALIFICATION_PROJECT", supersedesId: null,
        history: [{ revision: "1", value: "12000", unit: "kg" }, { revision: "2", value: "14000", unit: "kg" }],
      }),
      (register) => addDependency(register, actor("mechanical"), { id: "P-101", objectType: "equipment", discipline: "mechanical", categories: ["EQUIPMENT"], previousResult: "12000 kg" }, null),
      (register) => addDependency(register, actor("mechanical"), { id: "str-calc", objectType: "calculation_reference", discipline: "structural", categories: ["LOAD"], previousResult: null }, "P-101"),
      (register) => addDependency(register, actor("mechanical"), { id: "elec-load", objectType: "load", discipline: "electrical", categories: ["DUTY"], previousResult: "75 kW" }, "P-101"),
      (register) => discoverImpacts(register, actor("mechanical"), "chg-p101-runtime", 4),
    ]);
    if (changed.error || !changed.register) {
      return NextResponse.json({ data: { committed: false, approvalGranted: false, error: changed.error } }, { status: 422 });
    }
    const changeInsert = await ctx.supabase.from("engineering_change_impact_cases").insert({
      tenant_id: ctx.tenantId, workspace_id: ctx.workspaceId, project_id: PROJECT_ID, case_key: "chg-p101-runtime",
      title: "P-101 vendor revision", initiating_discipline: "mechanical", changed_field: "operating_mass",
      previous_value: "12000", new_value: "14000", unit: "kg", status: "draft", provenance: "SYNTHETIC_QUALIFICATION_PROJECT",
      recalculated: false, deliverable_revised: false, baseline_rewritten: false,
    }).select("id").single();
    if (changeInsert.error || !changeInsert.data) {
      return NextResponse.json({ data: { committed: false, approvalGranted: false, error: changeInsert.error?.message ?? "change_insert_failed" } }, { status: 422 });
    }
    for (const impact of changed.register.impacts) {
      const impactInsert = await ctx.supabase.from("engineering_change_candidate_impacts").insert({
        tenant_id: ctx.tenantId, workspace_id: ctx.workspaceId, case_id: changeInsert.data.id,
        object_key: impact.objectId, object_type: impact.objectType, discipline: impact.discipline,
        depth: impact.depth, direct_impact: impact.direct, path_text: impact.path.join(" -> "),
        materiality: impact.materiality, required_action: impact.requiredAction, action_confirmed: false,
        freshness: impact.freshness, recalculated: false,
      });
      if (impactInsert.error) {
        return NextResponse.json({ data: { committed: false, approvalGranted: false, error: impactInsert.error.message } }, { status: 422 });
      }
    }
    const freezeSeed = createFreezeRegister({
      id: "qa-freeze", tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, projectId: PROJECT_ID,
      projectTitle: "SYNTHETIC_QUALIFICATION_PROJECT", actorId: ctx.userId, at,
    });
    const stale = chain<FreezeRegister>(freezeSeed, [
      (register) => addDeliverable(register, actor("structural"), {
        id: "str-dwg", discipline: "structural", deliverableType: "drawing", number: "STR-DWG", title: "Structural drawing",
        revision: "1", stage: "detailed_engineering", issuePurpose: "CONSTRUCTION", engineeringStatus: "in_progress",
        reviewStatus: "not_started", approvalStatus: "pending", releaseStatus: "not_released", current: true,
        dependencies: [{ objectId: "p101-mass-runtime", revision: "1", status: "accepted", source: "interface", discipline: "mechanical" }],
        plannedDate: null,
      }),
      (register) => markUpstreamRevision(register, actor("mechanical"), "p101-mass-runtime", "2"),
    ]);
    const staleDeliverable = stale.register?.deliverables.find((item) => item.id === "str-dwg");
    const deliverableUpdate = await ctx.supabase.from("engineering_governed_deliverables").update({ freshness: "potentially_stale" }).eq("workspace_id", ctx.workspaceId).eq("deliverable_key", "str-dwg").eq("revision", beforeDeliverable.data?.revision ?? "1").select("revision, freshness");
    if (equipment.data?.id && equipment.data.delivery_id) {
      await ctx.supabase.from("engineering_mechanical_vendor_data").insert({
        tenant_id: ctx.tenantId, workspace_id: ctx.workspaceId, delivery_id: equipment.data.delivery_id,
        equipment_id: equipment.data.id, vendor_revision: 3, review_status: "under_review", package_approved: false,
      });
    }
    const afterFreeze = await ctx.supabase.from("engineering_design_freezes").select("fingerprint").eq("workspace_id", ctx.workspaceId).eq("project_id", PROJECT_ID);
    await ctx.supabase.from("engineering_delivery_audit").insert({
      tenant_id: ctx.tenantId, workspace_id: ctx.workspaceId, action: "application_vendor_revision", actor_id: ctx.userId,
      detail: {
        actingRole: "mechanical", approvalGranted: false, recalculated: false, projectId: PROJECT_ID,
        sourceRevision: "p101-mass-runtime", successor: "p101-mass-runtime-r2",
        receiverReset: true, impacts: changed.register.impacts.map((item) => item.discipline),
        deliverableRevisionUnchanged: deliverableUpdate.data?.[0]?.revision ?? null,
        deliverableFreshness: staleDeliverable?.freshness ?? null,
        baselineUnchanged: JSON.stringify(beforeFreeze.data ?? []) === JSON.stringify(afterFreeze.data ?? []),
      },
    });
    return NextResponse.json({
      data: {
        committed: true, approvalGranted: false, recalculated: false,
        successorReceiversPending: drafted.register.interfaces.filter((item) => item.current).every((item) => item.receivers.every((receiver) => receiver.status === "pending")),
        historicalAccepted: drafted.register.interfaces.filter((item) => !item.current).every((item) => item.receivers.every((receiver) => receiver.status === "accepted")),
        impactsUnassessed: changed.register.impacts.every((item) => item.materiality === "UNASSESSED"),
        deliverableRevision: deliverableUpdate.data?.[0]?.revision ?? null,
        deliverableFreshness: deliverableUpdate.data?.[0]?.freshness ?? null,
        baselineUnchanged: JSON.stringify(beforeFreeze.data ?? []) === JSON.stringify(afterFreeze.data ?? []),
        persistedHandoffs: persisted.length,
      },
    });
  }

  if (action === "receiver-accept") {
    const discipline = body?.discipline;
    if (actingRole !== discipline) {
      return NextResponse.json({ data: { committed: false, approvalGranted: false, error: "receiver_authority_required" } }, { status: 403 });
    }
    const key = discipline === "structural" ? "p101-mass-runtime-r2" : discipline === "electrical" ? "p101-power-runtime-r2" : "";
    if (!key) return NextResponse.json({ data: { committed: false, error: "receiver_not_found" } }, { status: 422 });
    const handoff = await ctx.supabase.from("engineering_interface_handoffs").select("id").eq("workspace_id", ctx.workspaceId).eq("handoff_key", key).maybeSingle();
    if (!handoff.data?.id) return NextResponse.json({ data: { committed: false, error: "handoff_not_found" } }, { status: 422 });
    const updated = await ctx.supabase.from("engineering_interface_receivers").update({ acceptance_status: "accepted", acting_role: actingRole }).eq("workspace_id", ctx.workspaceId).eq("handoff_id", handoff.data.id).eq("receiving_discipline", discipline).eq("acceptance_status", "pending").select("acceptance_status");
    await ctx.supabase.from("engineering_delivery_audit").insert({
      tenant_id: ctx.tenantId, workspace_id: ctx.workspaceId, action: "application_receiver_accepted", actor_id: ctx.userId,
      detail: { actingRole, discipline, approvalGranted: false, handoff: key, updated: updated.data?.length ?? 0 },
    });
    return NextResponse.json({ data: { committed: (updated.data?.length ?? 0) > 0, approvalGranted: false, acceptance: updated.data?.[0]?.acceptance_status ?? null } });
  }

  if (action === "materiality") {
    const discipline = body?.discipline;
    if (actingRole !== discipline) {
      return NextResponse.json({ data: { committed: false, approvalGranted: false, error: "materiality_authority_required" } }, { status: 403 });
    }
    const change = await ctx.supabase.from("engineering_change_impact_cases").select("id").eq("workspace_id", ctx.workspaceId).eq("case_key", "chg-p101-runtime").maybeSingle();
    if (!change.data?.id) return NextResponse.json({ data: { committed: false, error: "change_not_found" } }, { status: 422 });
    const seed = createChangeRegister({
      id: "qa-materiality", tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, projectId: PROJECT_ID,
      projectTitle: "SYNTHETIC_QUALIFICATION_PROJECT", actorId: ctx.userId, at,
    });
    const assessed = chain<ChangeRegister>(seed, [
      (register) => addChange(register, actor(discipline!), {
        id: "chg-p101-runtime", title: "P-101 vendor revision", description: "Synthetic qualification vendor revision",
        origin: "vendor", initiatingDiscipline: discipline as "structural", stage: "detailed_engineering", category: "vendor", driver: "vendor",
        sourceObjectType: "equipment", sourceObjectId: "P-101", previousRevision: "1", newRevision: "2", changedField: "operating_mass",
        previousValue: "12000", newValue: "14000", unit: "kg", reason: "Controlled vendor revision", owner: discipline!,
        criticality: "MEDIUM", baselineId: null, provenance: "SYNTHETIC_QUALIFICATION_PROJECT", supersedesId: null,
        history: [{ revision: "1", value: "12000", unit: "kg" }, { revision: "2", value: "14000", unit: "kg" }],
      }),
      (register) => addDependency(register, actor(discipline!), { id: "P-101", objectType: "equipment", discipline: discipline as "structural", categories: ["EQUIPMENT"], previousResult: null }, null),
      (register) => addDependency(register, actor(discipline!), { id: discipline === "structural" ? "str-calc" : "elec-load", objectType: "calculation_reference", discipline: discipline as "structural", categories: ["LOAD"], previousResult: null }, "P-101"),
      (register) => discoverImpacts(register, actor(discipline!), "chg-p101-runtime", 2),
    ]);
    const impact = assessed.register?.impacts.find((item) => item.discipline === discipline);
    if (!impact || !assessed.register) return NextResponse.json({ data: { committed: false, error: assessed.error ?? "impact_not_found" } }, { status: 422 });
    const decision = assessMateriality(assessed.register, actor(discipline!), impact.id, "MATERIAL_IMPACT", { action: "RECALCULATE", rationale: "Human materiality assessment. No calculation was run." });
    if (decision.error || !decision.register) return NextResponse.json({ data: { committed: false, approvalGranted: false, error: decision.error } }, { status: 403 });
    const decided = decision.register.impacts.find((item) => item.id === impact.id);
    const updated = await ctx.supabase.from("engineering_change_candidate_impacts").update({
      materiality: decided?.materiality, required_action: "RECALCULATE", action_confirmed: true, recalculated: false,
    }).eq("workspace_id", ctx.workspaceId).eq("case_id", change.data.id).eq("discipline", discipline).select("materiality, required_action, recalculated");
    await ctx.supabase.from("engineering_delivery_audit").insert({
      tenant_id: ctx.tenantId, workspace_id: ctx.workspaceId, action: "application_materiality_assessed", actor_id: ctx.userId,
      detail: { actingRole, discipline, approvalGranted: false, recalculated: false, materiality: decided?.materiality, requiredAction: "RECALCULATE" },
    });
    return NextResponse.json({ data: { committed: (updated.data?.length ?? 0) > 0, approvalGranted: false, materiality: updated.data?.[0] ?? null } });
  }

  if (action === "disposition") {
    if (actingRole !== "structural") {
      return NextResponse.json({ data: { committed: false, approvalGranted: false, error: "discipline_authority_required" } }, { status: 403 });
    }
    const seed = createFreezeRegister({
      id: "qa-disposition", tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, projectId: PROJECT_ID,
      projectTitle: "SYNTHETIC_QUALIFICATION_PROJECT", actorId: ctx.userId, at,
    });
    const drafted = addDeliverable(seed.register, actor("structural"), {
      id: "str-dwg", discipline: "structural", deliverableType: "drawing", number: "STR-DWG", title: "Structural drawing",
      revision: "1", stage: "detailed_engineering", issuePurpose: "CONSTRUCTION", engineeringStatus: "in_progress",
      reviewStatus: "not_started", approvalStatus: "pending", releaseStatus: "not_released", current: true,
      dependencies: [], plannedDate: null,
    });
    const disposed = drafted.register ? setDisposition(drafted.register, actor("structural"), "str-dwg", "REVALIDATION_REQUIRED") : null;
    if (!disposed || disposed.error) return NextResponse.json({ data: { committed: false, error: disposed?.error ?? "disposition_failed" } }, { status: 422 });
    await ctx.supabase.from("engineering_delivery_audit").insert({
      tenant_id: ctx.tenantId, workspace_id: ctx.workspaceId, action: "application_deliverable_disposition", actor_id: ctx.userId,
      detail: { actingRole, approvalGranted: false, revisionUnchanged: true, disposition: "REVALIDATION_REQUIRED" },
    });
    return NextResponse.json({ data: { committed: true, approvalGranted: false, disposition: "REVALIDATION_REQUIRED", revisionUnchanged: true } });
  }

  if (action === "freeze-approve" || action === "deliverable-approve" || action === "ifc-release") {
    const seed = createFreezeRegister({
      id: "qa-authority", tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, projectId: PROJECT_ID,
      projectTitle: "SYNTHETIC_QUALIFICATION_PROJECT", actorId: ctx.userId, at,
    });
    const drafted = addDeliverable(seed.register, actor("structural"), {
      id: "str-dwg", discipline: "structural", deliverableType: "drawing", number: "STR-DWG", title: "Structural drawing",
      revision: "1", stage: "detailed_engineering", issuePurpose: "CONSTRUCTION", engineeringStatus: "in_progress",
      reviewStatus: "not_started", approvalStatus: "pending", releaseStatus: "not_released", current: true,
      dependencies: [{ objectId: "p101-mass-runtime", revision: "1", status: "accepted", source: "interface", discipline: "mechanical" }],
      plannedDate: null,
    });
    const withFreeze = drafted.register
      ? addFreeze(drafted.register, actor("structural"), {
          id: "feed-baseline", freezeType: "feed_baseline", stage: "feed", title: "FEED baseline", scope: "synthetic",
          disciplines: ["structural"], items: [{ objectId: "p101-mass-runtime", revision: "1", status: "stale", source: "interface", discipline: "mechanical" }],
        })
      : drafted;
    const register = withFreeze.register;
    if (!register) return NextResponse.json({ data: { committed: false, error: drafted.error } }, { status: 422 });
    const result = action === "deliverable-approve"
      ? approveDeliverable(register, actor(actingRole), "str-dwg")
      : action === "ifc-release"
        ? releaseDeliverable(register, actor(actingRole), "str-dwg")
        : approveFreeze(register, actor(actingRole), "feed-baseline");
    return NextResponse.json({ data: { committed: false, approvalGranted: false, error: result.error ?? "authority_denied" } }, { status: result.error ? 403 : 200 });
  }

  return NextResponse.json({ data: { committed: false, error: "unknown_action" } }, { status: 400 });
});
