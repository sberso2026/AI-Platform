"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";
import { RtbLogo } from "@/components/brand/rtb-logo";
import { logAuthError, mapAuthError } from "@rtb/platform-core";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
    <div className="flex min-h-screen items-center justify-center bg-[#F4F6F8] p-4">
      <Card className="w-full max-w-md border-border bg-white shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <RtbLogo size="lg" variant="full" inverted={false} />
          </div>
          <CardTitle>RTB Engineering OS</CardTitle>
          <CardDescription>Sign in to your platform account</CardDescription>
        </CardHeader>
        <CardContent>
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
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
