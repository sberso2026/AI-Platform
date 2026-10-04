/** Client-safe mirror of SQL has_permission('engineering', 'admin') / hasEngineeringAdminAuthority. */
export type EngineeringAdminPrincipal = {
  roleSlug?: string | null;
  permissions?: ReadonlyArray<{ resource?: string; action?: string }> | null;
};

export function hasEngineeringAdminAuthority(principal: EngineeringAdminPrincipal): boolean {
  const slug = principal.roleSlug?.trim() ?? "";
  if (slug === "owner" || slug === "admin") return true;
  return (principal.permissions ?? []).some(
    (permission) => permission.resource === "engineering" && permission.action === "admin",
  );
}
