"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";
import { RtbLogo } from "@/components/brand/rtb-logo";
import { logAuthError, mapAuthError } from "@rtb/platform-core";

function readQueryFlag(name: string): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(name) === "1";
}

/**
 * Enterprise SSO login entry — email-first discovery + local auth when policy allows.
 * Password path is blocked when SSO is required; server-side TenantSsoPolicy is authoritative.
 */
export default function LoginPage() {
  const router = useRouter();
  const [ssoRequired] = useState(() => readQueryFlag("sso_required"));
  const [providerUnavailable] = useState(() => readQueryFlag("sso_unavailable"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ssoMode, setSsoMode] = useState<"unknown" | "optional" | "required" | "none">(
    ssoRequired ? "required" : "unknown",
  );

  const domain = useMemo(() => {
    const at = email.lastIndexOf("@");
    return at > 0 ? email.slice(at + 1).toLowerCase() : "";
  }, [email]);

  async function discoverSso() {
    setError(null);
    setInfo(null);
    if (!domain) {
      setError("Enter a work email to continue with organization SSO.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/platform/enterprise-sso/discover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as {
        status: string;
        mode?: string;
        message?: string;
      };
      if (data.status === "redirect" || data.status === "sso_available") {
        setSsoMode(data.mode === "required" ? "required" : "optional");
        setInfo("Organization SSO is available. Continue with Microsoft / enterprise IdP.");
        if (data.status === "redirect") {
          // Controlled redirect target from server (allow-listed).
          window.location.href = (data as { redirectTo?: string }).redirectTo || "/login?sso_required=1";
          return;
        }
      } else if (data.status === "unknown_domain") {
        setSsoMode("none");
        setInfo("Continue with your platform credentials, or contact your administrator for SSO.");
      } else if (data.status === "provider_unavailable") {
        setSsoMode("required");
        setError("Organization SSO is temporarily unavailable. Password sign-in is not permitted while SSO is required.");
      } else {
        setSsoMode("none");
        setInfo(data.message || "Continue with your platform credentials.");
      }
    } catch {
      setError("Unable to check organization SSO right now.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (ssoMode === "required" || ssoRequired) {
      setError("Organization SSO is required. Password sign-in is not permitted.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      logAuthError("signin", authError);
      setError(mapAuthError(authError, "signin"));
      setLoading(false);
      return;
    }

    router.push("/engineering");
    router.refresh();
  }

  return (
    <div data-testid="login-page" className="flex min-h-screen items-center justify-center bg-[#F4F6F8] p-4">
      <Card className="w-full max-w-md border-border bg-white shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <RtbLogo size="lg" variant="full" inverted={false} />
          </div>
          <CardTitle>RTB Engineering OS</CardTitle>
          <CardDescription>Sign in to your platform account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2" data-testid="enterprise-sso-login-entry">
            <label htmlFor="sso-email" className="text-sm font-medium">
              Work email
            </label>
            <Input
              id="sso-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              data-testid="enterprise-sso-email"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={discoverSso}
              data-testid="enterprise-sso-continue"
            >
              Continue with organization SSO
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading || !domain}
              onClick={discoverSso}
              data-testid="enterprise-sso-microsoft"
            >
              Continue with Microsoft
            </Button>
          </div>

          {(providerUnavailable || ssoMode === "required") && (
            <p className="mb-3 text-sm text-amber-800" data-testid="enterprise-sso-required" role="status">
              SSO required for this organization. Local password fallback is disabled.
            </p>
          )}
          {info && (
            <p className="mb-3 text-sm text-muted-foreground" data-testid="enterprise-sso-info">
              {info}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={ssoMode === "required" || ssoRequired}
                data-testid="login-password"
              />
            </div>
            {error && (
              <p
                className="mb-1 text-[0.9375rem] leading-relaxed text-red-700"
                role="alert"
                data-testid="auth-error"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || ssoMode === "required" || ssoRequired}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <a href="/forgot-password" className="text-primary hover:underline">
              Forgot password
            </a>
            . Recovery uses the same Auth account and custom domain. It is not break-glass.
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            No account?{" "}
            <a href="/signup" className="text-primary hover:underline">
              Create one
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
