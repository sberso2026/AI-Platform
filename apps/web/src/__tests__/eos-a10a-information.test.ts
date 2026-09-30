import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-A10A information UI", () => {
  it("uses readable EOS selectors and does not communicate authority by color alone", () => {
    const page = readApp("src/components/engineering/information-workspace.tsx");
    const settings = readApp("src/app/(platform)/engineering/settings/information/page.tsx");
    const css = readApp("src/app/globals.css");
    expect(page).toContain("eos-select");
    expect(page).toContain("EngineeringProjectContextBar");
    expect(page).toContain("Authority explanation");
    expect(page).toContain("not engineering approval");
    expect(page).not.toMatch(/traffic-light|score =/);
    expect(settings).toContain("eos-select");
    expect(css).toContain("select.eos-select");
    expect(css).toContain(".eos-select option");
  });
});
