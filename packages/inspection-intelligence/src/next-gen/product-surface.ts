/**
 * II-0 operational surface contract. Surfaces are defined, not implemented.
 */
export const INSPECTION_INTELLIGENCE_NEXT_GEN_SURFACES = [
  {
    id: "inspection_command_centre",
    title: "Inspection Command Centre",
    implementedInIi0: false,
    canonicalBasis: "compose existing inspection sessions/condition/defects; PI Command Centre pattern only",
  },
  {
    id: "inspection_planning",
    title: "Inspection Planning",
    implementedInIi0: false,
    implementedInIi2: true,
    canonicalBasis: "inspection_plans / inspection_templates",
  },
  {
    id: "inspection_execution",
    title: "Inspection Execution",
    implementedInIi0: false,
    implementedInIi2: true,
    canonicalBasis: "inspection_sessions / inspection_assignments",
  },
  {
    id: "observations_findings",
    title: "Observations / Findings",
    implementedInIi0: false,
    implementedInIi2: true,
    canonicalBasis:
      "inspection_observations and inspection_defects — must not duplicate Project Intelligence findings",
  },
  {
    id: "defect_intelligence",
    title: "Defect Intelligence",
    implementedInIi0: false,
    canonicalBasis: "inspection_defects",
  },
  {
    id: "condition_assessment",
    title: "Condition Assessment",
    implementedInIi0: false,
    canonicalBasis: "inspection_condition_ratings",
  },
  {
    id: "evidence_photos",
    title: "Evidence / Photos",
    implementedInIi0: false,
    implementedInIi2: true,
    canonicalBasis: "inspection_evidence via Platform Files",
  },
  {
    id: "remediation",
    title: "Remediation",
    implementedInIi0: false,
    canonicalBasis:
      "inspection corrective-action process state; link Engineering Core actions when enterprise tracking is required",
  },
  {
    id: "inspection_history",
    title: "Inspection History",
    implementedInIi0: false,
    canonicalBasis: "inspection_sessions / inspection_events",
  },
  {
    id: "inspection_reporting",
    title: "Inspection Reporting",
    implementedInIi0: false,
    canonicalBasis: "inspection reporting preparation/snapshots; PI snapshot pattern only",
  },
  {
    id: "ai_inspection_engineer",
    title: "AI Inspection Engineer",
    implementedInIi0: false,
    canonicalBasis: "advisory Platform AI Director / prompt-registry pattern; no private AI stack",
  },
] as const;

export const INSPECTION_FINDINGS_ARE_NOT_PI_FINDINGS = true as const;
export const INSPECTION_REMEDIATION_LINKS_CORE_ACTIONS_WHEN_REQUIRED = true as const;
