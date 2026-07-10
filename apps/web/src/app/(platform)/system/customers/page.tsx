import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";

export default function CustomersPage() {
  return (
    <CommerceAdminShell
      title="Customers"
      description="Tenant customer hierarchy, billing contacts, and cost centres."
    >
      <Card>
        <CardHeader>
          <CardTitle>Customer portal</CardTitle>
          <CardDescription>
            Customer self-service views subscriptions, licences, seats, billing, and usage.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Admin customer management connects to tenant records and billing accounts.
          Company hierarchy and invoice contacts will surface here when billing provider
          integration is enabled.
        </CardContent>
      </Card>
    </CommerceAdminShell>
  );
}
