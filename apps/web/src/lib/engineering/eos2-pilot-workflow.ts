export const CONTROLLED_PILOT_VALIDATION_PROJECT_ID = "CONTROLLED_PRODUCTION_PILOT_VALIDATION";

const WRITE_ROLES = new Set(["pilot_engineer", "pilot-engineer", "engineer", "owner", "admin"]);
const MATERIALITY = new Set(["MATERIAL_IMPACT", "NO_MATERIAL_IMPACT"]);
const FORBIDDEN_ACTIONS = new Set([
  "accept_interface",
  "approve_freeze",
  "approve_deliverable",
  "release_deliverable",
  "ifc_release",
]);
const PERSIST_ACTIONS = new Set([
  "create_basis",
  "revise_basis",
  "create_discipline",
  "revise_discipline",
  "create_interface",
  "revise_interface",
  "create_change",
  "record_materiality",
  "create_deliverable",
  "record_freeze",
]);

export function classifyPilotWrite(input: {
  action: string;
  roleSlug: string | null | undefined;
  actingRole?: string | null;
  projectId?: string | null;
  materiality?: string | null;
}): { ok: true } | { ok: false; error: "authority_denied" | "invalid_action" | "invalid_project" | "invalid_materiality" } {
  const action = input.action.trim();
  const role = (input.roleSlug ?? "").trim().toLowerCase();
  const acting = (input.actingRole ?? "").trim().toLowerCase();
  if (input.projectId && input.projectId !== CONTROLLED_PILOT_VALIDATION_PROJECT_ID) {
    return { ok: false, error: "invalid_project" };
  }
  if (FORBIDDEN_ACTIONS.has(action) || acting === "ai" || role === "ai" || role === "viewer" || !WRITE_ROLES.has(role)) {
    return { ok: false, error: "authority_denied" };
  }
  if (!PERSIST_ACTIONS.has(action)) return { ok: false, error: "invalid_action" };
  if (action === "record_materiality" && !MATERIALITY.has(input.materiality ?? "")) {
    return { ok: false, error: "invalid_materiality" };
  }
  return { ok: true };
}
