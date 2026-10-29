"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ENGINEERING_CONTEXT_STORAGE_KEY,
  createEmptyEngineeringContext,
  parseDeepLinkContext,
  type EngineeringExperienceContext,
} from "@rtb/engineering-os/browser";
import { ENGINEERING_PROJECT_FILTER_KEY } from "@/hooks/use-engineering-project-filter";

export const ENGINEERING_CONTEXT_EVENT = "rtb:engineering-context";

function readProjectFilter(): string | null {
  try {
    const stored = sessionStorage.getItem(ENGINEERING_PROJECT_FILTER_KEY);
    if (!stored || stored === "all") return null;
    return stored;
  } catch {
    return null;
  }
}

function readStoredContext(): EngineeringExperienceContext {
  try {
    const raw = sessionStorage.getItem(ENGINEERING_CONTEXT_STORAGE_KEY);
    if (!raw) {
      return createEmptyEngineeringContext({ projectId: readProjectFilter() });
    }
    const parsed = JSON.parse(raw) as Partial<EngineeringExperienceContext>;
    return createEmptyEngineeringContext({
      ...parsed,
      projectId: parsed.projectId ?? readProjectFilter(),
    });
  } catch {
    return createEmptyEngineeringContext({ projectId: readProjectFilter() });
  }
}

function persistContext(ctx: EngineeringExperienceContext) {
  try {
    sessionStorage.setItem(ENGINEERING_CONTEXT_STORAGE_KEY, JSON.stringify(ctx));
  } catch {
    // ignore quota / private mode
  }
}

function emitContext(ctx: EngineeringExperienceContext) {
  window.dispatchEvent(
    new CustomEvent(ENGINEERING_CONTEXT_EVENT, { detail: ctx }),
  );
}

/**
 * Shared Engineering Context — experience-layer contract only.
 * Does not authorize; backend guards remain authoritative.
 */
export function useEngineeringContext(route?: string) {
  const [context, setContext] = useState<EngineeringExperienceContext>(() =>
    createEmptyEngineeringContext({ route: route ?? "/engineering" }),
  );

  const applyPatch = useCallback((patch: Partial<EngineeringExperienceContext>) => {
    setContext((prev) => {
      const next = { ...prev, ...patch };
      // Tenant/workspace must not silently swap via local patch without identity change.
      if (prev.tenantId && patch.tenantId && patch.tenantId !== prev.tenantId) {
        return createEmptyEngineeringContext({
          ...patch,
          route: patch.route ?? prev.route,
        });
      }
      if (
        prev.workspaceId &&
        patch.workspaceId &&
        patch.workspaceId !== prev.workspaceId
      ) {
        return createEmptyEngineeringContext({
          ...patch,
          tenantId: patch.tenantId ?? prev.tenantId,
          route: patch.route ?? prev.route,
        });
      }
      persistContext(next);
      emitContext(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const empty = createEmptyEngineeringContext({
      route: route ?? "/engineering",
      projectId: null,
    });
    persistContext(empty);
    emitContext(empty);
    setContext(empty);
  }, [route]);

  const initFromDeepLink = useCallback(
    (input: {
      route: string;
      searchParams?: URLSearchParams | Record<string, string | undefined> | null;
      identity?: Partial<
        Pick<
          EngineeringExperienceContext,
          "tenantId" | "workspaceId" | "userId" | "roleSlug" | "activeProfile"
        >
      >;
    }) => {
      const deep = parseDeepLinkContext({
        route: input.route,
        searchParams: input.searchParams ?? null,
      });
      applyPatch({
        ...deep,
        ...input.identity,
        sessionId:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `session-${Date.now()}`,
      });
    },
    [applyPatch],
  );

  useEffect(() => {
    const stored = readStoredContext();
    setContext((prev) => ({
      ...stored,
      route: route ?? stored.route ?? prev.route,
    }));

    const onProjectFilter = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string | null }>).detail;
      const next = detail?.projectId ?? null;
      applyPatch({
        projectId: next && next !== "all" ? next : null,
        objectType: next && next !== "all" ? "project" : null,
        objectId: next && next !== "all" ? next : null,
      });
    };
    const onContext = (event: Event) => {
      const detail = (event as CustomEvent<EngineeringExperienceContext>).detail;
      if (detail) setContext(detail);
    };
    window.addEventListener("rtb:project-filter", onProjectFilter as EventListener);
    window.addEventListener(ENGINEERING_CONTEXT_EVENT, onContext as EventListener);
    return () => {
      window.removeEventListener("rtb:project-filter", onProjectFilter as EventListener);
      window.removeEventListener(ENGINEERING_CONTEXT_EVENT, onContext as EventListener);
    };
  }, [applyPatch, route]);

  useEffect(() => {
    if (route) applyPatch({ route });
  }, [route, applyPatch]);

  return {
    context,
    setContext: applyPatch,
    reset,
    initFromDeepLink,
  };
}

export function buildAskHref(input: {
  projectId?: string | null;
  objectType?: string | null;
  objectId?: string | null;
  q?: string | null;
}): string {
  const params = new URLSearchParams();
  if (input.projectId) params.set("projectId", input.projectId);
  if (input.objectType) params.set("objectType", input.objectType);
  if (input.objectId) params.set("objectId", input.objectId);
  if (input.q) params.set("q", input.q);
  const qs = params.toString();
  return qs ? `/engineering/ask?${qs}` : "/engineering/ask";
}
