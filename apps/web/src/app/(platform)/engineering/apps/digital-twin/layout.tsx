export default function DigitalTwinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="digital-twin-shell"
      data-module-version="0.7.0-simulation"
      data-module-status="simulation"
    >
      <nav aria-label="Digital Twin sections">
        <a href="/engineering/apps/digital-twin">Simulation Governance</a>
      </nav>
      {children}
    </div>
  );
}
