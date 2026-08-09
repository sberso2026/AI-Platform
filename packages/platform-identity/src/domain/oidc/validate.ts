/**
 * OIDC ID token + auth-code defense validation (production path).
 * Uses Node crypto; certification fixtures use controlled keys — not fabricated live Entra tenants.
 */
import { createHash, createHmac, createPublicKey, createVerify, randomBytes, timingSafeEqual } from "node:crypto";

export type OidcValidationInput = {
  idToken: string;
  expectedIssuer: string;
  expectedAudience: string | string[];
  expectedNonce: string;
  state: string;
  expectedState: string;
  jwks: Array<{ kid?: string; kty: string; alg?: string; k?: string; n?: string; e?: string }>;
  nowMs?: number;
  authorizedAlgs?: string[];
  maxClockSkewSec?: number;
};

export type OidcValidationOk = {
  ok: true;
  claims: Record<string, unknown>;
  header: { alg: string; kid?: string; typ?: string };
};

export type OidcValidationFail = {
  ok: false;
  reason:
    | "issuer_invalid"
    | "audience_invalid"
    | "signature_invalid"
    | "token_expired"
    | "nonce_invalid"
    | "state_invalid"
    | "jwks_unavailable"
    | "algorithm_invalid"
    | "malformed_token"
    | "replay";
};

function b64urlJson(part: string): unknown {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return JSON.parse(Buffer.from(padded + pad, "base64").toString("utf8"));
}

function b64urlToBuf(part: string): Buffer {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64");
}

export function generatePkcePair() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function generateStateNonce() {
  return {
    state: randomBytes(16).toString("base64url"),
    nonce: randomBytes(16).toString("base64url"),
  };
}

export function validateRedirectUri(
  candidate: string,
  allowList: string[],
): boolean {
  if (!candidate || candidate.includes("://") === false) return false;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "https:" && u.hostname !== "localhost") return false;
    return allowList.some((a) => a === candidate);
  } catch {
    return false;
  }
}

export function validateOidcIdToken(input: OidcValidationInput): OidcValidationOk | OidcValidationFail {
  const authorizedAlgs = input.authorizedAlgs ?? ["RS256", "HS256"];
  const skew = input.maxClockSkewSec ?? 60;
  const nowSec = Math.floor((input.nowMs ?? Date.now()) / 1000);

  if (!input.state || !input.expectedState || input.state !== input.expectedState) {
    return { ok: false, reason: "state_invalid" };
  }
  if (!input.jwks || input.jwks.length === 0) {
    return { ok: false, reason: "jwks_unavailable" };
  }

  const parts = input.idToken.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed_token" };

  let header: { alg: string; kid?: string; typ?: string };
  let claims: Record<string, unknown>;
  try {
    header = b64urlJson(parts[0]!) as { alg: string; kid?: string; typ?: string };
    claims = b64urlJson(parts[1]!) as Record<string, unknown>;
  } catch {
    return { ok: false, reason: "malformed_token" };
  }

  if (!authorizedAlgs.includes(header.alg)) {
    return { ok: false, reason: "algorithm_invalid" };
  }

  const signingInput = `${parts[0]}.${parts[1]}`;
  const sig = b64urlToBuf(parts[2]!);
  const key =
    (header.kid ? input.jwks.find((j) => j.kid === header.kid) : undefined) ??
    input.jwks[0];
  if (!key) return { ok: false, reason: "jwks_unavailable" };

  let signatureOk = false;
  try {
    if (header.alg === "HS256") {
      if (!key.k) return { ok: false, reason: "jwks_unavailable" };
      const expected = createHmac("sha256", Buffer.from(key.k, "base64url"))
        .update(signingInput)
        .digest();
      signatureOk =
        expected.length === sig.length && timingSafeEqual(expected, sig);
    } else if (header.alg === "RS256") {
      if (!key.n || !key.e) return { ok: false, reason: "jwks_unavailable" };
      const pub = createPublicKey({
        key: {
          kty: "RSA",
          n: key.n,
          e: key.e,
        },
        format: "jwk",
      });
      const verifier = createVerify("RSA-SHA256");
      verifier.update(signingInput);
      signatureOk = verifier.verify(pub, sig);
    } else {
      return { ok: false, reason: "algorithm_invalid" };
    }
  } catch {
    return { ok: false, reason: "signature_invalid" };
  }
  if (!signatureOk) return { ok: false, reason: "signature_invalid" };

  if (claims.iss !== input.expectedIssuer) {
    return { ok: false, reason: "issuer_invalid" };
  }

  const aud = claims.aud;
  const expected = Array.isArray(input.expectedAudience)
    ? input.expectedAudience
    : [input.expectedAudience];
  const audList = Array.isArray(aud) ? aud : [aud];
  if (!audList.some((a) => typeof a === "string" && expected.includes(a))) {
    return { ok: false, reason: "audience_invalid" };
  }

  const exp = typeof claims.exp === "number" ? claims.exp : NaN;
  if (!Number.isFinite(exp) || exp + skew < nowSec) {
    return { ok: false, reason: "token_expired" };
  }

  if (claims.nonce !== input.expectedNonce) {
    return { ok: false, reason: "nonce_invalid" };
  }

  return { ok: true, claims, header };
}

/** Sign HS256 ID token for controlled certification fixtures only. */
export function signHs256IdToken(
  claims: Record<string, unknown>,
  secretBase64Url: string,
  kid = "fixture-1",
): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT", kid }),
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signingInput = `${header}.${body}`;
  const sig = createHmac("sha256", Buffer.from(secretBase64Url, "base64url"))
    .update(signingInput)
    .digest("base64url");
  return `${signingInput}.${sig}`;
}
