export type ClaimSupport = "SUPPORTED" | "INFERRED" | "UNSUPPORTED";

export type EngineeringClaim = {
  text: string;
  kind: "numerical" | "normative" | "other";
  value?: string;
  unit?: string;
  support: ClaimSupport;
};

const UNIT = "(mm|m|kPa|MPa|lux|dB(?:\\(A\\))?|degrees|m\\/s|N|minutes?)";

export function decomposeEngineeringClaims(answer: string): EngineeringClaim[] {
  const text = answer.replace(/\s+/g, " ").trim();
  const claims: EngineeringClaim[] = [];
  const seen = new Set<string>();
  const numeric = new RegExp(`${"(\\d+(?:\\.\\d+)?)"}\\s*${UNIT}`, "gi");
  let match: RegExpExecArray | null;
  while ((match = numeric.exec(text))) {
    const key = `${match[1]}|${match[2]}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    claims.push({
      text: match[0],
      kind: "numerical",
      value: match[1],
      unit: match[2],
      support: "UNSUPPORTED",
    });
  }
  const shall = text.match(/[^.]*\b(shall|shall not|must not|must)\b[^.]+/gi) ?? [];
  for (const sentence of shall) {
    const compact = sentence.trim();
    if (!compact || claims.some((claim) => compact.includes(claim.text))) continue;
    claims.push({ text: compact, kind: "normative", support: "UNSUPPORTED" });
  }
  return claims;
}

export function verifyClaimsAgainstEvidence(
  answer: string,
  evidenceText: string,
): { claims: EngineeringClaim[]; unsupportedRequirementRate: number } {
  const hay = evidenceText.replace(/\s+/g, " ").toLowerCase();
  const claims = decomposeEngineeringClaims(answer).map((claim) => {
    if (claim.kind === "numerical" && claim.value && claim.unit) {
      const pattern = new RegExp(`${claim.value}\\s*${claim.unit.replace("/", "\\/")}`, "i");
      return { ...claim, support: pattern.test(hay) ? "SUPPORTED" as const : "UNSUPPORTED" as const };
    }
    const tokens = claim.text.toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) ?? [];
    const hits = tokens.filter((token) => hay.includes(token)).length;
    const support: ClaimSupport = hits >= Math.max(3, Math.ceil(tokens.length * 0.6))
      ? "SUPPORTED"
      : hits >= 2
        ? "INFERRED"
        : "UNSUPPORTED";
    return { ...claim, support };
  });
  const requirements = claims.filter((claim) => claim.kind === "numerical" || claim.kind === "normative");
  const unsupported = requirements.filter((claim) => claim.support === "UNSUPPORTED");
  return {
    claims,
    unsupportedRequirementRate: requirements.length === 0 ? 0 : unsupported.length / requirements.length,
  };
}

export function stripUnsupportedClaims(answer: string, evidenceText: string): string {
  const { claims } = verifyClaimsAgainstEvidence(answer, evidenceText);
  let cleaned = answer;
  for (const claim of claims) {
    if (claim.support === "UNSUPPORTED" && claim.kind === "numerical" && claim.value) {
      cleaned = cleaned.replace(new RegExp(`${claim.value}\\s*${claim.unit ?? ""}[^.]{0,80}\\.?`, "i"), "");
    }
  }
  return cleaned.replace(/\s+/g, " ").trim();
}
