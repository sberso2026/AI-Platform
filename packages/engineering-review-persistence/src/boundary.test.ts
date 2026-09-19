import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = join(PKG, "../..");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe("persistence package boundary", () => {
  it("depends on domain + supabase + platform-core, not Next/React/EOS", () => {
    const pkg = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
    };
    expect(pkg.dependencies?.["@rtb/engineering-review"]).toBe("workspace:*");
    expect(pkg.dependencies?.["@supabase/supabase-js"]).toBeTruthy();
    expect(pkg.dependencies?.["@rtb/platform-core"]).toBe("workspace:*");
    expect(pkg.dependencies?.next).toBeUndefined();
    expect(pkg.dependencies?.react).toBeUndefined();
    expect(pkg.dependencies?.["@rtb/engineering-os"]).toBeUndefined();
  });

  it("is not imported by the pure domain package", () => {
    const forbidden = /from ["']@rtb\/engineering-review-persistence["']/;
    const files = walk(join(REPO, "packages/engineering-review/src")).filter((path) => path.endsWith(".ts"));
    for (const file of files) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(forbidden);
    }
  });

  it("does not create reverse domain imports from platform/EOS/PI", () => {
    const forbidden = /from ["']@rtb\/engineering-review["']/;
    for (const name of ["engineering-os", "platform-core", "platform-kernel", "platform-intelligence", "project-intelligence"]) {
      const src = join(REPO, "packages", name, "src");
      const files = walk(src).filter((path) => path.endsWith(".ts") || path.endsWith(".tsx"));
      for (const file of files) {
        expect(readFileSync(file, "utf8"), file).not.toMatch(forbidden);
      }
    }
  });
});
