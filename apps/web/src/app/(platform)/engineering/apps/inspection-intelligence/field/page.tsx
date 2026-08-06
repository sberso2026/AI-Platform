export default function InspectionFieldPage() {
  return (
    <section data-testid="inspection-field-ready" aria-labelledby="ii-field-title">
      <h1 id="ii-field-title" className="text-xl font-semibold text-slate-900">
        Field Capture
      </h1>
      <p className="mt-2 text-slate-600">
        Device camera, QR/barcode identification, governed photo annotation, and authenticated
        attestation via the Engineering Mobile SDK. Original evidence remains immutable.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
        <li data-testid="inspection-field-camera">Camera capture → Platform Files evidence</li>
        <li data-testid="inspection-field-scan">QR / barcode → shared-domain target resolution</li>
        <li data-testid="inspection-field-annotate">Annotation derivatives (hash preserved)</li>
        <li data-testid="inspection-field-attest">Authenticated attestation + supplementary signature</li>
      </ul>
      <p className="mt-4 text-xs text-slate-500" data-testid="inspection-field-draft-state">
        Draft states: local_draft → media_staged → upload_pending → uploading → uploaded →
        server_confirmed
      </p>
    </section>
  );
}
