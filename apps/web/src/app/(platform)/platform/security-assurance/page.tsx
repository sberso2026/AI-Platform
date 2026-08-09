import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";

/**
 * Bounded administrative Security & Assurance surface (Phases 15B–15D).
 * No SOC dashboard theatre, threat map, or universal security score.
 */
export default function PlatformSecurityAssurancePage() {
  return (
    <>
      <Header
        title="Security & Assurance"
        description="Control, evidence, isolation, AI/data security assurance, and dimensional posture"
        showEngineeringChrome={false}
      />
      <PageMain>
        <main className="space-y-6">
          <p data-testid="security-assurance-foundation-ready">
            Security & Assurance foundation ready (0.4.0-ai-data-security) —
            controls, evidence freshness, assessments, findings, exceptions, and
            dimensional posture; SecurityIntelligenceImplemented=false;
            CustomerTrustCenterImplemented=false; no universal security score.
          </p>

          <p data-testid="security-assurance-isolation-ready">
            Isolation Assurance ready (0.4.0-ai-data-security) —
            IsolationAssuranceRuntimeImplemented=true;
            knownCrossTenantLeakageDetected=false;
            knownCrossWorkspaceLeakageDetected=false;
            automaticRemediationEnabled=false;
            automaticRlsMutationEnabled=false; observes isolation, does not enforce.
          </p>

          <p data-testid="security-assurance-ai-data-ready">
            AI & Data Security Assurance ready (0.4.0-ai-data-security) —
            AiDataSecurityRuntimeImplemented=true;
            ProviderDataHandlingAssuranceImplemented=true;
            duplicateAiStackDetected=false;
            AiTrustRuntimeImplemented=false;
            no universal prompt-injection claim; observes AI/data security.
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
              <li data-testid="sa-surface-isolation">Isolation Assurance</li>
              <li data-testid="sa-surface-ai-data">AI & Data Security</li>
            </ul>
          </section>

          <section aria-label="Isolation assurance">
            <h2 className="text-lg font-semibold">Isolation Assurance</h2>
            <ul
              className="mt-2 grid gap-1 text-sm sm:grid-cols-2 lg:grid-cols-3"
              data-testid="sa-isolation-planes"
              aria-label="Isolation target planes"
            >
              <li data-testid="sa-iso-plane-DATABASE">DATABASE</li>
              <li data-testid="sa-iso-plane-API">API</li>
              <li data-testid="sa-iso-plane-FILES">FILES</li>
              <li data-testid="sa-iso-plane-SEARCH">SEARCH</li>
              <li data-testid="sa-iso-plane-KNOWLEDGE_GRAPH">KNOWLEDGE_GRAPH</li>
              <li data-testid="sa-iso-plane-AI_CONTEXT">AI_CONTEXT</li>
              <li data-testid="sa-iso-plane-BACKGROUND_JOB">BACKGROUND_JOB</li>
              <li data-testid="sa-iso-plane-EVENT">EVENT</li>
              <li data-testid="sa-iso-plane-EXECUTION_HOST">EXECUTION_HOST</li>
              <li data-testid="sa-iso-plane-SOLVER_WORKSPACE">SOLVER_WORKSPACE</li>
              <li data-testid="sa-iso-plane-CACHE">CACHE (NOT_APPLICABLE)</li>
            </ul>
            <p data-testid="sa-iso-no-theatre" className="mt-2 text-sm text-muted-foreground">
              no fake 100% secure indicator
            </p>
          </section>

          <section aria-label="AI and data security assurance">
            <h2 className="text-lg font-semibold">AI & Data Security</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Plane status · provider posture · data-flow assurance · findings ·
              evidence freshness · limitations
            </p>
            <ul
              className="mt-2 grid gap-1 text-sm sm:grid-cols-2 lg:grid-cols-3"
              data-testid="sa-ai-data-planes"
              aria-label="AI data security planes"
            >
              <li data-testid="sa-aid-plane-DATA_INGESTION">DATA_INGESTION</li>
              <li data-testid="sa-aid-plane-DATA_STORAGE">DATA_STORAGE</li>
              <li data-testid="sa-aid-plane-RETRIEVAL">RETRIEVAL</li>
              <li data-testid="sa-aid-plane-AI_CONTEXT">AI_CONTEXT</li>
              <li data-testid="sa-aid-plane-PROMPT">PROMPT</li>
              <li data-testid="sa-aid-plane-MODEL_PROVIDER">MODEL_PROVIDER</li>
              <li data-testid="sa-aid-plane-TOOL_INPUT">TOOL_INPUT</li>
              <li data-testid="sa-aid-plane-TOOL_OUTPUT">TOOL_OUTPUT</li>
              <li data-testid="sa-aid-plane-MODEL_OUTPUT">MODEL_OUTPUT</li>
              <li data-testid="sa-aid-plane-PERSISTENCE">PERSISTENCE</li>
              <li data-testid="sa-aid-plane-LOGGING_TELEMETRY">LOGGING_TELEMETRY</li>
              <li data-testid="sa-aid-plane-DATA_EGRESS">DATA_EGRESS</li>
            </ul>
            <p data-testid="sa-aid-provider-posture" className="mt-2 text-sm">
              provider posture: approved evidenced; unknown fail-closed
            </p>
            <p data-testid="sa-aid-no-injection-claim" className="text-sm text-muted-foreground">
              promptInjectionCompletelyPreventedClaimed=false
            </p>
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
            <p data-testid="sa-auto-rls-mutation-flag">automaticRlsMutationEnabled=false</p>
            <p data-testid="sa-s08-ownership">S08 owned by Platform Identity</p>
            <p data-testid="sa-s07-tier1">S07 REQUIRED_BEFORE_TIER1_PRODUCTION</p>
          </section>
        </main>
      </PageMain>
    </>
  );
}
