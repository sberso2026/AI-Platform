/**
 * Deterministic EOS 2 → EOS 3 object mapping foundation (no migration executed).
 */

import type { Eos3ObjectImplementationStatus, Eos3ObjectType } from "./eos3-canonical-objects";
import { EOS3_OBJECT_IMPLEMENTATION_STATUS } from "./eos3-canonical-objects";

export type Eos2ToEos3MappingRow = {
  eos3Object: Eos3ObjectType;
  status: Eos3ObjectImplementationStatus;
  eos2Source: string;
  transformationNeeded: boolean;
  notes: string;
};

export const EOS2_TO_EOS3_OBJECT_MAPPING: Eos2ToEos3MappingRow[] = [
  {
    eos3Object: "Project",
    status: "EXTENDED",
    eos2Source: "engineering_projects / shared project domain",
    transformationNeeded: false,
    notes: "Add generation metadata; no rewrite of EOS 2 rows.",
  },
  {
    eos3Object: "EngineeringBasis",
    status: "EXTENDED",
    eos2Source: "engineering basis / design basis records",
    transformationNeeded: false,
    notes: "Relate to requirements/systems via typed edges.",
  },
  {
    eos3Object: "Requirement",
    status: "EXTENDED",
    eos2Source: "engineering_requirements (where present) / delivery requirements",
    transformationNeeded: true,
    notes: "Map identity + allocation; deepen systems-engineering fields.",
  },
  {
    eos3Object: "System",
    status: "EXTENDED",
    eos2Source: "engineering_systems / asset systems labels",
    transformationNeeded: true,
    notes: "First-class hierarchy + requirement allocation.",
  },
  {
    eos3Object: "DisciplineObject",
    status: "EXTENDED",
    eos2Source: "discipline delivery tables (structural/electrical/etc.)",
    transformationNeeded: true,
    notes: "Discipline-neutral envelope; preserve source ownership.",
  },
  {
    eos3Object: "Revision",
    status: "EXTENDED",
    eos2Source: "existing revision / handoff revision patterns",
    transformationNeeded: false,
    notes: "Immutability + provenance extension.",
  },
  {
    eos3Object: "Interface",
    status: "EXTENDED",
    eos2Source: "engineering_interfaces + interface handoffs",
    transformationNeeded: false,
    notes: "Preserve source/receiver authority; no AI acceptance.",
  },
  {
    eos3Object: "Change",
    status: "EXTENDED",
    eos2Source: "engineering_change_impact_cases",
    transformationNeeded: false,
    notes: "Separate Change from Impact objects.",
  },
  {
    eos3Object: "Impact",
    status: "EXTENDED",
    eos2Source: "engineering_change_candidate_impacts",
    transformationNeeded: false,
    notes: "Materiality remains human-finalized.",
  },
  {
    eos3Object: "Decision",
    status: "EXTENDED",
    eos2Source: "engineering_decisions (where present)",
    transformationNeeded: true,
    notes: "First-class decision record with human decision-maker.",
  },
  {
    eos3Object: "Assumption",
    status: "EXTENDED",
    eos2Source: "assumptions embedded in basis/reviews",
    transformationNeeded: true,
    notes: "Promote to first-class with validation/expiry.",
  },
  {
    eos3Object: "Calculation",
    status: "EXTENDED",
    eos2Source: "engineering_structural_calculations / delivery calc records",
    transformationNeeded: false,
    notes: "Qualification metadata explicit; no formula change.",
  },
  {
    eos3Object: "Review",
    status: "EXTENDED",
    eos2Source: "discipline review tables / pre-issue reviews",
    transformationNeeded: false,
    notes: "AI cannot impersonate reviewer.",
  },
  {
    eos3Object: "Evidence",
    status: "EXTENDED",
    eos2Source: "audit/provenance/document refs",
    transformationNeeded: false,
    notes: "Inference is not source evidence.",
  },
  {
    eos3Object: "Deliverable",
    status: "EXTENDED",
    eos2Source: "engineering_governed_deliverables",
    transformationNeeded: false,
    notes: "Preserve stale detection + approval/release authority.",
  },
  {
    eos3Object: "Baseline",
    status: "EXTENDED",
    eos2Source: "engineering_design_freezes / interface baseline revisions",
    transformationNeeded: false,
    notes: "Immutable historical membership.",
  },
  {
    eos3Object: "Asset",
    status: "EXTENDED",
    eos2Source: "engineering_assets / asset intelligence foundation",
    transformationNeeded: true,
    notes: "Minimal continuity foundation only.",
  },
  {
    eos3Object: "Inspection",
    status: "EXTENDED",
    eos2Source: "inspection intelligence foundation",
    transformationNeeded: true,
    notes: "Metadata foundation only; no analytics.",
  },
  {
    eos3Object: "OptimizationRun",
    status: "NEW_EOS3_OBJECT",
    eos2Source: "none",
    transformationNeeded: true,
    notes: "New EOS 3 object; result ≠ decision.",
  },
];

export function mappingDefined(): true {
  return EOS2_TO_EOS3_OBJECT_MAPPING.length === Object.keys(EOS3_OBJECT_IMPLEMENTATION_STATUS).length;
}
