import type { D1dCanonicalCapabilityRow, D1dCapabilityCell } from "@rtb/types";
import { D1D_GLOBAL_RELEASE_CLASSIFICATION } from "@rtb/types";

const RELEASE = D1D_GLOBAL_RELEASE_CLASSIFICATION;

function cell(patch: Partial<D1dCapabilityCell> & Pick<D1dCapabilityCell, "limitation">): D1dCapabilityCell {
  return {
    implemented: false,
    frameworkOnly: false,
    numericallyValidated: false,
    engineerValidated: false,
    codeProfileImplemented: false,
    conformanceValidated: false,
    certified: false,
    releaseState: RELEASE,
    ...patch,
  };
}

const none = (limitation: string) => cell({ limitation });
const mechanics = (limitation: string) => cell({ implemented: true, numericallyValidated: true, limitation });
const framework = (limitation: string) => cell({ frameworkOnly: true, limitation });
const orchestrated = (limitation: string) => cell({ implemented: true, limitation });
const globalMech = (limitation: string) => cell({ implemented: true, numericallyValidated: true, limitation });

export const D1D_CANONICAL_CAPABILITY_MATRIX: readonly D1dCanonicalCapabilityRow[] = [
  {
    capability: "Structural domain model",
    GLOBAL: cell({ implemented: true, limitation: "D1A objects; not a design engine" }),
    AU: cell({ implemented: true, limitation: "reuses global domain" }),
    EU: cell({ implemented: true, limitation: "reuses global domain" }),
    US: cell({ implemented: true, limitation: "reuses global domain" }),
  },
  {
    capability: "Standards binding",
    GLOBAL: cell({ implemented: true, limitation: "D1B bind invariant; edition may remain unknown" }),
    AU: cell({ implemented: true, limitation: "AS 4100 profile; edition UNKNOWN_PENDING_CONFIRMATION" }),
    EU: cell({ implemented: true, limitation: "EN 1993 family/part/annex/NDP architecture; values not populated" }),
    US: cell({ implemented: true, limitation: "AISC + building-code adoption architecture; datasets not populated" }),
  },
  {
    capability: "Bounded statics",
    GLOBAL: cell({ implemented: true, limitation: "D1C first-order demand; not general FEA" }),
    AU: cell({ implemented: true, limitation: "D1C demand reused" }),
    EU: cell({ implemented: true, limitation: "D1C demand reused; no parallel EN combination engine" }),
    US: cell({ implemented: true, limitation: "D1C demand reused; no parallel ASCE combination engine" }),
  },
  {
    capability: "Tension mechanics",
    GLOBAL: globalMech("shared stress×area; not code tension strength"),
    AU: mechanics("fyAg/fuAn mechanics; not AS 4100 φNt"),
    EU: mechanics("fyAg/fuAn mechanics; not EN 1993 Nt,Rd"),
    US: mechanics("FyAg/FuAn mechanics; not AISC Pn"),
  },
  {
    capability: "Compression mechanics",
    GLOBAL: globalMech("shared squash yield; not code compression strength"),
    AU: mechanics("squash fyA; not AS 4100 Nc"),
    EU: mechanics("squash fyA; not EN 1993 Nb,Rd"),
    US: mechanics("squash FyA; not AISC Pn"),
  },
  {
    capability: "Euler buckling",
    GLOBAL: globalMech("shared Euler Pcr; not code member compression"),
    AU: mechanics("Euler Pcr is not AS 4100 member compression"),
    EU: mechanics("Euler Pcr is not EN 1993 member compression"),
    US: mechanics("Euler Pcr is not AISC member compression"),
  },
  {
    capability: "Bending mechanics",
    GLOBAL: globalMech("shared elastic My=fS; not code flexural strength"),
    AU: mechanics("elastic My; not AS 4100 Ms/Mb"),
    EU: mechanics("elastic My; not EN 1993 Mc,Rd"),
    US: mechanics("elastic My; not AISC Mn"),
  },
  {
    capability: "Elastic LTB",
    GLOBAL: globalMech("shared uniform-moment Mcr; no Cb/αm/χLT"),
    AU: mechanics("elastic Mcr is not AS 4100 Mb"),
    EU: mechanics("elastic Mcr is not EN 1993 Mb,Rd"),
    US: mechanics("elastic Mcr is not AISC Mn"),
  },
  {
    capability: "Shear mechanics",
    GLOBAL: globalMech("shared von Mises Vy; not code shear strength"),
    AU: mechanics("von Mises yield; not AS 4100 Vv"),
    EU: mechanics("von Mises yield; not EN 1993 Vpl,Rd"),
    US: mechanics("von Mises yield; not AISC Vn"),
  },
  {
    capability: "Elastic shear buckling",
    GLOBAL: globalMech("shared elastic plate buckling; kv explicit"),
    AU: mechanics("elastic plate buckling; not AS 4100 web design"),
    EU: mechanics("elastic plate buckling; not EN 1993-1-5"),
    US: mechanics("elastic plate buckling; not AISC web strength"),
  },
  {
    capability: "Section classification framework",
    GLOBAL: framework("classification is jurisdiction-specific; not in common mechanics"),
    AU: framework("AS 4100 classification not implemented"),
    EU: framework("EN 1993 classification not implemented"),
    US: framework("AISC compact/noncompact/slender not implemented"),
  },
  {
    capability: "Local buckling framework",
    GLOBAL: framework("local buckling is jurisdiction-specific"),
    AU: framework("AS 4100 local buckling not implemented"),
    EU: framework("EN 1993 local buckling not implemented"),
    US: framework("AISC local buckling not implemented"),
  },
  {
    capability: "Web stability framework",
    GLOBAL: framework("elastic plate mechanics exist; code web rules do not"),
    AU: framework("AS 4100 web slenderness not implemented"),
    EU: framework("EN 1993-1-5 web rules not implemented"),
    US: framework("AISC web stability / tension field not implemented"),
  },
  {
    capability: "Combined-action framework",
    GLOBAL: framework("detection only; component ratios informational"),
    AU: framework("IMPLEMENTED_INTERACTION_METHODS = NONE"),
    EU: framework("IMPLEMENTED_EU_INTERACTION_METHODS = NONE"),
    US: framework("IMPLEMENTED_US_INTERACTION_METHODS = NONE"),
  },
  {
    capability: "Serviceability orchestration",
    GLOBAL: orchestrated("governed criterion required; no default L/n"),
    AU: orchestrated("D1C deflection reused"),
    EU: orchestrated("D1C deflection reused; Annex/NDP fail-closed"),
    US: orchestrated("D1C deflection reused; building-code/direct-contract fail-closed"),
  },
  {
    capability: "Member orchestration",
    GLOBAL: orchestrated("common completeness/invalidation/approval separation"),
    AU: orchestrated("mechanics complete ≠ AS 4100 complete"),
    EU: orchestrated("mechanics complete ≠ EN 1993 complete"),
    US: orchestrated("mechanics complete ≠ AISC complete; four-layer model"),
  },
  {
    capability: "Optimization handoff",
    GLOBAL: orchestrated("undetermined cannot be accepted; deterministic recheck required"),
    AU: orchestrated("AU optimizer rejects CHECK_UNDETERMINED"),
    EU: orchestrated("EU optimizer rejects CHECK_UNDETERMINED"),
    US: orchestrated("US optimizer rejects CHECK_UNDETERMINED"),
  },
  {
    capability: "AU adapter",
    GLOBAL: none("AU adapter is jurisdiction-specific"),
    AU: cell({ implemented: true, limitation: "bounded mechanics + orchestration; pack uncertified" }),
    EU: none("AU adapter not used for Eurocode"),
    US: none("AU adapter not used for AISC"),
  },
  {
    capability: "EU adapter",
    GLOBAL: none("EU adapter is jurisdiction-specific"),
    AU: none("EU adapter not used for AS 4100"),
    EU: cell({ implemented: false, frameworkOnly: true, limitation: "ready; implemented=false; bounded mechanics exist; pack uncertified" }),
    US: none("EU adapter not used for AISC"),
  },
  {
    capability: "US adapter",
    GLOBAL: none("US adapter is jurisdiction-specific"),
    AU: none("US adapter not used for AS 4100"),
    EU: none("US adapter not used for Eurocode"),
    US: cell({ implemented: false, frameworkOnly: true, limitation: "ready; implemented=false; bounded mechanics exist; pack uncertified" }),
  },
  {
    capability: "Connection design",
    GLOBAL: none("connection objects may exist in D1A; design engines are not D1D"),
    AU: none("AU connection design not validated"),
    EU: none("EN 1993-1-8 not in member scope"),
    US: none("AISC 360/358 connection design not validated"),
  },
  {
    capability: "Seismic steel design",
    GLOBAL: none("seismic steel not a D1D member capability"),
    AU: none("not validated"),
    EU: none("EN 1998 not a member design engine"),
    US: none("AISC 341 not validated"),
  },
  {
    capability: "General FEA",
    GLOBAL: none("GENERAL_FEA_CAPABILITY_CLAIMED = NO; D1C remains bounded"),
    AU: none("not claimed"),
    EU: none("not claimed"),
    US: none("not claimed"),
  },
  {
    capability: "Code conformance",
    GLOBAL: none("no jurisdiction is CONFORMANCE_VALIDATED"),
    AU: none("AS4100_CONFORMANCE_VALIDATED = NO"),
    EU: none("Eurocode conformance not validated"),
    US: none("AISC conformance not validated"),
  },
  {
    capability: "Professional approval",
    GLOBAL: none("numerical/conformance/certification ≠ project approval"),
    AU: none("human review required; not approved"),
    EU: none("human review required; not approved"),
    US: none("human review required; not approved"),
  },
];
