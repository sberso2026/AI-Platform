/** EOS 3.2 object authority boundaries — AI cannot hold human engineering authority. */

export type AuthorityAction =
  | "accept_interface"
  | "finalize_impact_materiality"
  | "approve_review"
  | "approve_deliverable"
  | "release_deliverable"
  | "freeze_baseline"
  | "release_ifc"
  | "record_human_decision"
  | "propose_impact"
  | "assist_review_preparation"
  | "compare_decision_options";

export function aiMayPerform(action: AuthorityAction): boolean {
  return (
    action === "propose_impact" ||
    action === "assist_review_preparation" ||
    action === "compare_decision_options"
  );
}

export function assertHumanAuthority(
  action: AuthorityAction,
  actor: { role: "human" | "ai"; authorityRole?: string | null },
): void {
  if (actor.role === "ai" && !aiMayPerform(action)) {
    throw new Error(`ai_authority_denied:${action}`);
  }
  if (
    actor.role === "human" &&
    (action === "accept_interface" ||
      action === "finalize_impact_materiality" ||
      action === "approve_review" ||
      action === "approve_deliverable" ||
      action === "release_deliverable" ||
      action === "freeze_baseline" ||
      action === "release_ifc" ||
      action === "record_human_decision") &&
    !actor.authorityRole
  ) {
    throw new Error(`human_authority_role_required:${action}`);
  }
}

export function interfaceAuthorityBoundary(): {
  sourceOwnsSourceState: true;
  receiverOwnsAcceptance: true;
  aiCannotAccept: true;
} {
  return {
    sourceOwnsSourceState: true,
    receiverOwnsAcceptance: true,
    aiCannotAccept: true,
  };
}

export function changeMaterialityAuthority(): {
  aiMayPropose: true;
  aiMayFinalize: false;
} {
  return { aiMayPropose: true, aiMayFinalize: false };
}
