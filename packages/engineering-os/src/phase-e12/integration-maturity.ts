/**
 * Integration maturity audit — honest classification.
 * Never promote fixture/contract success to LIVE_CERTIFIED.
 */

import type { EngineeringIntegrationMaturityClass } from "./contracts";

export type IntegrationMaturityRow = {
  integration: string;
  maturity: EngineeringIntegrationMaturityClass;
  note: string;
};

export function buildIntegrationMaturityMatrix(): {
  rows: IntegrationMaturityRow[];
  passed: boolean;
  disclaimer: string;
} {
  const rows: IntegrationMaturityRow[] = [
    {
      integration: "Native EOS (projects/documents/registers/Ask)",
      maturity: "LIVE_CERTIFIED",
      note: "Native domain + Ask path certified across E1–E11 suites",
    },
    {
      integration: "File Import",
      maturity: "IMPLEMENTED_NOT_LIVE_CERTIFIED",
      note: "Upload/document paths implemented; hosted live cert outside E12 fixture scope",
    },
    {
      integration: "Generic REST connector",
      maturity: "CONTRACT_ONLY",
      note: "E4 connector contract + adapter stubs",
    },
    {
      integration: "M365/SharePoint",
      maturity: "CONTRACT_ONLY",
      note: "Optional ENTERPRISE connector — not live-certified",
    },
    {
      integration: "Fabric",
      maturity: "CONTRACT_ONLY",
      note: "Optional data-platform adapter contract — not live-certified",
    },
    {
      integration: "SAP/EAM",
      maturity: "CONTRACT_ONLY",
      note: "Optional EAM adapter contract — not live-certified; SoR ownership external",
    },
    {
      integration: "Entra/OIDC",
      maturity: "CONTRACT_ONLY",
      note: "Identity abstraction CONTRACT_READY; live IdP not certified in E12",
    },
    {
      integration: "Copilot federation",
      maturity: "CONTRACT_ONLY",
      note: "Optional ENTERPRISE boundary; microsoftCopilotRequired=false",
    },
    {
      integration: "PI/AI/II/PC engine adapters (E9)",
      maturity: "FIXTURE_ONLY",
      note: "E9 routing/fixtures; engines retain ownership — not promoted to live adapter cert",
    },
    {
      integration: "Live register/domain executor",
      maturity: "IMPLEMENTED_NOT_LIVE_CERTIFIED",
      note: "E8 domain executor + web runtime; full hosted live cert environment-dependent",
    },
    {
      integration: "Platform workflow definitions",
      maturity: "IMPLEMENTED_NOT_LIVE_CERTIFIED",
      note: "Reuses Platform Workflow ownership; seed/docs required per deployment",
    },
    {
      integration: "Platform Memory persistence",
      maturity: "IMPLEMENTED_NOT_LIVE_CERTIFIED",
      note: "E7 reuses Platform Kernel Memory; persistence env-dependent",
    },
  ];

  const invalidPromotion = rows.some(
    (r) =>
      (r.maturity === "LIVE_CERTIFIED" &&
        /fixture|contract.?only|stub/i.test(r.note) &&
        r.integration !== "Native EOS (projects/documents/registers/Ask)") ||
      (r.maturity === "LIVE_CERTIFIED" &&
        /M365|Fabric|SAP|Copilot|Entra|Generic REST/i.test(r.integration)),
  );

  return {
    rows,
    passed: !invalidPromotion,
    disclaimer:
      "Integration maturity is honest. Fixture/contract success is never LIVE_CERTIFIED enterprise integration.",
  };
}
