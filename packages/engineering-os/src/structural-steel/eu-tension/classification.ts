export const AU_TENSION_IMPLEMENTATION_REVIEW = [
  { component: "nominalTensionForceN / toAreaM2 / toStressPa", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "generalized into structural-steel/mechanics" },
  { component: "AU_TENSION_GROSS_YIELD / AU_TENSION_NET_FRACTURE method IDs", classification: "AU_SPECIFIC", action: "not copied into EU adapter" },
  { component: "AS 4100 intended profile and AU national-annex-not-applicable", classification: "AU_SPECIFIC", action: "not reused as EU rules" },
  { component: "AUST300 catalog identity checks", classification: "AU_SPECIFIC", action: "EU rejects AUST300 as default" },
  { component: "engineering-rule authority and fail-closed property provenance", classification: "REQUIRES_GENERALIZATION", action: "reused as global D1D-0 contracts" },
  { component: "AU compression/bending/shear/interaction", classification: "NOT_RELEVANT", action: "out of EU-2 scope" },
] as const;
