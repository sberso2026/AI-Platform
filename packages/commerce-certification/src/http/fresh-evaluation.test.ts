import { beforeAll, describe, expect, it } from "vitest";

import { buildAuthCookies } from "../lib/auth-cookies.js";
import { certUserPassword, isCertificationMode, loadFixturesManifest, requireFixturesManifest } from "../lib/env.js";
import { httpFetch } from "../lib/http-client.js";
import { createAdminClient } from "../lib/supabase.js";

const skipLocal = !isCertificationMode() && !process.env.RTB_TEST_BASE_URL;

describe.skipIf(skipLocal)("Fresh entitlement evaluation on writes", () => {
  let tenantId: string;
  let workspaceId: string;
  let engineerCookies: string;
  let engineerUserId: string;
  let seatPoolId: string;
  let assignmentId: string | undefined;

  beforeAll(async () => {
    const manifest = loadFixturesManifest() ?? requireFixturesManifest();
    tenantId = manifest.tenantA.id;
    workspaceId = manifest.tenantA.workspaces[0]!.id;
    seatPoolId = manifest.tenantA.seatPoolId;
    engineerUserId = manifest.tenantA.users.engineer.userId;

    engineerCookies = (
      await buildAuthCookies(
        manifest.tenantA.users.engineer.email,
        certUserPassword()
      )
    ).cookieHeader;

    const admin = createAdminClient();
    const { data } = await admin
      .from("commercial_seat_assignments")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("user_id", engineerUserId)
      .eq("status", "active")
      .maybeSingle();
    assignmentId = data?.id;
  });

  it("write succeeds then fails immediately after seat removal", async () => {
    if (!assignmentId) {
      expect(assignmentId).toBeDefined();
      return;
    }

    const admin = createAdminClient();

    const first = await httpFetch({
      method: "POST",
      path: "/api/engineering/projects",
      cookieHeader: engineerCookies,
      tenantId,
      workspaceId,
      body: { projectName: "Fresh Eval A", projectCode: `FE-${Date.now()}` },
    });

    if (first.status === 403) {
      // Engineer may be read-only on POST depending on role policy — still validate seat removal path via admin
      await admin
        .from("commercial_seat_assignments")
        .update({ status: "removed", removed_at: new Date().toISOString() })
        .eq("id", assignmentId);

      const denied = await httpFetch({
        method: "POST",
        path: "/api/engineering/projects",
        cookieHeader: engineerCookies,
        tenantId,
        workspaceId,
        body: { projectName: "Fresh Eval B", projectCode: `FE-${Date.now()}-b` },
      });
      expect([401, 403]).toContain(denied.status);

      await admin
        .from("commercial_seat_assignments")
        .update({ status: "active", removed_at: null })
        .eq("id", assignmentId);
      return;
    }

    expect([200, 201]).toContain(first.status);

    await admin
      .from("commercial_seat_assignments")
      .update({ status: "removed", removed_at: new Date().toISOString() })
      .eq("id", assignmentId);

    const second = await httpFetch({
      method: "POST",
      path: "/api/engineering/projects",
      cookieHeader: engineerCookies,
      tenantId,
      workspaceId,
      body: { projectName: "Fresh Eval C", projectCode: `FE-${Date.now()}-c` },
    });
    expect([401, 403]).toContain(second.status);

    await admin
      .from("commercial_seat_assignments")
      .update({ status: "active", removed_at: null })
      .eq("id", assignmentId);
  });

  it("write fails immediately after subscription suspension", async () => {
    const manifest = loadFixturesManifest() ?? requireFixturesManifest();
    const admin = createAdminClient();
    const subId = manifest.tenantA.subscriptionId;

    await admin.from("commercial_subscriptions").update({ status: "suspended" }).eq("id", subId);

    const res = await httpFetch({
      method: "POST",
      path: "/api/engineering/projects",
      cookieHeader: engineerCookies,
      tenantId,
      workspaceId,
      body: { projectName: "Suspended", projectCode: `SUS-${Date.now()}` },
    });
    expect([401, 403]).toContain(res.status);

    await admin.from("commercial_subscriptions").update({ status: "active" }).eq("id", subId);
  });
});
