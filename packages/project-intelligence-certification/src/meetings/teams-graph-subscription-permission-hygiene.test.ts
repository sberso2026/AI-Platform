import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE,
  REQUIRED_APPLICATION_ROLES_BY_RESOURCE,
  isInvalidGenericSubscriptionRoleName,
} from "@rtb/project-intelligence";

const ROOT = resolve(process.cwd(), "../..");
const FORBIDDEN = ["Subscription.ReadWrite.All", "Subscriptions.ReadWrite.All"] as const;

const SKIP_DIR = new Set(["node_modules", ".git", ".next", "dist", "coverage", "out", ".turbo"]);

/** Files allowed to mention the forbidden names only to reject/document them. */
const ALLOWLIST = new Set([
  "packages/project-intelligence/src/meetings/teams/teams-subscription-resource-permissions.ts",
  "packages/project-intelligence/tests/teams-subscription-resource-permissions.test.ts",
  "packages/project-intelligence-certification/src/meetings/teams-graph-subscription-permission-hygiene.test.ts",
  "docs/security/PROJECT_INTELLIGENCE_TEAMS_GRAPH_PERMISSIONS.md",
]);

function walk(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx|js|mjs|cjs|yml|yaml)$/i.test(name)) acc.push(full);
  }
  return acc;
}

function rel(file: string): string {
  return file.replace(ROOT, "").replace(/\\/g, "/").replace(/^\//, "");
}

describe("Teams Graph subscription permission hygiene", () => {
  it("forbids requiring nonexistent generic subscription application roles in executable code", () => {
    const roots = [
      resolve(ROOT, "packages/project-intelligence/src"),
      resolve(ROOT, "packages/project-intelligence-certification/scripts"),
      resolve(ROOT, "packages/project-intelligence-certification/src"),
      resolve(ROOT, ".github/workflows"),
    ];
    const hits: string[] = [];
    for (const root of roots) {
      for (const file of walk(root)) {
        const relative = rel(file);
        if (ALLOWLIST.has(relative)) continue;
        const text = readFileSync(file, "utf8");
        for (const needle of FORBIDDEN) {
          if (text.includes(needle)) hits.push(`${relative} :: ${needle}`);
        }
      }
    }
    expect(hits).toEqual([]);
  });

  it("resource role map never requires invalid generic subscription roles", () => {
    for (const roles of Object.values(REQUIRED_APPLICATION_ROLES_BY_RESOURCE)) {
      for (const role of roles) {
        expect(isInvalidGenericSubscriptionRoleName(role)).toBe(false);
      }
    }
  });

  it("subscription probe uses resource-specific transcript permission path", () => {
    const probe = readFileSync(
      resolve(ROOT, "packages/project-intelligence-certification/scripts/probe-teams-live-subscription.ts"),
      "utf8",
    );
    expect(probe).toContain("CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE");
    expect(probe).toContain("tokenRolesSatisfySubscriptionResource");
    expect(probe).toMatch(/resource\s*=\s*CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE|resource,\s*$/m);
    expect(probe).not.toContain('resource: "/communications/onlineMeetings"');
    expect(CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE).toBe(
      "communications/onlineMeetings/getAllTranscripts",
    );
    for (const needle of FORBIDDEN) {
      expect(probe.includes(needle)).toBe(false);
    }
  });

  it("does not mask subscription Graph failures as admin consent", () => {
    const probe = readFileSync(
      resolve(ROOT, "packages/project-intelligence-certification/scripts/probe-teams-live-subscription.ts"),
      "utf8",
    );
    expect(probe).toContain("classification");
    expect(probe).toContain("httpStatus");
    expect(probe).toContain("graphCode");
    expect(probe).not.toMatch(/TEAMS_GRAPH_ADMIN_CONSENT_REQUIRED/);
    expect(probe).not.toMatch(/status\s*===\s*200\s*\|\|\s*status\s*===\s*403/);
  });
});

