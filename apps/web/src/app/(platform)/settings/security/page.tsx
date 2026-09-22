"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/client";
import {
  mapMfaVerifyError,
  redactMfaEnrollmentForLog,
  reviewMfaUiStatus,
  safeMfaReturnPath,
  totpQrImageSrc,
  verifiedTotpFactors,
} from "@rtb/engineering-review/mfa-ux";

type EnrollState = {
  factorId: string;
  qrSrc: string | null;
  manualSecret: string | null;
};

function SecurityMfaPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeMfaReturnPath(searchParams.get("next"), "/review");
  const [aal, setAal] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unauthenticated">("loading");
  const [verified, setVerified] = useState<ReturnType<typeof verifiedTotpFactors>>([]);
  const [enroll, setEnroll] = useState<EnrollState | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const label = useMemo(
    () =>
      reviewMfaUiStatus({
        verifiedTotpCount: verified.length,
        currentAal: aal,
        enrollmentInProgress: Boolean(enroll),
      }),
    [aal, enroll, verified.length],
  );

  async function refresh(supabase: ReturnType<typeof createClient>) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setStatus("unauthenticated");
      return;
    }
    const [{ data: aalData }, { data: factorData }] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ]);
    setAal(aalData.currentLevel);
    setVerified(verifiedTotpFactors(factorData.totp ?? []));
    setStatus("ready");
    void fetch("/api/platform/active-context", { credentials: "same-origin" })
      .then((response) => response.json())
      .then((body: { data?: { current?: { requireMfa?: boolean; tenantSlug?: string } | null } }) => {
        if (body.data?.current?.requireMfa) {
          setInfo((current) => current ?? `Engineering Review in ${body.data?.current?.tenantSlug ?? "this workspace"} requires authenticator verification.`);
        }
      })
      .catch(() => undefined);
  }

  useEffect(() => {
    const supabase = createClient();
    void refresh(supabase);
  }, []);

  async function startEnrollment() {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const supabase = createClient();
      const existing = await supabase.auth.mfa.listFactors();
      const unverified = (existing.data?.totp ?? []).filter((factor) => factor.status === "unverified");
      for (const factor of unverified) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator",
      });
      if (enrollError || !data) {
        setError("Unable to start authenticator setup. Try again.");
        return;
      }
      redactMfaEnrollmentForLog(data);
      setEnroll({
        factorId: data.id,
        qrSrc: totpQrImageSrc(data.totp.qr_code),
        manualSecret: data.totp.secret || null,
      });
    } catch {
      setError("Unable to start authenticator setup. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyEnrollment(e: React.FormEvent) {
    e.preventDefault();
    if (!enroll) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: enroll.factorId });
      if (challengeError || !challenge) {
        setError("Unable to start verification. Try again.");
        return;
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enroll.factorId,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (verifyError) {
        setError(mapMfaVerifyError(verifyError.message));
        return;
      }
      setCode("");
      setEnroll(null);
      setInfo("MFA configured.");
      await refresh(supabase);
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData.currentLevel === "aal2") {
        router.replace(nextPath);
        router.refresh();
      }
    } catch {
      setError("Unable to complete authenticator setup. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Header title="Security" description="Multi-Factor Authentication" />
        <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
          <p className="text-sm text-muted-foreground">Sign in to manage authenticator settings.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Security" description="Multi-Factor Authentication" />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="mfa-security-page">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Multi-Factor Authentication</CardTitle>
            <CardDescription>Uses Supabase Auth TOTP. Engineering Review still requires AAL2 when the tenant policy requires MFA.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Status</span>
              <Badge data-testid="mfa-status">{label}</Badge>
            </div>
            {verified.length > 0 ? (
              <ul className="space-y-1 text-sm" data-testid="mfa-factor-list">
                {verified.map((factor) => (
                  <li key={factor.id}>
                    {factor.friendlyName} — {factor.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No verified authenticator is configured.</p>
            )}
            {!enroll ? (
              <Button type="button" onClick={() => void startEnrollment()} disabled={busy} data-testid="mfa-setup">
                Set up authenticator
              </Button>
            ) : (
              <form className="space-y-3" onSubmit={(event) => void verifyEnrollment(event)}>
                {enroll.qrSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="Authenticator QR code" src={enroll.qrSrc} className="h-48 w-48 bg-white p-2" data-testid="mfa-qr" />
                ) : null}
                {enroll.manualSecret ? (
                  <p className="break-all font-mono text-xs" data-testid="mfa-manual-secret">
                    Manual setup key: {enroll.manualSecret}
                  </p>
                ) : null}
                <label className="text-sm font-medium" htmlFor="enroll-code">
                  Authenticator code
                </label>
                <Input
                  id="enroll-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  required
                  data-testid="mfa-enroll-code"
                />
                <Button type="submit" disabled={busy || code.trim().length < 6}>
                  Verify and enable
                </Button>
              </form>
            )}
            {info ? <p className="text-sm text-green-700">{info}</p> : null}
            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Recovery codes are not issued by this product. An administrator can reset MFA from the Supabase Auth dashboard
              for project rntonzigxwxcjlcsadip. Factor removal is not offered here so pilot MFA cannot be weakened from this page.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default function SecurityMfaPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading security settings…</p>}>
      <SecurityMfaPageInner />
    </Suspense>
  );
}
