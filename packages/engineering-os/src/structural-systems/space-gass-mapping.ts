import type { D1gR1AdapterIdentity, D1gR1MappingManifest } from "@rtb/types";
import {
  D1G_R4_CONNECTOR_VERSION,
  D1G_R4_MAPPING_MANIFEST_ID,
  D1G_R4_MAPPING_MANIFEST_VERSION,
  D1G_R4_PROVIDER_ID,
  D1G_R5_API_GENERATION,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";

export const SPACE_GASS_SIGN_STATEMENTS = {
  axial: "POSITIVE_NATIVE_AXIAL_IS_COMPRESSION",
  shear: "POSITIVE_SHEAR_TRANSLATES_NODE_A_RELATIVE_TO_NODE_B_ALONG_THE_POSITIVE_LOCAL_AXIS",
  torsion: "POSITIVE_TORSION_ROTATES_NODE_A_ANTI_CLOCKWISE_RELATIVE_TO_NODE_B_VIEWED_FROM_NODE_B",
  moment: "POSITIVE_MOMENT_COMPRESSES_THE_POSITIVE_AXIS_SIDE",
  reaction: "POSITIVE_NODE_REACTION_ALONG_THE_POSITIVE_GLOBAL_AXIS",
  factorPolicy: "FACTOR_PLUS_ONE_PRESERVES_THE_DOCUMENTED_NATIVE_SIGN_AND_DOES_NOT_INVENT_A_CANONICAL_FLIP",
} as const;

export const SPACE_GASS_UNRESOLVED_MAPPING = {
  MEMBER_END_RESULT_ENDPOINT: "UNSUPPORTED_UNRESOLVED",
  REACTION_MOMENT_COMPONENTS: "UNSUPPORTED_UNRESOLVED",
  NONLINEAR_CONVERGENCE: "UNSUPPORTED_UNRESOLVED",
  DESIGN_MAJOR_MINOR_MAPPING: "REQUIRES_GOVERNED_SECTION_AXIS_MAPPING",
  OBJECT_ID_STABILITY: "UNKNOWN",
} as const;

export const SPACE_GASS_MAPPING_MANIFEST: D1gR1MappingManifest = {
  manifestId: D1G_R4_MAPPING_MANIFEST_ID,
  manifestVersion: D1G_R4_MAPPING_MANIFEST_VERSION,
  authority: "EXPLICIT_GOVERNED",
  categories: {
    MEMBER_STATION_ACTION: "MEMBER_FORCE_ACTION_EFFECT",
    SUPPORT_FORCE: "SUPPORT_REACTION",
  },
  quantities: {
    Fx: "N",
    Fy: "DESIGN_AXIS_MAPPING_UNRESOLVED",
    Fz: "DESIGN_AXIS_MAPPING_UNRESOLVED",
    Mx: "T",
    My: "DESIGN_AXIS_MAPPING_UNRESOLVED",
    Mz: "DESIGN_AXIS_MAPPING_UNRESOLVED",
  },
  signs: { Fx: 1, Fy: 1, Fz: 1, Mx: 1, My: 1, Mz: 1 },
  memberEnds: {},
  locations: { STATION: "STATION", NODE: "NODE" },
  cases: {},
  combinations: {},
  runStates: { Completed: "COMPLETED", Failed: "FAILED", Cancelled: "INVALID" },
  convergenceStates: { NOT_ESTABLISHED: "NOT_CONVERGENCE_PROOF" },
  warningCategories: { LOAD_CASES_NOT_ANALYZED: "TRANSPORT_WARNING" },
};

export function spaceGassMappingFingerprint(): string {
  return fingerprintCanonical({
    subject: "SPACE_GASS_MAPPING_MANIFEST",
    identity: { manifest: SPACE_GASS_MAPPING_MANIFEST, signs: SPACE_GASS_SIGN_STATEMENTS, unresolved: SPACE_GASS_UNRESOLVED_MAPPING },
  });
}

export function spaceGassAdapter(): D1gR1AdapterIdentity {
  return {
    adapterId: "d1g-r4-space-gass-readonly",
    adapterVersion: D1G_R4_CONNECTOR_VERSION,
    adapterSchemaVersion: "d1g-r4-1",
    providerId: D1G_R4_PROVIDER_ID,
    supportedProviderVersions: [D1G_R5_API_GENERATION],
    adapterType: "API_PROVIDER",
    capabilityManifestRef: "cap-d1g-r4-space-gass",
    mappingManifestRef: D1G_R4_MAPPING_MANIFEST_ID,
    declaredCapabilities: [
      "MODEL_METADATA",
      "NODES",
      "ANALYTICAL_ELEMENTS",
      "LOAD_CASES",
      "LOAD_COMBINATIONS",
      "MEMBER_STATION_FORCES",
      "SUPPORT_REACTIONS",
      "WARNINGS",
    ],
    requiredCapabilities: ["MEMBER_STATION_FORCES", "SUPPORT_REACTIONS"],
    status: "READ_ONLY_CONNECTOR",
    authority: "TRANSLATOR_NOT_AUTHORITY",
    provenanceRef: "prov-d1g-r4-space-gass",
  };
}

export function manifestForGovernedMaps(caseMap: Readonly<Record<string, string>>, combinationMap: Readonly<Record<string, string>>): D1gR1MappingManifest {
  return {
    ...SPACE_GASS_MAPPING_MANIFEST,
    cases: { ...caseMap },
    combinations: { ...combinationMap },
  };
}
