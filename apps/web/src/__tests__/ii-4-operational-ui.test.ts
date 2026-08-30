import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_SRC = resolve(__dirname, "..");

describe("II-4 operational web routes", () => {
  it("adds history and reporting pages on the hosted API without PDF or a new store", () => {
    expect(existsSync(resolve(WEB_SRC, "app/(platform)/engineering/apps/inspection-intelligence/history/page.tsx"))).toBe(
      true,
    );
    expect(
      existsSync(
        resolve(
          WEB_SRC,
          "app/(platform)/engineering/apps/inspection-intelligence/history/targets/[kind]/[canonicalId]/page.tsx",
        ),
      ),
    ).toBe(true);
    expect(existsSync(resolve(WEB_SRC, "app/(platform)/engineering/apps/inspection-intelligence/reports/page.tsx"))).toBe(
      true,
    );
    expect(
      existsSync(
        resolve(WEB_SRC, "app/(platform)/engineering/apps/inspection-intelligence/reports/[outputId]/page.tsx"),
      ),
    ).toBe(true);
    const hosted = readFileSync(resolve(WEB_SRC, "app/api/engineering/inspection-intelligence/hosted/route.ts"), "utf8");
    expect(hosted).toContain('resource === "history"');
    expect(hosted).toContain('resource === "target_history"');
    expect(hosted).toContain("compose_report");
    expect(hosted).toContain("transition_report");
    expect(hosted).not.toContain("createServiceClient");
    const shell = readFileSync(resolve(WEB_SRC, "components/engineering/inspection-intelligence-shell.tsx"), "utf8");
    expect(shell).toContain("/engineering/apps/inspection-intelligence/history");
    expect(shell).toContain("/engineering/apps/inspection-intelligence/reports");
    const reports = readFileSync(resolve(WEB_SRC, "components/engineering/inspection-report-list.tsx"), "utf8");
    expect(reports).toContain("PDF available");
    expect(reports).not.toContain("Download PDF");
    const history = readFileSync(resolve(WEB_SRC, "components/engineering/inspection-history-board.tsx"), "utf8");
    expect(history).toContain("not Asset Intelligence");
  });
});
