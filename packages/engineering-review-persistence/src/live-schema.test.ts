import { beforeAll, describe, expect, it } from "vitest";
import { applyHostedCoreRlsMigration } from "../scripts/apply-hosted-migration";
import { createServiceReviewClient } from "./client";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseUrl,
} from "./env";
import { loadReviewSecuritySchemaStatus } from "./security-schema";

const mode = liveRlsMode();
const LIVE = mode === "run";

describe.skipIf(!LIVE)("ERA-7 security schema verification", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const serviceKey = resolveServiceRoleKey()!;

  beforeAll(async () => {
    if (mode === "misconfigured") throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    await applyHostedCoreRlsMigration();
  });

  it("reports Core workspace RLS and Review tables as deployed", async () => {
    const admin = createServiceReviewClient(url, serviceKey);
    const status = await loadReviewSecuritySchemaStatus(admin);
    expect(status.ok, status.missing.join(",")).toBe(true);
    expect(status.coreWorkspaceRls).toBe(true);
    expect(status.reviewTables).toBe(true);
  });
});
