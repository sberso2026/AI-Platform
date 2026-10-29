export const EOS2_ROLLOUT_MODES = ["off", "controlled_pilot"] as const;

export type Eos2RolloutMode = (typeof EOS2_ROLLOUT_MODES)[number];

export type Eos2Settings = Record<string, unknown> & { eos2?: Record<string, unknown> };

export function applyEos2Mode(
  settings: unknown,
  mode: string,
): { ok: true; settings: Eos2Settings; previousMode: string | null } | { ok: false; error: "invalid_mode" } {
  if (mode !== "off" && mode !== "controlled_pilot") return { ok: false, error: "invalid_mode" };
  const base: Eos2Settings =
    settings && typeof settings === "object" && !Array.isArray(settings)
      ? { ...(settings as Record<string, unknown>) }
      : {};
  const current = base.eos2;
  const eos2 =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as Record<string, unknown>) }
      : {};
  const previous = typeof eos2.mode === "string" ? eos2.mode : null;
  return { ok: true, previousMode: previous, settings: { ...base, eos2: { ...eos2, mode } } };
}
