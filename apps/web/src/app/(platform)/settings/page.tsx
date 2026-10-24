import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";

export default function SettingsPage() {
  return (
      <>
        <Header title="Settings" description="Platform and tenant configuration" />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Settings</CardTitle>
              <CardDescription>Organization name, branding, timezone, locale</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Stored in tenants.settings JSONB column.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>Default operating system, feature flags</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Stored in platform_settings table.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>Authenticator app enrollment for Review AAL2</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/settings/security" className="text-sm text-primary hover:underline">
                Open security settings
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
      </>
  );
}
