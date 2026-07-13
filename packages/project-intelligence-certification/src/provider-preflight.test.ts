import { describe, expect, it } from "vitest";
import {
  checkCertificationPreflight,
  resolveEmbeddingSecretRouting,
  providerSecretPresence,
} from "./provider-preflight.js";

describe("provider preflight secret resolution", () => {
  it("fails when embedding secrets are missing under provider certification", () => {
    const errors = checkCertificationPreflight({
      NEXT_PUBLIC_SUPABASE_URL: "https://wcydlhqiqdwgoaqrlget.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SUPABASE_SERVICE_ROLE_KEY: "service",
      PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF: "wcydlhqiqdwgoaqrlget",
      PROJECT_INTELLIGENCE_CERTIFICATION_TARGET: "hosted_staging",
      PI_PROVIDER_CERTIFICATION: "1",
      PLATFORM_EMBEDDING_ALLOW_STAGING_HASH: "0",
    });
    expect(errors.some((error) => error.includes("PLATFORM_EMBEDDING_API_KEY or OPENAI_API_KEY"))).toBe(true);
  });

  it("fails ambiguous dual-key routing without PLATFORM_EMBEDDING_PROVIDER", () => {
    const routing = resolveEmbeddingSecretRouting({
      PLATFORM_EMBEDDING_API_KEY: "platform-key",
      OPENAI_API_KEY: "openai-key",
      PLATFORM_EMBEDDING_MODEL: "text-embedding-3-small",
    });
    expect(routing.errors.some((error) => error.includes("ambiguous"))).toBe(true);
  });

  it("resolves OPENAI_API_KEY to openai with default endpoint", () => {
    const routing = resolveEmbeddingSecretRouting({
      OPENAI_API_KEY: "openai-key",
      PLATFORM_EMBEDDING_PROVIDER: "openai",
      PLATFORM_EMBEDDING_MODEL: "text-embedding-3-small",
    });
    expect(routing.errors).toEqual([]);
    expect(routing.provider).toBe("openai");
    expect(routing.credentialSource).toBe("OPENAI_API_KEY");
    expect(routing.model).toBe("text-embedding-3-small");
    expect(routing.baseUrl).toBe("https://api.openai.com/v1");
  });

  it("requires Azure secrets when PI_REQUIRE_AZURE_DI=1", () => {
    const errors = checkCertificationPreflight({
      NEXT_PUBLIC_SUPABASE_URL: "https://wcydlhqiqdwgoaqrlget.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SUPABASE_SERVICE_ROLE_KEY: "service",
      PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF: "wcydlhqiqdwgoaqrlget",
      PROJECT_INTELLIGENCE_CERTIFICATION_TARGET: "hosted_staging",
      PI_PROVIDER_CERTIFICATION: "1",
      OPENAI_API_KEY: "openai-key",
      PLATFORM_EMBEDDING_PROVIDER: "openai",
      PLATFORM_EMBEDDING_ALLOW_STAGING_HASH: "0",
      PI_REQUIRE_AZURE_DI: "1",
    });
    expect(errors).toContain("missing secret: AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT");
    expect(errors).toContain("missing secret: AZURE_DOCUMENT_INTELLIGENCE_KEY");
  });

  it("reports presence flags without values", () => {
    const presence = providerSecretPresence({
      OPENAI_API_KEY: "x",
      AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: "https://example.cognitiveservices.azure.com",
    });
    expect(presence.OPENAI_API_KEY).toBe(true);
    expect(presence.PLATFORM_EMBEDDING_API_KEY).toBe(false);
    expect(presence.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT).toBe(true);
    expect(presence.AZURE_DOCUMENT_INTELLIGENCE_KEY).toBe(false);
  });
});
