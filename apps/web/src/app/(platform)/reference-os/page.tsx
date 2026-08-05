import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";

/**
 * Certification-only Reference OS surface.
 * Not a customer product. Visible only when reference-os installation is active.
 */
export default function ReferenceOsHomePage() {
  return (
    <>
      <Header
        title="Reference OS"
        description="Certification-only operating system fixture"
        showEngineeringChrome={false}
      />
      <PageMain>
        <div data-testid="reference-os-ready" className="mx-auto max-w-xl space-y-3 py-10">
          <h1 className="text-xl font-semibold text-slate-900">Reference OS</h1>
          <p className="text-sm text-slate-600">
            This surface exists only for multi-OS isolation certification. It must not appear in
            production catalogues outside certification mode.
          </p>
        </div>
      </PageMain>
    </>
  );
}
