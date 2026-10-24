import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";
import {
  EngineeringConnectorTypes,
  PhaseE4EssentialZeroConnector,
  PhaseE4ExternalWritesDisabled,
  getPhaseE4Declaration,
} from "@rtb/engineering-os";

const INTEGRATIONS = [
  { name: "Native Engineering OS", status: "connected", description: "Always-on ESSENTIAL capability (zero connectors required)" },
  { name: "File Import", status: "available", description: "CSV/Excel/file metadata import for small-company mode" },
  { name: "Generic REST", status: "available", description: "Read-only REST adapter (SSRF-safe configuration)" },
  { name: "Microsoft 365", status: "contract", description: "SharePoint/document search contract — live Graph not certified in E4" },
  { name: "Microsoft Fabric", status: "contract", description: "Data platform query contract — optional, no hard dependency" },
  { name: "SAP EAM/PM", status: "contract", description: "Asset/FLOC/notification/work-order read contract — fixture/mock in E4" },
  { name: "Google Workspace", status: "planned", description: "Collaboration and identity (provider taxonomy)" },
  { name: "Storage", status: "connected", description: "Document and attachment storage" },
] as const;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  connected: "default",
  available: "default",
  contract: "secondary",
  planned: "outline",
};

export default function IntegrationsPage() {
  const declaration = getPhaseE4Declaration();

  return (
    <>
      <Header
        title="Integrations"
        description="Enterprise connector registry — admin surface (not primary engineer navigation)"
        showEngineeringChrome={false}
      />
      <PageMain>
        <Card className="mb-6" data-testid="e4-connector-framework-banner">
          <CardHeader>
            <CardTitle>Connector Framework (E4)</CardTitle>
            <CardDescription>
              Vendor-neutral, read-first connectors. External systems remain systems of record.
              ESSENTIAL zero-connector mode: {String(PhaseE4EssentialZeroConnector)}. External
              writes: {PhaseE4ExternalWritesDisabled ? "disabled" : "enabled"}. Contract{" "}
              {declaration.contractVersion}.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Families: {EngineeringConnectorTypes.join(", ")}. Configure credentials via Platform
            Secrets — never paste plaintext keys into connector rows. Normal engineers do not see
            adapter internals in Ask; evidence appears as unified sources (Engineering OS, SharePoint,
            SAP, Fabric).
          </CardContent>
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
