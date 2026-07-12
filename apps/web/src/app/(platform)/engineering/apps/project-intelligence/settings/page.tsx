import { getAuthContext } from "@/lib/kernel";

export default async function ProjectIntelligenceSettingsPage() {
  const ctx = await getAuthContext();
  const { data, error } = ctx
    ? await ctx.supabase.from("tenants").select("settings").eq("id", ctx.tenantId).single()
    : { data: null, error: new Error("Unauthorized") };
  const settings = (data?.settings ?? {}) as { projectIntelligence?: { legacySourceSystem?: string } };
  const legacySourceSystem = settings.projectIntelligence?.legacySourceSystem;

  if (error || !legacySourceSystem) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Configuration incomplete</h2>
        <p className="mt-2 text-slate-600">Set a legacy source system before creating or synchronizing migration candidates.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
      <dl className="mt-6 rounded-lg border border-slate-200 p-5">
        <dt className="text-sm text-slate-500">Legacy source system</dt>
        <dd className="mt-1 font-medium text-slate-900">{legacySourceSystem}</dd>
      </dl>
    </section>
  );
}
