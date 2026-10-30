import Link from "next/link";
import { Header } from "@/components/layout/header";

/**
 * Approved Administration hub — system/technical functions live here,
 * not in the primary engineer workflow.
 */
export default function EngineeringAdministrationPage() {
  const links = [
    {
      href: "/engineering/settings",
      title: "Engineering Settings",
      description: "Installation preferences and engineering OS configuration.",
    },
    {
      href: "/engineering/governance",
      title: "Governance & Assurance",
      description: "Qualification boundary, trust, and release status.",
    },
    {
      href: "/engineering/health",
      title: "Health Check",
      description: "Service and solver status for authorized operators.",
    },
    {
      href: "/engineering/settings/integrations",
      title: "Integrations",
      description: "External tools and connector administration.",
    },
  ] as const;

  return (
    <>
      <Header
        title="Administration"
        description="System, qualification, integrations, and configuration — separate from day-to-day engineering work."
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-administration"
      >
        <p className="mb-4 max-w-3xl text-sm text-slate-600">
          Ordinary engineering work uses Home, Projects, My Work, and the project workspace.
          Administration holds technical and system functions that do not belong in the primary
          engineer navigation.
        </p>
        <ul className="grid gap-3 md:grid-cols-2" data-testid="administration-links">
          {links.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-[color:var(--eos-gold,#c4a35a)]/50"
              >
                <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                <span className="mt-1 block text-xs text-slate-600">{item.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
