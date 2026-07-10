import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import {
  ADVANCED_PLATFORM_NAVIGATION,
  buildAdvancedToolCategories,
} from "@rtb/platform-core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rtb/ui";
import { getIcon } from "@/lib/icons";
import { AlertTriangle } from "lucide-react";

export default function AdvancedPlatformToolsPage() {
  const categories = buildAdvancedToolCategories(ADVANCED_PLATFORM_NAVIGATION);

  return (
    <>
      <Header
        title="Advanced Platform Tools"
        description="Internal RTB platform services for administrators and support engineers"
        showEngineeringChrome={false}
      />
      <PageMain>
        <div
          className="mb-8 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950"
          role="alert"
          data-testid="advanced-platform-warning"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <p>
            Advanced Platform Tools are intended for system administrators and RTB support.
            Changes may affect AI behavior, automation, security, and integrations.
          </p>
        </div>

        <div className="space-y-10">
          {categories.map((category) => (
            <section key={category.id} data-testid={`advanced-category-${category.id}`}>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">{category.label}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => {
                  const Icon = getIcon(item.icon);
                  return (
                    <Link key={item.id} href={item.href}>
                      <Card className="h-full transition-colors hover:border-blue-200 hover:bg-slate-50">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base">{item.label}</CardTitle>
                          </div>
                          <CardDescription className="text-xs">{item.href}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Open internal platform screen. Routes remain protected by role.
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </PageMain>
    </>
  );
}
