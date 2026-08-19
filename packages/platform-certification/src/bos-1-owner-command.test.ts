import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BUSINESS_OS_RUNTIME_MANIFEST,
  createBusinessOS,
  implementsOwnAiStack,
} from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("BOS-1 Owner Command Centre", () => {
  it("does not implement an independent AI stack", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().implementsOwnAiStack).toBe(false);
    expect(bos.status.snapshot().phase).toBe("BOS-5");
    expect(bos.capabilities.isImplemented("owner_command")).toBe(true);
    expect(bos.capabilities.isImplemented("financial_intelligence")).toBe(true);
    expect(bos.capabilities.isImplemented("growth_intelligence")).toBe(true);
    expect(bos.capabilities.isImplemented("revenue_execution")).toBe(true);
    expect(bos.capabilities.isImplemented("customer_intelligence")).toBe(true);
  });

  it("registers Owner Command Centre as the /business route", () => {
    expect(BUSINESS_OS_RUNTIME_MANIFEST.routes?.some((r) => r.path === "/business" && r.title === "Owner Command Centre")).toBe(
      true,
    );
    const page = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/page.tsx"), "utf8");
    expect(page).toContain("Owner Command Centre");
    expect(page).toContain("data-testid=\"bos-signals\"");
    expect(page).toContain("data-testid=\"bos-brief\"");
    expect(page).toContain("Demo fixtures");
  });

  it("adds only owner-command management migrations", () => {
    const migration = resolve(
      ROOT,
      "supabase/migrations/20260818000000_batch_97_business_os_owner_command.sql",
    );
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, "utf8");
    expect(sql).toContain("business_os_kpis");
    expect(sql).not.toMatch(/create table if not exists (customers|leads|invoices)/i);
  });
});
