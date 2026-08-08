export default function DigitalTwinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="digital-twin-shell"
      data-module-version="0.9.0-external-solver"
      data-module-status="external_solver"
    >
      <nav aria-label="Digital Twin sections">
        <a href="/engineering/apps/digital-twin">External Solver</a>
      </nav>
      {children}
    </div>
  );
}
