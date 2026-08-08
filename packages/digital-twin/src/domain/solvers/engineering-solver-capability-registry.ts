/**
 * Phase 12J — EngineeringSolverCapabilityRegistry.
 *
 * Multi-provider CAPABILITY registry only. Does NOT implement additional solver
 * execution. CalculiX linear_elastic_static remains the sole certified real path.
 * Capability registration ≠ method ≠ provider ≠ application ≠ execution.
 */

import { LINEAR_ELASTIC_STATIC_METHOD_KEY } from "./solver-mappers";
import {
  CALCULIX_ADAPTER_ID,
  CALCULIX_ADAPTER_VERSION,
  CALCULIX_SOLVER_ID,
} from "./calculix-adapter";

export const SOLVER_CAPABILITY_REGISTRY_VERSION = "1.0.0-solver-capabilities" as const;

export const CAPABILITY_QUALIFICATION_STATUSES = [
  "draft",
  "registered",
  "reserved",
  "not_qualified",
  "qualified",
  "revoked",
] as const;

export type CapabilityQualificationStatus =
  (typeof CAPABILITY_QUALIFICATION_STATUSES)[number];

export const ENGINEERING_DISCIPLINES = [
  "structural",
  "thermal",
  "fluid",
  "multiphysics",
  "geotechnical",
  "other",
] as const;

export type EngineeringDiscipline = (typeof ENGINEERING_DISCIPLINES)[number];

export const ANALYSIS_CATEGORIES = [
  "linear_static",
  "modal",
  "buckling",
  "thermal",
  "contact",
  "nonlinear",
  "cfd",
  "optimization",
  "other",
] as const;

export type AnalysisCategory = (typeof ANALYSIS_CATEGORIES)[number];

export type CapabilityIoClass = {
  classId: string;
  direction: "input" | "output";
  description: string;
};

export type CapabilityCertificationHistoryEntry = {
  at: string;
  status: CapabilityQualificationStatus;
  note: string;
  phaseRef?: string;
  methodKeyRef?: string;
};

export type EngineeringSolverCapability = {
  capabilityId: string;
  solverId: string;
  capabilityKey: string;
  displayName: string;
  discipline: EngineeringDiscipline;
  analysisCategory: AnalysisCategory;
  unitSystem: "SI" | "US" | "mixed" | "unspecified";
  limitations: string[];
  assumptions: string[];
  validationStatus: CapabilityQualificationStatus;
  qualificationStatus: CapabilityQualificationStatus;
  /** Capability qualification NEVER implies whole-solver qualification. */
  impliesWholeSolverQualification: false;
  /** Auto-execution / auto-qualification forbidden. */
  autoExecuteAllowed: false;
  autoQualifyAllowed: false;
  certificationHistory: CapabilityCertificationHistoryEntry[];
  inputClasses: CapabilityIoClass[];
  outputClasses: CapabilityIoClass[];
  /** Link to 12I method when this is the certified CalculiX path. */
  certifiedMethodKey?: typeof LINEAR_ELASTIC_STATIC_METHOD_KEY | string;
  adapterId?: string;
  notes: string;
};

export type EngineeringSolverCapabilityVersion = {
  capabilityVersionId: string;
  capabilityId: string;
  version: string;
  status: CapabilityQualificationStatus;
  registeredAt: string;
  notes: string;
};

type RegistryState = {
  capabilities: Map<string, EngineeringSolverCapability>;
  versions: Map<string, EngineeringSolverCapabilityVersion>;
};

function createEmptyState(): RegistryState {
  return { capabilities: new Map(), versions: new Map() };
}

export class EngineeringSolverCapabilityRegistry {
  private readonly state: RegistryState;

  constructor(seed = true) {
    this.state = createEmptyState();
    if (seed) {
      seedDefaultCapabilities(this);
    }
  }

  registerCapability(capability: EngineeringSolverCapability): EngineeringSolverCapability {
    if (capability.impliesWholeSolverQualification !== false) {
      throw new Error("capability_must_not_imply_whole_solver_qualification");
    }
    if (capability.autoExecuteAllowed !== false || capability.autoQualifyAllowed !== false) {
      throw new Error("capability_auto_execute_or_qualify_forbidden");
    }
    this.state.capabilities.set(capability.capabilityId, capability);
    return capability;
  }

  registerVersion(
    version: EngineeringSolverCapabilityVersion,
  ): EngineeringSolverCapabilityVersion {
    if (!this.state.capabilities.has(version.capabilityId)) {
      throw new Error(`capability_not_registered:${version.capabilityId}`);
    }
    this.state.versions.set(version.capabilityVersionId, version);
    return version;
  }

  getCapability(capabilityId: string): EngineeringSolverCapability | undefined {
    return this.state.capabilities.get(capabilityId);
  }

  listCapabilities(filter?: {
    solverId?: string;
    qualificationStatus?: CapabilityQualificationStatus;
  }): EngineeringSolverCapability[] {
    let items = [...this.state.capabilities.values()];
    if (filter?.solverId) {
      items = items.filter((c) => c.solverId === filter.solverId);
    }
    if (filter?.qualificationStatus) {
      items = items.filter((c) => c.qualificationStatus === filter.qualificationStatus);
    }
    return items;
  }

  listVersions(capabilityId?: string): EngineeringSolverCapabilityVersion[] {
    const items = [...this.state.versions.values()];
    return capabilityId ? items.filter((v) => v.capabilityId === capabilityId) : items;
  }

  /** Query only — never executes a solver. */
  findByMethodKey(methodKey: string): EngineeringSolverCapability[] {
    return this.listCapabilities().filter((c) => c.certifiedMethodKey === methodKey);
  }
}

export const CALCULIX_LINEAR_STATIC_CAPABILITY_ID =
  "calculix.linear_elastic_static" as const;
export const CALCULIX_MODAL_CAPABILITY_ID = "calculix.modal" as const;
export const CALCULIX_BUCKLING_CAPABILITY_ID = "calculix.buckling" as const;
export const CALCULIX_THERMAL_CAPABILITY_ID = "calculix.thermal" as const;
export const CALCULIX_CONTACT_CAPABILITY_ID = "calculix.contact" as const;

const RESERVED_SOLVER_IDS = [
  "abaqus",
  "ansys",
  "opensees",
  "openfoam",
  "sap2000",
  "etabs",
  "staad",
  "spacegass",
] as const;

function reservedCapability(
  solverId: string,
  key: string,
  category: AnalysisCategory,
  discipline: EngineeringDiscipline,
): EngineeringSolverCapability {
  return {
    capabilityId: `${solverId}.${key}`,
    solverId,
    capabilityKey: key,
    displayName: `${solverId} ${key} (reserved)`,
    discipline,
    analysisCategory: category,
    unitSystem: "unspecified",
    limitations: ["Reserved adapter — not implemented; not qualified; not executable."],
    assumptions: [],
    validationStatus: "reserved",
    qualificationStatus: "reserved",
    impliesWholeSolverQualification: false,
    autoExecuteAllowed: false,
    autoQualifyAllowed: false,
    certificationHistory: [
      {
        at: "2026-08-08T00:00:00.000Z",
        status: "reserved",
        note: "Phase 12J seed — reserved provider adapter capability.",
        phaseRef: "12J",
      },
    ],
    inputClasses: [],
    outputClasses: [],
    notes: "Reserved — no execution path in Phase 12J.",
  };
}

function seedDefaultCapabilities(registry: EngineeringSolverCapabilityRegistry): void {
  const now = "2026-08-08T00:00:00.000Z";

  registry.registerCapability({
    capabilityId: CALCULIX_LINEAR_STATIC_CAPABILITY_ID,
    solverId: CALCULIX_SOLVER_ID,
    capabilityKey: "linear_elastic_static",
    displayName: "CalculiX linear elastic static",
    discipline: "structural",
    analysisCategory: "linear_static",
    unitSystem: "SI",
    limitations: [
      "Linear elastic static structural only",
      "Does not qualify other CalculiX analysis types",
      "Does not qualify CalculiX as a whole solver",
    ],
    assumptions: [
      "Small displacement linear elasticity",
      "SI units (N, m, Pa)",
      "Defaults manifest fail-closed",
    ],
    validationStatus: "qualified",
    qualificationStatus: "qualified",
    impliesWholeSolverQualification: false,
    autoExecuteAllowed: false,
    autoQualifyAllowed: false,
    certificationHistory: [
      {
        at: now,
        status: "qualified",
        note: "Linked to Phase 12I certified method linear_elastic_static.",
        phaseRef: "12I",
        methodKeyRef: LINEAR_ELASTIC_STATIC_METHOD_KEY,
      },
    ],
    inputClasses: [
      {
        classId: "linear_elastic_static_input",
        direction: "input",
        description: "Mapped linear elastic static structural input",
      },
    ],
    outputClasses: [
      {
        classId: "linear_elastic_static_output",
        direction: "output",
        description: "Mapped displacement/stress summary",
      },
    ],
    certifiedMethodKey: LINEAR_ELASTIC_STATIC_METHOD_KEY,
    adapterId: CALCULIX_ADAPTER_ID,
    notes: "Sole certified real execution capability — CalculiX via 12I adapter.",
  });

  registry.registerVersion({
    capabilityVersionId: `${CALCULIX_LINEAR_STATIC_CAPABILITY_ID}@1.0.0`,
    capabilityId: CALCULIX_LINEAR_STATIC_CAPABILITY_ID,
    version: "1.0.0",
    status: "qualified",
    registeredAt: now,
    notes: `Adapter ${CALCULIX_ADAPTER_ID}@${CALCULIX_ADAPTER_VERSION}`,
  });

  for (const [id, key, category] of [
    [CALCULIX_MODAL_CAPABILITY_ID, "modal", "modal"],
    [CALCULIX_BUCKLING_CAPABILITY_ID, "buckling", "buckling"],
    [CALCULIX_THERMAL_CAPABILITY_ID, "thermal", "thermal"],
    [CALCULIX_CONTACT_CAPABILITY_ID, "contact", "contact"],
  ] as const) {
    registry.registerCapability({
      capabilityId: id,
      solverId: CALCULIX_SOLVER_ID,
      capabilityKey: key,
      displayName: `CalculiX ${key}`,
      discipline: category === "thermal" ? "thermal" : "structural",
      analysisCategory: category,
      unitSystem: "SI",
      limitations: ["Reserved/not_qualified — no execution path in 12J."],
      assumptions: [],
      validationStatus: "not_qualified",
      qualificationStatus: "reserved",
      impliesWholeSolverQualification: false,
      autoExecuteAllowed: false,
      autoQualifyAllowed: false,
      certificationHistory: [
        {
          at: now,
          status: "reserved",
          note: "Phase 12J seed — CalculiX capability reserved/not_qualified.",
          phaseRef: "12J",
        },
      ],
      inputClasses: [],
      outputClasses: [],
      adapterId: CALCULIX_ADAPTER_ID,
      notes: "Reserved — do not auto-qualify or execute.",
    });
    registry.registerVersion({
      capabilityVersionId: `${id}@0.0.0-reserved`,
      capabilityId: id,
      version: "0.0.0-reserved",
      status: "reserved",
      registeredAt: now,
      notes: "Reserved seed version",
    });
  }

  for (const solverId of RESERVED_SOLVER_IDS) {
    const cap = reservedCapability(solverId, "adapter", "other", "other");
    registry.registerCapability(cap);
    registry.registerVersion({
      capabilityVersionId: `${cap.capabilityId}@0.0.0-reserved`,
      capabilityId: cap.capabilityId,
      version: "0.0.0-reserved",
      status: "reserved",
      registeredAt: now,
      notes: "Reserved provider adapter — no execution",
    });
  }
}

export function createEngineeringSolverCapabilityRegistry(
  seed = true,
): EngineeringSolverCapabilityRegistry {
  return new EngineeringSolverCapabilityRegistry(seed);
}

export function assertOnlyCalculiXLinearStaticQualified(
  registry: EngineeringSolverCapabilityRegistry,
): { ok: true; qualifiedCount: number } {
  const qualified = registry
    .listCapabilities()
    .filter((c) => c.qualificationStatus === "qualified");
  if (qualified.length !== 1) {
    throw new Error(`expected_exactly_one_qualified_capability:${qualified.length}`);
  }
  if (qualified[0].capabilityId !== CALCULIX_LINEAR_STATIC_CAPABILITY_ID) {
    throw new Error(`unexpected_qualified_capability:${qualified[0].capabilityId}`);
  }
  if (qualified[0].impliesWholeSolverQualification !== false) {
    throw new Error("qualified_capability_must_not_imply_whole_solver");
  }
  return { ok: true, qualifiedCount: 1 };
}
