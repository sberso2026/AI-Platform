import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { getAuthContext } from "@/lib/kernel";
import { requireBusinessOsAccess } from "@/lib/business/access";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";

export default async function BusinessOsSettingsPage() {
  const ctx = await getAuthContext();
  const authorized = await requireBusinessOsAccess(ctx, "business_os.manage", "/business/settings");
  const snapshot = authorized.business.status.snapshot();
  const config = authorized.business.status.configuration();

  return (
    <>
      <Header
        title="Business OS Settings"
        description="Business OS configuration — Owner Command Centre uses platform services only"
        showEngineeringChrome={false}
      />
      <PageMain data-testid="business-os-settings">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Installation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="OS id" value={snapshot.osId} />
              <Row label="Product" value={snapshot.productSlug} />
              <Row
                label="Catalog"
                value={snapshot.catalogStatus}
                badge
              />
              <Row label="Feature flag" value={snapshot.featureKey} />
              <Row label="Foundation state" value={snapshot.foundationState} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform reuse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="AI Director" value={config.kernelServices.aiDirector ? "Platform Kernel" : "none"} />
              <Row label="Policy engine" value="Platform Intelligence" />
              <Row label="implementsOwnAiStack" value={String(config.implementsOwnAiStack)} />
              <Row label="External writes" value="disabled" />
              <Row label="Autonomous approval" value="forbidden" />
            </CardContent>
          </Card>
        </div>
      </PageMain>
    </>
  );
}

function Row({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-600">{label}</span>
      {badge ? <Badge variant="secondary">{value}</Badge> : <span className="font-mono text-slate-900">{value}</span>}
    </div>
  );
}
