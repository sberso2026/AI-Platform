import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@rtb/ui";
import { OPERATING_SYSTEMS } from "@rtb/platform-core";
import { getIcon } from "@/lib/icons";
import { Terminal, Shield, Boxes, Activity } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const installedOS = OPERATING_SYSTEMS.filter((os) => os.status === "installed");
  const upcomingOS = OPERATING_SYSTEMS.filter((os) => os.status === "coming_soon");

  return (
    <>
      <Header
        title="System Health Overview"
        description="Legacy RTB platform administration summary"
        showEngineeringChrome={false}
      />
      <PageMain>
        <div
          className="mb-8 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600"
          role="note"
        >
          Engineering operations are managed in{" "}
          <Link
            href="/engineering"
            className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-800"
          >
            Engineering Command Center
          </Link>
          . This page is for platform administration only.
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <StatCard
            title="Platform Status"
            value="Operational"
            description="All core services running"
            icon={<Activity className="h-4 w-4 text-emerald-500" />}
          />
          <StatCard
            title="Operating Systems"
            value={String(installedOS.length)}
            description={`${upcomingOS.length} coming soon`}
            icon={<Boxes className="h-4 w-4 text-primary" />}
          />
          <StatCard
            title="Command Centre"
            value="Ready"
            description="AI agents available"
            icon={<Terminal className="h-4 w-4 text-primary" />}
          />
          <StatCard
            title="Security"
            value="RLS Active"
            description="Multi-tenant isolation enabled"
            icon={<Shield className="h-4 w-4 text-primary" />}
          />
        </div>

        <section className="mt-8 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg font-semibold text-slate-800">Operating Systems</h2>
            <p className="mt-1 text-sm text-slate-500">Installed and upcoming RTB operating systems.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {OPERATING_SYSTEMS.map((os) => {
              const Icon = getIcon(os.icon);
              const installed = os.status === "installed";
              return (
                <Card
                  key={os.id}
                  className={
                    installed
                      ? "border-border bg-white shadow-sm"
                      : "border-border bg-slate-50 opacity-90"
                  }
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={
                            installed
                              ? "flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50"
                              : "flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200/70"
                          }
                        >
                          <Icon
                            className={installed ? "h-5 w-5 text-blue-600" : "h-5 w-5 text-slate-500"}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-base">{os.name}</CardTitle>
                          {os.version && (
                            <p className="text-xs text-muted-foreground">Version {os.version}</p>
                          )}
                        </div>
                      </div>
                      {installed ? (
                        <Badge variant="success" className="gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Installed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Coming Soon</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <CardDescription>{os.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-8 space-y-4" aria-label="Platform Administration">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg font-semibold text-slate-800">Platform Administration</h2>
            <p className="mt-1 text-sm text-slate-500">
              Platform Core and related subsystems — secondary to Engineering Operations.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {PLATFORM_CORES.map((core) => (
              <Card key={core.name} className="border-border bg-white p-5 shadow-sm">
                <p className="font-medium text-slate-800">{core.name}</p>
                <p className="mt-1 text-sm text-slate-500">{core.status}</p>
              </Card>
            ))}
          </div>
        </section>
      </PageMain>
    </>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-border bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

const PLATFORM_CORES = [
  { name: "Platform Core", status: "Phase 1 — Active" },
  { name: "AI Intelligence", status: "Phase 2" },
  { name: "Knowledge", status: "Phase 2" },
  { name: "Workflow", status: "Phase 2" },
  { name: "Digital Twin", status: "Phase 2" },
  { name: "Analytics", status: "Phase 2" },
  { name: "Simulation", status: "Phase 2" },
  { name: "Automation", status: "Phase 2" },
];
