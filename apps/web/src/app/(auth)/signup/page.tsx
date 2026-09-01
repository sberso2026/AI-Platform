"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";
import { RtbLogo } from "@/components/brand/rtb-logo";
import { buildAuthLoginRedirect, logAuthError, mapAuthError } from "@rtb/platform-core";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: buildAuthLoginRedirect({
            appUrl: process.env.NEXT_PUBLIC_APP_URL,
            requestOrigin: window.location.origin,
          }),
          data: {
            full_name: fullName,
            tenant_name: organization.trim() || undefined,
            company_name: organization.trim() || undefined,
          },
        },
      });

      if (authError) {
        logAuthError("signup", authError);
        setError(mapAuthError(authError, "signup"));
        setLoading(false);
        return;
      }

      if (!data.user) {
        logAuthError("signup", { message: "no user returned from Auth" });
        setError(mapAuthError({ message: "Signup failed" }, "signup"));
        setLoading(false);
        return;
      }

      // Email confirmation may be required — session can be null
      if (!data.session) {
        setInfo(
          "Account created. Check your email to confirm your address, then sign in."
        );
        setLoading(false);
        return;
      }

      router.push("/engineering");
      router.refresh();
    } catch (err) {
      logAuthError("signup", err);
      setError(mapAuthError(err instanceof Error ? err : { message: String(err) }, "signup"));
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <RtbLogo size="lg" variant="full" inverted={false} />
          </div>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Canonical owner onboarding is self-service: create the tenant here, then invite engineers from Users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="organization" className="text-sm font-medium">
                Organization
              </label>
              <Input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Acme Engineering"
              />
            </div>
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
                minLength={8}
                required
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
            {info && (
              <p
                className="mb-1 text-[0.9375rem] leading-relaxed text-slate-600"
                role="status"
                data-testid="auth-info"
              >
                {info}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
