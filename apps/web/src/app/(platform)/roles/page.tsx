import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@rtb/ui";

const SYSTEM_ROLES = [
  { name: "Owner", slug: "owner", description: "Full platform access" },
  { name: "Administrator", slug: "admin", description: "Administrative access to all platform resources" },
  { name: "Member", slug: "member", description: "Standard workspace access with Command Centre" },
  { name: "Viewer", slug: "viewer", description: "Read-only access" },
];

export default function RolesPage() {
  return (
      <>
        <Header title="Roles" description="Role-based access control and permissions" />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <div className="grid gap-4 md:grid-cols-2">
          {SYSTEM_ROLES.map((role) => (
            <Card key={role.slug}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{role.name}</CardTitle>
                  <Badge variant="secondary">System</Badge>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-xs text-muted-foreground">{role.slug}</code>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      </>
  );
}
