export const AU_EU_TENSION_IMPLEMENTATION_REVIEW = [
  { component: "nominalTensionForceN / toAreaM2 / toStressPa", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reuse structural-steel/mechanics; do not duplicate in US adapter" },
  { component: "gross-section axial yield and net-section fracture physics", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "same stress×area mechanics as AU/EU; US labels remain mechanics-reference" },
  { component: "area and unit handling", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "common converters" },
  { component: "demand/capacity ratio support", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "orchestrateSteelDesignCheck utilization; not labelled AISC utilization" },
  { component: "AU_TENSION_* method IDs and AS 4100 φNt authority", classification: "JURISDICTION_SPECIFIC", action: "not copied into US adapter" },
  { component: "EU_TENSION_* method IDs, National Annex, NDP, γM0", classification: "JURISDICTION_SPECIFIC", action: "not copied into US adapter" },
  { component: "AISC LRFD φ / ASD Ω / shear-lag U / hole deduction", classification: "JURISDICTION_SPECIFIC", action: "registered FRAMEWORK_ONLY; values not guessed" },
  { component: "engineering-rule authority and fail-closed provenance", classification: "REQUIRES_GENERALIZATION", action: "reuse D1D-0 / US-1 contracts" },
  { component: "AU/EU compression, bending, shear, interaction", classification: "NOT_RELEVANT", action: "out of US-2 scope" },
] as const;
