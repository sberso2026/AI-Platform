"use client";

import { useEffect, useState } from "react";
import { hasEngineeringAdminAuthority } from "@/lib/commerce/engineering-admin-authority";

export function useEngineeringWriteAccess() {
  const [canMutate, setCanMutate] = useState(false);
  const [canAdministerEngineering, setCanAdministerEngineering] = useState(false);
  const [roleSlug, setRoleSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/platform/nav-context")
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { data?: { roleSlug?: string; permissions?: Array<{ resource?: string; action?: string }> } } | null) => {
        if (cancelled) return;
        const slug = json?.data?.roleSlug ?? null;
        setRoleSlug(slug);
        setCanMutate(slug !== "viewer");
        setCanAdministerEngineering(hasEngineeringAdminAuthority({
          roleSlug: slug,
          permissions: json?.data?.permissions ?? [],
        }));
      })
      .catch(() => {
        if (!cancelled) {
          setCanMutate(false);
          setCanAdministerEngineering(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { canMutate, canAdministerEngineering, roleSlug };
}
