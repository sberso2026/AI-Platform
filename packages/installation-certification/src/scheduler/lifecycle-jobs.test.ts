import { describe, expect, it } from "vitest";

import { isCertificationMode, loadFixturesManifest, resolveSchedulerSecret } from "../lib/env.js";
import { buildAuthCookiesFromJwt } from "../lib/auth-cookies.js";
import { httpFetch } from "../lib/http-client.js";

const skipLocal = !isCertificationMode() && !process.env.RTB_TEST_BASE_URL;

describe.skipIf(skipLocal)("Installation scheduler lifecycle jobs", () => {
  it("rejects missing secret and missing auth", async () => {
    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/commerce/jobs/run",
      body: { jobs: ["installationHealthCheck"] },
    });
    expect([401, 403]).toContain(res.status);
  });

  it("rejects invalid scheduler secret", async () => {
    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/commerce/jobs/run",
      headers: { "x-commerce-scheduler-secret": "invalid-secret" },
      body: { jobs: ["installationRetry"] },
    });
    expect([401, 403]).toContain(res.status);
  });

  it("rejects invalid installation job name", async () => {
    const secret = resolveSchedulerSecret();
    if (!secret) {
      if (isCertificationMode()) throw new Error("COMMERCE_SCHEDULER_SECRET required");
      return;
    }

    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/commerce/jobs/run",
      headers: { "x-commerce-scheduler-secret": secret },
      body: { jobs: ["notAnInstallationJob"] },
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { invalidJobs?: string[] };
    expect(body.invalidJobs).toContain("notAnInstallationJob");
  });

  it("accepts installationHealthCheck with valid scheduler secret", async () => {
    const secret = resolveSchedulerSecret();
    if (!secret) return;

    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/commerce/jobs/run",
      headers: {
        "x-commerce-scheduler-secret": secret,
        "x-correlation-id": "cert-install-health-001",
      },
      body: { jobs: ["installationHealthCheck"] },
    });
    expect([200, 503]).toContain(res.status);
  });

  it("accepts installationRetry with valid scheduler secret", async () => {
    const secret = resolveSchedulerSecret();
    if (!secret) return;

    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/commerce/jobs/run",
      headers: {
        "x-commerce-scheduler-secret": secret,
        "x-correlation-id": "cert-install-retry-001",
      },
      body: { jobs: ["installationRetry"] },
    });
    expect([200, 503]).toContain(res.status);
  });

  it("denies engineer even with session cookies", async () => {
    const manifest = loadFixturesManifest();
    if (!manifest) return;

    const cookies = (
      await buildAuthCookiesFromJwt(
        manifest.tenantA.users.engineer.jwt,
        manifest.tenantA.users.engineer.email
      )
    ).cookieHeader;

    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/commerce/jobs/run",
      cookieHeader: cookies,
      tenantId: manifest.tenantA.id,
      body: { jobs: ["installationHealthCheck"] },
    });
    expect([401, 403]).toContain(res.status);
  });
});
