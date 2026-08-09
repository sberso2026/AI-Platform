import { describe, expect, it } from "vitest";
import {
  SECURITY_ASSURANCE_VERSION,
  SECURITY_ASSURANCE_STATUS,
  SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION,
  SECURITY_ASSURANCE_RELEASE_TAG,
  SecurityAssurancePublicContractsFrozen,
  SecurityAssuranceManifestFrozen,
  SecurityAssuranceV1GaCertified,
  SecurityAssuranceV1Frozen,
  productionSecurityAssuranceReady,
  PHASE_15H_BASELINE_COMMIT,
  SECURITY_ASSURANCE_V1_SEMANTICS,
} from "./version";
import {
  S07ExternalPenTestComplete,
  S08CustomerSsoProductionReady,
} from "./customer-assurance-flags";
import { CustomerTrustCenterImplemented } from "./discovery-flags";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

describe("Phase 15I Security & Assurance V1.0 GA", () => {
  it("declares 1.0.0 ga freeze on Phase 15H baseline", () => {
    expect(SECURITY_ASSURANCE_VERSION).toBe("1.0.0");
    expect(SECURITY_ASSURANCE_STATUS).toBe("ga");
    expect(SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION).toBe("1.0.0");
    expect(SECURITY_ASSURANCE_RELEASE_TAG).toBe("security-assurance-v1.0.0");
    expect(PHASE_15H_BASELINE_COMMIT).toBe(
      "e1d2d72170c3fa47bc2dddcd13b596890387666f",
    );
  });

  it("sets production GA freeze flags", () => {
    expect(SecurityAssuranceV1GaCertified).toBe(true);
    expect(SecurityAssuranceV1Frozen).toBe(true);
    expect(SecurityAssurancePublicContractsFrozen).toBe(true);
    expect(SecurityAssuranceManifestFrozen).toBe(true);
    expect(productionSecurityAssuranceReady).toBe(true);
  });

  it("preserves Tier-1 and Trust Center boundaries", () => {
    expect(S07ExternalPenTestComplete).toBe(false);
    expect(S08CustomerSsoProductionReady).toBe(true);
    expect(CustomerTrustCenterImplemented).toBe(false);
    expect(SECURITY_ASSURANCE_V1_SEMANTICS.universalSecurityScorePresent).toBe(
      false,
    );
  });

  it("ships frozen manifest and public contracts doc", () => {
    const manifest = resolve(
      root,
      "packages/security-assurance/manifest/security-assurance-module-manifest.json",
    );
    expect(existsSync(manifest)).toBe(true);
    const json = JSON.parse(readFileSync(manifest, "utf8"));
    expect(json.version).toBe("1.0.0");
    expect(json.status).toBe("ga");
    expect(json.moduleRegistryDriftDetected).toBe(false);
    expect(
      existsSync(
        resolve(root, "docs/security/SECURITY_ASSURANCE_V1_PUBLIC_CONTRACTS.md"),
      ),
    ).toBe(true);
  });
});
