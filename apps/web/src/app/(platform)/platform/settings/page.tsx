import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";
import { OPERATING_SYSTEMS } from "@rtb/platform-core";

export default function PlatformSettingsPage() {
  const installedOS = OPERATING_SYSTEMS.filter((os) => os.status === "installed");

  return (
    <>
      <Header
        title="Platform Settings"
        description="High-level tenant configuration — not low-level AI internals"
        showEngineeringChrome={false}
      />
      <PageMain>
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          AI model, prompt, and policy configuration belongs in{" "}
          <Link href="/platform/advanced" className="font-medium text-blue-700 hover:underline">
            Advanced Platform Tools
          </Link>
          .
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Company</CardTitle>
              <CardDescription>Organization name and branding</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Stored in tenant settings (company name, logo, locale, timezone).
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workspace Defaults</CardTitle>
              <CardDescription>Default workspace and operating system</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Configure default workspace behavior for new projects and members.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enabled Operating Systems</CardTitle>
              <CardDescription>Products installed on this tenant</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5">
                {installedOS.map((os) => (
                  <li key={os.id}>{os.name}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Summary</CardTitle>
              <CardDescription>Authentication and access controls</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Supabase Auth with tenant RBAC. Platform routes enforce role-based access.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Platform notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Email and in-app notification defaults for administrators.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Availability</CardTitle>
              <CardDescription>Product capabilities enabled for this tenant</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Engineering OS registers, AI workspace, and reports. Advanced platform features
              require administrator access.
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Advanced Navigation</CardTitle>
              <CardDescription>Show Advanced Platform Tools in the sidebar</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Toggle is stored in tenant settings as{" "}
              <code className="rounded bg-slate-100 px-1">showAdvancedPlatformTools</code>. Default
              is off. Owners can enable for faster access to internal tools.
            </CardContent>
          </Card>
        </div>
      </PageMain>
    </>
  );
}
