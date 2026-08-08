export default function DigitalTwinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="digital-twin-shell"
      data-module-version="0.6.0-representation"
      data-module-status="representation"
    >
      <nav aria-label="Digital Twin sections">
        <a href="/engineering/apps/digital-twin">Representation Mapping</a>
      </nav>
      {children}
    </div>
  );
}
