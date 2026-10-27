import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_ROOT = resolve(__dirname, "../../");
const REPO_ROOT = resolve(WEB_ROOT, "../..");

function read(rel: string) {
  return readFileSync(resolve(REPO_ROOT, rel), "utf8");
}

describe("engineering surface result-package asset", () => {
  it("loads the fixture through the server bundle for both engineering routes", () => {
    const layout = read("apps/web/src/app/(platform)/engineering/layout.tsx");
    const page = read("apps/web/src/app/(platform)/engineering/page.tsx");
    const pilot = read("apps/web/src/app/(platform)/engineering/pilot/page.tsx");
    const kernel = read("apps/web/src/lib/kernel.ts");
    const loader = read("packages/engineering-os/src/structural-systems/d1g-validation-route-execution.ts");
    const nextConfig = read("apps/web/next.config.ts");
    const errorPage = read("apps/web/src/app/(platform)/engineering/error.tsx");
    expect(layout).toContain("getAuthContext");
    expect(page).toContain("engineering-os-shell");
    expect(pilot).toContain("pilot-feedback-form");
    expect(kernel).toContain('from "@rtb/engineering-os"');
    expect(loader).toContain("STRUCTURAL_RESULT_PACKAGE_EXAMPLE_BASE64");
    expect(loader).not.toContain("vercel/path0");
    expect(nextConfig).toContain("STRUCTURAL_RESULT_PACKAGE_EXAMPLE_BASE64");
    expect(nextConfig).toContain("eos-structural-result-package-v1.example.json");
    expect(nextConfig).not.toContain("structuralExampleTrace");
    expect(errorPage).not.toContain("error.message");
    expect(errorPage).not.toContain("error.stack");
  });
});
