import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-TQ-UX-1R3 founder navigation and register", () => {
  it("gives every TQ workflow page an explicit back action and a scrollable main", () => {
    const create = readApp("src/app/(platform)/engineering/technical-queries/new/page.tsx");
    const detail = readApp("src/app/(platform)/engineering/technical-queries/[id]/page.tsx");
    const print = readApp("src/app/(platform)/engineering/technical-queries/[id]/print/page.tsx");
    const register = readApp("src/app/(platform)/engineering/technical-queries/page.tsx");
    const ui = readApp("src/components/engineering/technical-query-ui.tsx");
    expect(ui).toContain("TqBackLink");
    expect(ui).toContain("overflow-y-auto");
    expect(create).toContain("Back to Technical Queries");
    expect(create).toContain("TQ_SCROLL_MAIN");
    expect(create).toContain("unsaved changes");
    expect(detail).toContain("Back to Technical Queries");
    expect(detail).toContain("Back to {p.tqNumber}");
    expect(print).toContain("Back to");
    expect(register).toContain("TQ_SCROLL_MAIN");
  });

  it("keeps Submit reachable on a sticky action bar with an explicit disabled reason", () => {
    const create = readApp("src/app/(platform)/engineering/technical-queries/new/page.tsx");
    expect(create).toContain("tq-sticky-actions");
    expect(create).toContain("Submit Technical Query");
    expect(create).toContain("Save Draft");
    expect(create).toContain("Cancel");
    expect(create).toContain("tq-submit-reason");
    expect(create).toContain("Enter Query / Information Required.");
    expect(create).toContain("Enter a Response Due Date.");
    expect(create).toContain("Select a Project.");
    expect(create).not.toContain("Suggested Solution is required");
  });

  it("makes Print Preview interactive without applying print-only chrome hiding on screen", () => {
    const print = readApp("src/app/(platform)/engineering/technical-queries/[id]/print/page.tsx");
    const css = readApp("src/app/(platform)/engineering/technical-queries/[id]/print/tq-print.css");
    expect(print).toContain("overflow-y-auto");
    expect(print).toContain("window.print");
    expect(print).toContain("tq-print-button");
    expect(css).toContain("@media print");
    expect(css).toContain(".tq-print-toolbar");
    expect(css).toContain("overflow: visible !important");
  });

  it("moves register filters into the table header and exposes active filter chips", () => {
    const register = readApp("src/app/(platform)/engineering/technical-queries/page.tsx");
    expect(register).toContain("tq-col-status");
    expect(register).toContain("tq-col-initiator");
    expect(register).toContain("tq-col-action-by");
    expect(register).toContain("tq-active-filters");
    expect(register).toContain("Clear all filters");
    expect(register).toContain("line-clamp-2");
    expect(register).not.toContain("md:grid-cols-4 xl:grid-cols-8");
    expect(register).toContain("role=\"tablist\"");
  });
});
