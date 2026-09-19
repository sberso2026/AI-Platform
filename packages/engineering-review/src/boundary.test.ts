import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe("package boundary", () => {
  it("has no runtime workspace or UI/HTTP/database dependencies", () => {
    const pkg = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
      name: string;
    };
    expect(pkg.name).toBe("@rtb/engineering-review");
    expect(pkg.dependencies ?? {}).toEqual({});
    expect(pkg.peerDependencies ?? {}).toEqual({});
  });

  it("does not import Next.js, React, Supabase, EOS, or platform packages", () => {
    const forbidden =
      /from ["'](next|react|react-dom|@supabase\/|@rtb\/engineering-os|@rtb\/platform-core|@rtb\/platform-kernel|@rtb\/platform-intelligence|@rtb\/project-intelligence|@rtb\/database|@rtb\/ui)["']/;
    const files = walk(join(PKG_ROOT, "src")).filter((path) => path.endsWith(".ts"));
    for (const file of files) {
      const body = readFileSync(file, "utf8");
      expect(body, file).not.toMatch(forbidden);
    }
  });
});
