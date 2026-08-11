"use client";

import { useEffect, useRef } from "react";

const PERF_KEY = "rtb.engineering.experience.perf";

export type ExperiencePerfMark =
  | "home"
  | "ask"
  | "my"
  | "explore"
  | "intelligence";

/**
 * Non-blocking route timing. Records marks; never gates rendering.
 */
export function useExperiencePerf(surface: ExperiencePerfMark) {
  const started = useRef(
    typeof performance !== "undefined" ? performance.now() : 0,
  );

  useEffect(() => {
    const markName = `eos-e1-${surface}-load`;
    try {
      performance.mark(markName);
      const durationMs = Math.round(performance.now() - started.current);
      const payload = {
        surface,
        durationMs,
        at: new Date().toISOString(),
      };
      const raw = sessionStorage.getItem(PERF_KEY);
      const list = raw ? (JSON.parse(raw) as unknown[]) : [];
      const next = Array.isArray(list) ? [...list.slice(-40), payload] : [payload];
      sessionStorage.setItem(PERF_KEY, JSON.stringify(next));
      if (typeof window !== "undefined") {
        (window as unknown as { __EOS_E1_PERF__?: unknown }).__EOS_E1_PERF__ = next;
      }
    } catch {
      // Instrumentation must never throw into UI.
    }
  }, [surface]);
}

export function readExperiencePerf(): Array<{
  surface: string;
  durationMs: number;
  at: string;
}> {
  try {
    const raw = sessionStorage.getItem(PERF_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
