/**
 * Phase 14B — EngineeringOSHealth aggregation (preserves component detail).
 */

export type EngineeringOSHealthStatus =
  | "healthy"
  | "degraded"
  | "partially_available"
  | "unavailable"
  | "unknown";

export interface EngineeringOSHealthComponent {
  key: string;
  label: string;
  status: EngineeringOSHealthStatus;
  limitation?: string;
}

export interface EngineeringOSHealth {
  overall: EngineeringOSHealthStatus;
  checkedAt: string;
  components: EngineeringOSHealthComponent[];
}

export interface ComponentHealthInput {
  key: string;
  label: string;
  status: EngineeringOSHealthStatus;
  limitation?: string;
  /** When true, unavailable status makes overall unavailable. */
  critical?: boolean;
}

const DEFAULT_COMPONENTS: ComponentHealthInput[] = [
  { key: "platform_dependencies", label: "Platform dependencies", status: "healthy", critical: true },
  { key: "shared_asset_domain", label: "Shared Asset Domain", status: "healthy" },
  { key: "shared_project_domain", label: "Shared Project Domain", status: "healthy" },
  { key: "shared_spatial_domain", label: "Shared Spatial Domain", status: "healthy" },
  { key: "project_intelligence", label: "Project Intelligence", status: "healthy" },
  { key: "inspection_intelligence", label: "Inspection Intelligence", status: "healthy" },
  { key: "asset_intelligence", label: "Asset Intelligence", status: "healthy" },
  { key: "project_controls", label: "Project Controls", status: "healthy" },
  { key: "digital_twin", label: "Digital Twin", status: "healthy" },
  { key: "engineering_model_interoperability", label: "Engineering Model Interoperability", status: "healthy" },
  { key: "engineering_tool_framework", label: "Engineering Tool Framework", status: "healthy" },
  { key: "controlled_execution_host", label: "Controlled Engineering Execution Host", status: "healthy" },
  { key: "ai_runtime", label: "AI Runtime", status: "healthy" },
  { key: "search", label: "Search", status: "healthy" },
  { key: "database", label: "Database", status: "healthy", critical: true },
  {
    key: "spacegass_live_execution",
    label: "SPACE GASS live execution",
    status: "unavailable",
    limitation: "blocked_external_dependency — does not make OS unhealthy",
  },
  {
    key: "etabs_live_execution",
    label: "ETABS live execution",
    status: "unavailable",
    limitation: "not_certified — does not make OS unhealthy",
  },
];

export function aggregateEngineeringOSHealth(
  overrides: Partial<Record<string, ComponentHealthInput>> = {},
): EngineeringOSHealth {
  const components: EngineeringOSHealthComponent[] = DEFAULT_COMPONENTS.map((c) => {
    const o = overrides[c.key];
    return {
      key: c.key,
      label: o?.label ?? c.label,
      status: o?.status ?? c.status,
      limitation: o?.limitation ?? c.limitation,
    };
  });

  const criticalUnavailable = DEFAULT_COMPONENTS.some(
    (c) =>
      c.critical &&
      (overrides[c.key]?.status ?? c.status) === "unavailable",
  );
  const anyUnavailableCriticalError = criticalUnavailable;

  const nonOptional = components.filter(
    (c) =>
      c.key !== "spacegass_live_execution" && c.key !== "etabs_live_execution",
  );

  let overall: EngineeringOSHealthStatus = "healthy";
  if (anyUnavailableCriticalError) {
    overall = "unavailable";
  } else if (nonOptional.some((c) => c.status === "unavailable")) {
    overall = "partially_available";
  } else if (nonOptional.some((c) => c.status === "degraded" || c.status === "unknown")) {
    overall = "degraded";
  } else if (nonOptional.some((c) => c.status === "partially_available")) {
    overall = "partially_available";
  }

  return {
    overall,
    checkedAt: new Date().toISOString(),
    components,
  };
}
