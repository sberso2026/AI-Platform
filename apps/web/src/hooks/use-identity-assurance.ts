"use client";

import { useEffect, useState } from "react";

export type IdentityAssurance = {
  authenticated: boolean;
  aal: string | null;
  currentLevel: string | null;
  nextLevel: string | null;
  verifiedFactors: number;
};

export function useIdentityAssurance(): IdentityAssurance {
  const [state, setState] = useState<IdentityAssurance>({
    authenticated: false,
    aal: null,
    currentLevel: null,
    nextLevel: null,
    verifiedFactors: 0,
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/platform/identity-assurance", { credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : null))
      .then(
        (
          body: {
            authenticated?: boolean;
            aal?: string | null;
            currentLevel?: string | null;
            nextLevel?: string | null;
            verifiedFactors?: number;
          } | null,
        ) => {
          if (cancelled || !body) return;
          const currentLevel =
            typeof body.currentLevel === "string"
              ? body.currentLevel
              : typeof body.aal === "string"
                ? body.aal
                : null;
          setState({
            authenticated: body.authenticated === true,
            aal: currentLevel,
            currentLevel,
            nextLevel: typeof body.nextLevel === "string" ? body.nextLevel : null,
            verifiedFactors: Number(body.verifiedFactors ?? 0),
          });
        },
      )
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
