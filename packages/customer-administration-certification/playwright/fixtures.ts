import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { fixturesManifestPath } from "../src/lib/env.js";

export function requireFixtures() {
  const path = fixturesManifestPath();
  if (!existsSync(path)) {
    throw new Error("phase4-cert-fixtures.json missing — run pnpm provision");
  }
  return JSON.parse(readFileSync(path, "utf8")) as {
    tenantA: {
      id: string;
      users: Record<string, { email: string; jwt: string; userId?: string }>;
      workspaces: Array<{ id: string; slug: string }>;
      seatPoolId: string;
      installations: { productInstallationId: string; suspendedInstallationId?: string };
    };
    uninstallFixtures?: {
      happyPathInstallationId: string;
      happyPathTenantId: string;
      happyPathWorkspaceId: string;
      happyPathWorkspaceAssignmentId: string;
      invalidStateInstallationId: string;
      withDependenciesInstallationId: string;
      missingInstallationId: string;
    };
    tenantB: { id: string; users: Record<string, { email: string; jwt: string }> };
  };
}
