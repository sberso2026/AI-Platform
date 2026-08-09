import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";

/**
 * Bounded authenticated Customer Assurance foundation (Phase 15G).
 * Not a public Trust Center. Approved customer-safe projection only.
 */
export default function PlatformCustomerAssurancePage() {
  return (
    <>
      <Header
        title="Customer Assurance"
        description="Approved enterprise trust evidence and controlled disclosure"
        showEngineeringChrome={false}
      />
      <PageMain>
        <main className="space-y-6" aria-label="Customer assurance">
          <p data-testid="security-assurance-customer-ready">
            Customer Assurance ready (1.0.0) —
            CustomerAssuranceImplemented=true;
            AssuranceDisclosurePolicyReady=true;
            automaticCustomerAssurancePublicationEnabled=false;
            automaticExternalDisclosureEnabled=false;
            CustomerTrustCenterImplemented=false;
            certificationClaimed=false; approved disclosure only.
          </p>

          <section aria-label="Approved security profile">
            <h2 className="text-lg font-semibold">Approved security profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Platform-scoped CustomerAssuranceProfile with governed categories.
            </p>
            <ul
              className="mt-2 grid gap-1 text-sm sm:grid-cols-2 lg:grid-cols-3"
              data-testid="sa-ca-profile-categories"
              aria-label="Assurance profile categories"
            >
              <li>security governance</li>
              <li>identity/access</li>
              <li>tenant isolation</li>
              <li>data protection</li>
              <li>AI security</li>
              <li>secure compute</li>
              <li>secure SDLC</li>
              <li>incident readiness</li>
              <li>backup/recovery</li>
              <li>external assurance</li>
              <li>framework coverage</li>
              <li>data residency</li>
              <li>subprocessors</li>
            </ul>
          </section>

          <section aria-label="Approved claims">
            <h2 className="text-lg font-semibold">Approved claims</h2>
            <ul
              className="mt-2 grid gap-1 text-sm sm:grid-cols-2 lg:grid-cols-3"
              data-testid="sa-ca-claims"
              aria-label="Customer assurance claims"
            >
              <li data-testid="sa-ca-claim-mfa">MFA privileged access — supported</li>
              <li data-testid="sa-ca-claim-isolation">
                Tenant isolation — supported within certified scope
              </li>
              <li data-testid="sa-ca-claim-pentest">
                External penetration test — requires_external_assurance (S07)
              </li>
              <li data-testid="sa-ca-claim-sso">
                Customer SSO — not production-ready (S08)
              </li>
              <li data-testid="sa-ca-claim-iso">ISO 27001 — not certified</li>
              <li data-testid="sa-ca-claim-soc2">SOC 2 — not attested</li>
            </ul>
          </section>

          <section aria-label="Framework mapping summary">
            <h2 className="text-lg font-semibold">Framework mapping summary</h2>
            <ul
              className="mt-2 grid gap-1 text-sm sm:grid-cols-2 lg:grid-cols-3"
              data-testid="sa-ca-frameworks"
              aria-label="Customer-safe framework summaries"
            >
              <li>NIST CSF — mapped coverage available</li>
              <li>ISO 27001 — control mapping available (not certified)</li>
              <li>Essential Eight — applicability/mapping; maturity not claimed</li>
              <li>SOC 2 — mapping scaffold only</li>
            </ul>
            <p data-testid="sa-ca-no-cert-claims" className="mt-2 text-sm text-muted-foreground">
              framework mapping ≠ compliance claim; iso27001CertifiedClaimed=false;
              soc2CompliantClaimed=false
            </p>
          </section>

          <section aria-label="External assurance status">
            <h2 className="text-lg font-semibold">External assurance status</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm" data-testid="sa-ca-external">
              <li>penetration test — not_available (S07 incomplete)</li>
              <li>ISO certification — not_available</li>
              <li>SOC 2 report — not_available</li>
              <li>Essential Eight assessment — pending</li>
            </ul>
          </section>

          <section aria-label="AI governance summary">
            <h2 className="text-lg font-semibold">AI governance summary</h2>
            <p data-testid="sa-ca-ai" className="text-sm">
              Approved provider policy · classification restrictions · training-use from
              approved policy · human review requirements · tool authorization · AI audit
              capability. System prompts and guardrail internals not disclosed.
            </p>
          </section>

          <section aria-label="Data governance summary">
            <h2 className="text-lg font-semibold">Data governance summary</h2>
            <p data-testid="sa-ca-data-gov" className="text-sm">
              Data residency state=not_verified; subprocessors referenced from approved
              metadata; no invented sovereignty guarantees.
            </p>
          </section>

          <section aria-label="Backup and recovery status">
            <h2 className="text-lg font-semibold">Backup / recovery</h2>
            <p data-testid="sa-ca-backup" className="text-sm">
              Restore tested within documented scope. RPO=DEFINED_NOT_TESTED;
              RTO=MEASURED — not SLA.
            </p>
          </section>

          <section aria-label="Tier-1 readiness requirements">
            <h2 className="text-lg font-semibold">Tier-1 readiness</h2>
            <p data-testid="sa-ca-tier1" className="text-sm">
              S07 external penetration test = REQUIRED_BEFORE_TIER1_PRODUCTION
              (complete=false). S08 customer SSO = REQUIRED_BEFORE_TIER1_PRODUCTION
              (productionReady=false).
            </p>
          </section>

          <section aria-label="Approved downloadable documents">
            <h2 className="text-lg font-semibold">Approved documents</h2>
            <ul
              className="mt-2 list-disc space-y-1 pl-5 text-sm"
              data-testid="sa-ca-documents"
              aria-label="Assurance documents"
            >
              <li>Platform Security Overview (Platform Files)</li>
              <li>Incident Response Process Summary (Platform Files)</li>
            </ul>
          </section>

          <section aria-label="Disclosure governance">
            <p data-testid="sa-ca-no-findings" className="text-sm text-muted-foreground">
              Internal findings / exceptions / evidence gaps are not exposed on this
              customer surface.
            </p>
            <p data-testid="sa-ca-auto-publish" className="text-sm">
              automaticCustomerAssurancePublicationEnabled=false;
              automaticExternalDisclosureEnabled=false
            </p>
            <p data-testid="sa-no-universal-score" className="text-sm text-muted-foreground">
              universalScorePresent=false
            </p>
          </section>
        </main>
      </PageMain>
    </>
  );
}
