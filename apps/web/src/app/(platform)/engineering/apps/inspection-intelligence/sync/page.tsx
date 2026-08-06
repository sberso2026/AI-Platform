export default function InspectionSyncPage() {
  return (
    <section data-testid="inspection-sync-ready" aria-labelledby="ii-sync-title">
      <h1 id="ii-sync-title" className="text-xl font-semibold text-slate-900">
        Sync Status
      </h1>
      <p className="mt-2 text-slate-600">
        Connectivity, pending commands, evidence uploads, package freshness, entitlement expiry,
        storage use, and conflict recovery. Browser online is not treated as server reachability.
      </p>
      <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="font-medium">Last successful sync</dt>
          <dd data-testid="inspection-sync-last-success">—</dd>
        </div>
        <div>
          <dt className="font-medium">Pending / failed</dt>
          <dd data-testid="inspection-sync-pending">0 / 0</dd>
        </div>
        <div>
          <dt className="font-medium">Package freshness</dt>
          <dd data-testid="inspection-sync-packages">current</dd>
        </div>
        <div>
          <dt className="font-medium">Entitlement expiry</dt>
          <dd data-testid="inspection-sync-entitlement">valid</dd>
        </div>
        <div>
          <dt className="font-medium">Storage</dt>
          <dd data-testid="inspection-sync-storage">protected unsynced evidence</dd>
        </div>
        <div>
          <dt className="font-medium">Offline wipe guarantee</dt>
          <dd data-testid="inspection-sync-wipe-limitation">
            best-effort on reconnect; permanently offline devices not guaranteed
          </dd>
        </div>
      </dl>
    </section>
  );
}
