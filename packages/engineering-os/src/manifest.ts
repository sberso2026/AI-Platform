/**
 * Phase 8A — Engineering OS manifests.
 * Canonical OS runtime manifest + module registry exports.
 */
export {
  ENGINEERING_MODULE_REGISTRATIONS,
  ENGINEERING_APPLICATIONS,
  EngineeringModuleRegistry,
  defaultEngineeringModuleRegistry,
  buildEngineeringOsManifest,
} from "./module-registry";

import { buildEngineeringOsManifest } from "./module-registry";

/** Canonical OperatingSystemManifest for Engineering OS (Phase 8A). */
export const ENGINEERING_OS_RUNTIME_MANIFEST = buildEngineeringOsManifest();

/**
 * Legacy plugin-shaped manifest retained for existing consumers.
 * Prefer ENGINEERING_OS_RUNTIME_MANIFEST / buildEngineeringOsManifest().
 */
export const ENGINEERING_OS_MANIFEST = {
  id: "engineering-os",
  name: ENGINEERING_OS_RUNTIME_MANIFEST.name,
  version: ENGINEERING_OS_RUNTIME_MANIFEST.version,
  description: ENGINEERING_OS_RUNTIME_MANIFEST.description,
  author: ENGINEERING_OS_RUNTIME_MANIFEST.author,
  operating_system: "engineering" as const,
  entry_point: "@rtb/engineering-os",
  permissions: ENGINEERING_OS_RUNTIME_MANIFEST.permissions ?? [],
  routes: (ENGINEERING_OS_RUNTIME_MANIFEST.routes ?? []).map((r) => ({
    path: r.path,
    component: r.component ?? "Unknown",
    title: r.title,
  })),
  navigation: (ENGINEERING_OS_RUNTIME_MANIFEST.navigation ?? []).map((n) => ({
    id: n.id,
    label: n.label,
    icon: n.icon ?? "Circle",
    path: n.path,
    group: n.group ?? "engineering",
    order: n.order ?? 99,
  })),
};

export const ENGINEERING_CAPABILITIES = [
  { key: "engineering_os", name: "Engineering OS", description: "Core Engineering Operating System" },
  {
    key: "engineering_module_host",
    name: "Engineering Module Host",
    description: "Host registered Engineering modules",
  },
  {
    key: "engineering_project_management",
    name: "Engineering Project Management",
    description: "Manage engineering projects",
  },
  {
    key: "engineering_asset_register",
    name: "Engineering Asset Register",
    description: "Asset register and hierarchy",
  },
  {
    key: "engineering_document_register",
    name: "Engineering Document Register",
    description: "Document register and versions",
  },
  {
    key: "engineering_ai_workspace",
    name: "Engineering AI Workspace",
    description: "Engineering-specific AI workspace",
  },
  { key: "engineering_search", name: "Engineering Search", description: "Cross-entity engineering search" },
  { key: "engineering_reporting", name: "Engineering Reporting", description: "Engineering report shell" },
] as const;

export const ENGINEERING_DISCIPLINES = [
  "Structural",
  "Civil",
  "Mechanical",
  "Piping",
  "Electrical",
  "Instrumentation",
  "Process",
  "Geotechnical",
  "Marine",
  "Construction",
  "Project Controls",
  "Quality",
  "HSE",
] as const;

export const ENGINEERING_TOOLS = [
  { key: "engineering_project_lookup", name: "Engineering Project Lookup", category: "engineering_check", risk: "low" },
  { key: "engineering_asset_lookup", name: "Engineering Asset Lookup", category: "engineering_check", risk: "low" },
  { key: "engineering_document_lookup", name: "Engineering Document Lookup", category: "document_search", risk: "low" },
  { key: "engineering_knowledge_lookup", name: "Engineering Knowledge Lookup", category: "document_search", risk: "low" },
  {
    key: "engineering_report_draft_placeholder",
    name: "Engineering Report Draft Placeholder",
    category: "report_generation",
    risk: "medium",
  },
] as const;

export const ENGINEERING_PROMPTS = [
  {
    key: "engineering_ai_director_system_prompt",
    name: "Engineering AI Director",
    content:
      "You are the RTB Engineering OS AI Director. Assist with engineering projects, assets, and documents. Never approve engineering decisions autonomously. Flag design, structural, and safety decisions for human review. Cite evidence where available.",
  },
  {
    key: "engineering_reviewer_prompt",
    name: "Engineering Reviewer",
    content:
      "You are an Engineering Reviewer. Assess technical outputs for completeness, risk, and review readiness. Do not issue approvals. Recommend human review for safety-critical or design decisions.",
  },
  {
    key: "engineering_document_reviewer_prompt",
    name: "Document Reviewer",
    content:
      "You are an Engineering Document Reviewer. Review document metadata, revision status, and discipline alignment. Require traceability for controlled documents.",
  },
  {
    key: "engineering_asset_engineer_prompt",
    name: "Asset Engineer",
    content:
      "You are an Asset Engineer assistant. Help with asset register queries, criticality, hierarchy, and digital twin linkage. High-criticality assets require heightened review.",
  },
  {
    key: "engineering_risk_reviewer_prompt",
    name: "Risk Reviewer",
    content:
      "You are an Engineering Risk Reviewer. Identify risks related to assets, documents, and project phases. Escalate high-risk findings for human approval.",
  },
] as const;
