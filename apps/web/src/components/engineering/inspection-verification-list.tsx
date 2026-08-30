"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hostedGet, hostedIntent, type InspectionRow } from "@/lib/inspection-intelligence/hosted-client";

export function InspectionVerificationList() {
  const [rows, setRows] = useState<InspectionRow[]>([]);
  const [error, setError] = useState<string>();
  const [canWrite, setCanWrite] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [next, caps] = await Promise.all([
      hostedGet<InspectionRow[]>("verifications"),
      hostedGet<{ canWrite: boolean }>("capabilities").catch(() => ({ canWrite: true })),
    ]);
    setRows(next);
    setCanWrite(caps.canWrite !== false);
  }

  useEffect(() => {
    load().catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load verifications"));
  }, []);

  if (error) return <p className="text-red-700" role="alert">{error}</p>;

  return (
    <section data-testid="inspection-review-ready">
      <p className="text-sm font-medium text-cyan-700">Review</p>
      <h1 id="ii-review-title" className="mt-1 text-2xl font-semibold text-slate-900">
        Inspection review and verification
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Human verification of inspection subjects. Pending means unset completion, not an automatic pass.
      </p>
      {rows.length === 0 ? (
        <p className="mt-6 text-slate-500">No verification records yet.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {rows.map((row) => (
            <li key={String(row.id)} className="rounded border px-4 py-3 text-sm">
              <p className="font-medium">
                {String(row.kind)} · {String(row.status)}
              </p>
              <p className="text-slate-500">
                Subject {String(row.subject_id).slice(0, 8)} · session{" "}
                <Link className="text-cyan-700 hover:underline" href={`/engineering/apps/inspection-intelligence/sessions/${row.session_id}`}>
                  {String(row.session_id).slice(0, 8)}
                </Link>
              </p>
              {row.status === "pending" ? (
                <div className="mt-2 flex gap-2">
                  {(["passed", "failed"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className="rounded border px-3 py-1 disabled:opacity-60"
                      disabled={!canWrite || busy}
                      onClick={async () => {
                        setBusy(true);
                        setError(undefined);
                        try {
                          await hostedIntent("complete_verification", { verificationId: row.id, status });
                          await load();
                        } catch (reason) {
                          setError(reason instanceof Error ? reason.message : "Verification update failed");
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  Verifier {String(row.verifier_person_id ?? "unknown")} · {String(row.updated_at ?? "")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
