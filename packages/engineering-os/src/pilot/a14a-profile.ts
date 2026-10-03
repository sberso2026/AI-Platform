import { hostedAuthenticatedMalwareScannerAvailable } from "@rtb/engineering-review";

export const A14A_PILOT_PROFILE = "PROFILE_A_CORE_EOS" as const;

export const A14A_PILOT_SCOPE = {
  included: [
    "Unified Engineering Workbench",
    "My Engineering Day",
    "Engineering Work Plans",
    "Engineering Information",
    "Information Requirements",
    "company/EOS default artifact templates",
    "DOCX/XLSX/PPTX generation",
    "Office handoff",
    "Pre-Issue Review",
    "Change / Impact",
    "Option Study without uncertified numerical calculation",
    "RFI/TQ using EOS-local governed context",
    "Digital Thread",
    "human Decisions",
    "handover context",
  ],
  excluded: [
    "SharePoint live connector",
    "Aconex/EDMS live connector",
    "ACC/BIM live connector",
    "P6/planning live connector",
    "SPACE GASS / real solver execution",
    "EXAMPLE_ONLY calculation definitions for real design decisions",
    "PDF export",
    "direct company-template upload until hosted malware PASS",
    "returned binary uploads until hosted malware PASS",
  ],
} as const;

export const A14A_NAMED_PILOT_USERS = [
  "cert-er-a1@rtb-cert.test",
  "cert-er-a-admin@rtb-cert.test",
] as const;

export const A14A_KILL_SWITCH = {
  env: "EOS_CONTROLLED_PILOT_ENABLED",
  commerce: "suspend engineering-os installation",
  newInfrastructure: false,
} as const;

export function controlledPilotEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.EOS_CONTROLLED_PILOT_ENABLED !== "0";
}

export function returnedBinaryUploadsInPilot(env: NodeJS.ProcessEnv = process.env): boolean {
  return hostedAuthenticatedMalwareScannerAvailable(env);
}

export const A14A_GATE_STATES = ["PASS", "BLOCKED", "NOT_APPLICABLE", "NOT_TESTED"] as const;
export type A14AGateState = (typeof A14A_GATE_STATES)[number];

export type A14AGate = {
  category: string;
  state: A14AGateState;
  evidence: string;
  blockingCondition?: string;
  remediation?: string;
};

export const SURVEILLANCE_PROHIBITIONS = {
  keystrokeMonitoring: false,
  screenCapture: false,
  applicationUsageDuration: false,
  browserHistory: false,
  personalEmailReading: false,
  employeeRanking: false,
  productivityScoring: false,
} as const;
