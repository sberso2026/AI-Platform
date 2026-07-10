import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";

const INTEGRATIONS = [
  { name: "Supabase", status: "connected", description: "Auth, database, and storage foundation" },
  { name: "Microsoft 365", status: "planned", description: "Email, calendar, and document sync" },
  { name: "Google Workspace", status: "planned", description: "Collaboration and identity" },
  { name: "Xero", status: "planned", description: "Finance and project cost data" },
  { name: "ERP", status: "planned", description: "Enterprise resource planning" },
  { name: "CMMS", status: "planned", description: "Maintenance management" },
  { name: "SCADA", status: "planned", description: "Operational technology interfaces" },
  { name: "IoT", status: "planned", description: "Sensor and device telemetry" },
  { name: "GIS", status: "planned", description: "Geospatial asset context" },
  { name: "Email", status: "planned", description: "Notifications and inbound parsing" },
  { name: "Calendar", status: "planned", description: "Meeting and milestone sync" },
  { name: "Storage", status: "connected", description: "Document and attachment storage" },
] as const;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  connected: "default",
  planned: "outline",
};

export default function IntegrationsPage() {
  return (
    <>
      <Header
        title="Integrations"
        description="External systems registry and connection status"
        showEngineeringChrome={false}
      />
      <PageMain>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Integration Registry</CardTitle>
            <CardDescription>
              Connect Engineering OS to enterprise systems. Configuration shells are shown until
              connectors are enabled.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map((integration) => (
            <Card key={integration.name} data-testid={`integration-${integration.name}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{integration.name}</CardTitle>
                  <Badge variant={STATUS_VARIANT[integration.status] ?? "secondary"}>
                    {integration.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageMain>
    </>
  );
}
