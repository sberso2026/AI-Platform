"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";
import { RtbLogo } from "@/components/brand/rtb-logo";
import { AUTH_ERROR_MESSAGES, buildAuthRecoveryRedirect, logAuthError, mapAuthError } from "@rtb/platform-core";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();
    const redirectTo = buildAuthRecoveryRedirect({
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      requestOrigin: window.location.origin,
    });
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (authError) {
      logAuthError("reset", authError);
      if (authError.status === 429 || /rate limit/i.test(authError.message)) {
        setError(mapAuthError(authError, "reset"));
      } else {
        setInfo(AUTH_ERROR_MESSAGES.recoveryDispatched);
      }
      setLoading(false);
      return;
    }
    setInfo(AUTH_ERROR_MESSAGES.recoveryDispatched);
    setLoading(false);
  }

  return (
    <div data-testid="forgot-password-page" className="flex min-h-screen items-center justify-center bg-[#F4F6F8] p-4">
      <Card className="w-full max-w-md border-border bg-white shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <RtbLogo size="lg" variant="full" inverted={false} />
          </div>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Canonical Auth recovery. The link returns to the Engineering OS custom domain.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            {info ? (
              <p className="text-sm text-muted-foreground" role="status">
                {info}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <a href="/login" className="text-primary hover:underline">
              Back to sign in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
