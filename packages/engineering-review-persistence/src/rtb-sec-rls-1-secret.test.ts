import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SKIP = new Set(["node_modules", "dist", ".next", "coverage", ".git"]);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (SKIP.has(entry)) return [];
      return walk(path);
    }
    if (!/\.(ts|tsx|js|mjs|jsx)$/i.test(entry)) return [];
    return [path];
  });
}

describe("RTB-SEC-RLS-1 service credential exposure", () => {
  it("does not bind service_role to NEXT_PUBLIC or browser supabase config", () => {
    const files = [
      ...walk(resolve(root, "apps/web/src")),
      resolve(root, "apps/web/src/lib/supabase/public-config.ts"),
    ];
    const findings: string[] = [];
    for (const file of files) {
      let text = "";
      try {
        text = readFileSync(file, "utf8");
      } catch {
        continue;
      }
      const rel = relative(root, file).replace(/\\/g, "/");
      if (/NEXT_PUBLIC_[A-Z0-9_]*SERVICE_ROLE/.test(text)) {
        findings.push(`${rel}:NEXT_PUBLIC_SERVICE_ROLE`);
      }
      if (rel.includes("/lib/supabase/public-config.ts") && /SERVICE_ROLE/.test(text)) {
        findings.push(`${rel}:public_config_service_role`);
      }
    }
    expect(findings, findings.join("\n")).toEqual([]);
  });
});
