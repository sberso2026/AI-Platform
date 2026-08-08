export default function DigitalTwinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="digital-twin-shell"
      data-module-version="0.5.0-telemetry-binding"
      data-module-status="telemetry_binding"
    >
      <nav aria-label="Digital Twin sections">
        <a href="/engineering/apps/digital-twin">Telemetry Binding</a>
      </nav>
      {children}
    </div>
  );
}
