/**
 * Enterprise SSO tenant administration surface (Phase 16B).
 * Secrets are never rendered — only secret reference IDs.
 */
export default function EnterpriseSsoAdminPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6" data-testid="platform-enterprise-sso-ready">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Enterprise SSO</h1>
        <p className="text-sm text-muted-foreground">
          Configure OIDC enterprise federation (Microsoft Entra first-class). Provider-neutral
          architecture. Secrets are referenced — never displayed.
        </p>
        <p data-testid="enterprise-sso-version" className="text-xs text-muted-foreground">
          version=0.2.0-enterprise-sso; S08CustomerSsoProductionReady=true;
          S07ExternalPenTestComplete=false; Tier1EnterpriseProductionReady=false;
          passwordFallbackWhenRequired=false;
          knownEnterpriseIdentityCrossTenantLeakageDetected=false.
        </p>
      </header>

      <section aria-label="Provider configuration" className="space-y-2">
        <h2 className="text-lg font-medium">Provider configuration</h2>
        <ul className="grid gap-1 text-sm sm:grid-cols-2 lg:grid-cols-3" data-testid="enterprise-sso-provider-summary">
          <li>protocol=oidc</li>
          <li>providerType=microsoft_entra|generic_oidc</li>
          <li>status=draft|pending_verification|active|disabled|invalid|revoked</li>
          <li>clientSecretRefId=(secret ref only)</li>
          <li>SAML=reserved</li>
          <li>SCIM=POST_V1</li>
        </ul>
      </section>

      <section aria-label="Domain verification" className="space-y-2">
        <h2 className="text-lg font-medium">Verified domains</h2>
        <p className="text-sm text-muted-foreground">
          Governed verification (DNS TXT / well-known / manual review with evidence). Unverified
          domains never auto-route.
        </p>
      </section>

      <section aria-label="SSO policy" className="space-y-2">
        <h2 className="text-lg font-medium">Tenant SSO policy</h2>
        <p className="text-sm" data-testid="enterprise-sso-policy">
          modes=disabled|optional|required|required_for_privileged_users|required_for_all_users;
          passwordFallbackWhenRequired=false
        </p>
      </section>

      <section aria-label="Role mapping" className="space-y-2">
        <h2 className="text-lg font-medium">Role mapping</h2>
        <p className="text-sm text-muted-foreground">
          External group → approved mapping → RTB role. Privileged mappings require review. Unknown
          groups grant no privilege.
        </p>
      </section>

      <section aria-label="Provider health" className="space-y-2">
        <h2 className="text-lg font-medium">Provider health</h2>
        <p className="text-sm" data-testid="enterprise-sso-health">
          healthy|degraded|unavailable|invalid|unknown — unavailable does not enable password
          fallback when SSO is required.
        </p>
      </section>

      <section aria-label="Audit" className="space-y-2">
        <h2 className="text-lg font-medium">Audit history</h2>
        <p className="text-sm text-muted-foreground">
          Provider/domain/policy/mapping/login events via Platform Audit. No tokens or client
          secrets in audit payloads.
        </p>
      </section>
    </main>
  );
}
