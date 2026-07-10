import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";

export default function PluginsPage() {
  return (
      <>
        <Header title="Plugins" description="Extend platform capabilities with installable modules" />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <Card>
          <CardHeader>
            <CardTitle>Plugin Architecture</CardTitle>
            <CardDescription>
              Operating systems and extensions install as plugins using the @rtb/plugin-sdk.
              No plugins installed yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Plugins register routes, navigation items, and permissions through a validated manifest.
              See <code className="rounded bg-muted px-1">packages/plugin-sdk</code> for the SDK.
            </p>
          </CardContent>
        </Card>
      </main>
      </>
  );
}
