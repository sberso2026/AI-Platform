import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";

export default function GrowthCreditsPage() {
  return (
    <>
      <Header
        title="Growth Credits"
        description="Manage promotional credits and growth incentives."
        showEngineeringChrome={false}
      />
      <PageMain>
        <Card>
          <CardHeader>
            <CardTitle>Growth programme</CardTitle>
            <CardDescription>
              Growth credits will be managed through Platform Commerce when available.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Owner access only. Billing provider and credits ledger integration pending.
          </CardContent>
        </Card>
      </PageMain>
    </>
  );
}
