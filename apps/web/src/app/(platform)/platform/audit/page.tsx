import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";
import { Shield } from "lucide-react";

export default function PlatformAuditPage() {
  return (
    <>
      <Header
        title="Audit Logs"
        description="Immutable system and engineering audit events"
        showEngineeringChrome={false}
      />
      <PageMain>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Audit Event Viewer</CardTitle>
            </div>
            <CardDescription>
              Filter by user, event type, date, workspace, or project when querying the audit
              service.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              All platform actions are logged to the immutable{" "}
              <code className="rounded bg-slate-100 px-1">audit_events</code> table. Updates and
              deletes are blocked at the database level.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Filter by user</li>
              <li>Filter by event type</li>
              <li>Filter by date range</li>
              <li>Filter by workspace or project metadata when available</li>
              <li>View event metadata, IP address, and user agent</li>
            </ul>
            <Link href="/audit" className="font-medium text-blue-700 hover:underline">
              Open legacy audit viewer
            </Link>
          </CardContent>
        </Card>
      </PageMain>
    </>
  );
}
