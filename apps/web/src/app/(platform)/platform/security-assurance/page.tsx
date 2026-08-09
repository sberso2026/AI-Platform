import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";

/**
 * Bounded administrative Security & Assurance surface (Phase 15B).
 * No SOC dashboard theatre, threat map, or universal security score.
 */
export default function PlatformSecurityAssurancePage() {
  return (
    <>
      <Header
        title="Security & Assurance"
        description="Control, evidence, assessment, and dimensional posture foundation"
        showEngineeringChrome={false}
      />
      <PageMain>
        <main className="space-y-6">
          <p data-testid="security-assurance-foundation-ready">
            Security & Assurance foundation ready (0.2.0-control-evidence) —
            controls, evidence freshness, assessments, findings, exceptions, and
            dimensional posture; SecurityIntelligenceImplemented=false;
            CustomerTrustCenterImplemented=false; no universal security score.
          </p>

          <section aria-label="Security assurance inspection surfaces">
            <h2 className="text-lg font-semibold">Inspection surfaces</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li data-testid="sa-surface-controls">Controls</li>
              <li data-testid="sa-surface-evidence">Evidence status</li>
              <li data-testid="sa-surface-assessments">Assessments</li>
              <li data-testid="sa-surface-findings">Findings</li>
              <li data-testid="sa-surface-exceptions">Exceptions</li>
              <li data-testid="sa-surface-posture">Posture dimensions</li>
            </ul>
          </section>

          <section aria-label="Posture dimensions">
            <h2 className="text-lg font-semibold">Posture dimensions</h2>
            <ul
              className="mt-2 grid gap-1 text-sm sm:grid-cols-2 lg:grid-cols-3"
              data-testid="sa-posture-dimensions"
            >
              <li>identity</li>
              <li>isolation</li>
              <li>data_protection</li>
              <li>ai_security</li>
              <li>secure_compute</li>
              <li>secure_sdlc</li>
              <li>incident_readiness</li>
              <li>recovery</li>
              <li>compliance_evidence</li>
            </ul>
            <p data-testid="sa-no-universal-score" className="mt-2 text-sm text-muted-foreground">
              universalScorePresent=false
            </p>
          </section>

          <section aria-label="Governance flags">
            <p data-testid="sa-auto-approval-flag">automaticSecurityApprovalEnabled=false</p>
            <p data-testid="sa-auto-exception-flag">automaticExceptionApprovalEnabled=false</p>
            <p data-testid="sa-auto-remediation-flag">automaticRemediationEnabled=false</p>
            <p data-testid="sa-s08-ownership">S08 owned by Platform Identity</p>
            <p data-testid="sa-s07-tier1">S07 REQUIRED_BEFORE_TIER1_PRODUCTION</p>
          </section>
        </main>
      </PageMain>
    </>
  );
}
