import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";
import { Shield } from "lucide-react";

export default function AuditPage() {
  return (
      <>
        <Header title="Audit Log" description="Immutable record of platform actions and decisions" />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Audit Framework</CardTitle>
            </div>
            <CardDescription>
              All platform actions are logged to an immutable audit_events table.
              Updates and deletes are blocked at the database level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Audit events capture tenant, workspace, user, action, resource type, metadata,
              IP address, and user agent. Query via the AuditService in @rtb/platform-core.
            </p>
          </CardContent>
        </Card>
      </main>
      </>
  );
}
