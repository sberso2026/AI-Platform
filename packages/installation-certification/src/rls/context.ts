import { beforeAll } from "vitest";

import {
  isCertificationMode,
  requireFixturesManifest,
  type CertFixturesManifest,
} from "../lib/env.js";
import { createAuthedClient } from "../lib/supabase.js";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface RlsContext {
  manifest: CertFixturesManifest;
  tenantA: CertFixturesManifest["tenantA"];
  tenantB: CertFixturesManifest["tenantB"];
  clients: {
    tenantA: {
      owner: SupabaseClient;
      admin: SupabaseClient;
      engineer: SupabaseClient;
      viewer: SupabaseClient;
    };
    tenantB: {
      owner: SupabaseClient;
    };
  };
}

let ctx: RlsContext | null = null;

export function useRlsContext(): RlsContext {
  if (!ctx) {
    throw new Error("RLS context not initialised");
  }
  return ctx;
}

export function initRlsSuite(): void {
  if (isCertificationMode() && !loadManifestSafe()) {
    throw new Error("INSTALLATION_CERTIFICATION=1: artifacts/cert-fixtures.json required");
  }

  beforeAll(() => {
    if (!isCertificationMode() && !loadManifestSafe()) return;

    const manifest = requireFixturesManifest();
    ctx = {
      manifest,
      tenantA: manifest.tenantA,
      tenantB: manifest.tenantB,
      clients: {
        tenantA: {
          owner: createAuthedClient(manifest.tenantA.users.owner.jwt),
          admin: createAuthedClient(manifest.tenantA.users.admin.jwt),
          engineer: createAuthedClient(manifest.tenantA.users.engineer.jwt),
          viewer: createAuthedClient(manifest.tenantA.users.viewer.jwt),
        },
        tenantB: {
          owner: createAuthedClient(manifest.tenantB.users.owner.jwt),
        },
      },
    };
  });
}

function loadManifestSafe() {
  try {
    return requireFixturesManifest();
  } catch {
    return null;
  }
}

export function skipUnlessRlsReady(): boolean {
  if (isCertificationMode()) return false;
  return !(
    process.env.SUPABASE_TEST_URL &&
    process.env.SUPABASE_TEST_ANON_KEY &&
    loadManifestSafe()
  );
}
