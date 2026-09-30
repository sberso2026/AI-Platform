"use client";

import { useEffect, useState } from "react";

export type IdentityAssurance = {
  authenticated: boolean;
  aal: string | null;
  verifiedFactors: number;
};

export function useIdentityAssurance(): IdentityAssurance {
  const [state, setState] = useState<IdentityAssurance>({
    authenticated: false,
    aal: null,
    verifiedFactors: 0,
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/platform/identity-assurance", { credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: IdentityAssurance | null) => {
        if (cancelled || !body) return;
        setState({
          authenticated: body.authenticated === true,
          aal: typeof body.aal === "string" ? body.aal : null,
          verifiedFactors: Number(body.verifiedFactors ?? 0),
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
