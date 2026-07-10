import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@rtb/ui";

export default function WorkspacesPage() {
  return (
      <>
        <Header title="Workspaces" description="Manage tenant workspaces and environments" />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <Card>
          <CardHeader>
            <CardTitle>Default Workspace</CardTitle>
            <CardDescription>Primary workspace — auto-created per tenant</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="success">Active</Badge>
          </CardContent>
        </Card>
      </main>
      </>
  );
}
