export type SafeIdentityAssurance = {
  authenticated: boolean;
  currentLevel: string | null;
  nextLevel: string | null;
  aal: string | null;
  verifiedFactors: number;
};

/** Public identity-assurance contract. Never copy JWT, session, or cookie fields. */
export function toSafeIdentityAssurance(input: {
  userPresent: boolean;
  currentLevel: string | null | undefined;
  nextLevel: string | null | undefined;
  verifiedFactors: number;
}): SafeIdentityAssurance {
  const currentLevel =
    input.userPresent && typeof input.currentLevel === "string" && input.currentLevel
      ? input.currentLevel
      : null;
  const nextLevel =
    input.userPresent && typeof input.nextLevel === "string" && input.nextLevel
      ? input.nextLevel
      : null;
  return {
    authenticated: input.userPresent,
    currentLevel,
    nextLevel,
    aal: currentLevel,
    verifiedFactors: input.userPresent ? Math.max(0, Math.trunc(input.verifiedFactors)) : 0,
  };
}
