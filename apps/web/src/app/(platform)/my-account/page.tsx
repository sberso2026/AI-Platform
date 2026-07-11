"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { buttonVariants, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import type { MyAccountView } from "@rtb/platform-core";

export default function MyAccountPage() {
  const [data, setData] = useState<MyAccountView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/platform/administration/my-account")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Failed to load account");
        setData(json.data);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <Header
        title="My Account"
        description="Your assigned products, applications, workspace access, and personal usage."
        showEngineeringChrome={false}
      />
      <PageMain>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card data-testid="my-account-os">
            <CardHeader>
              <CardTitle className="text-base">Assigned Operating Systems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {data?.assignedOperatingSystems.length ? (
                data.assignedOperatingSystems.map((os) => (
                  <div key={os.slug} className="rounded-md border border-border p-3">
                    <p className="font-medium">{os.name}</p>
                    {os.seatType && <p className="text-muted-foreground">Seat: {os.seatType}</p>}
                    <p className="text-muted-foreground">
                      Workspaces: {os.workspaceNames.join(", ") || "None"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No operating systems assigned.</p>
              )}
            </CardContent>
          </Card>

          <Card data-testid="my-account-apps">
            <CardHeader>
              <CardTitle className="text-base">Assigned applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {data?.assignedApplications.length ? (
                data.assignedApplications.map((app) => (
                  <div key={app.appKey} className="flex items-center justify-between gap-2">
                    <span>{app.name}</span>
                    {app.openHref && (
                      <Link href={app.openHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
                        Open
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No applications assigned.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal usage</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {data?.personalUsage.length ? (
                <ul className="space-y-2">
                  {data.personalUsage.map((u) => (
                    <li key={u.metricKey} className="flex justify-between gap-2">
                      <span>{u.name}</span>
                      <span>
                        {u.consumed}
                        {u.unit ? ` ${u.unit}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No usage recorded this period.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workspace access</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {data?.workspaceAccess.length ? (
                <ul className="list-disc pl-5">
                  {data.workspaceAccess.map((w) => (
                    <li key={w.id}>{w.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No workspace access.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </PageMain>
    </>
  );
}
