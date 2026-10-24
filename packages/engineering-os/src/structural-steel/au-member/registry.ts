export const AU_MEMBER_IMPLEMENTATION_VERSION = "au-member-1.0.0" as const;
export const AU_MEMBER_TOOL_REF = "EOS_AU_STEEL_MEMBER_DESIGN" as const;

export const AU_MEMBER_UNSUPPORTED_METHODS = {
  AS4100_SERVICEABILITY_LIMITS: "VALIDATION_REQUIRED",
  DEFAULT_LN: false,
  VIBRATION: false,
  CONNECTIONS: false,
  FATIGUE: false,
  FIRE: false,
  SEISMIC: false,
  TORSION: false,
  GENERAL_FEA: false,
} as const;
