"use client";

import { useEffect, useState } from "react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import {
  resolveEngineeringDeploymentProfile,
  resolveExperienceUxDensity,
  resolveVisiblePrimaryNavIds,
} from "@/lib/engineering/experience-surfaces";
import type { DeploymentProfile, EngineeringUxDensity } from "@rtb/engineering-os/browser";

export type EngineeringCapabilitySnapshot = {
  productEntitled: boolean;
  entitledFeatureKeys: string[];
  entitledApplicationKeys: string[];
  visiblePrimaryNavIds: string[];
  profileId: DeploymentProfile;
  uxDensity: EngineeringUxDensity;
  timingMs: number | null;
  loaded: boolean;
};

const CACHE_KEY = "rtb.engineering.capability.snapshot.v3";
const CACHE_TTL_MS = 60_000;

type CachedSnapshot = {
  at: number;
  value: Omit<EngineeringCapabilitySnapshot, "loaded">;
};

function readCache(): CachedSnapshot | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedSnapshot;
    if (!parsed?.at || Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(value: Omit<EngineeringCapabilitySnapshot, "loaded">) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), value }));
  } catch {
    // ignore
  }
}

/**
 * Capability + profile metadata for experience nav.
 * Cached briefly; does not block first paint or enterprise capability discovery on ESSENTIAL.
 */
export function useEngineeringCapabilities(): EngineeringCapabilitySnapshot {
  const profileId = resolveEngineeringDeploymentProfile();
  const cached = typeof window !== "undefined" ? readCache() : null;
  const [state, setState] = useState<EngineeringCapabilitySnapshot>(() => ({
    productEntitled: cached?.value.productEntitled ?? true,
    entitledFeatureKeys: cached?.value.entitledFeatureKeys ?? [],
    entitledApplicationKeys: cached?.value.entitledApplicationKeys ?? [],
    visiblePrimaryNavIds:
      cached?.value.visiblePrimaryNavIds ??
      resolveVisiblePrimaryNavIds({
        productEntitled: true,
        entitledFeatureKeys: [],
        profileId,
      }),
    profileId: cached?.value.profileId ?? profileId,
    uxDensity: cached?.value.uxDensity ?? resolveExperienceUxDensity(profileId),
    timingMs: cached?.value.timingMs ?? null,
    loaded: Boolean(cached),
  }));

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();

    (async () => {
      try {
        const [modulesRes, snapshotRes] = await Promise.all([
          fetch("/api/engineering/modules/access"),
          fetch("/api/platform/commerce/access-snapshot"),
        ]);
        const modulesParsed = await parseApiJsonResponse<{
          modules?: Array<{ applicationKey: string; allowed: boolean }>;
        }>(modulesRes);
        const snapshotParsed = await parseApiJsonResponse<{
          aiAssistant?: { allowed?: boolean };
          productAccess?: { allowed?: boolean };
          features?: Array<{ key: string; allowed: boolean }>;
          deploymentProfile?: string;
        }>(snapshotRes);

        const entitledApplicationKeys = (
          (modulesParsed.data as { modules?: Array<{ applicationKey: string; allowed: boolean }> } | null)
            ?.modules ?? []
        )
          .filter((m) => m.allowed)
          .map((m) => m.applicationKey);

        const snap = snapshotParsed.data as {
          aiAssistant?: { allowed?: boolean };
          productAccess?: { allowed?: boolean };
          features?: Array<{ key: string; allowed: boolean }>;
          deploymentProfile?: string;
        } | null;

        const entitledFeatureKeys: string[] = [];
        if (snap?.aiAssistant?.allowed) entitledFeatureKeys.push("ai_assistant");
        for (const f of snap?.features ?? []) {
          if (f.allowed && !entitledFeatureKeys.includes(f.key)) {
            entitledFeatureKeys.push(f.key);
          }
        }

        const productEntitled = snap?.productAccess?.allowed !== false;
        const resolvedProfile = resolveEngineeringDeploymentProfile(
          snap?.deploymentProfile,
        );
        const visiblePrimaryNavIds = resolveVisiblePrimaryNavIds({
          productEntitled,
          entitledFeatureKeys,
          profileId: resolvedProfile,
        });
        const timingMs = Math.round(performance.now() - started);
        const next = {
          productEntitled,
          entitledFeatureKeys,
          entitledApplicationKeys,
          visiblePrimaryNavIds,
          profileId: resolvedProfile,
          uxDensity: resolveExperienceUxDensity(resolvedProfile),
          timingMs,
        };
        writeCache(next);
        if (!cancelled) setState({ ...next, loaded: true });
      } catch {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loaded: true }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
