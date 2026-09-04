import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeTqQueryHtml } from "@rtb/engineering-os/browser";
import {
  projectTqRegisterRow,
  rowMatchesView,
  tqRegisterVisibleText,
  tqVisibleLeakCount,
} from "../lib/engineering/tq-register-presentation";

const WEB_SRC = resolve(__dirname, "..");
const REPO = resolve(__dirname, "../../../..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

const DOC_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const TQ_ID = "11111111-2222-4333-8444-555555555555";
const USER_ID = "99999999-aaaa-4bbb-8ccc-dddddddddddd";

const RICH_QUESTION = `<div>
<figure class="tq-query-figure" data-document-id="${DOC_ID}">
<img data-document-id="${DOC_ID}" alt="Bund floor" src="/api/engineering/technical-queries/${TQ_ID}/query-images/${DOC_ID}" />
<figcaption>Figure 1</figcaption>
</figure>
</div>
<p>Cracks are found around the bund floor of varying width and condition.</p>`;

function richRow(overrides: Record<string, unknown> = {}) {
  return projectTqRegisterRow(
    {
      id: TQ_ID,
      tq_number: "TQ-017",
      title: "Bund floor cracks",
      question: RICH_QUESTION,
      status: "open",
      priority: "high",
      requester_id: USER_ID,
      assigned_to: USER_ID,
      response_due: "2099-09-07",
      created_at: "2026-08-01T00:00:00.000Z",
      updated_at: "2026-08-20T00:00:00.000Z",
      ...overrides,
    },
    {
      currentUserId: USER_ID,
      projectNames: {},
      disciplineNames: {},
    },
  );
}

describe("EOS-SHELL-JARVIS-2R-TQ rich content and register projection", () => {
  it("projects a register summary without markup, UUIDs, or API paths", () => {
    const row = richRow();
    const visible = tqRegisterVisibleText(row);
    const leaks = tqVisibleLeakCount(visible);
    expect(row.title).toBe("Bund floor cracks");
    expect(row.querySummary).toContain("Cracks are found around the bund floor");
    expect(row.imageCount).toBe(1);
    expect(leaks.html).toBe(0);
    expect(leaks.uuid).toBe(0);
    expect(leaks.api).toBe(0);
    expect(visible).not.toMatch(/<div|<figure|tq-query-figure|data-document-id/i);
  });

  it("clamps long query bodies to a short register summary", () => {
    const long = `<p>${"Long bund-floor narrative. ".repeat(50)}</p>`;
    const row = richRow({ tq_number: "TQ-024", title: "Long query", question: long });
    expect(row.querySummary.length).toBeLessThanOrEqual(181);
    expect(row.querySummary.endsWith("…")).toBe(true);
    expect(long.length).toBeGreaterThan(row.querySummary.length);
  });

  it("sanitizes scripts, event handlers, iframes, and javascript URLs", () => {
    const dirty = `<p>Safe</p><script>alert(1)</script><iframe src="https://evil.test"></iframe><img src="javascript:alert(1)" onerror="alert(1)" /><img data-document-id="${DOC_ID}" alt="Figure" src="https://evil.example/x.png" />`;
    const sanitized = sanitizeTqQueryHtml(dirty, TQ_ID);
    expect(sanitized).toContain("Safe");
    expect(sanitized).not.toMatch(/script|iframe|onerror|javascript:/i);
    expect(sanitized).toContain(`/api/engineering/technical-queries/${TQ_ID}/query-images/${DOC_ID}`);
    expect(sanitized).not.toContain("data-document-id");
    expect(sanitized).not.toContain("tq-query-figure");
  });

  it("surfaces draft row actions without inventing applyAction", () => {
    const row = richRow({ status: "draft" });
    expect(row.isDraft).toBe(true);
    expect(row.isOwnedDraft).toBe(true);
    expect(row.statusLabel).toBe("Draft");
    const register = read("app/(platform)/engineering/technical-queries/page.tsx");
    expect(register).toContain("Edit Draft");
    expect(register).toContain("Submit Technical Query");
    expect(register).not.toContain("applyAction");
    expect(read("app/api/engineering/technical-queries/[id]/route.ts")).not.toContain("PATCH");
    expect(read("app/api/engineering/technical-queries/[id]/route.ts")).toContain("technicalQueries.get");
  });

  it("keeps operational views and command-shell composition", () => {
    const register = read("app/(platform)/engineering/technical-queries/page.tsx");
    const presentation = read("lib/engineering/tq-register-presentation.ts");
    expect(register).toContain("Technical Query Register");
    expect(register).toContain("Controlled engineering query and RFI workflow");
    expect(presentation).toContain('label: "My Actions"');
    expect(presentation).toContain('label: "Awaiting Response"');
    expect(presentation).toContain('label: "Overdue"');
    expect(presentation).toContain('label: "Closed"');
    expect(register).toContain("TQ_REGISTER_VIEWS");
    expect(register).toContain("LiveSignal");
    expect(register).toContain("Unavailable");
    expect(register).toContain("eos-register-matrix");
    expect(register).toContain("eos-line-clamp-2");
    expect(register).toContain("tq-image-indicator");
    expect(register).not.toContain("{item.question}");
    expect(register).not.toContain("item.question as string");
    expect(rowMatchesView(richRow(), "awaiting_response", USER_ID)).toBe(true);
    expect(rowMatchesView(richRow({ status: "closed" }), "closed", USER_ID)).toBe(true);
  });

  it("renders detail and print through sanitized rich content", () => {
    const detail = read("app/(platform)/engineering/technical-queries/[id]/page.tsx");
    const print = read("app/(platform)/engineering/technical-queries/[id]/print/page.tsx");
    const renderer = read("components/engineering/tq-query-html.tsx");
    expect(detail).toContain("TqQueryHtml");
    expect(detail).toContain("Query / Information Required");
    expect(detail).toContain("Overview");
    expect(detail).toContain("Discussion");
    expect(print).toContain("TqQueryHtml");
    expect(print).toContain("tq-print-query");
    expect(print).toContain("overflow-y-auto");
    expect(renderer).toContain("sanitizeTqQueryHtml");
    expect(renderer).toContain("dangerouslySetInnerHTML");
    expect(read("app/api/engineering/technical-queries/[id]/query-images/[documentId]/route.ts")).toContain(
      "extractTqQueryImageIds",
    );
  });

  it("does not change canonical TQ create/list contracts", () => {
    const list = read("app/api/engineering/technical-queries/route.ts");
    expect(list).toContain("technicalQueries.list");
    expect(list).toContain("technicalQueries.create");
    expect(list).not.toContain("listPresented");
    expect(list).not.toContain("applyAction");
    expect(existsSync(resolve(REPO, "docs/pilot/EOS-SHELL-JARVIS-2R-TQ/architecture-freeze.md"))).toBe(true);
  });
});
