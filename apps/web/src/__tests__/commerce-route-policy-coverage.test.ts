import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BUSINESS_API_POLICIES,
  BUSINESS_PAGE_POLICIES,
  ENGINEERING_API_POLICIES,
  ENGINEERING_PAGE_POLICIES,
} from "@rtb/platform-commerce";

const ENGINEERING_ROOT = path.resolve(
  __dirname,
  "../app/(platform)/engineering"
);

const API_ROOT = path.resolve(__dirname, "../app/api/engineering");

/** Routes covered by parent layout entitlement guard (product-level). */
const COVERED_BY_PARENT = new Set(["/engineering"]);

function routeSegmentFromPolicy(route: string): string {
  return route.replace(/^\/engineering\/?/, "");
}

function hasPage(route: string): boolean {
  const segment = routeSegmentFromPolicy(route);
  const pagePath = segment
    ? path.join(ENGINEERING_ROOT, segment, "page.tsx")
    : path.join(ENGINEERING_ROOT, "page.tsx");
  return fs.existsSync(pagePath);
}

function hasEntitlementLayout(route: string): boolean {
  const segment = routeSegmentFromPolicy(route);
  if (!segment) {
    const layoutPath = path.join(ENGINEERING_ROOT, "layout.tsx");
    if (!fs.existsSync(layoutPath)) return false;
    const content = fs.readFileSync(layoutPath, "utf8");
    return content.includes("requireProductEntitlement");
  }

  const layoutPath = path.join(ENGINEERING_ROOT, segment, "layout.tsx");
  if (!fs.existsSync(layoutPath)) return false;
  const content = fs.readFileSync(layoutPath, "utf8");
  return (
    content.includes("ApplicationEntitlementLayout") ||
    content.includes("ENGINEERING_PAGE_POLICIES") ||
    content.includes("createEngineeringApplicationLayout")
  );
}

function listApiSegments(): string[] {
  if (!fs.existsSync(API_ROOT)) return [];
  return fs
    .readdirSync(API_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

describe("ENGINEERING_PAGE_POLICIES route coverage", () => {
  it("requires layout or parent coverage for every policy route with a page", () => {
    const uncovered: string[] = [];

    for (const route of Object.keys(ENGINEERING_PAGE_POLICIES)) {
      if (!hasPage(route)) continue;
      if (COVERED_BY_PARENT.has(route)) continue;
      if (!hasEntitlementLayout(route)) {
        uncovered.push(route);
      }
    }

    expect(uncovered).toEqual([]);
  });

  it("defines a policy for each registered page route key", () => {
    for (const route of Object.keys(ENGINEERING_PAGE_POLICIES)) {
      expect(ENGINEERING_PAGE_POLICIES[route]?.productKey).toBe("engineering-os");
    }
  });
});

describe("ENGINEERING_API_POLICIES route coverage", () => {
  it("defines policy keys for each engineering API segment", () => {
    const segments = listApiSegments();
    const missing: string[] = [];

    for (const segment of segments) {
      const readKey = `${segment}.read`;
      const writeKey = `${segment}.write`;
      if (!ENGINEERING_API_POLICIES[readKey] && !ENGINEERING_API_POLICIES[writeKey]) {
        missing.push(segment);
      }
    }

    expect(missing).toEqual([]);
  });
});

describe("BUSINESS_PAGE_POLICIES route coverage", () => {
  const BUSINESS_ROOT = path.resolve(__dirname, "../app/(platform)/business");
  const BUSINESS_API_ROOT = path.resolve(__dirname, "../app/api/business");

  it("covers every BOS page policy with the fail-closed foundation layout", () => {
    for (const route of Object.keys(BUSINESS_PAGE_POLICIES)) {
      expect(BUSINESS_PAGE_POLICIES[route]?.productKey).toBe("business-os");
      expect(BUSINESS_PAGE_POLICIES[route]?.featureKey).toBe("business_os");
      const segment = route.replace(/^\/business\/?/, "");
      const pagePath = segment
        ? path.join(BUSINESS_ROOT, segment, "page.tsx")
        : path.join(BUSINESS_ROOT, "page.tsx");
      expect(fs.existsSync(pagePath)).toBe(true);
    }
    const layout = fs.readFileSync(path.join(BUSINESS_ROOT, "layout.tsx"), "utf8");
    expect(layout).toContain("requireBusinessOsAccess");
  });

  it("defines BUSINESS_API_POLICIES for each /api/business segment", () => {
    const segments = fs.existsSync(BUSINESS_API_ROOT)
      ? fs
          .readdirSync(BUSINESS_API_ROOT, { withFileTypes: true })
          .filter((e) => e.isDirectory())
          .map((e) => e.name)
      : [];
    expect(segments.sort()).toEqual([
      "actions",
      "brief",
      "capabilities",
      "command",
      "config",
      "decisions",
      "demo",
      "health",
      "kpis",
      "recommendations",
      "signals",
      "status",
    ]);
    for (const segment of segments) {
      const read = BUSINESS_API_POLICIES[`${segment}.read`];
      const write = BUSINESS_API_POLICIES[`${segment}.write`];
      expect(read || write).toBeDefined();
      expect((read ?? write)?.productKey).toBe("business-os");
      expect((read ?? write)?.featureKey).toBe("business_os");
    }
  });
});
