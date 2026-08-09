/**
 * Microsoft Entra first-class helpers (provider-neutral OIDC underneath).
 */
export function isEntraIssuer(issuer: string, entraTenantId?: string): boolean {
  try {
    const u = new URL(issuer);
    if (u.hostname !== "login.microsoftonline.com" && u.hostname !== "sts.windows.net") {
      return false;
    }
    if (entraTenantId) {
      return issuer.includes(`/${entraTenantId}`) || issuer.includes(`${entraTenantId}`);
    }
    return /\/[0-9a-fA-F-]{36}(\/v2\.0)?\/?$/.test(u.pathname) || u.pathname.includes("/common");
  } catch {
    return false;
  }
}

export function entraDiscoveryUri(entraTenantId: string): string {
  return `https://login.microsoftonline.com/${entraTenantId}/v2.0/.well-known/openid-configuration`;
}

export function entraIssuer(entraTenantId: string): string {
  return `https://login.microsoftonline.com/${entraTenantId}/v2.0`;
}
