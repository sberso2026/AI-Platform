/**
 * Aggregate E12 production certification report + release eligibility.
 */

import { certifyProductAssertions } from "./assertions";
import { runArchitectureOwnershipAudit } from "./architecture-audit";
import {
  certifyEndToEndAskFlow,
  certifyEngineeringAuthorityBoundaries,
} from "./e2e-provenance";
import { buildProfileCertificationMatrix } from "./profile-certification";
import { buildIntegrationMaturityMatrix } from "./integration-maturity";
import {
  certifyBenchmarkRegression,
  certifyDeploymentReadiness,
  certifyEnterpriseScenario,
  certifyFailureModes,
  certifyKgpScenario,
  certifyPerformanceRegression,
  certifySecurityAdversarial,
  certifySmallCompanyEssentialScenario,
  certifyUxProductExperience,
} from "./certification-runners";
import { getPhaseE12Declaration } from "./contracts";
import {
  ENGINEERING_OS_RELEASE_TAG,
  ENGINEERING_OS_VERSION,
} from "../version";

export type E12CertificationReport = {
  verdict: "PASS" | "PASS_WITH_LIMITATIONS" | "FAIL";
  releaseEligible: boolean;
  recommendedScope: string;
  certifiedBaselines: {
    e11: string;
    version: string;
    releaseTag: string;
    e12Contract: string;
  };
  assertions: ReturnType<typeof certifyProductAssertions>;
  architecture: ReturnType<typeof runArchitectureOwnershipAudit>;
  profiles: ReturnType<typeof buildProfileCertificationMatrix>;
  integrations: ReturnType<typeof buildIntegrationMaturityMatrix>;
  security: ReturnType<typeof certifySecurityAdversarial>;
  authority: ReturnType<typeof certifyEngineeringAuthorityBoundaries>;
  e2eProvenance: ReturnType<typeof certifyEndToEndAskFlow>;
  failureModes: ReturnType<typeof certifyFailureModes>;
  performance: ReturnType<typeof certifyPerformanceRegression>;
  kgp: ReturnType<typeof certifyKgpScenario>;
  smallCompany: ReturnType<typeof certifySmallCompanyEssentialScenario>;
  enterprise: ReturnType<typeof certifyEnterpriseScenario>;
  ux: ReturnType<typeof certifyUxProductExperience>;
  deployment: ReturnType<typeof certifyDeploymentReadiness>;
  benchmark: ReturnType<typeof certifyBenchmarkRegression>;
  knownLimitations: string[];
  criticalBlockers: string[];
};

export function runE12ProductionCertification(input?: {
  e11BaselineCommit?: string;
}): E12CertificationReport {
  const assertions = certifyProductAssertions();
  const architecture = runArchitectureOwnershipAudit();
  const profiles = buildProfileCertificationMatrix();
  const integrations = buildIntegrationMaturityMatrix();
  const security = certifySecurityAdversarial();
  const authority = certifyEngineeringAuthorityBoundaries();
  const e2eProvenance = certifyEndToEndAskFlow();
  const failureModes = certifyFailureModes();
  const performance = certifyPerformanceRegression();
  const kgp = certifyKgpScenario();
  const smallCompany = certifySmallCompanyEssentialScenario();
  const enterprise = certifyEnterpriseScenario();
  const ux = certifyUxProductExperience();
  const deployment = certifyDeploymentReadiness();
  const benchmark = certifyBenchmarkRegression();

  const knownLimitations = [
    "Enterprise connectors (M365/Fabric/SAP/Entra/Copilot) are CONTRACT_ONLY — not live-certified.",
    "E9 PI/AI/II/PC adapter invocations in suites are FIXTURE_ONLY — engines retain ownership.",
    "Performance P50/P95 are instrumentation fixtures — not production SLA.",
    "KGP and efficiency metrics are BENCHMARK — not client ROI.",
    "File import / workflow / memory persistence are IMPLEMENTED_NOT_LIVE_CERTIFIED (env-dependent).",
  ];

  const criticalBlockers: string[] = [];
  if (!assertions.allPassed) criticalBlockers.push("A1–A20 assertion failure");
  if (!architecture.passed) criticalBlockers.push("Architecture ownership duplication");
  if (!smallCompany.passed) criticalBlockers.push("ESSENTIAL zero-connector scenario failed");
  if (!security.allPassed) criticalBlockers.push("Security/adversarial failure");
  if (!e2eProvenance.passed) criticalBlockers.push("E2E provenance failure");
  if (!failureModes.allPassed) criticalBlockers.push("Failure-mode fabrication/unsafe degrade");
  if (!integrations.passed) criticalBlockers.push("Integration maturity misclassification");
  if (!profiles.passed) criticalBlockers.push("Profile certification failure");
  if (!authority.passed) criticalBlockers.push("Authority boundary failure");
  if (!ux.passed) criticalBlockers.push("UX product certification failure");
  if (!benchmark.allPassed) criticalBlockers.push("E11 benchmark regression");
  if (!performance.passed) criticalBlockers.push("Performance budget regression");
  if (!kgp.passed) criticalBlockers.push("KGP benchmark failure");
  if (!enterprise.passed) criticalBlockers.push("Enterprise scenario packaging failure");
  if (!deployment.passed) criticalBlockers.push("Deployment readiness failure");

  const mandatoryPass = criticalBlockers.length === 0;
  const verdict: E12CertificationReport["verdict"] = mandatoryPass
    ? "PASS_WITH_LIMITATIONS"
    : "FAIL";

  // Policy: non-critical limitations documented → PASS_WITH_LIMITATIONS is allowed.
  // Mandatory gates never weakened.
  const releaseEligible =
    mandatoryPass &&
    smallCompany.passed &&
    assertions.allPassed &&
    !integrations.rows.some(
      (r) =>
        r.maturity === "LIVE_CERTIFIED" &&
        /SAP|Fabric|M365|Copilot|Entra|Generic REST/i.test(r.integration),
    );

  return {
    verdict,
    releaseEligible,
    recommendedScope:
      "Pilot: ESSENTIAL/PROFESSIONAL native Engineering OS (Ask, projects, documents, registers, grounded reasoning, governed tools/memory/actions). Enterprise connectors/IdP/Copilot: contract-ready only — require separate live integration certification before production federation claims.",
    certifiedBaselines: {
      e11: input?.e11BaselineCommit ?? "fc871d4",
      version: ENGINEERING_OS_VERSION,
      releaseTag: ENGINEERING_OS_RELEASE_TAG,
      e12Contract: getPhaseE12Declaration().contractVersion,
    },
    assertions,
    architecture,
    profiles,
    integrations,
    security,
    authority,
    e2eProvenance,
    failureModes,
    performance,
    kgp,
    smallCompany,
    enterprise,
    ux,
    deployment,
    benchmark,
    knownLimitations,
    criticalBlockers,
  };
}
