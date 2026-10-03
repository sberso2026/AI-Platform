"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EngineeringBreadcrumb } from "@/components/engineering/operational";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { useResolvedEngineeringProjectId } from "@/hooks/use-engineering-project-filter";

type MtoItem = {
  id: string;
  itemCode: string;
  description: string;
  discipline: string;
  tag?: string | null;
  systemId?: string | null;
  category: string;
  material?: string | null;
  grade?: string | null;
  quantity: number | null;
  unit: string | null;
  sourceUnit?: string | null;
  conversionRecorded?: boolean;
  quantityOrigin: string;
  quantityMaturity: string;
  verificationStatus: string;
  status: string;
  basis: {
    sourceType: string;
    sourceRef: string | null;
    sourceRevision: string | null;
    measurementMethod: string | null;
    derivationMethod: string | null;
    formula: string | null;
    assumptions: string[];
    exclusions: string[];
    extractionRecordId?: string | null;
  };
};

type Presented = {
  id: string;
  revision: string;
  status: string;
  staleness: string;
  snapshotFingerprint: string;
  lifecycleStage: string;
  disciplineScope?: string;
  verificationState: string;
  itemCount: number;
  supersedesSnapshotId: string | null;
  items: MtoItem[];
  page: { total: number; offset: number; limit: number; items: MtoItem[] };
  costs: Record<string, { state: string; amount?: number; currency?: string; reason?: string }>;
  carbons: Record<string, { state: string; value?: number; unit?: string; reason?: string }>;
  constructability: { opaqueScore: null; heavyMemberCount: number; concreteVolumeM3: number; excavationVolumeM3: number; cableLengthM: number };
  policy: { carbon: string };
  carbonRequiredWithoutFactorExample: { state: string };
  progress: { total: number; verified: number; unverified: number; rejected: number; needsInformation: number };
  exportDisclaimer?: string;
};

type Delta = { itemCode: string; kind: string; priorQuantity: number | null; currentQuantity: number | null; delta: number | null; unit: string | null; discipline: string; category: string };

const PAGE_SIZE = 50;

export default function MtoWorkbenchPage() {
  const params = useParams<{ id: string }>();
  const selectedProjectId = useResolvedEngineeringProjectId();
  const [snapshots, setSnapshots] = useState<Presented[]>([]);
  const [current, setCurrent] = useState<Presented | null>(null);
  const [selectedItem, setSelectedItem] = useState<MtoItem | null>(null);
  const [discipline, setDiscipline] = useState("ALL");
  const [verification, setVerification] = useState("ALL");
  const [offset, setOffset] = useState(0);
  const [compare, setCompare] = useState<{ deltas: Delta[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const planId = params.id;

  async function loadSnapshots() {
    const response = await fetch(`/api/engineering/work?action=mtoSnapshots&workPlanId=${encodeURIComponent(planId)}&projectId=${encodeURIComponent(selectedProjectId ?? "")}&selectedProjectId=${encodeURIComponent(selectedProjectId ?? "")}`);
    const json = await parseApiJsonResponse<Presented[]>(response);
    if (json.errorMessage) {
      setError(json.errorMessage);
      return [];
    }
    const rows = json.data ?? [];
    setSnapshots(rows);
    return rows;
  }

  async function loadSnapshot(id: string, nextOffset = offset) {
    const response = await fetch(`/api/engineering/work?action=mtoSnapshot&id=${encodeURIComponent(id)}&selectedProjectId=${encodeURIComponent(selectedProjectId ?? "")}&offset=${nextOffset}&limit=${PAGE_SIZE}&discipline=${encodeURIComponent(discipline)}&verification=${encodeURIComponent(verification)}`);
    const json = await parseApiJsonResponse<Presented>(response);
    if (json.errorMessage) setError(json.errorMessage);
    else {
      setCurrent(json.data);
      setSelectedItem((json.data?.page.items[0] ?? json.data?.items[0]) ?? null);
    }
  }

  useEffect(() => {
    void (async () => {
      const rows = await loadSnapshots();
      const active = rows.find((row) => row.status !== "SUPERSEDED") ?? rows[0];
      if (active) await loadSnapshot(active.id, 0);
    })();
  }, [planId, selectedProjectId]);

  useEffect(() => {
    if (current?.id) void loadSnapshot(current.id, offset);
  }, [discipline, verification, offset]);

  async function post(action: string, extra: Record<string, unknown> = {}) {
    setError(null);
    setMessage(null);
    const response = await fetch("/api/engineering/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, workPlanId: planId, snapshotId: current?.id, selectedProjectId, ...extra }),
    });
    const json = await parseApiJsonResponse<Presented>(response);
    if (json.errorMessage) {
      setError(json.errorMessage);
      return;
    }
    setMessage(action.replaceAll("_", " "));
    const rows = await loadSnapshots();
    const nextId = (json.data as Presented | undefined)?.id ?? current?.id ?? rows[0]?.id;
    if (nextId) await loadSnapshot(nextId, 0);
  }

  async function loadCompare() {
    const prior = snapshots.find((row) => row.id === current?.supersedesSnapshotId)
      ?? snapshots.find((row) => row.disciplineScope === current?.disciplineScope && row.id !== current?.id);
    if (!current || !prior) {
      setError("No prior like-scope revision to compare.");
      return;
    }
    const response = await fetch(`/api/engineering/work?action=mtoCompare&from=${encodeURIComponent(prior.id)}&to=${encodeURIComponent(current.id)}&selectedProjectId=${encodeURIComponent(selectedProjectId ?? "")}&discipline=${encodeURIComponent(discipline)}`);
    const json = await parseApiJsonResponse<{ deltas: Delta[] }>(response);
    if (json.errorMessage) setError(json.errorMessage);
    else setCompare(json.data);
  }

  const rows = current?.page.items ?? [];
  const disciplines = useMemo(() => ["ALL", ...new Set((current?.items ?? []).map((row) => row.discipline))], [current]);

  return (
    <>
        <Header title="Quantities & MTO" description="Governed quantity take-off. Verification is quantity/basis verification, not design approval. Export does not imply IFC or ENGINEERING_APPROVED." />
      <main className="mx-auto max-w-7xl p-6">
        <EngineeringBreadcrumb items={[{ href: "/engineering/work", label: "Engineering Workbench" }, { href: `/engineering/work/plans/${planId}`, label: "Work Plan" }, { href: `/engineering/work/plans/${planId}/mto`, label: "Quantities & MTO" }]} />
        <EngineeringProjectContextBar />
        <h1 className="mt-4 text-2xl font-semibold">Quantities &amp; MTO</h1>
        <p className="mt-1 text-sm text-muted-foreground">Governed quantity take-off. Verification is quantity/basis verification, not design approval. Export does not imply IFC or ENGINEERING_APPROVED.</p>
        {error && <p className="mt-3 rounded border border-red-300 p-2 text-sm">{error}</p>}
        {message && <p className="mt-3 rounded border p-2 text-sm">{message}</p>}

        <section className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="rounded border px-3 py-1" onClick={() => void post("seedMtoDemonstrator")}>Persist Crusher Demonstrator</button>
          <button type="button" className="rounded border px-3 py-1" onClick={() => void post("createMto")}>Create MTO</button>
          <button type="button" className="rounded border px-3 py-1" onClick={() => void post("createMtoRevision")}>Create new revision</button>
          <button type="button" className="rounded border px-3 py-1" onClick={() => void post("refreshMtoFreshness")}>Check source freshness</button>
          <button type="button" className="rounded border px-3 py-1" onClick={() => void loadCompare()}>Revision comparison</button>
          <button type="button" className="rounded border px-3 py-1" onClick={() => {
            const prior = snapshots.find((row) => row.id === current?.supersedesSnapshotId);
            if (prior && current) void post("mtoChangeImpacts", { fromSnapshotId: prior.id, toSnapshotId: current.id });
          }}>Send delta to Change Impact</button>
          {current && (
            <a className="rounded border px-3 py-1" href={`/api/engineering/work?action=exportMto&id=${encodeURIComponent(current.id)}&selectedProjectId=${encodeURIComponent(selectedProjectId ?? "")}`}>Export XLSX</a>
          )}
          <Link className="rounded border px-3 py-1" href={`/engineering/work/plans/${planId}`}>Back to Work Plan</Link>
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-4" aria-label="MTO overview">
          <div className="rounded border p-3"><p className="text-xs text-muted-foreground">Revision</p><p>{current?.revision ?? "—"}</p></div>
          <div className="rounded border p-3"><p className="text-xs text-muted-foreground">Status</p><p>{current?.status ?? "—"}</p></div>
          <div className="rounded border p-3"><p className="text-xs text-muted-foreground">Source freshness</p><p>{current?.staleness?.replaceAll("_", " ") ?? "—"}</p></div>
          <div className="rounded border p-3"><p className="text-xs text-muted-foreground">Verification progress</p><p>{current ? `${current.progress.verified}/${current.progress.total}` : "—"}</p></div>
        </section>
        {current && (
          <p className="mt-2 text-xs text-muted-foreground">Fingerprint {current.snapshotFingerprint.slice(0, 16)} · lifecycle {current.lifecycleStage} · {current.status === "VERIFIED" ? "VERIFIED MTO" : "DRAFT MTO"}</p>
        )}

        <label className="mt-4 mr-3 inline-block text-sm">
          Snapshot
          <select className="ml-2 rounded border px-2 py-1" value={current?.id ?? ""} onChange={(event) => void loadSnapshot(event.target.value, 0)}>
            {snapshots.map((row) => (
              <option key={row.id} value={row.id}>{row.revision} · {row.status}</option>
            ))}
          </select>
        </label>
        <label className="mr-3 inline-block text-sm">
          Discipline
          <select className="ml-2 rounded border px-2 py-1" value={discipline} onChange={(event) => { setOffset(0); setDiscipline(event.target.value); }}>
            {disciplines.map((row) => <option key={row} value={row}>{row}</option>)}
          </select>
        </label>
        <label className="inline-block text-sm">
          Verification
          <select className="ml-2 rounded border px-2 py-1" value={verification} onChange={(event) => { setOffset(0); setVerification(event.target.value); }}>
            {["ALL", "UNVERIFIED", "VERIFIED", "REJECTED", "NEEDS_INFORMATION"].map((row) => <option key={row} value={row}>{row}</option>)}
          </select>
        </label>

        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th />
                <th>Item Code</th>
                <th>Description</th>
                <th>Discipline</th>
                <th>System/Tag</th>
                <th>Category</th>
                <th>Material / Grade</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Origin</th>
                <th>Maturity</th>
                <th>Source Revision</th>
                <th>Verification</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className={selectedItem?.id === item.id ? "bg-muted/40" : undefined}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={(event) => setSelectedIds((ids) => event.target.checked ? [...ids, item.id] : ids.filter((id) => id !== item.id))}
                    />
                  </td>
                  <td><button type="button" className="underline" onClick={() => setSelectedItem(item)}>{item.itemCode}</button></td>
                  <td>{item.description}</td>
                  <td>{item.discipline}</td>
                  <td>{item.tag ?? item.systemId ?? ""}</td>
                  <td>{item.category}</td>
                  <td>{[item.material, item.grade].filter(Boolean).join(" / ")}</td>
                  <td>{item.quantity == null ? "QUANTITY_NOT_AVAILABLE" : item.quantity}</td>
                  <td>{item.unit ?? ""}</td>
                  <td>{item.quantityOrigin}</td>
                  <td>{item.quantityMaturity}</td>
                  <td>{item.basis.sourceRevision ?? ""}</td>
                  <td>{item.verificationStatus}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {current && (
          <p className="mt-2 text-sm">
            Showing {current.page.offset + 1}–{Math.min(current.page.offset + current.page.limit, current.page.total)} of {current.page.total}.
            <button type="button" className="ml-2 rounded border px-2" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>Previous</button>
            <button type="button" className="ml-2 rounded border px-2" disabled={offset + PAGE_SIZE >= current.page.total} onClick={() => setOffset(offset + PAGE_SIZE)}>Next</button>
          </p>
        )}

        {selectedItem && (
          <section className="mt-4 rounded border p-4" aria-label="Quantity provenance">
            <h2 className="font-semibold">Where did this quantity come from?</h2>
            <p>Source: {selectedItem.basis.sourceRef ?? "none"} Rev {selectedItem.basis.sourceRevision ?? "—"} ({selectedItem.basis.sourceType})</p>
            <p>Measurement: {selectedItem.basis.measurementMethod ?? "—"}</p>
            <p>Derivation: {selectedItem.basis.derivationMethod ?? selectedItem.basis.formula ?? "—"}</p>
            <p>Assumptions: {selectedItem.basis.assumptions.join("; ") || "none"}</p>
            <p>Exclusions: {selectedItem.basis.exclusions.join("; ") || "none"}</p>
            <p>Unit conversion: {selectedItem.conversionRecorded ? `${selectedItem.sourceUnit} → ${selectedItem.unit}` : "none recorded"}</p>
            <p>Digital Thread: quantity_basis BASED_ON source · USED_BY mto_item · snapshot SUPERSEDES prior revision</p>
            <p>Cost: {current?.costs[selectedItem.itemCode]?.state === "DERIVED" ? `${current.costs[selectedItem.itemCode].amount} ${current.costs[selectedItem.itemCode].currency}` : current?.costs[selectedItem.itemCode]?.state ?? "COST_NOT_CALCULATED"}</p>
            {current?.policy.carbon === "NOT_APPLICABLE" ? (
              <p>Carbon: NOT_APPLICABLE — no unnecessary carbon evidence gap.</p>
            ) : (
              <p>Carbon: {current?.carbons[selectedItem.itemCode]?.state ?? "CARBON_NOT_CALCULATED"}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="rounded border px-2 py-1" onClick={() => void post("verifyMtoItem", { itemId: selectedItem.id, status: "VERIFIED" })}>Verify item</button>
              <button type="button" className="rounded border px-2 py-1" onClick={() => void post("verifyMtoItem", { itemId: selectedItem.id, status: "REJECTED" })}>Reject item</button>
              <button type="button" className="rounded border px-2 py-1" onClick={() => void post("verifyMtoItem", { itemId: selectedItem.id, status: "NEEDS_INFORMATION" })}>Needs information</button>
            </div>
          </section>
        )}

        <section className="mt-4 rounded border p-4">
          <h2 className="font-semibold">Bulk verification</h2>
          <p className="text-sm text-muted-foreground">Requires explicit human selection and confirmation. Verify-all AI quantities is not available.</p>
          <label className="mt-2 block text-sm">
            <input type="checkbox" checked={confirmBulk} onChange={(event) => setConfirmBulk(event.target.checked)} /> I confirm these selected items as the verifying engineer.
          </label>
          <button
            type="button"
            className="mt-2 rounded border px-3 py-1"
            onClick={() => void post("verifyMtoItem", { itemId: selectedIds[0], itemIds: selectedIds, status: "VERIFIED", confirmBulk })}
          >
            Verify selected
          </button>
          <button type="button" className="ml-2 rounded border px-3 py-1" onClick={() => void post("verifyMtoSnapshot")}>Verify snapshot</button>
        </section>

        {current && (
          <section className="mt-4 rounded border p-4">
            <h2 className="font-semibold">Constructability evidence</h2>
            <p>Heavy members: {current.constructability.heavyMemberCount} · concrete {current.constructability.concreteVolumeM3} m3 · excavation {current.constructability.excavationVolumeM3} m3 · cable {current.constructability.cableLengthM} m</p>
            <p>Opaque constructability score: none.</p>
            {current.carbonRequiredWithoutFactorExample.state === "CARBON_NOT_CALCULATED" && (
              <p className="mt-1 text-sm">Controlled REQUIRED example without factor remains CARBON_NOT_CALCULATED.</p>
            )}
          </section>
        )}

        {compare && (
          <section className="mt-4 rounded border p-4" aria-label="Revision comparison">
            <h2 className="font-semibold">Revision comparison</h2>
            <p className="text-sm">ADDED / REMOVED / INCREASED / DECREASED / UNCHANGED. No automatic dollar or carbon impact.</p>
            <table className="mt-2 min-w-full text-left text-sm">
              <thead><tr><th>Item</th><th>Kind</th><th>Prior</th><th>Current</th><th>Delta</th><th>Unit</th></tr></thead>
              <tbody>
                {compare.deltas.filter((row) => discipline === "ALL" || row.discipline === discipline).map((row) => (
                  <tr key={row.itemCode}>
                    <td>{row.itemCode}</td>
                    <td>{row.kind}</td>
                    <td>{row.priorQuantity ?? ""}</td>
                    <td>{row.currentQuantity ?? ""}</td>
                    <td>{row.delta ?? ""}</td>
                    <td>{row.unit ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </>
  );
}
