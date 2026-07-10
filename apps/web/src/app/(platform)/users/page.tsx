import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";

export default function UsersPage() {
  return (
      <>
        <Header title="Users" description="Manage tenant members and invitations" />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Invite users, assign roles, and manage tenant memberships.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connected to Supabase Auth with profile sync and tenant membership tables.
            </p>
          </CardContent>
        </Card>
      </main>
      </>
  );
}
