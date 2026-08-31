import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)));

function read(abs: string): string {
  return readFileSync(abs, "utf8");
}

describe("browser/client Engineering OS boundary", () => {
  it("does not import node:crypto or the package barrel", () => {
    const source = read(join(root, "browser.ts"));
    expect(source).not.toMatch(/node:crypto/);
    expect(source).not.toMatch(/from ["']\.\/index["']/);
    expect(source).not.toMatch(/phase-e6\/invocation/);
    expect(source).not.toMatch(/services\/grounded-ask/);
  });

  it("leaf modules reachable from browser.ts do not use node:crypto", () => {
    const visited = new Set<string>();
    const queue = [join(root, "browser.ts")];
    while (queue.length) {
      const abs = queue.pop()!;
      if (visited.has(abs)) continue;
      visited.add(abs);
      const source = read(abs);
      expect(source, relative(root, abs)).not.toMatch(/from ["']node:crypto["']/);
      expect(source, relative(root, abs)).not.toMatch(/from ["']crypto["']/);
      for (const match of source.matchAll(/from ["'](\.[^"']+)["']/g)) {
        const spec = match[1]!;
        const withoutExt = spec.replace(/\.(ts|js)$/, "");
        const candidates = [`${withoutExt}.ts`, `${withoutExt}.tsx`, join(withoutExt, "index.ts")];
        for (const candidate of candidates) {
          const next = resolve(dirname(abs), candidate);
          if (existsSync(next) && !visited.has(next)) queue.push(next);
        }
      }
    }
    expect(visited.size).toBeGreaterThan(1);
  });

  it("exports catalog and experience helpers from leaf modules", () => {
    const source = read(join(root, "browser.ts"));
    expect(source).toContain("./phase-e9/catalog");
    expect(source).toContain("./phase-e1/contracts");
    expect(source).toContain("./phase-e11/adoption");
  });
});
