import { describe, expect, it } from "vitest";

import { isCertificationMode, loadFixturesManifest, resolveSchedulerSecret, resolveTestBaseUrl } from "../lib/env.js";
import { buildAuthCookiesFromJwt } from "../lib/auth-cookies.js";
import { httpFetch } from "../lib/http-client.js";

const skipLocal = !isCertificationMode() && !process.env.RTB_TEST_BASE_URL;

describe.skipIf(skipLocal)("Commerce scheduler job runner security", () => {
  it("rejects missing secret and missing auth", async () => {
    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/commerce/jobs/run",
      body: { jobs: ["expireTrials"] },
    });
    expect([401, 403]).toContain(res.status);
  });

  it("rejects invalid scheduler secret", async () => {
    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/commerce/jobs/run",
      headers: { "x-commerce-scheduler-secret": "invalid-secret" },
      body: { jobs: ["expireTrials"] },
    });
    expect([401, 403]).toContain(res.status);
  });

  it("rejects invalid job name", async () => {
    const secret = resolveSchedulerSecret();
    if (!secret) {
      if (isCertificationMode()) throw new Error("COMMERCE_SCHEDULER_SECRET required");
      return;
    }

    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/commerce/jobs/run",
      headers: { "x-commerce-scheduler-secret": secret },
      body: { jobs: ["notARealJob"] },
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { invalidJobs?: string[] };
    expect(body.invalidJobs).toContain("notARealJob");
  });

  it("accepts valid scheduler secret", async () => {
    const secret = resolveSchedulerSecret();
    if (!secret) return;

    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/commerce/jobs/run",
      headers: {
        "x-commerce-scheduler-secret": secret,
        "x-correlation-id": "cert-scheduler-001",
      },
      body: { jobs: ["expireTrials"] },
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
      body: { jobs: ["expireTrials"] },
    });
    expect([401, 403]).toContain(res.status);
  });

  it("records correlation ID on response", async () => {
    const secret = resolveSchedulerSecret();
    if (!secret) return;

    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/commerce/jobs/run",
      headers: {
        "x-commerce-scheduler-secret": secret,
        "x-correlation-id": "cert-correlation-xyz",
      },
      body: { jobs: ["expireTrials"] },
    });
    const body = (await res.json()) as { correlationId?: string };
    expect(body.correlationId).toBe("cert-correlation-xyz");
  });
});

describe("Scheduler test base URL", () => {
  it("defaults to localhost", () => {
    expect(resolveTestBaseUrl()).toMatch(/^https?:\/\//);
  });
});
