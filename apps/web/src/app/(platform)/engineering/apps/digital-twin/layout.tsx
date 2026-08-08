export default function DigitalTwinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="digital-twin-shell"
      data-module-version="0.8.0-simulation-assurance"
      data-module-status="simulation_assurance"
    >
      <nav aria-label="Digital Twin sections">
        <a href="/engineering/apps/digital-twin">Simulation Assurance</a>
      </nav>
      {children}
    </div>
  );
}
