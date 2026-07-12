import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import type { Page, Response } from "@playwright/test";

const HARMLESS_CONSOLE = [
  /Download the React DevTools/i,
  /\[HMR\]/i,
  /\[Fast Refresh\]/i,
  /Third-party cookie will be blocked/i,
];

export interface PageDiagnostics {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  failedApiResponses: Array<{ url: string; status: number }>;
  navigationMs: number | null;
  assertClean(): void;
  dump(dir: string, label: string): void;
}

function isApiUrl(url: string): boolean {
  return /\/api\//.test(url);
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
    const failure = req.failure()?.errorText ?? "unknown";
    failedRequests.push(`${req.method()} ${req.url()} — ${failure}`);
  });

  page.on("response", (res: Response) => {
    if (!isApiUrl(res.url())) return;
    if (res.status() >= 500) {
      failedApiResponses.push({ url: res.url(), status: res.status() });
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
