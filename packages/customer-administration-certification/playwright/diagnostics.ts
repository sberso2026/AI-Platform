import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import type { Page, Response } from "@playwright/test";

/** Documented browser noise that must not fail required certification flows. */
const HARMLESS_CONSOLE = [
  /Download the React DevTools/i,
  /\[HMR\]/i,
  /\[Fast Refresh\]/i,
  /Third-party cookie will be blocked/i,
  // Chromium resource-load messages for expected authz denials (engineering chrome prefetch).
  /Failed to load resource: the server responded with a status of (401|403|404)/i,
];

const REQUIRED_API_PATH =
  /\/api\/platform\/(administration|nav-context|build-identity|installations|commerce)\b/;

export interface PageDiagnostics {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  failedApiResponses: Array<{ url: string; status: number }>;
  navigationMs: number | null;
  assertClean(): void;
  dump(dir: string, label: string): void;
}

export function attachPageDiagnostics(page: Page): PageDiagnostics {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const failedApiResponses: Array<{ url: string; status: number }> = [];
  let navigationMs: number | null = null;
  const started = Date.now();

  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (HARMLESS_CONSOLE.some((re) => re.test(text))) return;
    consoleErrors.push(text);
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  page.on("requestfailed", (req) => {
    const url = req.url();
    const failure = req.failure()?.errorText ?? "unknown";
    // Next.js RSC prefetches abort when the route changes; ignore those.
    if (failure.includes("ERR_ABORTED") || url.includes("_rsc=")) return;
    if (!REQUIRED_API_PATH.test(url)) return;
    failedRequests.push(`${req.method()} ${url} — ${failure}`);
  });

  page.on("response", (res: Response) => {
    const url = res.url();
    if (!REQUIRED_API_PATH.test(url)) return;
    if (res.status() >= 500) {
      failedApiResponses.push({ url, status: res.status() });
    }
  });

  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      navigationMs = Date.now() - started;
    }
  });

  return {
    consoleErrors,
    pageErrors,
    failedRequests,
    failedApiResponses,
    get navigationMs() {
      return navigationMs;
    },
    assertClean() {
      const problems: string[] = [];
      if (pageErrors.length) problems.push(`page errors: ${pageErrors.join(" | ")}`);
      if (consoleErrors.length) problems.push(`console errors: ${consoleErrors.join(" | ")}`);
      if (failedApiResponses.length) {
        problems.push(
          `API 5xx: ${failedApiResponses.map((r) => `${r.status} ${r.url}`).join(" | ")}`
        );
      }
      if (failedRequests.length) {
        problems.push(`required API request failures: ${failedRequests.join(" | ")}`);
      }
      if (problems.length) {
        throw new Error(`Client/page diagnostics failed:\n- ${problems.join("\n- ")}`);
      }
    },
    dump(dir: string, label: string) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        resolve(dir, `${label}-diagnostics.json`),
        JSON.stringify(
          {
            navigationMs,
            consoleErrors,
            pageErrors,
            failedRequests,
            failedApiResponses,
          },
          null,
          2
        )
      );
    },
  };
}

export const REQUIRED_PRODUCT_DETAIL_TABS = [
  "Overview",
  "Applications",
  "Workspaces",
  "Licences & Seats",
  "Usage",
  "Installation",
  "Health",
  "Version History",
  "Audit History",
  "Support",
] as const;

export async function assertProductDetailRoute(page: Page): Promise<void> {
  const url = new URL(page.url());
  const path = url.pathname.replace(/\/$/, "") || "/";

  if (path.includes("/login") || path.endsWith("/auth") || path.includes("/sign-in")) {
    throw new Error(`Unexpected redirect to login: ${page.url()}`);
  }
  if (path === "/engineering" || path.startsWith("/engineering/")) {
    throw new Error(`Unexpected redirect to engineering surface: ${page.url()}`);
  }
  if (path === "/system/products") {
    throw new Error(`Unexpected redirect to products list: ${page.url()}`);
  }
  if (/access.?denied|unauthorized|forbidden/i.test(path + page.url())) {
    throw new Error(`Unexpected access-denied navigation: ${page.url()}`);
  }
  if (path.includes("/system/installations/")) {
    throw new Error(`Unexpected redirect to installation progress: ${page.url()}`);
  }
  if (!path.endsWith("/system/products/engineering-os")) {
    throw new Error(`Expected /system/products/engineering-os, got ${page.url()}`);
  }
}
