export const ENGINEERING_OS_MANIFEST = {
  id: "engineering-os",
  name: "Engineering OS",
  version: "0.2.1",
  description:
    "Engineering Operating System Core — shared foundation for engineering projects, assets, documents, and AI workspace",
  author: "RTB Engineering",
  operating_system: "engineering" as const,
  entry_point: "@rtb/engineering-os",
  permissions: [
    { resource: "engineering", action: "admin" },
    { resource: "engineering", action: "read" },
    { resource: "engineering", action: "execute" },
    { resource: "ai_agent", action: "execute" },
    { resource: "knowledge", action: "execute" },
    { resource: "digital_twin", action: "execute" },
  ],
  routes: [
    { path: "/engineering", component: "EngineeringDashboard", title: "Engineering Dashboard" },
    { path: "/engineering/projects", component: "EngineeringProjects", title: "Projects" },
    { path: "/engineering/assets", component: "EngineeringAssets", title: "Assets" },
    { path: "/engineering/documents", component: "EngineeringDocuments", title: "Documents" },
    { path: "/engineering/ai", component: "EngineeringAI", title: "AI Workspace" },
    { path: "/engineering/search", component: "EngineeringSearch", title: "Search" },
    { path: "/engineering/reports", component: "EngineeringReports", title: "Reports" },
    { path: "/engineering/settings", component: "EngineeringSettings", title: "Settings" },
  ],
  navigation: [
    { id: "eng-dashboard", label: "Dashboard", icon: "LayoutDashboard", path: "/engineering", group: "engineering", order: 1 },
    { id: "eng-projects", label: "Projects", icon: "FolderKanban", path: "/engineering/projects", group: "engineering", order: 2 },
    { id: "eng-assets", label: "Assets", icon: "Boxes", path: "/engineering/assets", group: "engineering", order: 3 },
    { id: "eng-documents", label: "Documents", icon: "FileText", path: "/engineering/documents", group: "engineering", order: 4 },
    { id: "eng-ai", label: "AI Workspace", icon: "Brain", path: "/engineering/ai", group: "engineering", order: 5 },
    { id: "eng-search", label: "Search", icon: "Search", path: "/engineering/search", group: "engineering", order: 6 },
    { id: "eng-reports", label: "Reports", icon: "ClipboardList", path: "/engineering/reports", group: "engineering", order: 7 },
    { id: "eng-disciplines", label: "Disciplines", icon: "Layers", path: "/engineering/disciplines", group: "engineering", order: 8 },
    { id: "eng-companies", label: "Companies", icon: "Building2", path: "/engineering/companies", group: "engineering", order: 9 },
    { id: "eng-settings", label: "Settings", icon: "Settings", path: "/engineering/settings", group: "engineering", order: 10 },
  ],
};

export const ENGINEERING_APPLICATIONS = [
  {
    app_key: "project_intelligence",
    name: "Project Intelligence",
    description: "Engineering project analytics and decision support",
    version: "0.0.0",
    status: "registered",
    enabled: false,
    required_capabilities: ["engineering_project_management"],
    required_permissions: ["engineering.view", "engineering.ai.use"],
    routes: ["/engineering/apps/project-intelligence"],
  },
  {
    app_key: "inspection_intelligence",
    name: "Inspection Intelligence",
    description: "Inspection planning and findings management",
    version: "0.0.0",
    status: "registered",
    enabled: false,
    required_capabilities: ["engineering_asset_register"],
    required_permissions: ["engineering.view", "engineering.ai.use"],
    routes: ["/engineering/apps/inspection-intelligence"],
  },
  {
    app_key: "project_controls",
    name: "Project Controls",
    description: "Cost, schedule, and progress controls",
    version: "0.0.0",
    status: "registered",
    enabled: false,
    required_capabilities: ["engineering_project_management"],
    required_permissions: ["engineering.view"],
    routes: ["/engineering/apps/project-controls"],
  },
  {
    app_key: "document_intelligence",
    name: "Document Intelligence",
    description: "Engineering document review and RAG",
    version: "0.0.0",
    status: "registered",
    enabled: false,
    required_capabilities: ["engineering_document_register"],
    required_permissions: ["engineering.document.upload", "engineering.document.review"],
    routes: ["/engineering/apps/document-intelligence"],
  },
  {
    app_key: "meeting_intelligence",
    name: "Meeting Intelligence",
    description: "Engineering meeting capture and action tracking",
    version: "0.0.0",
    status: "registered",
    enabled: false,
    required_capabilities: ["engineering_ai_workspace"],
    required_permissions: ["engineering.ai.use"],
    routes: ["/engineering/apps/meeting-intelligence"],
  },
  {
    app_key: "structural_intelligence",
    name: "Structural Intelligence",
    description: "Structural design review and calculation checks",
    version: "0.0.0",
    status: "registered",
    enabled: false,
    required_capabilities: ["engineering_ai_workspace"],
    required_permissions: ["engineering.ai.use"],
    routes: ["/engineering/apps/structural-intelligence"],
  },
  {
    app_key: "standards_intelligence",
    name: "Standards Intelligence",
    description: "Standards and specification compliance",
    version: "0.0.0",
    status: "registered",
    enabled: false,
    required_capabilities: ["engineering_document_register"],
    required_permissions: ["engineering.view"],
    routes: ["/engineering/apps/standards-intelligence"],
  },
  {
    app_key: "engineering_reports",
    name: "Engineering Reports",
    description: "Engineering report generation and registers",
    version: "0.0.0",
    status: "registered",
    enabled: false,
    required_capabilities: ["engineering_reporting"],
    required_permissions: ["engineering.report.create"],
    routes: ["/engineering/reports"],
  },
] as const;

export const ENGINEERING_CAPABILITIES = [
  { key: "engineering_os", name: "Engineering OS", description: "Core Engineering Operating System" },
  { key: "engineering_project_management", name: "Engineering Project Management", description: "Manage engineering projects" },
  { key: "engineering_asset_register", name: "Engineering Asset Register", description: "Asset register and hierarchy" },
  { key: "engineering_document_register", name: "Engineering Document Register", description: "Document register and versions" },
  { key: "engineering_ai_workspace", name: "Engineering AI Workspace", description: "Engineering-specific AI workspace" },
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
  { key: "engineering_report_draft_placeholder", name: "Engineering Report Draft Placeholder", category: "report_generation", risk: "medium" },
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
