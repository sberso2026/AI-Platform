import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "../../lifecycle-intelligence/fixture";
import { A11A_SYSTEM_ID } from "../fixture";
import { createConfiguredKnowledgeContext } from "../../structural-domain/binding";
import { assembleDesignBasis, provenanceOf } from "./compose";
import type { GovernedStructuralInput, StructuralDesignBasis, StructuralDesignStandard, StructuralWorkKind } from "./types";

export const STRUCTURAL_FIXTURE_CLASSIFICATION = "SYNTHETIC_DEMONSTRATION_DATA" as const;
export const STRUCTURAL_FIXTURE_NOT_REAL_PROJECT_DESIGN = true;

const PROVENANCE = {
  sourceType: "ENGINEER_PROVIDED_FIXTURE",
  classification: "SYNTHETIC_DEMONSTRATION_DATA" as const,
};

function input(partial: GovernedStructuralInput): GovernedStructuralInput {
  return partial;
}

export function crusherStructuralStandards(): StructuralDesignStandard[] {
  return [
    {
      identifier: "AS 4100",
      editionYear: "2020",
      source: "project_design_basis_fixture",
      projectApplicability: "CONFIGURED",
      status: "GOVERNED",
      engineState: "NOT_IMPLEMENTED",
      certificationState: "NOT_CERTIFIED",
      context: createConfiguredKnowledgeContext({
        contextId: "ctx-crusher-as4100-knowledge",
        jurisdictionProfileRef: "australia",
        standardFamily: "AS",
        standardCode: "AS 4100",
        edition: "2020",
        materialScope: "steel",
      }),
    },
    {
      identifier: "AS/NZS 1170.0",
      editionYear: "2002",
      source: "project_design_basis_fixture",
      projectApplicability: "CONFIGURED",
      status: "GOVERNED",
      engineState: "NOT_IMPLEMENTED",
      certificationState: "NOT_CERTIFIED",
      context: createConfiguredKnowledgeContext({
        contextId: "ctx-crusher-asnzs1170-knowledge",
        jurisdictionProfileRef: "australia",
        standardFamily: "AS/NZS",
        standardCode: "AS/NZS 1170.0",
        edition: "2002",
        materialScope: "actions",
      }),
    },
  ];
}

export function crusherStructuralInputs(options?: { omitMaterialGrade?: boolean; omitSpan?: boolean; omitDeadLoad?: boolean }): GovernedStructuralInput[] {
  const gradeMissing = options?.omitMaterialGrade === true;
  const spanMissing = options?.omitSpan === true;
  const deadMissing = options?.omitDeadLoad === true;
  return [
    input({
      key: "geometry.span",
      inputClass: "GEOMETRY",
      label: "Simply supported span",
      value: spanMissing ? null : 8,
      unit: "m",
      required: true,
      status: spanMissing ? "MISSING" : "GOVERNED",
      missingCode: spanMissing ? "GEOMETRY_REQUIRED" : null,
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "fix-span-ss-beam",
        title: "Crusher support beam span (synthetic fixture)",
        revision: "A",
        status: spanMissing ? "MISSING" : "GOVERNED",
      }),
    }),
    input({
      key: "geometry.section",
      inputClass: "GEOMETRY",
      label: "Member section",
      value: "310UB40.4",
      unit: null,
      required: true,
      status: "GOVERNED",
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "fix-section-310ub",
        title: "Governed section designation",
        revision: "A",
      }),
    }),
    input({
      key: "geometry.unitMass",
      inputClass: "GEOMETRY",
      label: "Published unit mass",
      value: 40.4,
      unit: "kg/m",
      required: false,
      status: "GOVERNED",
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "asi-ub-310x165x40",
        title: "ASI UB 310x165x40 published unit mass",
        revision: "catalog",
      }),
    }),
    input({
      key: "material.grade",
      inputClass: "MATERIAL",
      label: "Steel grade",
      value: gradeMissing ? null : "300PLUS",
      unit: null,
      required: true,
      status: gradeMissing ? "MISSING" : "GOVERNED",
      missingCode: gradeMissing ? "MATERIAL_GRADE_REQUIRED" : null,
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "fix-grade-300",
        title: "Project-configured steel grade",
        revision: "A",
        status: gradeMissing ? "MISSING" : "GOVERNED",
      }),
    }),
    input({
      key: "load.dead.udl",
      inputClass: "LOAD",
      loadClass: "DEAD",
      label: "Dead UDL",
      value: deadMissing ? null : 10,
      unit: "kN/m",
      direction: "gravity",
      loadCase: "G",
      required: true,
      status: deadMissing ? "MISSING" : "GOVERNED",
      missingCode: deadMissing ? "LOAD_REQUIRED" : null,
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "fix-load-g",
        title: "Governed dead load UDL",
        revision: "A",
        status: deadMissing ? "MISSING" : "GOVERNED",
      }),
    }),
    input({
      key: "load.live.udl",
      inputClass: "LOAD",
      loadClass: "LIVE",
      label: "Live UDL",
      value: 5,
      unit: "kN/m",
      direction: "gravity",
      loadCase: "Q",
      required: true,
      status: "GOVERNED",
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "fix-load-q",
        title: "Governed live load UDL",
        revision: "A",
      }),
    }),
    input({
      key: "load.wind",
      inputClass: "LOAD",
      loadClass: "WIND",
      label: "Wind load",
      value: null,
      unit: "kN",
      required: false,
      status: "MISSING",
      missingCode: "WIND_LOAD_REQUIRED",
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "wind-absent",
        title: "Wind load not supplied",
        revision: null,
        status: "MISSING",
      }),
    }),
    input({
      key: "load.seismic",
      inputClass: "LOAD",
      loadClass: "SEISMIC",
      label: "Seismic input",
      value: null,
      unit: null,
      required: false,
      status: "MISSING",
      missingCode: "SEISMIC_INPUT_REQUIRED",
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "seismic-absent",
        title: "Seismic input not supplied",
        revision: null,
        status: "MISSING",
      }),
    }),
    input({
      key: "combination.name",
      inputClass: "LOAD_COMBINATION",
      label: "Strength combination name",
      value: "1.2G + 1.5Q",
      unit: null,
      required: true,
      status: "GOVERNED",
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "fix-combo-str",
        title: "Engineer-defined combination set (synthetic fixture)",
        revision: "A",
      }),
    }),
    input({
      key: "combination.dead.factor",
      inputClass: "LOAD_COMBINATION",
      label: "Dead factor",
      value: 1.2,
      unit: null,
      required: true,
      status: "GOVERNED",
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "fix-combo-str",
        title: "Engineer-defined combination set (synthetic fixture)",
        revision: "A",
      }),
    }),
    input({
      key: "combination.live.factor",
      inputClass: "LOAD_COMBINATION",
      label: "Live factor",
      value: 1.5,
      unit: null,
      required: true,
      status: "GOVERNED",
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "fix-combo-str",
        title: "Engineer-defined combination set (synthetic fixture)",
        revision: "A",
      }),
    }),
    input({
      key: "capacity.moment",
      inputClass: "CAPACITY",
      label: "Engineer-entered design moment capacity",
      value: 200,
      unit: "kN.m",
      required: false,
      status: "GOVERNED",
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "fix-capacity-engineer",
        title: "Engineer-entered capacity (not an AS 4100 EOS equation)",
        revision: "A",
      }),
    }),
    input({
      key: "geotech.bearing",
      inputClass: "GEOTECHNICAL",
      label: "Allowable bearing pressure",
      value: null,
      unit: "kPa",
      required: false,
      status: "MISSING",
      missingCode: "GEOTECHNICAL_INPUT_REQUIRED",
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "geo-absent",
        title: "Geotechnical input not supplied",
        revision: null,
        status: "MISSING",
      }),
    }),
    input({
      key: "connection.geometry",
      inputClass: "GEOMETRY",
      label: "Connection geometry",
      value: null,
      unit: null,
      required: false,
      status: "MISSING",
      missingCode: "CONNECTION_GEOMETRY_REQUIRED",
      provenance: provenanceOf({
        ...PROVENANCE,
        sourceId: "conn-absent",
        title: "Connection detailing not supplied",
        revision: null,
        status: "MISSING",
      }),
    }),
  ];
}

export function crusherStructuralDesignBasis(options?: {
  workKind?: StructuralWorkKind;
  omitMaterialGrade?: boolean;
  omitSpan?: boolean;
  omitDeadLoad?: boolean;
  projectId?: string;
}): StructuralDesignBasis {
  return assembleDesignBasis({
    workKind: options?.workKind ?? "STRUCTURAL_MEMBER_CHECK",
    projectId: options?.projectId ?? CRUSHER_EXPANSION_FEED_PROJECT_ID,
    systemId: A11A_SYSTEM_ID,
    lifecycleStage: "FEED",
    structuralSystem: "Crusher support simply-supported beam (synthetic)",
    standards: crusherStructuralStandards(),
    inputs: crusherStructuralInputs(options),
  });
}

export const STRUCTURAL_FIXTURE_EXPECTED_DEMAND = {
  udlKNpm: 19.5,
  spanM: 8,
  shearKN: 78,
  momentKNm: 156,
  capacityKNm: 200,
  utilization: 0.78,
} as const;
