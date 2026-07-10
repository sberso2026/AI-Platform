import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";
import { Shield, Users } from "lucide-react";

export default function UsersPermissionsPage() {
  return (
    <>
      <Header
        title="Users & Permissions"
        description="Manage users, roles, memberships, and Engineering OS access"
        showEngineeringChrome={false}
      />
      <PageMain>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Users</CardTitle>
              </div>
              <CardDescription>Tenant members, invitations, and profile sync</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Invite users and manage tenant memberships connected to Supabase Auth.</p>
              <Link href="/users" className="font-medium text-blue-700 hover:underline">
                Open user management
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Roles & Permissions</CardTitle>
              </div>
              <CardDescription>Platform and Engineering OS role assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Configure owner, administrator, engineering manager, and viewer access.</p>
              <Link href="/roles" className="font-medium text-blue-700 hover:underline">
                Open role management
              </Link>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Memberships</CardTitle>
              <CardDescription>Tenant and workspace membership overview</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5">
                <li>Tenant memberships control platform-wide roles</li>
                <li>Workspace memberships scope project and asset access</li>
                <li>Engineering OS permissions are mapped from platform RBAC</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </PageMain>
    </>
  );
}
