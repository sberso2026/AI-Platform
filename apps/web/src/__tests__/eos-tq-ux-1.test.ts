import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import {
  describeTechnicalQueryNextAction,
  isRawUuid,
} from "@rtb/engineering-os/browser";

const WEB_ROOT = resolve(__dirname, "../../");
const TQ_DIR = resolve(WEB_ROOT, "src/app/(platform)/engineering/technical-queries");
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("EOS-TQ-UX-1 enterprise register", () => {
  it("replaces the primitive register and anonymous response boxes", () => {
    const page = readApp("src/app/(platform)/engineering/technical-queries/page.tsx");
    const views = readApp("src/lib/engineering/technical-query-ux.ts");
    expect(page).toContain("Technical Queries");
    expect(views).toContain("My Actions");
    expect(views).toContain("Awaiting Response");
    expect(views).toContain("Overdue");
    expect(page).toContain("+ New Technical Query");
    expect(page).toContain("TQ_REGISTER_VIEWS");
    expect(page).not.toContain("Respond / close TQ");
    expect(page).not.toContain("Submit TQ");
  });

  it("keeps response, review, closeout, next action, and AI advisory on the detail workspace", () => {
    const page = readApp("src/app/(platform)/engineering/technical-queries/[id]/page.tsx");
    const ui = readApp("src/components/engineering/technical-query-ui.tsx");
    expect(ui).toContain("tq-next-action");
    expect(page).toContain("TqNextActionPanel");
    expect(page).toContain("Client / Technical Response");
    expect(page).toContain("Submit Response");
    expect(page).toContain("Request Clarification");
    expect(page).toContain("Close Technical Query");
    expect(page).toContain("Ask Engineering AI");
    expect(page).toContain("cannot approve or close");
    expect(page).toContain("Print");
  });

  it("does not re-assert read presentation after a write commerce context", () => {
    const collection = readApp("src/app/api/engineering/technical-queries/route.ts");
    const service = readFileSync(
      resolve(WEB_ROOT, "../../packages/engineering-os/src/services/technical-query-service.ts"),
      "utf8",
    );
    expect(collection).not.toContain("getPresented");
    expect(service).toContain("presentAfterWrite");
    expect(service).toContain("return this.presentAfterWrite(commerce, input.tenantId, data as Record<string, unknown>)");
  });

  it("creates TQs through a structured form with query, due, and suggested solution", () => {
    const page = readApp("src/app/(platform)/engineering/technical-queries/new/page.tsx");
    expect(page).toContain("Query / Information Required");
    expect(page).toContain("Response Due Date");
    expect(page).toContain("Suggested Solution");
    expect(page).toContain("Action By");
    expect(page).toContain("Submit Technical Query");
    expect(page).toContain("Save Draft");
    expect(page).toContain("After submission");
    expect(page).toContain("tq-submit-confirmation");
  });

  it("print view includes controlled TQ sections and hides chrome in print CSS", () => {
    const page = readApp("src/app/(platform)/engineering/technical-queries/[id]/print/page.tsx");
    const css = readApp("src/app/(platform)/engineering/technical-queries/[id]/print/tq-print.css");
    expect(page).toContain("Query / Information Required");
    expect(page).toContain("Suggested Solution");
    expect(page).toContain("Client / Technical Response");
    expect(page).toContain("Uncontrolled when printed");
    expect(page).toContain("RTB Engineering & Analytics");
    expect(page).toContain("window.print");
    expect(page).toContain("tq-print-toolbar");
    expect(page).toContain("tq-print-button");
    expect(css).toContain("@page");
    expect(css).toContain("size: A4");
    expect(css).toContain("display: none !important");
    expect(css).toContain("tq-print-toolbar");
    expect(css).not.toMatch(/^\s*header,/m);
  });

  it("exposes zero raw UUIDs in TQ UI source text", () => {
    const files = walk(TQ_DIR).filter((file) => /\.(tsx|ts|css)$/.test(file));
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      const matches = text.match(UUID_RE) ?? [];
      hits.push(...matches);
    }
    expect(hits).toEqual([]);
  });

  it("next-action copy stays operational", () => {
    const next = describeTechnicalQueryNextAction({
      status: "awaiting_response",
      initiatorName: "Silvestre Berso",
      actionByName: "Jane Smith",
      due: "2026-09-07",
      assigned: true,
    });
    expect(next.actionRequired).not.toMatch(/pending/i);
    expect(isRawUuid(next.actionRequired)).toBe(false);
  });
});
