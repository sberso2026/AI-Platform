"use client";

import { useEffect, useState } from "react";

export function useEngineeringWriteAccess() {
  const [canMutate, setCanMutate] = useState(false);
  const [roleSlug, setRoleSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/platform/nav-context")
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { data?: { roleSlug?: string } } | null) => {
        if (cancelled) return;
        const slug = json?.data?.roleSlug ?? null;
        setRoleSlug(slug);
        setCanMutate(slug !== "viewer");
      })
      .catch(() => {
        if (!cancelled) setCanMutate(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { canMutate, roleSlug };
}
