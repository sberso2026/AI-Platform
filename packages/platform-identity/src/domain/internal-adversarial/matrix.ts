/**
 * Internal adversarial test matrix metadata (documentation mirror).
 */
export const INTERNAL_SECURITY_TEST_MATRIX = [
  { category: "authentication", cases: ["unauthenticated", "sso.state_mismatch", "sso.password_fallback_denied", "sso.redirect_abuse"] },
  { category: "authorization", cases: ["priv.viewer_assurance", "priv.viewer_execution", "priv.disabled_user"] },
  { category: "tenant_isolation", cases: ["tenant.cross.* surfaces", "sso.cross_tenant_binding"] },
  { category: "ai_security", cases: ["ai.cross_tenant_context", "ai.untrusted_doc_instructions", "ai.tool_unauthorized", "ai.classification_provider"] },
  { category: "files", cases: ["files.cross_tenant_idor", "files.path_traversal", "files.absolute_path"] },
  { category: "execution_host", cases: ["execution.cross_tenant", "execution.command_injection", "execution.unapproved_solver", "execution.silent_fallback"] },
  { category: "security_assurance", cases: ["assurance.disclosure_negatives", "assurance.auto_approval", "assurance.stale_claim"] },
] as const;
