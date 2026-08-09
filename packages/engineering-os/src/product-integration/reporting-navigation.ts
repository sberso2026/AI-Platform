/**
 * Phase 14B — reporting entry routing (no universal reporting engine).
 */

export interface EngineeringReportRoute {
  moduleKey: string;
  label: string;
  href: string;
}

export const ENGINEERING_OS_REPORT_ROUTES: EngineeringReportRoute[] = [
  {
    moduleKey: "project_intelligence",
    label: "Project Intelligence reports",
    href: "/engineering/apps/project-intelligence/reports",
  },
  {
    moduleKey: "inspection_intelligence",
    label: "Inspection Intelligence release / reports",
    href: "/engineering/apps/inspection-intelligence/release",
  },
  {
    moduleKey: "asset_intelligence",
    label: "Asset Intelligence profiles",
    href: "/engineering/apps/asset-intelligence",
  },
  {
    moduleKey: "project_controls",
    label: "Project Controls reports",
    href: "/engineering/apps/project-controls",
  },
  {
    moduleKey: "digital_twin",
    label: "Digital Twin simulation artifacts",
    href: "/engineering/apps/digital-twin",
  },
  {
    moduleKey: "engineering_model_interoperability",
    label: "Engineering model federation status",
    href: "/engineering/apps/model-interoperability",
  },
];

export function listEntitledReportRoutes(
  entitledModules: ReadonlySet<string> | string[],
): EngineeringReportRoute[] {
  const set =
    entitledModules instanceof Set
      ? entitledModules
      : new Set(entitledModules);
  return ENGINEERING_OS_REPORT_ROUTES.filter(
    (r) => set.has(r.moduleKey) || set.has("*"),
  );
}
