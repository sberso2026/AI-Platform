"use client";

import { useIdentityAssurance } from "@/hooks/use-identity-assurance";

/** Staging/certification identity-assurance indicator. No tokens or TOTP. */
export function IdentityAssuranceReadout() {
  const assurance = useIdentityAssurance();
  if (!assurance.authenticated || !assurance.currentLevel) return null;
  return (
    <p
      className="mt-1 text-xs text-[color:var(--eos-muted)]"
      data-testid="identity-assurance-level"
      data-current-level={assurance.currentLevel}
      data-next-level={assurance.nextLevel ?? ""}
      data-verified-factors={String(assurance.verifiedFactors)}
    >
      Identity assurance: {assurance.currentLevel.toUpperCase()}
    </p>
  );
}
