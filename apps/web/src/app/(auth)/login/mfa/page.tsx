"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@rtb/ui";
import { RtbLogo } from "@/components/brand/rtb-logo";
import { createClient } from "@/lib/supabase/client";
import {
  challengeAfterVerifyDestination,
  mapMfaVerifyError,
  MFA_SECURITY_ROUTE,
  safeMfaReturnPath,
  verifiedTotpFactors,
} from "@rtb/engineering-review/mfa-ux";

function MfaChallengeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeMfaReturnPath(searchParams.get("next"), "/review");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData.currentLevel === "aal2") {
        router.replace(nextPath);
        return;
      }
      const { data: factorData } = await supabase.auth.mfa.listFactors();
      if (verifiedTotpFactors(factorData.totp ?? []).length === 0) {
        router.replace(`${MFA_SECURITY_ROUTE}?next=${encodeURIComponent(nextPath)}`);
      }
    });
  }, [nextPath, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: factorData, error: factorError } = await supabase.auth.mfa.listFactors();
      if (factorError) {
        setError("Unable to load authenticator factors.");
        return;
      }
      const totp = verifiedTotpFactors(factorData.totp ?? [])[0];
      if (!totp) {
        router.replace(`${MFA_SECURITY_ROUTE}?next=${encodeURIComponent(nextPath)}`);
        return;
      }
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (challengeError || !challenge) {
        setError("Unable to start additional verification.");
        return;
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totp.id,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (verifyError) {
        setError(mapMfaVerifyError(verifyError.message));
        return;
      }
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const result = challengeAfterVerifyDestination({ currentAal: aalData.currentLevel, nextPath });
      if (!result.ok) {
        setError("Session is not AAL2 yet. Try the authenticator code again.");
        return;
      }
      router.replace(result.path);
      router.refresh();
    } catch {
      setError("Unable to complete additional verification. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F6F8] p-4" data-testid="mfa-challenge-page">
      <Card className="w-full max-w-md border-border bg-white shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <RtbLogo size="lg" variant="full" inverted={false} />
          </div>
          <CardTitle>Additional verification is required.</CardTitle>
          <CardDescription>Enter the code from your authenticator app.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => void submit(event)}>
            <label className="text-sm font-medium" htmlFor="mfa-code">
              Authenticator code
            </label>
            <Input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              data-testid="mfa-challenge-code"
            />
            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={busy || code.trim().length < 6}>
              {busy ? "Verifying..." : "Verify"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginMfaPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading verification…</p>}>
      <MfaChallengeForm />
    </Suspense>
  );
}
