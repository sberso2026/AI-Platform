"use client";

import { useEffect, useState } from "react";

type Mapping = {
  id: string;
  legacy_project_intelligence_project_id: string;
  engineering_project_id: string;
  tenant_id: string;
  workspace_id: string;
  mapping_status: string;
  confidence_score: number;
  match_method: string | null;
  conflict_state: string | null;
  metadata: { recommendation?: string } | null;
};

export default function ProjectIntelligenceMigrationPage() {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/engineering/project-intelligence/mappings")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load mappings");
        setMappings(payload.data);
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  async function updateMapping(id: string, action: "approve" | "reject" | "conflict" | "defer") {
    const response = await fetch(`/api/engineering/project-intelligence/mappings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error?.message ?? "Unable to update mapping");
    setMappings((current) => current.map((mapping) => mapping.id === id ? payload.data : mapping));
  }

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Migration review</h2>
        <p className="mt-4 text-slate-600" role="status">Loading mapping candidates…</p>
      </section>
    );
  }
  if (error) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Migration review</h2>
        <p className="mt-4 text-red-700" role="alert">{error}</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-900">Migration review</h2>
      <p className="mt-2 text-slate-600">Approving a mapping does not merge or migrate Engineering Core register data.</p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Legacy PI project</th><th className="p-3">Proposed Core project</th><th className="p-3">Confidence</th><th className="p-3">Match method</th><th className="p-3">Tenant</th><th className="p-3">Workspace</th><th className="p-3">Status</th><th className="p-3">Conflict summary</th><th className="p-3">Recommendation</th><th className="p-3">Review</th></tr></thead>
          <tbody>
            {mappings.map((mapping) => (
              <tr key={mapping.id} className="border-t border-slate-200">
                <td className="p-3 font-mono text-xs">{mapping.legacy_project_intelligence_project_id}</td>
                <td className="p-3 font-mono text-xs">{mapping.engineering_project_id}</td>
                <td className="p-3">{Math.round(mapping.confidence_score * 100)}%</td>
                <td className="p-3">{mapping.match_method ?? "—"}</td>
                <td className="p-3 font-mono text-xs">{mapping.tenant_id}</td>
                <td className="p-3 font-mono text-xs">{mapping.workspace_id}</td>
                <td className="p-3">{mapping.mapping_status}</td>
                <td className="p-3">{mapping.conflict_state ?? "none"}</td>
                <td className="p-3">{mapping.metadata?.recommendation ?? "Review before approval"}</td>
                <td className="space-x-2 p-3">
                  <button className="text-cyan-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400" disabled={mapping.confidence_score < 0.8} title={mapping.confidence_score < 0.8 ? "Low-confidence mappings cannot be approved" : undefined} onClick={() => updateMapping(mapping.id, "approve")}>Approve</button>
                  <button className="text-red-700 hover:underline" onClick={() => updateMapping(mapping.id, "reject")}>Reject</button>
                  <button className="text-slate-700 hover:underline" onClick={() => updateMapping(mapping.id, "defer")}>Defer</button>
                  <button className="text-amber-700 hover:underline" onClick={() => updateMapping(mapping.id, "conflict")}>Choose conflict</button>
                </td>
              </tr>
            ))}
            {!mappings.length && <tr><td colSpan={10} className="p-6 text-center text-slate-500">No mapping candidates require review.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
