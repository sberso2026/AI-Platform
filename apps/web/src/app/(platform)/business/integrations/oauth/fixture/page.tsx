"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import {
  BOS_CONNECTOR_CONSENT,
  BOS_OAUTH_FIXTURE_CODES,
  isBosOauthConnector,
} from "@rtb/business-os";

function FixtureInner() {
  const params = useSearchParams();
  const connector = params.get("connector") ?? "";
  const state = params.get("state") ?? "";
  const mode = params.get("mode") ?? "";
  const valid = isBosOauthConnector(connector) && Boolean(state);
  const consent = isBosOauthConnector(connector) ? BOS_CONNECTOR_CONSENT[connector] : null;

  async function go(code?: string, error?: string) {
    const next = new URLSearchParams({ fixture: "1" });
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 20_000);
      const parsed = await fetch("/api/business/integrations/oauth/callback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ state, code: code ?? null, error: error ?? null }),
        signal: controller.signal,
      });
      window.clearTimeout(timer);
      const body = (await parsed.json().catch(() => ({}))) as {
        data?: { connectionState?: string; connectorId?: string };
        code?: string;
        error?: string;
      };
      if (!parsed.ok) {
        next.set("oauth", "error");
        next.set("reason", String(body.code ?? body.error ?? "oauth_provider_error"));
      } else {
        next.set("oauth", body.data?.connectionState === "CONNECTED" ? "connected" : "error");
        if (body.data?.connectorId) next.set("provider", body.data.connectorId);
      }
    } catch {
      next.set("oauth", "error");
      next.set("reason", "oauth_provider_error");
    }
    window.location.assign(`/business/integrations?${next.toString()}`);
  }

  return (
    <>
      <Header title="Provider consent fixture" />
      <PageMain>
        <p
          data-testid="bos-oauth-fixture-banner"
          className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm"
        >
          Browser OAuth fixture — this is not a live {consent?.providerLabel ?? "provider"} identity page.
        </p>
        {!valid ? (
          <p role="alert">This fixture request is missing a connector or state parameter.</p>
        ) : (
          <Card data-testid={`bos-oauth-fixture-${connector}`}>
            <CardHeader>
              <CardTitle>Allow BOS to read {consent?.providerLabel}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{consent?.capabilitySummary}</p>
              <p>Requested: {consent?.permissionClass}</p>
              <p className="text-slate-600">Mode: {mode || "browser_fixture"}</p>
              <div className="flex flex-wrap gap-2">
                <Button data-testid="bos-oauth-allow" type="button" onClick={() => void go(BOS_OAUTH_FIXTURE_CODES.success)}>
                  Allow
                </Button>
                <Button data-testid="bos-oauth-deny" type="button" variant="outline" onClick={() => void go(undefined, "access_denied")}>
                  Deny
                </Button>
                <Button
                  data-testid="bos-oauth-provider-error"
                  variant="secondary"
                  onClick={() => go(BOS_OAUTH_FIXTURE_CODES.error)}
                >
                  Simulate provider error
                </Button>
                <Button data-testid="bos-oauth-missing-code" variant="secondary" onClick={() => go()}>
                  Simulate missing code
                </Button>
                <Button
                  data-testid="bos-oauth-wrong-org"
                  variant="secondary"
                  onClick={() => go(BOS_OAUTH_FIXTURE_CODES.wrong_org)}
                >
                  Simulate wrong account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </PageMain>
    </>
  );
}

export default function BosOauthFixturePage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading fixture…</p>}>
      <FixtureInner />
    </Suspense>
  );
}
