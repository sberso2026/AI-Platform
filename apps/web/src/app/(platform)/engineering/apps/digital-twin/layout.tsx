export default function DigitalTwinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="digital-twin-shell"
      data-module-version="0.10.0-solver-capabilities"
      data-module-status="solver_capabilities"
    >
      <nav aria-label="Digital Twin sections">
        <a href="/engineering/apps/digital-twin">Solver Capabilities</a>
      </nav>
      {children}
    </div>
  );
}
