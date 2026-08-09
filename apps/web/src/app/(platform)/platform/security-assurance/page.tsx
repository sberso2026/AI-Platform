import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";

/**
 * Bounded administrative Security & Assurance surface (Phases 15B–15F).
 * No SOC dashboard theatre, threat map, or universal security/compliance score.
 */
export default function PlatformSecurityAssurancePage() {
  return (
    <>
      <Header
        title="Security & Assurance"
        description="Control, evidence, isolation, AI/data, secure-compute, compliance, and customer assurance"
        showEngineeringChrome={false}
      />
      <PageMain>
        <main className="space-y-6">
          <p data-testid="security-assurance-foundation-ready">
            Security & Assurance foundation ready (0.7.0-customer-assurance) —
            controls, evidence freshness, assessments, findings, exceptions, and
            dimensional posture; SecurityIntelligenceImplemented=false;
            CustomerTrustCenterImplemented=false; no universal security score.
          </p>

          <p data-testid="security-assurance-isolation-ready">
            Isolation Assurance ready (0.7.0-customer-assurance) —
            IsolationAssuranceRuntimeImplemented=true;
            knownCrossTenantLeakageDetected=false;
            knownCrossWorkspaceLeakageDetected=false;
            automaticRemediationEnabled=false;
            automaticRlsMutationEnabled=false; observes isolation, does not enforce.
          </p>

          <p data-testid="security-assurance-ai-data-ready">
            AI & Data Security Assurance ready (0.7.0-customer-assurance) —
            AiDataSecurityRuntimeImplemented=true;
            ProviderDataHandlingAssuranceImplemented=true;
            duplicateAiStackDetected=false;
            AiTrustRuntimeImplemented=false;
            no universal prompt-injection claim; observes AI/data security.
          </p>

          <p data-testid="security-assurance-secure-compute-ready">
            Secure Compute Assurance ready (0.7.0-customer-assurance) —
            SecureComputeAssuranceRuntimeImplemented=true;
            WorkloadIdentityAssuranceImplemented=true;
            ExecutionProvenanceImplemented=true;
            duplicateExecutionHostDetected=false;
            confidentialComputingClaimed=false;
            teeClaimed=false; observes compute security, does not enforce.
          </p>

          <p data-testid="security-assurance-compliance-ready">
            Compliance Intelligence ready (0.7.0-customer-assurance) —
            ComplianceFrameworkRegistryImplemented=true;
            ComplianceAssessmentImplemented=true;
            automaticCertificationEnabled=false;
            automaticComplianceClaimEnabled=false;
            certificationClaimed=false; mapping/assessment only, not certification.
          </p>

          <p data-testid="security-assurance-customer-ready">
            Customer Assurance ready (0.7.0-customer-assurance) —
            CustomerAssuranceImplemented=true;
            AssuranceDisclosurePolicyReady=true;
            automaticCustomerAssurancePublicationEnabled=false;
            CustomerTrustCenterImplemented=false; approved disclosure only.
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
              <li data-testid="sa-surface-secure-compute">Secure Compute</li>
              <li data-testid="sa-surface-compliance">Compliance Intelligence</li>
              <li data-testid="sa-surface-customer">Customer Assurance</li>
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

          <section aria-label="Secure compute assurance">
            <h2 className="text-lg font-semibold">Secure Compute</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Plane matrix · workload/runtime posture · execution provenance ·
              control evidence · findings · evidence freshness · limitations
            </p>
            <ul
              className="mt-2 grid gap-1 text-sm sm:grid-cols-2 lg:grid-cols-3"
              data-testid="sa-secure-compute-planes"
              aria-label="Secure compute planes"
            >
              <li data-testid="sa-sc-plane-WORKLOAD_IDENTITY">WORKLOAD_IDENTITY</li>
              <li data-testid="sa-sc-plane-TENANT_WORKSPACE_SCOPE">TENANT_WORKSPACE_SCOPE</li>
              <li data-testid="sa-sc-plane-EXECUTION_AUTHORIZATION">EXECUTION_AUTHORIZATION</li>
              <li data-testid="sa-sc-plane-RUNTIME_ISOLATION">RUNTIME_ISOLATION</li>
              <li data-testid="sa-sc-plane-FILESYSTEM_SCOPE">FILESYSTEM_SCOPE</li>
              <li data-testid="sa-sc-plane-NETWORK_EGRESS">NETWORK_EGRESS</li>
              <li data-testid="sa-sc-plane-SECRET_ACCESS">SECRET_ACCESS</li>
              <li data-testid="sa-sc-plane-RESOURCE_LIMITS">RESOURCE_LIMITS</li>
              <li data-testid="sa-sc-plane-EXECUTION_TIMEOUT">EXECUTION_TIMEOUT</li>
              <li data-testid="sa-sc-plane-ARTEFACT_INTEGRITY">ARTEFACT_INTEGRITY</li>
              <li data-testid="sa-sc-plane-EXECUTION_PROVENANCE">EXECUTION_PROVENANCE</li>
              <li data-testid="sa-sc-plane-OUTPUT_HANDLING">OUTPUT_HANDLING</li>
              <li data-testid="sa-sc-plane-TEMPORARY_DATA">TEMPORARY_DATA</li>
              <li data-testid="sa-sc-plane-LOGGING_TELEMETRY">LOGGING_TELEMETRY</li>
              <li data-testid="sa-sc-plane-HOST_POSTURE">HOST_POSTURE</li>
            </ul>
            <p data-testid="sa-sc-workload-posture" className="mt-2 text-sm">
              workload/runtime posture: attributable identity required; unknown fail-closed
            </p>
            <p data-testid="sa-sc-no-tee-claim" className="text-sm text-muted-foreground">
              confidentialComputingClaimed=false; teeClaimed=false
            </p>
          </section>

          <section aria-label="Compliance intelligence">
            <h2 className="text-lg font-semibold">Compliance Intelligence</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Framework registry · framework/version · requirement status · mapped
              RTB controls · evidence freshness · gaps · external assurance
              dependencies · limitations
            </p>
            <ul
              className="mt-2 grid gap-1 text-sm sm:grid-cols-2 lg:grid-cols-3"
              data-testid="sa-compliance-frameworks"
              aria-label="Compliance frameworks"
            >
              <li data-testid="sa-comp-fw-ISO27001_2022">ISO/IEC 27001:2022</li>
              <li data-testid="sa-comp-fw-NIST_CSF_2_0">NIST CSF 2.0</li>
              <li data-testid="sa-comp-fw-ESSENTIAL_EIGHT">Essential Eight</li>
              <li data-testid="sa-comp-fw-SOC2_TSC">SOC 2 TSC (scaffold)</li>
            </ul>
            <p data-testid="sa-comp-claim-safety" className="mt-2 text-sm text-muted-foreground">
              iso27001CertifiedClaimed=false; soc2CompliantClaimed=false;
              essentialEightPassedClaimed=false; nistCompliantClaimed=false
            </p>
            <p data-testid="sa-comp-external" className="text-sm">
              external assurance required for attestation/pen-test markers — internal
              evidence alone cannot satisfy
            </p>
          </section>

          <section aria-label="Customer assurance foundation">
            <h2 className="text-lg font-semibold">Customer Assurance</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Approved profile · claims · framework summaries · external assurance ·
              AI/data governance · backup/recovery · Tier-1 requirements · documents
            </p>
            <p data-testid="sa-ca-admin-link" className="mt-2 text-sm">
              Authenticated foundation: /platform/security-assurance/customer-assurance
              (not a public Trust Center)
            </p>
            <p data-testid="sa-ca-separation" className="text-sm text-muted-foreground">
              Internal findings are not projected to customer surfaces.
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
              <li>compliance_intelligence</li>
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
            <p data-testid="sa-auto-runtime-mutation-flag">automaticRuntimeMutationEnabled=false</p>
            <p data-testid="sa-auto-certification-flag">automaticCertificationEnabled=false</p>
            <p data-testid="sa-auto-customer-publish-flag">
              automaticCustomerAssurancePublicationEnabled=false
            </p>
            <p data-testid="sa-s08-ownership">S08 owned by Platform Identity</p>
            <p data-testid="sa-s07-tier1">S07 REQUIRED_BEFORE_TIER1_PRODUCTION</p>
          </section>
        </main>
      </PageMain>
    </>
  );
}
